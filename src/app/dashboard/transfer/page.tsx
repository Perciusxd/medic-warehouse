"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { toast } from "sonner"

import { DataTable } from "../borrow/data-table";
import { columns } from "./columns";

import { useMedicineRequests, useMedicineResponsesInTransfer } from "@/hooks/useMedicineAPI";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ResponseAsset } from "@/types/responseMed";

export default function TransferDashboard(loggedInHospital) {
    const { medicineResponses, loading: loadingResponse, error: errorResponse, fetchMedicineResponses } = useMedicineResponsesInTransfer(loggedInHospital.loggedInHospital);
    const [selectedMed, setSelectedMed] = useState(null);
    const [loadingRowId, setLoadingRowId] = useState(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const [loading, setLoading] = useState(false);

    const handleApproveClick = async (med: ResponseAsset) => {
        setLoadingRowId(med.id);
        setSelectedMed(med);
        const responseBody = {
            responseId: med.id,
            offeredMedicine: med.offeredMedicine,
            status: "to-return",
        }
        setLoading(true)
        try {
            const response = await fetch("/api/updateRequest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(responseBody),
            })

            if (!response.ok) {
                throw new Error("Failed to submit")
            }

            const result = await response.json()
            fetchMedicineResponses();
            setLoading(false)
        } catch (error) {
            console.error("Error submitting form:", error)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMedicineResponses();
    }, [fetchMedicineResponses]);

    return (
        <div>
            <DataTable columns={columns(handleApproveClick, loading, loadingRowId)} data={medicineResponses} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        </div>
    )
}