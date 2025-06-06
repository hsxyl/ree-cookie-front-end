import { Bip322AuthClient } from "@/canister/internet-identity/ii-client";
import { Button } from "@mui/material";
import { useLaserEyes } from "@omnisat/lasereyes";
import { useSiwbIdentity } from "ic-siwb-lasereyes-connector";
import { useEffect, useState } from "react";

export function AccountButton({ }: {
}) {
    // const { address, provider, signMessage } = useLaserEyes();

    const { address, paymentAddress, connect, disconnect,signMessage } = useLaserEyes();
    const { isInitializing, identity, identityAddress, clear } = useSiwbIdentity();

    if(isInitializing) {
        return null
    }

    return <div className="flex items-center">
        { <div>{identity?.getPrincipal().toText()}</div>}
        <div className="mr-5">{identityAddress}</div>
        <Button onClick={()=>{clear(); disconnect()}}>logout</Button>
        {/* <button>
            {address}
        </button> */}
    </div>
}