import { ResponseAsset } from "@/types/responseMed";

/**
* Fetches all medicine reponses and filters by hospital and status[in-transfer]
* @param {string} loggedInHospital - The hospital name to filter by
* @returns {Promise<Array>} - Filtered medicine responses
*/
export const fetchAllMedicineReponsesInTransfer = async (loggedInHospital: string) => {
    try {
        const response = await fetch("api/queryAll");
        if (!response.ok) {
            throw new Error("Failed to fetch medicine responses");
        }
        const data = await response.json();
        const filteredResponseInTransfer = data
            .filter((item: any) => item.respondingHospitalNameEN === loggedInHospital && item.status === "to-transfer")
        return filteredResponseInTransfer
    } catch (error) {
        console.error("error fetching medicine responses:", error);
        throw error;    
    }
}