'use client';
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "../request/data-table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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

import { useMedicineRequestsStatus, useMedicineSharingStatus } from "@/hooks/useMedicineAPI";
import { useHospital } from "@/context/HospitalContext";

import { columns } from "./columns";
import ConfirmResponseDialog from "@/components/dialogs/confirm-response-dialog";
import ConfirmSharingDialog from "@/components/dialogs/confirm-sharing-dialog";
import AcceptSharingDialog from "@/components/dialogs/accept-sharing-dialog";
import ReturnDialog from "@/components/dialogs/return-dialog";

export default function StatusDashboard() {
    const { loggedInHospital } = useHospital();
    const { medicineRequests, loading: loadingRequest, error: errorRequest, fetchMedicineRequests } = useMedicineRequestsStatus(loggedInHospital);
    const { medicineSharing, loading: loadingShare, error: errorShare, fetchMedicineSharing } = useMedicineSharingStatus(loggedInHospital);
    const [loading, setLoading] = useState(false);
    const [selectedMed, setSelectedMed] = useState<any | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [acceptSharingDialogOpen, setAcceptSharingDialogOpen] = useState(false);
    const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    
    const handleApproveClick = (med :any) => {
        setSelectedMed(med);
        setConfirmDialogOpen(true);
    }

    const handleReConfirmClick = (med :any) => {
        console.log('handleReConfirmClick', med);
        setSelectedMed(med);
        setAcceptSharingDialogOpen(true);
    }

    const handleDeliveryClick = async (med :any) => {
        setSelectedMed(med);
        setDeliveryDialogOpen(true);
    }

    const handleReturnClick = async (med :any) => {
        console.log('handleReturnClick', med);
        setSelectedMed(med);
        setReturnDialogOpen(true);
    }

    const confirmDelivery = async (med :any) => {
        const responseBody = {
            responseId: med.responseId,
            offeredMedicine: med.offeredMedicine,
            status: "in-return"
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
            fetchMedicineRequests();
            setLoading(false)
            return true;
        } catch (error) {
            console.error("Error submitting form:", error)
            setLoading(false)
            return false;
        }
    }

    useEffect(() => {
        fetchMedicineRequests();
        fetchMedicineSharing();
    }, [fetchMedicineRequests, fetchMedicineSharing]);

    console.log('medicineSharing', medicineSharing)
    
    return (
        <>
            {/* Request Section */}
            <>ขอยืม</>
            {
                loadingRequest ? (
                    <div className="p-8 flex flex-col items-center justify-center">
                        <LoadingSpinner width="48" height="48" />
                        <p className="mt-4 text-gray-500">Loading medicines...</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns(handleApproveClick, handleDeliveryClick, handleReturnClick, handleReConfirmClick, "request")}
                        data={medicineRequests.filter((med: any) => med.ticketType === "request")}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter} />
                )
            }

            {/* Sharing Section */}
            <>ให้ยืม</>
            {
                loadingShare ? (
                    <div className="p-8 flex flex-col items-center justify-center">
                        <LoadingSpinner width="48" height="48" />
                        <p className="mt-4 text-gray-500">Loading medicines...</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns(handleApproveClick, handleDeliveryClick, handleReturnClick, handleReConfirmClick, "sharing")}
                        data={medicineSharing}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter} />
                )
            }

            {/* Dialogs */}
            {selectedMed && selectedMed.ticketType === "request" && (
                <ConfirmResponseDialog
                    data={selectedMed}
                    dialogTitle={"ยืนยันการตอบรับคำขอ"}
                    status={"to-transfer"}
                    openDialog={confirmDialogOpen}
                    onOpenChange={(open: boolean) => {
                        setConfirmDialogOpen(open);
                        if (!open) {
                            fetchMedicineRequests();
                            setSelectedMed(null);
                        }
                    }}
                />
            )}

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
                    }}  />
            )}

            <ReturnDialog 
                selectedMed={selectedMed}
                open={returnDialogOpen} 
                onOpenChange={(open: boolean) => {
                    setReturnDialogOpen(open);
                    if (!open) {
                        fetchMedicineRequests();
                        setSelectedMed(null);
                    }
                }}  />

            {/* AlertDialog for delivery */}
            <AlertDialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการรับของ</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณต้องการยืนยันการจัดส่งของจาก {selectedMed?.responseDetails.respondingHospitalNameTH} หรือไม่?
                            <div className="flex flex-col gap-2 mt-4">
                                <div className="flex flex-row items-center gap-2">
                                    <span>ชื่อยา:</span>
                                    <span>{selectedMed?.offeredMedicine.name}</span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                    <span>จำนวน:</span>
                                    <span>{selectedMed?.offeredMedicine.offerAmount}</span>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            {
                                loading ? (
                                    <Button className="flex flex-row items-center gap-2 text-muted-foreground" disabled>
                                        <LoadingSpinner /> ยืนยันการจัดส่ง
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={async () => {
                                            const success = await confirmDelivery(selectedMed);
                                            if (success) {
                                                setDeliveryDialogOpen(false);
                                                setSelectedMed(null);
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
        </>
    )
}