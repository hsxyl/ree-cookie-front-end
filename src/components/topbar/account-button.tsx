import { MyAuthClient } from "@/canister/internet-identity/ii-client";
import { useLaserEyes } from "@omnisat/lasereyes";
import { useEffect, useState } from "react";

export function AccountButton({ }: {
}) {
    const { address, provider, signMessage } = useLaserEyes();

    const [initializedInternetIdentity, setInitializedInternetIdentity] = useState(false);
    const [principal, setPrincipal] = useState<string | undefined>(undefined);

    const init_internet_identity = async () => {
        if (!address) {
            return
        }
        let client = await MyAuthClient.create()
        let hex_pub_key = client.get_hex_pub_key()
        const signature = (await signMessage(hex_pub_key, {
            toSignAddress: address,
            protocol: "bip322"
        }))!;
        const defaultTimeToLive = /* hours */ BigInt(8) * /* nanoseconds */ BigInt(3_600_000_000_000);
        await client.delegation_process(
            address,
            signature,
            defaultTimeToLive
        )
        setPrincipal(client.identity.getPrincipal().toText())

    }

    useEffect(() => {
        if (!address) {
            return;
        }
        init_internet_identity()
            .then(() => { setInitializedInternetIdentity(true) })


    }, [address]);

    useEffect(() => {
        if (!address) {
            return
        }
    }, [address])

    return <div className="flex">
        <label>{principal}</label>
        <button>
            {address}
        </button>
    </div>
}