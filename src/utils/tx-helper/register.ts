import { Orchestrator } from "../../canister/orchestrator";
import { BITCOIN, UTXO_DUST } from "../../constants";
import { AddressType, InputCoin, OutputCoin, ToSignInput, TxOutputType, UnspentOutput } from "../../types";
import { addressTypeToString, getAddressType } from "../address";
import { Transaction } from "../transaction";
import * as bitcoin from "bitcoinjs-lib";

export async function registerTx({
    userBtcUtxos,
    poolBtcUtxo,
    paymentAddress,
    poolAddress,
    feeRate,
    registerFee
}: {
    userBtcUtxos: UnspentOutput[],
    poolBtcUtxo: UnspentOutput,
    paymentAddress: string,
    poolAddress: string,
    feeRate: number,
    registerFee: bigint
}) {
    let userBtcAmount = userBtcUtxos.reduce((acc, utxo) => acc + BigInt(utxo.satoshis), BigInt(0))
    console.log({userBtcAmount})
    console.log({poolAddress})
    console.log({paymentAddress})
    const tx = new Transaction();
    let inputTypes: TxOutputType[] = []
    let outputTypes: TxOutputType[] = []

    tx.setFeeRate(feeRate)
    tx.setEnableRBF(false);
    tx.setChangeAddress(paymentAddress);
    

    tx.addInput(poolBtcUtxo)
    inputTypes.push(
        addressTypeToString(getAddressType(poolBtcUtxo.address))
    )

    userBtcUtxos.forEach(utxo => {
        tx.addInput(utxo)
        inputTypes.push(
            addressTypeToString(getAddressType(utxo.address))
        )
    })

    // add register fee to pool address
    tx.addOutput(poolAddress, BigInt(poolBtcUtxo.satoshis) + registerFee)
    outputTypes.push(
        addressTypeToString(getAddressType(poolAddress))
    )

    // add change utxo
    outputTypes.push(
        addressTypeToString(getAddressType(paymentAddress)),
    )

    let fee = await Orchestrator.getEstimateMinTxFee({
        input_types: inputTypes,
        pool_address: poolAddress,
        output_types: outputTypes,
    });
    // let fee = BigInt(221);

    console.log({fee})

    let change_amount = BigInt(userBtcAmount) - BigInt(registerFee) - fee;
    console.log({change_amount})
    if (change_amount < 0) {
        throw new Error("Inssuficient UTXO(s)");
    } else if (change_amount <= UTXO_DUST) {
        outputTypes.pop()
    } else {
        tx.addOutput(paymentAddress, change_amount)
    }

    console.log({tx})
    const inputs = tx.getInputs();
    const psbt = tx.toPsbt();
    //@ts-expect-error: todo
    const unsignedTx = psbt.__CACHE.__TX;
    // let _txid = unsignedTx.getId()
    // console.log({_txid})
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
    // console.log({txid})
    const inputCoins: InputCoin[] = [
        {
            from: paymentAddress,
            coin: {
                id: BITCOIN.id,
                value: userBtcAmount,
            },
        },
    ];

    const outputCoins: OutputCoin[] = [];
    const poolSpendUtxos = `${poolBtcUtxo.txid}:${poolBtcUtxo.vout}`;
    const poolReceiveUtxos = `${txid}:${0}`;

    return {
        psbt,
        toSpendUtxos,
        toSignInputs,
        poolSpendUtxos,
        poolReceiveUtxos,
        txid,
        fee,
        inputCoins,
        outputCoins,
    };

}

