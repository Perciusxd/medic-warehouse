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
    const { assetId } = req.body;

    try {
      await fetch(`${process.env.ENDPOINT_URL}/api/medicines/query-by-id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${req.cookies.token || ""}`,
        },
        body: JSON.stringify({ assetId }),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to query asset by ID");
        }
        const result = await response.json();
        res.status(200).json(result);
        // return res.status(200).json({
        //   message: "Asset queried successfully",
        //   result,
        // });
      }).catch((error) => {
        console.error("Error querying asset by ID:", error);
        return res.status(500).json({
          message: "Internal server error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      });
    } catch (error) {
      console.error("Error parsing request body:", error);
      return res.status(400).json({
        message: "Invalid request data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // const contract = await initializeFabric();
    // try {
    //   const resultBytes = await contract.evaluateTransaction(
    //     "ReadAssetById",
    //     assetId
    //   );
    //   const resultJson = utf8Decoder.decode(resultBytes);
    //   const result = JSON.parse(resultJson);
    //   console.log("*** Transaction committed successfully");
    //   res.status(200).json(result);
    // } catch (error) {
    //   console.error("Error in transaction:", error);
    //   res.status(500).json({ error: error });
    // }
  } catch (error) {
    res.status(500).json({ error: "Failed to initialize Fabric" });
  }
}
