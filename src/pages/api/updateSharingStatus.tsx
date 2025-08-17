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
        const updatedAt = Date.now().toString();
        const {
            sharingId,
            status
        } = req.body;
        try {
            // await contract.submitTransaction(
            //     "UpdateSharingStatus",
            //     sharingId,
            //     status,
            //     updatedAt
            // );
            // //console.log("*** Transaction committed successfully");
            // res.status(200).json({
            //     message: "Transaction committed successfully",
            //     assetId: sharingId,
            // });
            await fetch(`${process.env.ENDPOINT_URL}/api/sharing/update-status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${req.cookies.token || ""}`,
                },
                body: JSON.stringify({
                    sharingId: sharingId,
                    status: status,
                    updatedAt: updatedAt
                })
            }).then(async response => {
                if (!response.ok) {
                    throw new Error('Failed to update sharing status');
                }
                const result = await response.json();
                return res.status(200).json({
                    message: 'Update sharing status completed',
                    result
                });
            }).catch(error => {
                //console.error('Error update sharing', error);
                return res.status(500).json({
                    message: 'Internal server error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                })
            })
        } catch (error) {
            //console.error("Error in transaction:", error);
            res.status(500).json({ error: error });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to initialize Fabric" });
    }
}
