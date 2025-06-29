declare module 'zibal' {
    interface ZibalConfig {
        merchant?: string;
        callbackUrl?: string;
        token: string
    }

    interface RequestPayload {
        amount: number;
        callbackUrl?: string;
        merchant?: string;
        orderId?: string;
        mobile?: string;
        multiplexingInfos?: any[];
        description?: string;
        allowedCards?: string[];
        percentMode?: number;
        feeMode?: number;
        linkToPay?: boolean;
        sms?: boolean;
    }

    interface RequestResponse {
        success: boolean;
        result?: number;
        trackId?: number;
        paymentUrl?: string;
        persianMessage?: string;
        [key: string]: any;
    }

    interface VerifyPayload {
        merchant?: string;
        trackId: number;
    }

    interface VerifyResponse {
        success: boolean;
        amount?: number;
        persianMessage?: string;
        [key: string]: any;
    }

    class Zibal {
        constructor(config?: ZibalConfig);
        setMerchant(merchant: string): void;
        init(config: ZibalConfig): void;
        request(payload: RequestPayload): Promise<RequestResponse>;
        verify(payload: VerifyPayload): Promise<VerifyResponse>;
    }

    export = Zibal;
}
