import { useState, useEffect, useCallback } from "react";
import { fetchAllMedicineRequests } from "@/pages/api/requestService";

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
            console.log("hook fetch data", data);
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

    console.log('medicineRequests', medicineRequests);

    return {
        medicineRequests,
        loading,
        error,
        fetchMedicineRequests,
    };
}
