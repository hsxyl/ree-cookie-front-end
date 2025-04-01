
import { ProviderType, TESTNET4, useLaserEyes } from '@omnisat/lasereyes';
import { LaserEyesClient, createStores, createConfig, UNISAT, NetworkType } from '@omnisat/lasereyes-core';
import { useState } from 'react';

// Create stores for state management
const stores = createStores();

// Optional: Create configuration with network setting
const config = createConfig({
    network: TESTNET4
});

// const client = new LaserEyesClient(stores, config);
// client.initialize();

export function Login(
    {
        connect
    }:{
        connect: (walletName: ProviderType) => Promise<void>
    }
) {
    // const [loginAddress, setLoginAddress] = useState<string>('')
    // const {connect} = useLaserEyes();

    return <div>
        <button onClick={
            async () => {
                console.log("click login")
                await connect(UNISAT)
                // // await client.connect(UNISAT)
                // // let accounts = await client.requestAccounts();
                // if (!accounts || accounts?.length === 0) {
                //     throw new Error('No accounts found');
                // }
                // let current_account = accounts[0];

                // setLoginAddress(current_account)
            }
        }>Connect Wallet</button>

    </div>

}