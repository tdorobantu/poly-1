import { ApiKeyCreds } from "@polymarket/clob-client";

const getCredentials = (): ApiKeyCreds => {
    return {
        key: `${process.env.CLOB_API_KEY}`,
        secret: `${process.env.CLOB_SECRET}`,
        passphrase: `${process.env.CLOB_PASS_PHRASE}`,
    };
}

export default getCredentials;