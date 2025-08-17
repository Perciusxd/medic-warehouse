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
    const assetId = `asset${String(Date.now())}`;
    // Get data from the request body

    // New data
    // const {
    // postingDate,
    // postingHospital,
    // medicineName,
    // quantity,
    // unit,
    // batchNumber,
    // manufacturer,
    // manufactureDate,
    // expiryDate,
    // currentLocation,
    // status
    // } = req.body;

    const {
      postingDate,
      postingHospital,
      medicineName,
      quantity,
      unit,
      batchNumber,
      manufacturer,
      manufactureDate,
      expiryDate,
      currentLocation,
      status,
    } = req.body;
    
    try {
      await fetch(`${process.env.ENDPOINT_URL}/api/medicines/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${req.cookies.token || ""}`,
      },
      body: JSON.stringify({
        assetId,
        postingDate,
        postingHospital,
        medicineName,
        quantity,
        unit,
        batchNumber,
        manufacturer,
        manufactureDate,
        expiryDate,
        currentLocation,
        status,
      }),
    }).then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to create medicine");
        }
        const result = await response.json();
        return res.status(200).json({
          message: "Medicine created successfully",
          assetId: assetId,
          result,
        });
      })
      .catch((error) => {
        //console.error("Error creating medicine:", error);
        return res.status(500).json({
          message: "Internal server error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      });
    } catch (error) {
      //console.error("Error parsing request body:", error);
      return res.status(400).json({
        message: "Invalid request data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
    

    // const contract = await initializeFabric();
    // try {
    //   await contract.submitTransaction(
    //     "CreateMedicine",
    //     assetId,
    //     postingDate,
    //     postingHospital,
    //     medicineName,
    //     quantity,
    //     unit,
    //     batchNumber,
    //     manufacturer,
    //     manufactureDate,
    //     expiryDate,
    //     currentLocation,
    //     status
    //   );
    //   //console.log("*** Transaction committed successfully");
    //   res.status(200).json({
    //     message: "Transaction committed successfully",
    //     assetId: assetId,
    //   });
    // } catch (error) {
    //   //console.error("Error in transaction:", error);
    //   res.status(500).json({ error: error });
    // }
  } catch (error) {
    res.status(500).json({ error: "Failed to initialize Fabric" });
  }
}
