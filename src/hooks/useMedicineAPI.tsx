import { useState, useEffect, useCallback } from "react";
import { fetchAllMedicineRequests, fetchAssetById, fetchAllMedicineRequestsInProgress } from "@/pages/api/requestService";
import { fetchAllMedicineReponsesInTransfer } from "@/pages/api/transferService";
import { fetchAllStatusByTicketType, fetchConfirmStatusByTicketType } from "@/pages/api/statusService";
import { fetchAllMedicineSharing } from "@/pages/api/sharingService";
/**
 * Custom hook for managing medicine requests
 * @param {string} loggedInHospital - The currently logged in hospital
 * @returns {Object} Medicine data and operations
 */
export function useMedicineRequests(loggedInHospital: string, status: string[]) {
    const [medicineRequests, setMedicineRequests] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all medicine requests
    const fetchMedicineRequests = useCallback(async () => {
        if (!loggedInHospital) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchAllMedicineRequests(loggedInHospital, status);
            setMedicineRequests(data);
            return data;
        } catch (error: any) {
            setError(error.message || "Failed to fetch medicine requests");
        } finally {
            setIsLoading(false);
        }
    }, [loggedInHospital, status]);

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

export function useMedicineSharing(loggedInHospital: string, status: string[]) {
    const [medicineSharing, setMedicineSharing] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMedicineSharing = useCallback(async () => {
        if (!loggedInHospital) return;
        setIsLoading(true);
        setError(null);
        try {
            // Fixed: Pass the array directly, not the joined string
            const data = await fetchAllMedicineSharing(loggedInHospital, status);
            console.log("status", status)
            setMedicineSharing(data);
            return data;
        } catch (error: any) {
            setError(error.message || "Failed to fetch medicine sharing");
        } finally {
            setIsLoading(false);
        }
    }, [loggedInHospital, status]);

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

export function useMedicineRequestsStatus(loggedInHospital: string, status: string[]) {
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
            const response = await fetchAllStatusByTicketType(loggedInHospital, status, "request");
            setMedicineRequests(response);
            return response;
        } catch (error: any) {
            setError(error.message || "Failed to fetch medicine requests");
        } finally {
            setIsLoading(false);
        }
    }, [loggedInHospital, status]);
    
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

export function useMedicineSharingStatus(loggedInHospital: string, status: string[]) {
    const [medicineSharing, setMedicineSharing] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMedicineSharing = useCallback(async () => {
        if (!loggedInHospital) return;
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetchAllStatusByTicketType(loggedInHospital, status, "sharing");
            setMedicineSharing(response);
            return response;
        } catch (error: any) {
            setError(error.message || "Failed to fetch medicine sharing");
        } finally {
            setIsLoading(false);
        }
    }, [loggedInHospital, status]);

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

export function useMedicineRequestsInConfirm(loggedInHospital: string, status: string[]) {
    const [medicineRequestsInConfirm, setMedicineRequestsInConfirm] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMedicineRequestsInConfirm = useCallback(async () => {
        if (!loggedInHospital) return;
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetchConfirmStatusByTicketType(loggedInHospital, status, "request");
            setMedicineRequestsInConfirm(response);
            return response;
        } catch (error: any) {
            setError(error.message || "Failed to fetch medicine requests");
        } finally {
            setIsLoading(false);
        }
    }, [loggedInHospital, status]);

    useEffect(() => {
        fetchMedicineRequestsInConfirm();
    }, [fetchMedicineRequestsInConfirm]);

    return {
        medicineRequestsInConfirm,
        loading,
        error,
        fetchMedicineRequestsInConfirm,
    };
}

export function useMedicineSharingInReturn(loggedInHospital: string, status: string[]) {
    const [medicineSharingInReturn, setMedicineSharingInReturn] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMedicineSharingInReturn = useCallback(async () => {
        if (!loggedInHospital) return;
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetchConfirmStatusByTicketType(loggedInHospital, status, "sharing");
            setMedicineSharingInReturn(response);
            return response;
        } catch (error: any) {
            setError(error.message || "Failed to fetch medicine sharing");
        } finally {
            setIsLoading(false);
        }
    }, [loggedInHospital, status]);

    useEffect(() => {
        fetchMedicineSharingInReturn();
    }, [fetchMedicineSharingInReturn]);

    return {
        medicineSharingInReturn,
        loading,
        error,
        fetchMedicineSharingInReturn,
    };
}