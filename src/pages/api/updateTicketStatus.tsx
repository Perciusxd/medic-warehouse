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
            id,
            status
        } = req.body;
        try {
            await fetch(`${process.env.ENDPOINT_URL}/api/medicines/update-ticket-status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${req.cookies.token || ""}`,
                },
                body: JSON.stringify({
                    id,
                    status,
                    updatedAt
                })
            }).then(async response => {
                if (!response.ok) {
                    throw new Error('Failed to update ticket status');
                }
                const result = await response.json();
                return res.status(200).json({
                    message: 'Ticket status updated successfully',
                    result
                });
            })
        } catch (error) {
            console.error("Error in transaction:", error);
            res.status(500).json({ error: error });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to initialize Fabric" });
    }
}
