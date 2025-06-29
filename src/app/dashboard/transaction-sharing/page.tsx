"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { toast } from "sonner"

import { DataTable } from "../request/data-table";
import { columns } from "./columns";
import { columnsConfirmReturn } from "./columns_confirm_return";

import { useMedicineRequests, useMedicineResponsesInTransfer, useMedicineRequestsInConfirm } from "@/hooks/useMedicineAPI";
import { useHospital } from "@/context/HospitalContext";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ResponseAsset } from "@/types/responseMed";

export default function TransferDashboard() {
    const { loggedInHospital } = useHospital();
    const { medicineResponses, loading: loadingResponse, error: errorResponse, fetchMedicineResponses } = useMedicineResponsesInTransfer(loggedInHospital);
    const { medicineRequestsInConfirm, loading: loadingInConfirm, error: errorInConfirm, fetchMedicineRequestsInConfirm } = useMedicineRequestsInConfirm(loggedInHospital, "confirm-return");
    const [selectedMed, setSelectedMed] = useState<any>(null);
    const [loadingRowId, setLoadingRowId] = useState<any | null>(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const [loading, setLoading] = useState(false);
    console.log("medicineResponses", medicineResponses)
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

    const handleConfirmReturn = async (med: ResponseAsset) => {
        setLoadingRowId(med.id);
        setSelectedMed(med);
        const responseBody = {
            responseId: med.id,
            offeredMedicine: med.offeredMedicine,
            status: "returned",
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
                throw new Error("Failed to confirm return")
            }

            const result = await response.json()
            fetchMedicineRequestsInConfirm();
            setLoading(false)
            toast.success("ยืนยันการรับคืนเรียบร้อยแล้ว")
        } catch (error) {
            console.error("Error confirming return:", error)
            setLoading(false)
            toast.error("เกิดข้อผิดพลาดในการยืนยันการรับคืน")
        }
    }

    useEffect(() => {
        fetchMedicineResponses();
        fetchMedicineRequestsInConfirm();
    }, [fetchMedicineResponses, fetchMedicineRequestsInConfirm]);
    console.log("medicineRequestsInConfirm", medicineRequestsInConfirm)
    return (
        <div>
            <div>
                <h1>Transfer</h1>
                <DataTable columns={columns(handleApproveClick, loading, loadingRowId)} data={medicineResponses} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
            </div>
            <div>
                <h1>Confirm Return</h1>
                <DataTable columns={columnsConfirmReturn(handleConfirmReturn, loading, loadingRowId)} data={medicineRequestsInConfirm} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
            </div>
        </div>
    )
}