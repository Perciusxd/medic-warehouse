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
    // const contract = await initializeFabric();
    // const resultBytes = await contract.evaluateTransaction("GetAllMedicines");
    // const resultJson = utf8Decoder.decode(resultBytes);
    // const result: any = JSON.parse(resultJson);
    // res.status(200).json(result);
    try {
      await fetch(`${process.env.ENDPOINT_URL}/api/medicines`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.cookies.token || ''}`
      }
      }).then(async response => {
        if (!response.ok) {
          throw new Error('Failed to fetch data from API');
        }
        const result = await response.json();
        return res.status(200).json({
          message: 'Query successful',
          result
        });
      }).catch(error => {
        //console.error('Error fetching data:', error);
        return res.status(500).json({
          message: 'Internal server error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      });
    } catch (error) {
      //console.error('Error initializing Fabric:', error);
      return res.status(500).json({ message: 'Failed to initialize Fabric', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to initialize Fabric" });
  }
}
