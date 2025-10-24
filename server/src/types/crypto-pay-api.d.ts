declare module '@foile/crypto-pay-api' {
    export class CryptoPay {
        constructor(apiKey: string);

        createInvoice(
            asset: string,
            amount: number | string,
            options?: {
                hidden_message?: string;
                allow_comments?: boolean;
                allow_anonymous?: boolean;
                paid_btn_name?: string;
                paid_btn_url?: string;
                expires_in?: number;
            }
        ): Promise<{
            invoice_id: string;
            status: string;
            pay_url: string;
            mini_app_invoice_url?: string;
        }>;

        createInvoice(options: {
            asset: string;
            amount: string;
            description?: string;
            paid_btn_name?: string;
            paid_btn_url?: string;
        }): Promise<{
            invoice_id: string;
            status: string;
            pay_url: string;
        }>;

        transfer(
            user_id: number,
            asset: string,
            amount: string,
            spend_id: string,
            options?: {
                comment?: string;
                disable_send_notification?: boolean;
            }
        ): Promise<{
            transfer_id: number;
            user_id: number;
            asset: string;
            amount: string;
            status: string;
            completed_at: string;
        }>;
    }
}
