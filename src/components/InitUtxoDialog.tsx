import { cookieActor } from "@/canister/cookie/actor";
import { useLaserEyes } from "@omnisat/lasereyes";
import { Button, Form, FormProps, Input } from "antd";
import Modal from "antd/es/modal/Modal";
import { useSiwbIdentity } from "ic-siwb-lasereyes-connector";
import { useState } from "react";

type FieldType = {
    txid?: string;
    vout?: number;
    sats?: number;
};

export default function InitBtcUtxoDialog({
    isOpen,
    setIsOpen
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}) {
    const { identity } = useSiwbIdentity();
    // const [txid, setTxid] = useState<string>("");
    // const [vout, setVout] = useState<number>(0);
    // const [sats, setSats] = useState<bigint>(BigInt(0));

    // const handleInitUtxo = async () => {
    //     if (!identity) return;
    //     // Call the initUtxo function from the cookieActor
    //     await cookieActor.init_btc_utxo({
    //         txid: txid,
    //         vout: vout,
    //         sats: sats,
    //         maybe_rune: []
    //     });
    //     setIsOpen(false);
    // };

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        console.log('Success Finish form:', values);
        await cookieActor.init_btc_utxo({
            txid: values.txid!,
            vout: Number(values.vout!),
            sats: BigInt(values.sats!),
            maybe_rune: []
        });
        setIsOpen(false);
    };

    return (
        <div>
            <Modal
                title="Init Utxo"
                style={{ "paddingTop": "10px" }}
                open={isOpen}
                footer={null}
                onCancel={() => {
                    setIsOpen(false);
                }}
            >
                <Form
                    name="initBtcUtxo"
                    onFinish={onFinish}
                >
                    <Form.Item<FieldType>
                        label="txid"
                        name="txid"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item<FieldType>
                        label="vout"
                        name="vout"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item<FieldType>
                        label="sats"
                        name="sats"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label={null}>
                        <Button type="primary" htmlType="submit">
                            Init
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}