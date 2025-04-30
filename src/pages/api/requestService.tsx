import { ResponseAsset } from "@/types/responseMed";
/**
 * Fetches all medicine requests and filters by hospital and status
 * @param {string} loggedInHospital - The hospital name to filter by
 * @returns {Promise<Array>} - Filtered medicine requests
 */
export const fetchAllMedicineRequests = async (loggedInHospital: string) => {
    try {
        const response = await fetch("api/queryAll");
        if (!response.ok) {
            throw new Error("Failed to fetch medicine requests");
        }
        // Fetch all medicine requests
        // Filter only the requests that are pending and belong to the logged-in hospital
        const data = await response.json();
        const requestIdToLoggedInHospital = data
            .filter((item: any) => item.respondingHospitalNameEN === loggedInHospital)
            .map((item: any) => item.requestId);

        return data.filter((item: any) =>
            requestIdToLoggedInHospital.includes(item.id)
        );
    } catch (error) {
        console.error("Error fetching medicine requests:", error);
        throw error;
    }
};

/**
 * Fetches a specific asset by ID
 * @param {string} assetId - The ID of the asset to fetch
 * @returns {Promise<Object>} - The asset data
 */
export const fetchAssetById = async (assetId: string) => {
    try {
        const response = await fetch("/api/queryById", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ assetId }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch asset by ID");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching asset by ID:", error);
        throw error;
    }
};

/**
 * Fetches medicine requests with their associated assets
 * @param {string} loggedInHospital - The hospital name to filter by
 * @returns {Promise<Array>} - Medicine requests with asset data
 */
export const fetchMedicineRequestsWithAssets = async (loggedInHospital: string) => {
    try {
        const filteredRequests = await fetchAllMedicineRequests(loggedInHospital);

        // Fetch assets for each requestId
        const requestsWithAssets = await Promise.all(
            filteredRequests.map(async (item: ResponseAsset) => {
                const asset = await fetchAssetById(item.requestId);
                return {
                    ...item,
                    asset,
                };
            })
        );

        return requestsWithAssets;
    } catch (error) {
        console.error("Error fetching medicine requests with assets:", error);
        throw error;
    }
};

/**
 * Deletes a medicine by ID
 * @param {string} medicineID - The ID of the medicine to delete
 * @param {string} medicineName - The name of the medicine to delete
 * @returns {Promise<Response>} - The response from the delete operation
 */
export const deleteMedicine = async (medicineID: string, medicineName: string) => {
    try {
        const formattedId = medicineID.toString();

        const response = await fetch(`/api/deleteMed`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                medicineID: formattedId,
                medicineName
            })
        });

        if (!response.ok) {
            throw new Error('Failed to delete medicine');
        }

        return response;
    } catch (error) {
        console.error('Error deleting medicine:', error);
        throw error;
    }
};

/**
 * Helper function to format dates consistently
 * @param {string|number} dateString - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString: string) => {
    if (!dateString) return "";

    try {
        // Try to handle various date formats
        if (isNaN(Number(dateString))) {
            return new Date(dateString).toLocaleDateString();
        } else {
            return new Date(Number(dateString)).toLocaleDateString();
        }
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString;
    }
};