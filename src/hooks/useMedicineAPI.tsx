import { useState, useEffect, useCallback } from "react";
import { fetchAllMedicineRequests, fetchAssetById, fetchAllMedicineRequestsInProgress } from "@/pages/api/requestService";
import { fetchAllMedicineReponsesInTransfer } from "@/pages/api/transferService";
import { fetchAllRequestsByStatus } from "@/pages/api/statusService";
import { fetchAllMedicineSharing } from "@/pages/api/sharingService";
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
        } catch (error: any) {
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

export function useMedicineSharing(loggedInHospital: string) {
    const [medicineSharing, setMedicineSharing] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMedicineSharing = useCallback(async () => {
        if (!loggedInHospital) return;
        setIsLoading(true);
        setError(null);
        try {
            // Error
            const data = await fetchAllMedicineSharing(loggedInHospital);
            setMedicineSharing(data);
            return data;
        } catch (error: any) {
            setError(error.message || "Failed to fetch medicine sharing");
        } finally {
            setIsLoading(false);
        }
    }, [loggedInHospital]);

    useEffect(() => {
        fetchMedicineSharing();
    }, [fetchMedicineSharing]);

    return {
        medicineSharing,
        loading,
        error,
        fetchMedicineSharing,
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
        } catch (error: any) {
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
    console.log("useMedicineRequestsStatus == medicineRequests");
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all medicine requests
    const fetchMedicineRequests = useCallback(async () => {
        if (!loggedInHospital) return;

        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetchAllRequestsByStatus(loggedInHospital, "pending");
            console.log("useMedicineRequestsStatus == response", response);
            let filterRes;
    
            if (filterRes) {
                setMedicineRequests(filterRes);
                return filterRes;
            } else {
                setMedicineRequests(response)
                return response;
            }
        } catch (error: any) {
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