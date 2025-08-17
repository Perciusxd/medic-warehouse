import type { NextApiRequest, NextApiResponse } from "next";
// import { initializeFabric } from "../../../lib/fabricClient";
import { initializeFabric } from "../../lib/fabricClient";
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
            sharingMedicine,
            selectedHospitals
        } = req.body;

        try {
            await fetch(`${process.env.ENDPOINT_URL}/api/sharing/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${req.cookies.token || ""}`,
                },
                body: JSON.stringify({
                    sharingMedicine,
                    selectedHospitals
                })
            }).then(async response => {
                if (!response.ok) {
                    throw new Error('Failed to create sharing');
                }
                const result = await response.json();
                return res.status(200).json({
                    message: 'Sharing created successfully',
                    result
                });
            }).catch(error => {
                //console.error('Error creating sharing:', error);
                return res.status(500).json({
                    message: 'Internal server error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            });
        } catch (error) {
            //console.error('Error parsing request body:', error);
            return res.status(400).json({ message: 'Invalid request data', error: error instanceof Error ? error.message : 'Unknown error' });
        }
        // const contract = await initializeFabric();
        // try {
        //     await contract.submitTransaction(
        //         "CreateMedicineSharing",
        //         JSON.stringify(sharingMedicine),
        //         JSON.stringify(selectedHospitals)
        //     );
        //     //console.log("*** Transaction committed successfully");
        //     res.status(200).json({
        //         message: "Transaction committed successfully",
        //         requestId: sharingMedicine.id,
        //     });
        // } catch (error) {
        //     //console.error("Error in transaction:", error);
        //     res.status(500).json({ error: error });
        // }
    } catch (error) {
        res.status(500).json({ error: "Failed to initialize Fabric" });
    }
}

// Increase Next.js API body size limit to handle Base64 images
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};
