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
        const {
            loggedInHospital,
            status,
        } = req.body;
        const contract = await initializeFabric();
        try {
            const resultBytes = await contract.evaluateTransaction(
                "QuerySharingStatusToHospital",
                loggedInHospital,
                status,
            );
            const resultJson = utf8Decoder.decode(resultBytes);
            const result = JSON.parse(resultJson);
            console.log("*** QuerySharingStatusToHospital Transaction committed successfully");
            res.status(200).json(result);
        } catch (error) {
            console.log("error", error);
            res.status(500).json({ error: error });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to initialize Fabric" });
    }
}