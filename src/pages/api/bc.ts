import type { NextApiRequest, NextApiResponse } from "next";
// import { initializeFabric } from "../../../lib/fabricClient";
import { initializeFabric } from "../../lib/fabricClient";
import { TextDecoder } from 'util'; 

const utf8Decoder = new TextDecoder();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const contract = await initializeFabric();
    const resultBytes = await contract.evaluateTransaction("GetAllMedicines");
    const resultJson = utf8Decoder.decode(resultBytes);
    const result: any = JSON.parse(resultJson);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to initialize Fabric" });
  }
}
