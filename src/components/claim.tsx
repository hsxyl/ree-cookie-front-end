// import { useLaserEyes } from "@omnisat/lasereyes";
// import { useWalletBtcUtxos } from "../hooks/use-utxos";
// import { getP2trAressAndScript, registerTx } from "../utils";
// import { AddressType, UnspentOutput } from "../types";
// import { cookieActor } from "../canister/cookie/actor";
// import { RegisterInfo } from "../canister/cookie/service.did";
// import { useRecommendedFeeRateFromOrchestrator } from "../hooks/use-fee-rate";
// import { useState } from "react";
// import * as bitcoin from "bitcoinjs-lib";
// import axios from "axios";
// import { EXCHANGE_ID } from "@/constants";
// import { Button } from "@mui/material";
// import { ocActor } from "@/canister/orchestrator/actor";
// import { OrchestratorStatus } from "@/canister/orchestrator/service.did";

// export function Claim() {

//     return (
//         <div>
//             <button>claim</button>
//         </div>
//     );
// }

// export function Register({
//     // psbt,
//     // setPsbt,
//     paymentAddress,
//     paymentAddressUtxos
// }: {
//     paymentAddress: string;
//     paymentAddressUtxos: UnspentOutput[] | undefined;
// }) {
//     const { signPsbt } = useLaserEyes()
//     const [registerTxid, setRegisterTxid] = useState<string | undefined>(undefined)


//     let register = async () => {
//         console.log("fuck", JSON.stringify(paymentAddressUtxos))
//         if (!paymentAddressUtxos) {
//             return
//         }
//         let register_info: RegisterInfo = await cookieActor.get_register_info()
//         console.log({register_info})
//         const { address: poolAddress, output } = getP2trAressAndScript(register_info.untweaked_key);
//         console.log({poolAddress, output})

//         console.log("fuck", JSON.stringify(paymentAddressUtxos))
//         let recommendedFeeRate = await ocActor.get_status()
//         .then((res: OrchestratorStatus) => 
//         {
//             return res.mempool_tx_fee_rate.medium
//         }).catch((err) => {
//             console.log("get recommendedFeeRate error", err);
//             throw err;
//         })

//         let {
//             psbt,
//             toSpendUtxos,
//             toSignInputs,
//             poolSpendUtxos,
//             poolReceiveUtxos,
//             txid,
//             fee,
//             inputCoins,
//             outputCoins,
//         } = await registerTx(
//             {
//                 userBtcUtxos: paymentAddressUtxos!,
//                 poolBtcUtxo: {
//                     txid: register_info.utxo.txid,
//                     vout: register_info.utxo.vout,
//                     satoshis: register_info.utxo.sats,
//                     address: register_info.address,
//                     scriptPk: output,
//                     pubkey: "",
//                     addressType: AddressType.P2TR,
//                     runes: [],
//                 },
//                 paymentAddress,
//                 poolAddress: poolAddress!,
//                 feeRate: recommendedFeeRate,
//                 registerFee: register_info.register_fee,
//             }
//         )

//         console.log(psbt.toHex())

//         const psbtBase64 = psbt.toBase64();
//         const res = await signPsbt(psbtBase64);
//         let signedPsbtHex = res?.signedPsbtHex;

//         if (!signedPsbtHex) {
//             throw new Error("failed to sign psbt")
//         }

//         let register_txid = await ocActor.invoke({
//             'intention_set': {
//                 tx_fee_in_sats: BigInt(fee),
//                 initiator_address: paymentAddress,
//                 intentions: [
//                     {
//                         action: "register",
//                         exchange_id: EXCHANGE_ID,
//                         input_coins: inputCoins,
//                         pool_utxo_spend: [poolSpendUtxos],
//                         pool_utxo_receive: [poolReceiveUtxos],
//                         output_coins: outputCoins,
//                         pool_address: register_info.address,
//                         action_params: "",
//                         nonce: BigInt(register_info.nonce),
//                     },
//                 ],
//             },
//             psbt_hex: signedPsbtHex,
//         }).then((res) => {
//             if ('Err' in res) {
//                 throw new Error(res.Err);
//             }
//             return res.Ok;
//         }).catch((err) => {
//             console.log("invoke error", err);
//             throw err;
//         })

//         // let register_txid = await Orchestrator.invoke({
//         //     intention_set: {
//         //         initiator_address: paymentAddress,
//         //         intentions: [
//         //             {
//         //                 action: "register",
//         //                 exchange_id: EXCHANGE_ID,
//         //                 input_coins: inputCoins,
//         //                 pool_utxo_spend: [poolSpendUtxos],
//         //                 pool_utxo_receive: [poolReceiveUtxos],
//         //                 output_coins: outputCoins,
//         //                 pool_address: register_info.address,
//         //                 action_params: "",
//         //                 nonce: BigInt(register_info.nonce),
//         //             },
//         //         ],
//         //     },
//         //     psbt_hex: signedPsbtHex,
//         // })
//         setRegisterTxid(JSON.stringify(register_txid))
//     }

//     return (
//         <div>
//             <Button variant="contained" onClick={register}>register</Button>
//             {/* <label>{JSON.stringify(btcUtxos)}</label> */}
//             {/* <label>{psbt?.toHex()}</label> */}
//             {/* <label>{JSON.stringify(registerTxid)}</label> */}
//         </div>
//     )

// }