import { ResponseAsset } from "@/types/responseMed";

/**
* Fetches all medicine reponses and filters by hospital and status[in-transfer]
* @param {string} loggedInHospital - The hospital name to filter by
* @returns {Promise<Array>} - Filtered medicine responses
*/
export const fetchAllMedicineReponsesInTransfer = async (loggedInHospital: string) => {
    console.log("transfer API", loggedInHospital);
    try {
        const response = await fetch("api/queryAll");
        if (!response.ok) {
            throw new Error("Failed to fetch medicine responses");
        }
        const data = await response.json();
        console.log('transfer data', data);
        const filteredResponseInTransfer = data
            .filter((item: any) => item.respondingHospitalNameEN === loggedInHospital && item.status === "in-transfer")
        console.log('filterResp', filteredResponseInTransfer);
        return filteredResponseInTransfer
    } catch (error) {
        console.error("error fetching medicine responses:", error);
        throw error;    
    }
}