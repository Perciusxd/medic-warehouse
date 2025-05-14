import { useState, useEffect, useCallback } from "react";
import { fetchAllMedicineRequests, fetchAssetById, fetchAllMedicineRequestsInProgress } from "@/pages/api/requestService";
import { fetchAllMedicineReponsesInTransfer } from "@/pages/api/transferService";

/**
 * Custom hook for managing medicine requests
 * @param {string} loggedInHospital - The currently logged in hospital
 * @returns {Object} Medicine data and operations
 */
export function useMedicineRequests(loggedInHospital: string) {
    const [medicineRequests, setMedicineRequests] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all medicine requests
    const fetchMedicineRequests = useCallback(async () => {
        if (!loggedInHospital) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchAllMedicineRequests(loggedInHospital);
            setMedicineRequests(data);
            return data;
        } catch (error) {
            setError(error.message || "Failed to fetch medicine requests");
        } finally {
            setIsLoading(false);
        }
    }, [loggedInHospital]);

    useEffect(() => {
        fetchMedicineRequests();
    }, [fetchMedicineRequests]);

    return {
        medicineRequests,
        loading,
        error,
        fetchMedicineRequests,
    };
}

/**
 * Custom hook for managing medicine responses in status[in-transfer]
 * @param {string} loggedInHospital - The currently logged in hospital
 * @returns {Object} Medicine data and operations
 */
export function useMedicineResponsesInTransfer(loggedInHospital: string) {
    const [medicineResponses, setMedicineResponses] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all medicine responses
    const fetchMedicineResponses = useCallback(async () => {
        if (!loggedInHospital) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchAllMedicineReponsesInTransfer(loggedInHospital);
            setMedicineResponses(data);
            return data;
        } catch (error) {
            setError(error.message || "Failed to fetch medicine responses");
        } finally {
            setIsLoading(false);
        }
    }, [loggedInHospital]);

    useEffect(() => {
        fetchMedicineResponses();
    }, [fetchMedicineResponses]);

    return {
        medicineResponses,
        loading,
        error,
        fetchMedicineResponses,
    };
}

export function useMedicineRequestsStatus(loggedInHospital: string) {
    const [medicineRequests, setMedicineRequests] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all medicine requests
    const fetchMedicineRequests = useCallback(async () => {
        if (!loggedInHospital) return;

        setIsLoading(true);
        setError(null);

        const body = {
            loggedInHospital: loggedInHospital,
            status: "pending",
        }
        const startFetch = performance.now();
        const response = await fetch("api/queryRequests", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
        const result = await response.json();
        console.log("richQuery", result);
        const endFetch = performance.now();
        console.log("RQ request took", endFetch - startFetch, "ms");
        
        try {
            const startFetch = performance.now();
            const data = await fetchAllMedicineRequestsInProgress(loggedInHospital);
            const requestsWithReponses = await Promise.all(
                data.map(async (item) => {
                    const responseIds = item.responseIds;
                    const responseDetails = await Promise.all(
                        responseIds.map(async (responseId) => {
                            const asset = await fetchAssetById(responseId);
                            return {
                                ...asset,
                                responseId,
                                requestDetails: item,
                            };
                        })
                    )
                    return {
                        ...item,
                        responseDetails,
                    };
                })
            )
            // sort by updatedAt
            requestsWithReponses.sort((a, b) => {
                const dateA = a.updatedAt;
                const dateB = b.updatedAt;
                return dateB - dateA;
            });
            const endFetch = performance.now();
            console.log("Query request took", endFetch - startFetch, "ms");
            setMedicineRequests(requestsWithReponses)
            return requestsWithReponses;
        } catch (error) {
            setError(error.message || "Failed to fetch medicine requests");
        } finally {
            setIsLoading(false);
        }
    }, [loggedInHospital]);
    
    useEffect(() => {
        fetchMedicineRequests();
    }, [fetchMedicineRequests]);

    return {
        medicineRequests,
        loading,
        error,
        fetchMedicineRequests,
    };
}