import React, { useEffect, useState } from "react";
import { LaserEyesProvider, TESTNET4, useLaserEyes } from '@omnisat/lasereyes';
import { Login } from "@/components/login";
import { useRecommendedFeeRateFromOrchestrator } from "@/hooks/use-fee-rate";
import * as bitcoin from "bitcoinjs-lib";
import { useWalletBtcUtxos } from "@/hooks/use-utxos";
import "@/styles/app.css"
import { Topbar } from "@/components/topbar";
// import { Game } from "@/components/Game";
import { LinearProgress } from "@mui/material";
// import { SiwbIdentityProvider, useSiwbIdentity } from "ic-use-siwb-identity";
import { SiwbIdentityProvider, useSiwbIdentity } from 'ic-siwb-lasereyes-connector';

import type { _SERVICE as siwbService } from '../canister/siwb/ic_siwb_provider.d.ts';
import { idlFactory as siwbIdl } from '../canister/siwb/ic_siwb_provider.idl';
import { GameSteps } from "@/components/GameSteps";
import { cookieActor } from "@/canister/cookie/actor";
import { ExchangeState, GameStatus } from "@/canister/cookie/service.did";
import { Skeleton } from "antd";

export default function Home() {
  return (
    <div>
      <LaserEyesProvider config={{ network: TESTNET4 }}>
        <SiwbIdentityProvider<siwbService>
          canisterId={process.env.PROVIDER! ?? 'stxih-wyaaa-aaaah-aq2la-cai'}
          idlFactory={siwbIdl}
          httpAgentOptions={{ host: process.env.DFX_NETWORK === 'ic' ? 'https://icp0.io' : 'https://icp0.io' }} // use only in local canister
        >
          <LaserEyesProvider config={{ network: TESTNET4 }}>
            <App />
          </LaserEyesProvider>

        </SiwbIdentityProvider>

      </LaserEyesProvider>
    </div>

  );
}

function App() {

  // const [loginAddress, setLoginAddress] = useState<string | undefined>(undefined);

  const { address, isInitializing, paymentAddress, connect, disconnect,signMessage } = useLaserEyes();
  const { identity, identityAddress, clear } = useSiwbIdentity();
  // const [psbt, setPsbt] = useState<bitcoin.Psbt>();
  // console.log(JSON.stringify(btcUtxos))
  const [gameStatus, setGameStatus] = useState<GameStatus | undefined>(undefined);
  const [exchangeState, setExchangeState] = useState<ExchangeState | undefined>(undefined);

  let exchange_state = undefined

  useEffect(() => {
    cookieActor.get_exchange_state().then((e) => {
      exchange_state = e
      setGameStatus(e.game_status)
    } )
  },[])

  return (
    <div className="App">
      <Topbar />


      {/* <Game /> */}

      {
        !gameStatus?
        <Skeleton /> :
        <GameSteps gameStatus={gameStatus!} />
      }
    </div>
  );
}
