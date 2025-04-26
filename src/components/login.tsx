
import { ProviderType, TESTNET4, useLaserEyes } from '@omnisat/lasereyes';
import { LaserEyesClient, createStores, createConfig, UNISAT, NetworkType } from '@omnisat/lasereyes-core';
import { useState } from 'react';
import ConnectDialog from './ConnectDialog';
import { Button } from 'antd';

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
    }: {
        connect: (walletName: ProviderType) => Promise<void>
    }
) {
    // const [loginAddress, setLoginAddress] = useState<string>('')
    // const {connect} = useLaserEyes();
    const [connectDialogOpen, setConnectDialogOpen] = useState(false);
    const handleClick = async () => {
        // if (isConnecting) return;
        setConnectDialogOpen(true);
    };

    const buttonText = 'Connect wallet and Sign';

    return <div>
        <Button
            className="w-44"
            type="primary"
            onClick={handleClick}
        >
            {buttonText}
        </Button>

        <ConnectDialog isOpen={connectDialogOpen} setIsOpen={() => setConnectDialogOpen(false)} />

    </div>

}