import type { NextApiRequest, NextApiResponse } from "next";
import { initializeFabric } from "../../../lib/fabricClient";
import { TextDecoder } from "util";

const utf8Decoder = new TextDecoder();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }
    try {
        const updatedAt = new Date().toString();
        const {
            responseId,
            acceptOffer,
        } = req.body;
        const contract = await initializeFabric();
        try {
            await contract.submitTransaction(
                "AcceptSharing",
                responseId,
                JSON.stringify(acceptOffer),
                updatedAt
            );
            console.log("*** Transaction committed successfully");
            res.status(200).json({
                message: "Transaction committed successfully",
                assetId: responseId,
            });
        } catch (error) {
            console.error("Error in transaction:", error);
            res.status(500).json({ error: error });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to initialize Fabric" });
    }
}
