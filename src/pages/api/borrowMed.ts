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
    //console.log(req.body);
    const borrowDate = `${String(Date.now())}`;
    const borrowID = `borrow${String(Date.now())}`;
    // Get data from the request body
    const {
        medicineID,
        borrowHospital,
        borrowQty
    } = req.body;
    try {
      await fetch(`${process.env.ENDPOINT_URL}/api/medicines/borrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${req.cookies.token || ''}`
        },
        body: JSON.stringify(req.body)
      }).then(async response => {
        if (!response.ok) {
          throw new Error('Failed to borrow medicine');
        }
        const result = await response.json();
        return res.status(200).json({
          message: 'Medicine borrowed successfully',
          result
        });
      }).catch(error => {
        //console.error('Error borrowing medicine:', error);
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
    //   const commit = await contract.submitAsync("BorrowMedicine", {
    //     arguments: [
    //         medicineID,
    //         borrowID,
    //         borrowHospital,
    //         String(borrowQty),
    //         borrowDate
    //     ],
    //   });
    //   const previousMedData = utf8Decoder.decode(commit.getResult());
    //   //console.log(
    //     `*** Successfully submitted transaction to borrow ${previousMedData}`
    //   );
    //   const status = await commit.getStatus();
    //   if (!status.successful) {
    //     throw new Error(
    //       `Transaction ${
    //         status.transactionId
    //       } failed to commit with status code ${String(status.code)}`
    //     );
    //   }
    //   //console.log("*** Transaction committed successfully");
    //   res.status(200).json({
    //     message: "Transaction committed successfully",
    //     assetId: medicineID,
    //   });
    // } catch (error) {
    //   //console.error("Error in transaction:", error);
    //   res.status(500).json({ error: error });
    // }
  } catch (error) {
    res.status(500).json({ error: "Failed to initialize Fabric" });
  }
}
