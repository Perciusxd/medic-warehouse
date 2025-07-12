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
    // const contract = await initializeFabric();
    const { loggedInHospital, status } = req.body;

    try {
      await fetch(`${process.env.ENDPOINT_URL}/api/requests/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${req.cookies.token || ""}`,
        },
        body: JSON.stringify({
          loggedInHospital,
          status,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to query requests by status");
        }
        const result = await response.json();
        return res.status(200).json({
          message: "Requests queried successfully",
          result,
        });
      }).catch((error) => {
        console.error("Error querying requests by status:", error);
        return res.status(500).json({
          message: "Internal server error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      });
    } catch (error) {
      console.error('Error parsing request body:', error);
      return res.status(400).json({ message: 'Invalid request data', error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // try {
    //   console.log('loggedInHospital ================', loggedInHospital);
      
    //     const resultBytes = await contract.evaluateTransaction(
    //         "QueryRequestStatus",
    //         loggedInHospital,
    //         status
    //     );
    //     const resultJson = utf8Decoder.decode(resultBytes);
    //     const result = JSON.parse(resultJson);
    //     console.log("*** QueryRequestStatus Transaction committed successfully");
    //     res.status(200).json(result);
    // } catch (error) {
    //     console.log("error", error);
    //     res.status(500).json({ error: error });
    // }
  } catch (error) {
    res.status(500).json({ error: "Failed to initialize Fabric" });
  }
}