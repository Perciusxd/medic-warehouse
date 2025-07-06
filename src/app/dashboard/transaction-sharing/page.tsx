"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCcwIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { DataTable } from "../request/data-table";
import { columns as columnsRequestToHospital } from "./columns_request_to_hospital";
import { columns as columnSharing } from "./columns_sharing_to_hospital";
import { columns as columnSharingInReturn } from "./column_mock_return";

import { useMedicineRequests, useMedicineResponsesInTransfer, useMedicineRequestsInConfirm, useMedicineSharingStatus, useMedicineRequestsStatus, useMedicineSharingInReturn } from "@/hooks/useMedicineAPI";
import { useHospital } from "@/context/HospitalContext";

import { ResponseAsset } from "@/types/responseMed";

import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ConfirmSharingDialog from '@/components/dialogs/confirm-sharing-dialog';
import AcceptSharingDialog from '@/components/dialogs/accept-sharing-dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import ReturnDialog from '@/components/dialogs/return-dialog';
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';

export default function TransferDashboard() {
    const { loggedInHospital } = useHospital();
    const statusFilter = useMemo(() => ["offered", "to-transfer", "to-return", "returned"], []);
    const { medicineRequests, loading: loadingRequest, error: errorRequest, fetchMedicineRequests } = useMedicineRequests(loggedInHospital, statusFilter);
    const { medicineSharing, loading: loadingShare, error: errorShare, fetchMedicineSharing } = useMedicineSharingStatus(loggedInHospital);
    const { medicineSharingInReturn, loading: loadingReturn, error: errorReturn, fetchMedicineSharingInReturn } = useMedicineSharingInReturn(loggedInHospital, "to-confirm");
    const [selectedMed, setSelectedMed] = useState<any>(null);
    const [loadingRowId, setLoadingRowId] = useState<any | null>(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [updatedLast, setUpdatedLast] = useState<Date | null>(null);

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [acceptSharingDialogOpen, setAcceptSharingDialogOpen] = useState(false);
    const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [confirmReceiveDeliveryDialogOpen, setConfirmReceiveDeliveryDialogOpen] = useState(false);

    const handleApproveClick = (med: any) => {
        setSelectedMed(med);
        setConfirmDialogOpen(true);
    }

    const handleReConfirmClick = (med: any) => {
        console.log('handleReConfirmClick', med);
        setSelectedMed(med);
        setAcceptSharingDialogOpen(true);
    }

    const handleDeliveryClick = async (med :any) => {
        console.log('handleDeliveryClick', med);
        setSelectedMed(med);
        setDeliveryDialogOpen(true);
    }

    const handleReturnClick = async (med :any) => {
        console.log('handleReturnClick', med);
        setSelectedMed(med);
        setReturnDialogOpen(true);
    }

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
                description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการยืนยัน",
            })
            setLoading(false)
        }
    }

    const handleConfirmReceiveDelivery = async (med: any) => {
        console.log('handleConfirmReceiveDelivery', med);
        setSelectedMed(med);
        setConfirmReceiveDeliveryDialogOpen(true);
    }

    const confirmDelivery = async (med: any) => {
        console.log(med)
        const responseBody = {
            sharingId: med.responseId,
            acceptOffer: med.acceptedOffer,
            status: "to-confirm",
            returnTerm: med.sharingReturnTerm,
        }
        console.log('responseBody', responseBody)
        setLoading(true)
        try {
            const response = await fetch("/api/updateSharing", {
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
            console.log('result', result)
            fetchMedicineRequests();
            setLoading(false)
            return true;
        } catch (error) {
            console.error("Error submitting form:", error)
            setLoading(false)
            return false;
        }
    }

    const confirmReceiveDelivery = async (med: any) => {
        const responseBody = {
            sharingId: med.responseId,
            acceptOffer: med.acceptedOffer,
            status: "in-return",
        }
        return true;
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
        fetchMedicineSharingInReturn();
    }, [fetchMedicineRequests, fetchMedicineSharing, fetchMedicineSharingInReturn]);
    console.log("medicineSharingInReturn", medicineSharingInReturn)

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
                            <DataTable columns={columnSharing(handleApproveClick, handleReConfirmClick, handleDeliveryClick, handleReturnClick)} data={medicineSharing} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
                        </div>
                    )
                }
            </div>

            <div>
                <h1>รับคืน</h1>
                <div className="bg-white shadow rounded">
                    <DataTable columns={columnSharingInReturn(handleReturnClick, handleConfirmReceiveDelivery)} data={medicineSharingInReturn} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
                </div>
            </div>

            {selectedMed && selectedMed.ticketType === "sharing" && (
                <ConfirmSharingDialog
                    data={selectedMed}
                    dialogTitle={"ยืนยันการยอมรับแบ่งปัน"}
                    status={"to-transfer"}
                    openDialog={confirmDialogOpen}
                    onOpenChange={(open: boolean) => {
                        setConfirmDialogOpen(open);
                        if (!open) {
                            fetchMedicineSharing();
                            setSelectedMed(null);
                        }
                    }}
                />
            )}

            {selectedMed && selectedMed.ticketType === "sharing" && (
                <AcceptSharingDialog
                    sharingMed={selectedMed}
                    openDialog={acceptSharingDialogOpen}
                    onOpenChange={(open: boolean) => {
                        setAcceptSharingDialogOpen(open);
                        if (!open) {
                            fetchMedicineSharing();
                            setSelectedMed(null);
                        }
                    }} />
            )}

            <AlertDialog
                open={deliveryDialogOpen}
                onOpenChange={(open) => {
                    if (open) setDeliveryDialogOpen(true);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการรับของ</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณต้องการยืนยันการจัดส่งของจาก {selectedMed?.responseDetails.respondingHospitalNameTH} หรือไม่?
                            <div className="flex flex-col gap-2 mt-4">
                                <div className="flex flex-row items-center gap-2">
                                    <span>ชื่อยา:</span>
                                    <span>{selectedMed?.sharingMedicine.name}</span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                    <span>จำนวน:</span>
                                    <span>{selectedMed?.offeredMedicine.responseAmount}</span>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeliveryDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            {
                                loading ? (
                                    <Button className="flex flex-row items-center gap-2 text-muted-foreground" disabled>
                                        <LoadingSpinner /> ยืนยันการจัดส่ง
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={async () => {
                                            const result = await confirmDelivery(selectedMed);
                                            if (result) {
                                                setDeliveryDialogOpen(false);
                                                setSelectedMed(null);
                                                toast.success("ยืนยันการจัดส่งเรียบร้อยแล้ว")
                                            } else {
                                                toast.error("เกิดข้อผิดพลาดในการยืนยัน")
                                            }
                                        }}
                                    >
                                        ยืนยันการจัดส่ง
                                    </Button>
                                )
                            }
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ReturnDialog
                selectedMed={selectedMed}
                open={returnDialogOpen}
                onOpenChange={(open: boolean) => {
                    setReturnDialogOpen(open);
                    if (!open) {
                        fetchMedicineSharingInReturn();
                        setSelectedMed(null);
                    }
                }}
            />
        </div>
    )
}