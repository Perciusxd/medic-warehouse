"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { toast } from "sonner"

import { DataTable } from "../request/data-table";
import { columns as columnsRequestToHospital } from "./columns_request_to_hospital";
import { columns as columnSharing } from "./columns_sharing_to_hospital";

import { useMedicineRequests, useMedicineResponsesInTransfer, useMedicineRequestsInConfirm, useMedicineSharingStatus, useMedicineRequestsStatus } from "@/hooks/useMedicineAPI";
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
    const statusFilter = useMemo(() => ["offered", "to-transfer", "to-return", "returned"], []);
    const { medicineRequests, loading: loadingRequest, error: errorRequest, fetchMedicineRequests } = useMedicineRequests(loggedInHospital, statusFilter);
    const { medicineSharing, loading: loadingShare, error: errorShare, fetchMedicineSharing } = useMedicineSharingStatus(loggedInHospital);
    const [selectedMed, setSelectedMed] = useState<any>(null);
    const [loadingRowId, setLoadingRowId] = useState<any | null>(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const [loading, setLoading] = useState(false);
    
    const handleStatusClick = async (med: ResponseAsset, status: string) => {
        setLoadingRowId(med.id);
        setSelectedMed(med);
        const responseBody = {
            responseId: med.id,
            offeredMedicine: med.offeredMedicine,
            status: status,
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
            console.log(result)
            toast.success(status === "to-transfer" ? "ยืนยันการส่งมอบเรียบร้อยแล้ว" : "ยืนยันการรับคืนเรียบร้อยแล้ว", {
                description: result.message,
            })
            fetchMedicineRequests();
            setLoading(false)
        } catch (error) {
            console.error("Error submitting form:", error)
            toast.error("เกิดข้อผิดพลาดในการยืนยัน", {
                description: error.message || "เกิดข้อผิดพลาดในการยืนยัน",
            })
            setLoading(false)
        }
    }

    // const handleConfirmReturn = async (med: ResponseAsset) => {
    //     setLoadingRowId(med.id);
    //     setSelectedMed(med);
    //     const responseBody = {
    //         responseId: med.id,
    //         offeredMedicine: med.offeredMedicine,
    //         status: "returned",
    //     }
    //     setLoading(true)
    //     try {
    //         const response = await fetch("/api/updateRequest", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify(responseBody),
    //         })

    //         if (!response.ok) {
    //             throw new Error("Failed to confirm return")
    //         }

    //         const result = await response.json()
    //         fetchMedicineRequestsInConfirm();
    //         setLoading(false)
    //         toast.success("ยืนยันการรับคืนเรียบร้อยแล้ว")
    //     } catch (error) {
    //         console.error("Error confirming return:", error)
    //         setLoading(false)
    //         toast.error("เกิดข้อผิดพลาดในการยืนยันการรับคืน")
    //     }
    // }

    useEffect(() => {
        fetchMedicineRequests();
        fetchMedicineSharing();
    }, [fetchMedicineRequests, fetchMedicineSharing]);
    console.log("medicineRequests", medicineRequests)
    console.log("medicineSharing", medicineSharing)

    return (
        <div>
            <div >
                <h1>ให้ยืมยา (ขาดแคลน)</h1>
                <div className="bg-white shadow rounded">
                    <DataTable columns={columnsRequestToHospital(handleStatusClick)} data={medicineRequests} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
                </div>
                {/* <DataTable columns={columns(handleApproveClick, loading, loadingRowId)} data={medicineResponses} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} /> */}
            </div>
            <div className="mt-12">
                <h1>ให้ยืม (แบ่งปัน)</h1>
                <div className="bg-white shadow rounded">
                    <DataTable columns={columnSharing(handleStatusClick)} data={medicineSharing} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
                </div>
            </div>
        </div>
    )
}