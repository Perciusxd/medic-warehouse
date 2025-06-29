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
    const contract = await initializeFabric();
    try {
      await contract.submitTransaction(
        "CreateMedicine",
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
        status
      );
      console.log("*** Transaction committed successfully");
      res.status(200).json({
        message: "Transaction committed successfully",
        assetId: assetId,
      });
    } catch (error) {
      console.error("Error in transaction:", error);
      res.status(500).json({ error: error });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to initialize Fabric" });
  }
}
