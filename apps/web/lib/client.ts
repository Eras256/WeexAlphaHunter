import { createThirdwebClient } from "thirdweb";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const secretKey = process.env.THIRDWEB_SECRET_KEY;

if (!clientId && !secretKey) {
    console.warn("No client ID or Secret Key provided for Thirdweb");
}

export const client = createThirdwebClient(
    secretKey
        ? { secretKey }
        : clientId
            ? { clientId }
            : { clientId: "demo" } // Fallback to avoid crash, but will likely fail requests
);
