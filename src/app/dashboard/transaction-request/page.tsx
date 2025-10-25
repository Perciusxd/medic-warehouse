'use client';
import { useEffect, useState, useMemo } from "react";
import { RefreshCcwIcon } from "lucide-react";
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
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import ReturnSharingDialog from '@/components/dialogs/return-sharing-dialog';
import { useMedicineRequestsStatus, useMedicineSharingStatus, useMedicineSharingInReturn } from "@/hooks/useMedicineAPI";
import { useHospital } from "@/context/HospitalContext";
import { columns as columnSharingInReturn } from "./column_mock_return";
import { columns } from "./columns";
import ConfirmResponseDialog from "@/components/dialogs/confirm-response-dialog";
import ConfirmSharingDialog from "@/components/dialogs/confirm-sharing-dialog";
import AcceptSharingDialog from "@/components/dialogs/accept-sharing-dialog";
import ReturnDialog from "@/components/dialogs/return-dialog";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import EditRequestDialog from "@/components/dialogs/edit-request-dialog";
import { SelectDataMedDialog } from "@/components/ui/select-data-to-pdf";
export default function StatusDashboard() {
    const statusFilterSharing = useMemo(() => ["to-confirm", "in-return", "returned", "to-transfer", "confirm-return", "re-confirm", "offered", "to-return"], []);
    const statusFilterRequest = useMemo(() => ["pending", "cancelled"], []);
    const { loggedInHospital } = useHospital();
    const { medicineRequests, loading: loadingRequest, error: errorRequest, fetchMedicineRequests } = useMedicineRequestsStatus(loggedInHospital, statusFilterRequest);
    const { medicineSharingInReturn, loading: loadingReturn, error: errorReturn, fetchMedicineSharingInReturn } = useMedicineSharingInReturn(loggedInHospital, statusFilterSharing);
    const { medicineSharing, loading: loadingShare, error: errorShare, fetchMedicineSharing } = useMedicineSharingStatus(loggedInHospital, statusFilterSharing);
    const [loading, setLoading] = useState(false);
    const [selectedMed, setSelectedMed] = useState<any | null>(null);
    const [updatedLast, setUpdatedLast] = useState<Date | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [acceptSharingDialogOpen, setAcceptSharingDialogOpen] = useState(false);
    const [openAcceptSharingDialog, setOpenAcceptSharingDialog] = useState(false);
    const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const [returnSharingDialogOpen, setReturnSharingDialogOpen] = useState(false);
    const [confirmReceiveDeliveryDialogOpen, setConfirmReceiveDeliveryDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<{
        title: string;
        description: string;
        confirmButtonText: string;
        successMessage: string;
        errorMessage: string;
        onConfirm: (med: any) => Promise<boolean>;
        refetchFunction: () => void;
    } | null>(null);

    const handleReturnSharingClick = async (med: any) => {
        //console.log('handleReturnSharingClick', med);
        setSelectedMed(med);
        setReturnSharingDialogOpen(true);
    }
    const handleConfirmReceiveDelivery = async (med: any) => {
        //console.log('handleConfirmReceiveDelivery', med);
        openConfirmationDialog(med, 'receive-delivery');
    }
    const handleconfirReceiveDelivery = async (med: any) => {
        //console.log('handleConfirmReceiveDelivery', med);
        openConfirmationDialog(med, 'to-return');
    }
    const openConfirmationDialog = (med: any, actionType: 'receive-delivery' | 'delivery' | 'return' | 'to-return') => {
        setSelectedMed(med);

        const configs = {
            'receive-delivery': {
                title: "ยืนยันการรับของ",
                description: "คุณต้องการยืนยันการรับของจาก {hospitalName} หรือไม่?",
                confirmButtonText: "ยืนยันการรับของ",
                successMessage: "ยืนยันการรับของเรียบร้อยแล้ว",
                errorMessage: "เกิดข้อผิดพลาดในการยืนยัน",
                onConfirm: confirmReceiveDelivery,
                refetchFunction: fetchMedicineSharingInReturn,
            },
            'delivery': {
                title: "ยืนยันการจัดส่ง",
                description: "คุณต้องการยืนยันการจัดส่งของไปยัง {hospitalName} หรือไม่?",
                confirmButtonText: "ยืนยันการจัดส่ง",
                successMessage: "ยืนยันการจัดส่งเรียบร้อยแล้ว",
                errorMessage: "เกิดข้อผิดพลาดในการยืนยัน",
                onConfirm: confirmDelivery,
                refetchFunction: fetchMedicineRequests,
            },
            'return': {
                title: "ยืนยันการรับคืน",
                description: "คุณต้องการยืนยันการรับคืนจาก {hospitalName} หรือไม่?",
                confirmButtonText: "ยืนยันการรับคืน",
                successMessage: "ยืนยันการรับคืนเรียบร้อยแล้ว",
                errorMessage: "เกิดข้อผิดพลาดในการยืนยัน",
                onConfirm: confirmReturn,
                refetchFunction: fetchMedicineRequests,
            },
            'to-return': {
                title: "ยืนยันการรับยา",
                description: "คุณต้องการยืนยันการรับยาจาก {hospitalName} หรือไม่?",
                confirmButtonText: "ยืนยันการรับยา",
                successMessage: "ยืนยันการรับยาเรียบร้อยแล้ว",
                errorMessage: "เกิดข้อผิดพลาดในการยืนยัน",
                onConfirm: confirReceiveDelivery,
                refetchFunction: fetchMedicineRequests,
            }

        };

        setDialogConfig(configs[actionType]);
        setConfirmReceiveDeliveryDialogOpen(true);
    };
    // Additional submit functions for different scenarios
    const confirmReturn = async (med: any) => {
        //console.log('med in confirmReturn', med)
        const responseBody = {
            sharingId: med.responseId,
            status: "returned",
        }
        //console.log('confirmReturn', responseBody)
        setLoading(true)
        try {
            const response = await fetch("/api/updateSharingStatus", {
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
            fetchMedicineSharing();
            setLoading(false)
            return true;
        } catch (error) {
            //console.error("Error submitting form:", error)
            setLoading(false)
            return false;
        }
    }

    const confirmReceiveDelivery = async (med: any) => {
        const responseBody = {
            sharingId: med.id,
            status: med.returnTerm.returnType === "supportReturn" ? "returned" : "in-return"
        }
        console.log('staup[dat',responseBody)
        setLoading(true)
        try {
            const response = await fetch("/api/updateSharingStatus", {
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
            //console.log('result', result)
            fetchMedicineSharingInReturn();
            setLoading(false)
            return true;
        } catch (error) {
            //console.error("Error submitting form:", error)
            setLoading(false)
            return false;
        }
    }

    const handleApproveClick = (med: any) => {
        setSelectedMed(med);
        setConfirmDialogOpen(true);
    }

    const handleReconfirmClickSharingTicket = (med: any) => {
        //console.log('handleReconfirmClickSharingTicket', med);
        setSelectedMed(med);
        setOpenAcceptSharingDialog(true);
    }

    const handleReConfirmClick = (med: any) => {
        //console.log('handleReConfirmClick', med);
        setSelectedMed(med);
        setAcceptSharingDialogOpen(true);
    }

    const handleDeliveryClick = async (med: any) => {
        setSelectedMed(med);
        setDeliveryDialogOpen(true);
    }

    const handleReturnClick = async (med: any) => {
        console.log('handleReturnClick===', med);
        setSelectedMed(med);
        setReturnDialogOpen(true);
    }

    const handleEditClick = async (med: any) => {
        //console.log('handleEditClick', med);
        setSelectedMed(med);
        setEditDialogOpen(true);
    }

    const confirReceiveDelivery = async (med: any) => {
        const responseBody = {
            responseId: med.responseId,
            offeredMedicine: med.offeredMedicine,
            status: med.requestTerm.returnType === "supportReturn" ? "returned" : "in-return"
        }
        console.log('confirReceiveDelivery', med)
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
            //console.error("Error submitting form:", error)
            setLoading(false)
            return false;
        }
    }

    const confirmDelivery = async (med: any) => {
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
            //console.error("Error submitting form:", error)
            setLoading(false)
            return false;
        }
    }

    useEffect(() => {
        fetchMedicineRequests();
        fetchMedicineSharingInReturn();
    }, [fetchMedicineRequests, fetchMedicineSharingInReturn]);

    // //console.log('medicineSharing', medicineSharing)
    // //console.log('medicineRequests', medicineRequests);
    // //console.log('medicineSharingInReturn', medicineSharingInReturn)
    const combinedDataList = [
        ...(medicineRequests as any[])
            .filter((item) =>
                item.responseDetails?.some((res: any) => res.status !== "pending" && res.status !== "cancelled")
            )
            .map((item) => ({
                medicineRequests: item,
                // เก็บเฉพาะ responseDetails ที่ offered
                responseDetails: item.responseDetails,
                // responseDetails: item.responseDetails.filter(
                //     (res: any) => res.status === "offered"
                // ),
                type: "request",
            })),

        ...(medicineSharingInReturn as any[])
            // .filter((item) => item.status === "re-confirm")
            .map((item) => ({ item, type: "return" }))
    ]
    const handleSelectMedicine = (item: any) => {
        //console.log("เลือก object:", item)

    }

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div /> {/* Placeholder for alignment, can add search if needed */}
                <div className="flex items-center space-x-2">

                    <SelectDataMedDialog dataList={combinedDataList} onSelect={handleSelectMedicine} />
                    <Button>เอกสารส่งคืน Mock Button</Button>

                    {/* <SelectDataMedDialog dataList={medicineSharingInReturn} onSelect={handleSelectMedicine} /> */}

                    <Button variant={"outline"} onClick={() => {
                        fetchMedicineRequests();
                        fetchMedicineSharingInReturn();
                        setUpdatedLast(new Date());
                    }}>
                        <RefreshCcwIcon />
                        {updatedLast ? `อัปเดต ${formatDistanceToNow(updatedLast, { addSuffix: true, locale: th })}` : ""}
                    </Button>
                </div>
            </div>

            {/* Request Section */}
            <>ขอยืม (ขาดแคลน)</>
            <div className="bg-white shadow rounded">
                {
                    loadingRequest ? (
                        <div className="p-8 flex flex-col items-center justify-center">
                            <LoadingSpinner width="48" height="48" />
                            <p className="mt-4 text-gray-500">กำลังโหลดข้อมูลยา...</p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns(handleApproveClick, handleDeliveryClick, handleReturnClick, handleReConfirmClick, handleEditClick, handleconfirReceiveDelivery, "request")}
                            // data={(medicineRequests as any)?.result?.filter((med: any) => med.ticketType === "request")}
                            data={medicineRequests}
                            globalFilter={globalFilter}
                            setGlobalFilter={setGlobalFilter} />
                    )
                }
            </div>
            
            <div className="mt-12">ขอยืม (แบ่งปัน)</div>
            <div className="shadow rounded">
                {/* Sharing Section */}
                {
                    loadingReturn ? (
                        <div className="p-8 flex flex-col items-center justify-center">
                            <LoadingSpinner width="48" height="48" />
                            <p className="mt-4 text-gray-500">กำลังโหลดข้อมูลยา...</p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columnSharingInReturn(handleReturnSharingClick, handleConfirmReceiveDelivery, handleReconfirmClickSharingTicket)}
                            data={medicineSharingInReturn}
                            globalFilter={globalFilter}
                            setGlobalFilter={setGlobalFilter} />
                    )
                }
            </div>
            {/* Dialogs */}
            {selectedMed && selectedMed.ticketType === "request" && confirmDialogOpen && (
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

            {selectedMed && selectedMed.ticketType === "request" && editDialogOpen && (
                <EditRequestDialog
                    selectedMed={selectedMed}
                    openDialog={editDialogOpen}
                    onOpenChange={(open: boolean) => {
                        setEditDialogOpen(open);
                        if (!open) {
                            fetchMedicineRequests();
                            setSelectedMed(null);
                        }
                    }}
                />
            )}

            {selectedMed && dialogConfig && confirmReceiveDeliveryDialogOpen && (
                <ConfirmationDialog
                    open={confirmReceiveDeliveryDialogOpen}
                    onOpenChange={(open: boolean) => {
                        setConfirmReceiveDeliveryDialogOpen(open);
                        if (!open) {
                            dialogConfig.refetchFunction();
                            setSelectedMed(null);
                            setDialogConfig(null);
                        }
                    }}
                    selectedMed={selectedMed}
                    title={dialogConfig.title}
                    description={dialogConfig.description}
                    confirmButtonText={dialogConfig.confirmButtonText}
                    successMessage={dialogConfig.successMessage}
                    errorMessage={dialogConfig.errorMessage}
                    loading={loading}
                    onConfirm={dialogConfig.onConfirm}
                />
            )}
            {selectedMed && selectedMed.ticketType === "sharing" && returnSharingDialogOpen && (
                <ReturnSharingDialog
                    selectedMed={selectedMed}
                    open={returnSharingDialogOpen}
                    onOpenChange={(open: boolean) => {
                        setReturnSharingDialogOpen(open);
                        if (!open) {
                            fetchMedicineSharingInReturn();
                            setSelectedMed(null);
                        }
                    }}
                />
            )}

            {selectedMed && selectedMed.ticketType === "sharing" && openAcceptSharingDialog && (
                <AcceptSharingDialog
                    sharingMed={selectedMed}
                    openDialog={openAcceptSharingDialog}
                    onOpenChange={(open: boolean) => {
                        setOpenAcceptSharingDialog(open);
                        if (!open) {
                            setSelectedMed(null);
                            fetchMedicineSharingInReturn();
                        }
                    }}
                />
            )}

            {selectedMed && selectedMed.ticketType === "request" && returnDialogOpen && (
                <ReturnDialog
                    selectedMed={selectedMed}
                    open={returnDialogOpen}
                    onOpenChange={(open: boolean) => {
                        setReturnDialogOpen(open);
                        if (!open) {
                            fetchMedicineRequests();
                            setSelectedMed(null);
                        }
                    }} />
            )}

            {/* AlertDialog for delivery */}
            <AlertDialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการรับของ</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณต้องการยืนยันการจัดส่งของจาก {selectedMed?.responseDetails?.respondingHospitalNameTH} หรือไม่?

                            <div className="flex flex-col gap-2 mt-4">
                                <div className="flex flex-row items-center gap-2">
                                    <span>ชื่อยา:</span>
                                    <span>{selectedMed?.offeredMedicine?.name}</span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                    <span>จำนวน:</span>
                                    <span>{selectedMed?.offeredMedicine?.offerAmount} {selectedMed?.offeredMedicine?.unit}</span>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
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