import Image from "next/image";
import { Button } from "../ui/button";
import { UNISAT, useLaserEyes } from "@omnisat/lasereyes";
// import { AccountButton } from "../account-button";
import { useSetAtom } from "jotai";
import { connectWalletModalOpenAtom } from "@/store/connect-wallet-modal-open";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";
// import { MenuButton } from "./menu-button";
import { AccountButton } from "./account-button";
import { Bip322AuthClient } from "@/canister/internet-identity/ii-client";
import ConnectButton from "../ConnectButton";
import { useSiwbIdentity } from "ic-siwb-lasereyes-connector";

export function Topbar() {
  const { address, connect, signMessage } = useLaserEyes();
  const [initialized, setInitialized] = useState(false);
  const { isInitializing, identity } = useSiwbIdentity();

  useEffect(() => {
    if (isInitializing) {
      return;
    }
    setInitialized(true);


  }, [isInitializing]);

  return (
    <div className="flex justify-between items-cetner sm:p-4 p-3">
      <div className="items-center flex space-x-3 flex-1 justify-start">
        <Image
          src="/icon.png"
          className="size-6 sm:size-8"
          width={128}
          height={128}
          alt="RichSwap"
        />
        <span className="font-bold sm:text-lg">Ree Cookie</span>
      </div>
      <div className="flex-1 justify-end space-x-2 flex">
        {!initialized ? (
          <Skeleton className="h-9 w-24 rounded-full" />
        ) : (!identity||!address) ? (
          <ConnectButton />
          // <Button
          //   className="rounded-lg border-2 border-blue-500 bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 hover:border-blue-600 transition-colors"
          //   onClick={() => connect(UNISAT)}
          // >
          //   Connect wallet
          // </Button>
        ) : (
          <AccountButton />
        )}
      </div>
    </div>
  );
}
