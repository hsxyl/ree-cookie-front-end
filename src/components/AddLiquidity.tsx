import { cookieActor } from "@/canister/cookie/actor"
import { ocActor } from "@/canister/orchestrator/actor"
import { OrchestratorStatus } from "@/canister/orchestrator/service.did"
import { swapActor } from "@/canister/rich-swap/actor"
import { PoolBasic } from "@/canister/rich-swap/service.did"
import { useWalletBtcUtxos } from "@/hooks/use-utxos"
import { convertUtxo } from "@/utils"
import { addLiquidityTx } from "@/utils/tx-helper/addLiquidity"
import { useLaserEyes } from "@omnisat/lasereyes"
import { Button, Skeleton } from "antd"
import { useEffect, useState } from "react"

export function AddLiquidity({
}: {
}) {
    const [registerTxid, setRegisterTxid] = useState<string | undefined>(undefined)
    const [loadingCookiePool, setLoadingCookiePool] = useState(true)
    const [cookiePool, setCookiePool] = useState<PoolBasic | undefined>(undefined)
    const { address, paymentAddress, connect, signPsbt  } = useLaserEyes();
    const userBtcUtxos = useWalletBtcUtxos();

    useEffect(() => {
        const s = async () => {
            let cookieExchangeState = await cookieActor.get_exchange_state()
            console.log({ cookieExchangeState })
            let runeName = cookieExchangeState.rune_name;
            let pool = (await swapActor.get_pool_list()).find(e => e.name == runeName)
            console.log({ pool })
            if (pool) {
                setCookiePool(pool)
                console.log({ pool })
            }
            setLoadingCookiePool(false)
        }

        s()
    }, [])

    const createPool = async () => {
        let cookieExchangeState = await cookieActor.get_exchange_state()
        let pubkey = await swapActor.create(
            (cookieExchangeState.rune_id as any as [string])[0]
        ).then((data) => {
            if ("Ok" in data) {
                return data.Ok
            } else {
                throw new Error(data.Err ? Object.keys(data.Err)[0] : "Unknown Error");
            }
        })
        console.log({ pubkey })
    }

    const addLiquidity = async () => {
        let cookieExchangeState = await cookieActor.get_exchange_state()
        let addLiquidityInfo = await cookieActor.query_add_liquidity_info()
        let runeName = cookieExchangeState.rune_name;
        let runeId = (cookieExchangeState.rune_id as any as [string])[0]
        let swapPool = (await swapActor.get_pool_list()).find(e => e.name == runeName)!
        let untweakKey = (cookieExchangeState.key as any as [string])[0]
        // let register_info: RegisterInfo = (await cookieActor.get_register_info()).untweaked_key

        let recommendedFeeRate = await ocActor.get_status()
        .then((res: OrchestratorStatus) => {
            return res.mempool_tx_fee_rate.medium
        }).catch((err) => {
            console.log("get recommendedFeeRate error", err);
            throw err;
        })
        // const btcAmountForAddLiquidity = cookieExchangeState.game.

        const lastState = cookieExchangeState.states.slice(-1)[0]

        // addLiquidityTx({
        //     userBtcUtxos: userBtcUtxos!,
        //     btcAmountForAddLiquidity: addLiquidityInfo.btc_amount_for_add_liquidity,
        //     runeid: runeId,
        //     runeAmountForAddLiquidity: addLiquidityInfo.rune_amount_for_add_liquidity,
        //     cookiePoolBtcUtxo: convertUtxo(lastState.utxo, untweakKey ),
        //     cookiePoolRuneUtxo: convertUtxo(lastState.rune_utxo, untweakKey ),
        //     paymentAddress: paymentAddress,
        //     swapPoolAddress: swapPool.address,
        //     cookiePoolAddress: (cookieExchangeState.address as [string])[0],
        //     feeRate: recommendedFeeRate,
        //     signPsbt: signPsbt,
        //     cookiePoolNonce: ,
        //     swapPoolNonce,
            
        // })

        



    }


    return <div>
        {
            loadingCookiePool ?
                <Skeleton />
                :
                <div>
                    {
                        cookiePool ?
                            <div>
                                <p>
                                    Already Create Pool
                                </p>
                                <Button onClick={() => addLiquidity()}>
                                    Add Liquidity
                                </Button>
                            </div>
                            :
                            <div>
                                <Button onClick={() => createPool()}>
                                    Create Pool
                                </Button>
                                <Button onClick={() => addLiquidity()}>
                                    Add Liquidity
                                </Button>
                            </div>
                    }
                </div>
        }
    </div>
}

