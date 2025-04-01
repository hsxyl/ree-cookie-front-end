import React, { useState } from "react";
import { LaserEyesProvider, TESTNET4, useLaserEyes } from '@omnisat/lasereyes';
import { Login } from "@/components/login";
import { Register } from "@/components/claim";
import { useRecommendedFeeRateFromOrchestrator } from "@/hooks/use-fee-rate";
import * as bitcoin from "bitcoinjs-lib";
import { useWalletBtcUtxos } from "@/hooks/use-utxos";
import "@/styles/app.css"
import { Topbar } from "@/components/topbar";
import { Game } from "@/components/game";
import { LinearProgress } from "@mui/material";

export default function Home() {
  return (
    <React.StrictMode>
      <LaserEyesProvider config={{ network: TESTNET4 }}>
        <App />
      </LaserEyesProvider>
    </React.StrictMode>
  );
}

function App() {

  // const [loginAddress, setLoginAddress] = useState<string | undefined>(undefined);

  const { address, isInitializing,  paymentAddress, connect, disconnect  } = useLaserEyes();
  // const [psbt, setPsbt] = useState<bitcoin.Psbt>();

  // console.log(JSON.stringify(btcUtxos))

  return (
    <div className="App">
      <Topbar/>

      <Game/>
      {/* <Login connect={connect} /> */}
      {/* <label>{address}</label> */}
      {/* <Claim  /> */}
      {/* <Register
        paymentAddress={paymentAddress}
        paymentAddressUtxos={btcUtxos}
      /> */}
      <button onClick={()=>disconnect()}>logout</button>
    </div>
  );
}
