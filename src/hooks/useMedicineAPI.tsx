import { useApiEndpoint } from "@/context/ApiEndpointContext";
import { useState, useEffect, useCallback } from "react";
import { fetchAllMedicineRequests, fetchAssetById, fetchAllMedicineRequestsInProgress } from "@/pages/api/requestService";
import { fetchAllMedicineReponsesInTransfer } from "@/pages/api/transferService";
import { fetchAllStatusByTicketType } from "@/pages/api/statusService";
import { fetchAllMedicineSharing } from "@/pages/api/sharingService";
/**
 * Custom hook for managing medicine requests
 * @param {string} loggedInHospital - The currently logged in hospital
 * @returns {Object} Medicine data and operations
 */
export function useMedicineRequests(loggedInHospital: string) {
    const { apiEndpoint } = useApiEndpoint();
    const [medicineRequests, setMedicineRequests] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all medicine requests
    const fetchMedicineRequests = useCallback(async () => {
        if (!loggedInHospital) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchAllMedicineRequests(apiEndpoint, loggedInHospital);
            setMedicineRequests(data);
            return data;
        } catch (error: any) {
            setError(error.message || "Failed to fetch medicine requests");
        } finally {
            setIsLoading(false);
        }
    }, [loggedInHospital, apiEndpoint]);

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
    const { apiEndpoint } = useApiEndpoint();
    const [medicineResponses, setMedicineResponses] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all medicine responses
    const fetchMedicineResponses = useCallback(async () => {
        if (!loggedInHospital) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchAllMedicineReponsesInTransfer(apiEndpoint, loggedInHospital);
            setMedicineResponses(data);
            return data;
        } catch (error: any) {
            setError(error.message || "Failed to fetch medicine responses");
        } finally {
            setIsLoading(false);
        }
    }, [loggedInHospital, apiEndpoint]);

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
    const { apiEndpoint } = useApiEndpoint();
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
            const response = await fetchAllStatusByTicketType(apiEndpoint, loggedInHospital, "pending", "request");
            setMedicineRequests(response)
            return response;

        } catch (error: any) {
            setError(error.message || "Failed to fetch medicine requests");
        } finally {
            setIsLoading(false);
        }
    }, [loggedInHospital, apiEndpoint]);
    
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

export function useMedicineSharingStatus(loggedInHospital: string) {
    const { apiEndpoint } = useApiEndpoint();
    const [medicineSharing, setMedicineSharing] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMedicineSharing = useCallback(async () => {
        if (!loggedInHospital) return;
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetchAllStatusByTicketType(apiEndpoint, loggedInHospital, "pending", "sharing");
            setMedicineSharing(response);
            return response;
        } catch (error: any) {
            setError(error.message || "Failed to fetch medicine sharing");
        } finally {
            setIsLoading(false);
        }
    }, [loggedInHospital, apiEndpoint]);

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