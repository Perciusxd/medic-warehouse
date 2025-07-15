/**
 * Fetches all medicine responses in transfer
 * @param {string} loggedInHospital - The hospital name to filter by
 * @returns {Promise<Array>} - Filtered medicine responses
 */
export const fetchAllStatusByTicketType = async (loggedInHospital: string, status: string[], ticketType: string) => {
    try {
        if (ticketType === "sharing") {
            const statusParam = JSON.stringify(status);
            const body = {
                loggedInHospital: loggedInHospital,
                status: statusParam,
            }
            const response = await fetch("/api/querySharing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })
            const result = await response.json();
            if (!response.ok) {
                throw new Error("Failed to fetch medicine sharing");
            }
            return result;
        } else {
            const statusParam = JSON.stringify(status);
            const body = {
                loggedInHospital: loggedInHospital,
                status: statusParam,
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
        }
    } catch (error) {
        console.error("Error fetching medicine requests:", error);
        throw error;
    }
};

export const fetchConfirmStatusByTicketType = async (loggedInHospital: string, status: string[], ticketType: string) => {
    try {
        if (ticketType === "sharing") {
            const statusParam = JSON.stringify(status);
            const body = {
                loggedInHospital: loggedInHospital,
                status: statusParam,
            }
            const response = await fetch("/api/querySharingByStatus", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })
            const result = await response.json();
            if (!response.ok) {
                throw new Error("Failed to fetch medicine sharing");
            }
            return result;
        } else {
            const statusParam = JSON.stringify(status);
            const body = {
                loggedInHospital: loggedInHospital,
                status: statusParam,
            }
            const response = await fetch("/api/queryRequestByStatus", {
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
        }
    } catch (error) {
        console.error("Error fetching medicine requests:", error);
        throw error;
    }
}