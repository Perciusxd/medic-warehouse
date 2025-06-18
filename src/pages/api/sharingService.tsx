import { ResponseAsset } from "@/types/responseMed";
import { fetchAssetById } from "./requestService";

/**
* Fetches all medicine reponses and filters by hospital and status[in-transfer]
* @param {string} loggedInHospital - The hospital name to filter by
* @returns {Promise<Array>} - Filtered medicine responses
*/
export const fetchAllMedicineSharing = async (loggedInHospital: string) => {
    try {
        const body = {
            loggedInHospital: loggedInHospital,
            status: 'pending'
        }
        const response = await fetch("/api/querySharingByStatus", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("error fetching medicine responses:", error);
        throw error;
    }
}