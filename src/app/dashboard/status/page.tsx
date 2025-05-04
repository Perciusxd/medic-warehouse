import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "../borrow/data-table";

import { useMedicineRequestsStatus } from "@/hooks/useMedicineAPI";

import { columns } from "./columns";

export default function StatusDashboard(loggedInHospital) {
    const { medicineRequests, loading: loadingRequest, error: errorRequest, fetchMedicineRequests } = useMedicineRequestsStatus(loggedInHospital.loggedInHospital);
    const [selectedMed, setSelectedMed] = useState(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const handleApproveClick = (med) => {
        setSelectedMed(med);
    }

    useEffect(() => {
        fetchMedicineRequests();
    }, [fetchMedicineRequests]);

    console.log(medicineRequests);
    return (
        <>
            <DataTable 
                columns={columns(handleApproveClick)} 
                data={medicineRequests} 
                globalFilter={globalFilter} 
                setGlobalFilter={setGlobalFilter} />
        </>
    )
}