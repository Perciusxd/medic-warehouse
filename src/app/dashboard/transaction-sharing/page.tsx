"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCcwIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { toast } from "sonner"

import { DataTable } from "../request/data-table";
import { columns as columnsRequestToHospital } from "./columns_request_to_hospital";
import { columns as columnSharing } from "./columns_sharing_to_hospital";

import { useMedicineRequests, useMedicineResponsesInTransfer, useMedicineRequestsInConfirm, useMedicineSharingStatus, useMedicineRequestsStatus } from "@/hooks/useMedicineAPI";
import { useHospital } from "@/context/HospitalContext";

import { ResponseAsset } from "@/types/responseMed";
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function TransferDashboard() {
    const { loggedInHospital } = useHospital();
    const statusFilter = useMemo(() => ["offered", "to-transfer", "to-return", "returned"], []);
    const { medicineRequests, loading: loadingRequest, error: errorRequest, fetchMedicineRequests } = useMedicineRequests(loggedInHospital, statusFilter);
    const { medicineSharing, loading: loadingShare, error: errorShare, fetchMedicineSharing } = useMedicineSharingStatus(loggedInHospital);
    const [selectedMed, setSelectedMed] = useState<any>(null);
    const [loadingRowId, setLoadingRowId] = useState<any | null>(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [updatedLast, setUpdatedLast] = useState<Date | null>(null);
    
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
            <div className="flex items-center justify-between mb-4">
                <div /> {/* Placeholder for alignment, can add search if needed */}
                <div className="flex items-center space-x-2">
                    <Button variant={"outline"} onClick={() => {
                        fetchMedicineRequests();
                        fetchMedicineSharing();
                        setUpdatedLast(new Date());
                    }}>
                        <RefreshCcwIcon />
                        {updatedLast ? `Updated ${formatDistanceToNow(updatedLast, { addSuffix: true })}` : ""}
                    </Button>
                </div>
            </div>
            <div >
                <h1>ให้ยืมยา (ขาดแคลน)</h1>
                <div className="bg-white shadow rounded">
                    <DataTable columns={columnsRequestToHospital(handleStatusClick)} data={medicineRequests} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
                </div>
                {/* <DataTable columns={columns(handleApproveClick, loading, loadingRowId)} data={medicineResponses} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} /> */}
            </div>
            <div className="mt-12">
                <h1>ให้ยืม (แบ่งปัน)</h1>
                {
                    loadingShare ? (
                        <div className="p-8 flex flex-col items-center justify-center">
                            <LoadingSpinner width="48" height="48" />
                            <p className="mt-4 text-gray-500">Loading medicines...</p>
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded">
                            <DataTable columns={columnSharing()} data={medicineSharing} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
                        </div>
                    )
                }
            </div>
        </div>
    )
}