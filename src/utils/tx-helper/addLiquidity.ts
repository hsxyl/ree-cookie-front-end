import { AddressType, InputCoin, OutputCoin, ToSignInput, TxOutputType, UnspentOutput } from "@/types";
import { Transaction } from "../transaction";
import { addressTypeToString, getAddressType } from "../address";
import { ocActor } from "@/canister/orchestrator/actor";
import { BITCOIN, COOKIE_EXCHANGE_ID, RICHSWAP_EXCHANGE_ID, UTXO_DUST } from "@/constants";
import { RuneId, Runestone, none, Edict } from "runelib";
import * as bitcoin from "bitcoinjs-lib";


export async function addLiquidityTx({
    userBtcUtxos,
    btcAmountForAddLiquidity,
    runeid,
    runeAmountForAddLiquidity,
    cookiePoolBtcUtxo,
    cookiePoolRuneUtxo,
    paymentAddress,
    swapPoolAddress,
    cookiePoolAddress,
    feeRate,
    signPsbt,
    cookiePoolNonce,
    swapPoolNonce,
}: {
    userBtcUtxos: UnspentOutput[],
    btcAmountForAddLiquidity: bigint;
    runeid: string;
    runeAmountForAddLiquidity: bigint;
    cookiePoolBtcUtxo: UnspentOutput;
    cookiePoolRuneUtxo: UnspentOutput;
    address: string;
    paymentAddress: string;
    swapPoolAddress: string;
    cookiePoolAddress: string;
    feeRate: bigint;
    signPsbt: any;
    cookiePoolNonce: bigint;
    swapPoolNonce: bigint;
}) {

    // let inputBtcAmount =  
    const tx = new Transaction();

    tx.setFeeRate(feeRate);
    tx.setEnableRBF(false);
    tx.setChangeAddress(paymentAddress);

    let userBtcAmount = userBtcUtxos.reduce((acc, utxo) => acc + BigInt(utxo.satoshis), BigInt(0))

    let inputTypes: TxOutputType[] = []
    let outputTypes: TxOutputType[] = []


    // input 
    tx.addInput(cookiePoolBtcUtxo)
    inputTypes.push(
        addressTypeToString(getAddressType(cookiePoolBtcUtxo.address))
    )

    tx.addInput(cookiePoolRuneUtxo)
    inputTypes.push(
        addressTypeToString(getAddressType(cookiePoolRuneUtxo.address))
    )

    userBtcUtxos.forEach(utxo => {
        tx.addInput(utxo)
        inputTypes.push(
            addressTypeToString(getAddressType(utxo.address))
        )
    })

    // output

    // cookie pool
    // output 0
    tx.addOutput(cookiePoolAddress, BigInt(cookiePoolBtcUtxo.satoshis) - btcAmountForAddLiquidity)
    outputTypes.push(
        addressTypeToString(getAddressType(cookiePoolAddress))
    )
    // output 1
    tx.addOutput(cookiePoolAddress, BigInt(cookiePoolRuneUtxo.satoshis))
    outputTypes.push(
        addressTypeToString(getAddressType(cookiePoolAddress))
    )

    // swap pool
    // output 2
    tx.addOutput(swapPoolAddress, btcAmountForAddLiquidity)
    outputTypes.push(
        addressTypeToString(getAddressType(swapPoolAddress))
    )

    // edict & op return
    const [runeBlock, runeIdx] = runeid.split(":");
    const { id: cookieRuneId, amount: cookiePoolRuneAmount } = cookiePoolRuneUtxo.runes.find(rune => rune.id === runeid)!;
    const edicts = [
        new Edict(
            new RuneId(Number(runeBlock), Number(runeIdx)),
            BigInt(cookiePoolRuneAmount) - runeAmountForAddLiquidity,
            1
        ),
        new Edict(
            new RuneId(Number(runeBlock), Number(runeIdx)),
            BigInt(runeAmountForAddLiquidity),
            2
        )
    ]
    const runestone = new Runestone(edicts, none(), none(), none());

    const opReturnScript = runestone.encipher();
    // OP_RETURN
    tx.addScriptOutput(opReturnScript, BigInt(0));

    // user
    // add change utxo
    outputTypes.push(
        addressTypeToString(getAddressType(paymentAddress)),
    )

    let fee = await ocActor.estimate_min_tx_fee({
        'input_types': inputTypes,
        'pool_address': [swapPoolAddress, cookiePoolAddress],
        'output_types': outputTypes,
    }).then((res: { 'Ok': bigint } | { 'Err': string }) => {
        if ('Err' in res) {
            throw new Error(res.Err);
        }
        return res.Ok
    }).catch((err) => {
        console.log("invoke error", err);
        throw err;
    });

    let change_amount = BigInt(userBtcAmount) - fee;

    if (change_amount < 0) {
        throw new Error("Inssuficient UTXO(s)");
    } else if (change_amount <= UTXO_DUST) {
        outputTypes.pop()
    } else {
        tx.addOutput(paymentAddress, change_amount)
    }

    console.log({ tx })
    const inputs = tx.getInputs();
    const psbt = tx.toPsbt();
    //@ts-expect-error: todo
    const unsignedTx = psbt.__CACHE.__TX;
    const toSignInputs: ToSignInput[] = [];
    const toSpendUtxos = inputs
        .filter(({ utxo }, index) => {
            const isUserInput =
                utxo.address === paymentAddress || utxo.address === paymentAddress;
            const addressType = getAddressType(utxo.address);
            if (isUserInput) {
                toSignInputs.push({
                    index,
                    ...(addressType === AddressType.P2TR
                        ? { address: utxo.address, disableTweakSigner: false }
                        : { publicKey: utxo.pubkey, disableTweakSigner: true }),
                });
            }
            return isUserInput;
        })
        .map((input) => input.utxo);
        const unsignedTxClone = unsignedTx.clone();

    for (let i = 0; i < toSignInputs.length; i++) {
        const toSignInput = toSignInputs[i];

        const toSignIndex = toSignInput.index;
        const input = inputs[toSignIndex];
        const inputAddress = input.utxo.address;
        if (!inputAddress) continue;
        const redeemScript = psbt.data.inputs[toSignIndex].redeemScript;
        const addressType = getAddressType(inputAddress);

        if (redeemScript && addressType === AddressType.P2SH_P2WPKH) {
            const finalScriptSig = bitcoin.script.compile([redeemScript]);
            unsignedTxClone.setInputScript(toSignIndex, finalScriptSig);
        }
    }

    const txid = unsignedTxClone.getId();
    const psbtBase64 = psbt.toBase64();
    const res = await signPsbt(psbtBase64);
    let signedPsbtHex = res?.signedPsbtHex;

    let register_txid = await ocActor.invoke({
        'intention_set': {
            tx_fee_in_sats: BigInt(fee),
            initiator_address: paymentAddress,
            intentions: [
                {
                    action: "add_liquidity",
                    exchange_id: COOKIE_EXCHANGE_ID,
                    input_coins: [],
                    pool_utxo_spend: [
                        `${cookiePoolBtcUtxo.txid}:${cookiePoolBtcUtxo.vout}`, 
                        `${cookiePoolRuneUtxo.txid}:${cookiePoolRuneUtxo.vout}`
                    ],
                    pool_utxo_receive: [
                        `${txid}:0`,
                        `${txid}:1`,
                    ],
                    output_coins: [
                        {
                            to: swapPoolAddress,
                            coin: {
                                id: BITCOIN.id,
                                value: btcAmountForAddLiquidity,
                            }
                        },
                        {
                            to: swapPoolAddress,
                            coin: {
                                id: runeid,
                                value: runeAmountForAddLiquidity,
                            }
                        }
                    ],
                    pool_address: cookiePoolAddress,
                    action_params: "",
                    nonce: cookiePoolNonce,
                },
                {
                    action: "add_liquidity",
                    exchange_id: RICHSWAP_EXCHANGE_ID,
                    input_coins: [
                        {
                            from: cookiePoolAddress,
                            coin: {
                                id: BITCOIN.id,
                                value: btcAmountForAddLiquidity,
                            }
                        },
                        {
                            from: cookiePoolAddress,
                            coin: {
                                id: runeid,
                                value: runeAmountForAddLiquidity,
                            }
                        }
                    ],
                    pool_utxo_spend: [
                        `${cookiePoolBtcUtxo.txid}:${cookiePoolBtcUtxo.vout}`, 
                        `${cookiePoolRuneUtxo.txid}:${cookiePoolRuneUtxo.vout}`
                    ],
                    pool_utxo_receive: [
                        `${txid}:0`,
                        `${txid}:1`,
                    ],
                    output_coins: [
                        {
                            to: swapPoolAddress,
                            coin: {
                                id: BITCOIN.id,
                                value: btcAmountForAddLiquidity,
                            }
                        },
                        {
                            to: swapPoolAddress,
                            coin: {
                                id: runeid,
                                value: runeAmountForAddLiquidity,
                            }
                        }
                    ],
                    pool_address: cookiePoolAddress,
                    action_params: "",
                    nonce: swapPoolNonce, 
                }

            ],
        },
        psbt_hex: signedPsbtHex,
    }).then((res) => {
        if ('Err' in res) {
            throw new Error(res.Err);
        }
        return res.Ok;
    }).catch((err) => {
        console.log("invoke error", err);
        throw err;
    })






}