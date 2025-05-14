/**
 * Fetches all medicine responses in transfer
 * @param {string} loggedInHospital - The hospital name to filter by
 * @returns {Promise<Array>} - Filtered medicine responses
 */
export const fetchAllRequestsByStatus = async (loggedInHospital: string, status: string) => {
    try {
        const body = {
            loggedInHospital: loggedInHospital,
            status: "pending"
        }
        const response = await fetch("/api/queryRequests", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
        const result = await response.json();
        if (!response.ok) {
            throw new Error("Failed to fetch medicine requests");
        }
        return result;
    } catch (error) {
        console.error("Error fetching medicine requests:", error);
        throw error;
    }
};