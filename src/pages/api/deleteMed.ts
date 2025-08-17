import type { NextApiRequest, NextApiResponse } from "next";
// import { initializeFabric } from "../../../lib/fabricClient";
import { initializeFabric } from "../../lib/fabricClient";
import { TextDecoder } from "util";

const utf8Decoder = new TextDecoder();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    //console.log("*** Deleting medicine", req.body);
    const { medicineID, medicineName } = req.body;

    try {
      await fetch(`${process.env.ENDPOINT_URL}/api/medicines/${medicineID}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${req.cookies.token || ""}`,
        },
        body: JSON.stringify({
          medicineID,
          medicineName,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to delete medicine");
        }
        const result = await response.json();
        return res.status(200).json({
          message: "Medicine deleted successfully",
          result,
        });
      }).catch((error) => {
        //console.error("Error deleting medicine:", error);
        return res.status(500).json({
          message: "Internal server error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      });
    } catch (error) {
      //console.error("Error parsing request body:", error);
      return res.status(400).json({ message: "Invalid request data", error: error instanceof Error ? error.message : "Unknown error" });
    }

    // const contract = await initializeFabric();
    // //console.log("*** Contract initialized", medicineID, medicineName);
    // try {
    //     const result = await contract.submitTransaction("DeleteMedicine", medicineID);
    //     res.status(200).json({ message: "Medicine deleted successfully" });
    // } catch (error) {
    //   //console.error("Error deleting medicine:", error);
    //   res.status(500).json({ message: "Error deleting medicine" });
    // }
  } catch (error) {
    //console.error("Error initializing fabric:", error);
    res.status(500).json({ message: "Error initializing fabric" });
  }
}
