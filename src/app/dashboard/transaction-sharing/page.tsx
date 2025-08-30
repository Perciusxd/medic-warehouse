"use client";
import { useState, useEffect, useMemo } from 'react';
import { RefreshCcwIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { DataTable } from "../request/data-table";
import { columns as columnsRequestToHospital } from "./columns_request_to_hospital";
import { columns as columnSharing } from "./columns_sharing_to_hospital";

import { useMedicineRequests, useMedicineSharingStatus, useMedicineSharingInReturn } from "@/hooks/useMedicineAPI";
import { useHospital } from "@/context/HospitalContext";

import { ResponseAsset } from "@/types/responseMed";

import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ConfirmSharingDialog from '@/components/dialogs/confirm-sharing-dialog';
import AcceptSharingDialog from '@/components/dialogs/accept-sharing-dialog';
import ReturnDialog from '@/components/dialogs/return-dialog';
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import ReturnSharingDialog from '@/components/dialogs/return-sharing-dialog';
import EditSharingDialog from '@/components/dialogs/edit-sharing-dialog';
import { MultiSelect } from "@/components/ui/multi-select";
import { th } from 'date-fns/locale';

const sharingStatusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "cancelled", label: "Cancelled" },
];

const requestStatusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "offered", label: "Offered" },
    { value: "to-transfer", label: "To Transfer" },
    { value: "to-return", label: "To Return" },
    { value: "in-return", label: "In Return" },
    { value: "returned", label: "Returned" },
    { value: "confirm-return", label: "To Confirm" },
];

export default function TransferDashboard() {
    const { loggedInHospital } = useHospital();
    const statusFilterSharing = useMemo(() => ["pending", "cancelled"], []);
    const { medicineSharingInReturn, loading: loadingReturn, error: errorReturn, fetchMedicineSharingInReturn } = useMedicineSharingInReturn(loggedInHospital, statusFilterSharing);
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
    const [returnSharingDialogOpen, setReturnSharingDialogOpen] = useState(false);

    // Request status filter
    const [requestStatusFilter, setRequestStatusFilter] = useState<string[]>([]);
    const [requestStatusFilterOptions, setRequestStatusFilterOptions] = useState(requestStatusOptions.filter(o => o.value !== 'all'));

    const selectedRequestStatuses = useMemo(() => {
        const allStatuses = ["offered", "to-transfer", "to-return", "in-return", "returned", "confirm-return"]
         if (requestStatusFilter.length === 0) {
            return ["offered", "to-transfer", "to-return", "in-return", "returned", "confirm-return"];
        }
        return requestStatusFilter;
        // return requestStatusFilter === "all"
        //     ? allStatuses
        //     : [requestStatusFilter];
    }, [requestStatusFilter]);
    const { medicineRequests, loading: loadingRequest, error: errorRequest, fetchMedicineRequests } = useMedicineRequests(loggedInHospital, selectedRequestStatuses);

    // Sharing status filter
    const [sharingStatusFilter, setSharingStatusFilter] = useState<string[]>([]);
    const [sharingStatusFilterOptions, setSharingStatusFilterOptions] = useState(sharingStatusOptions.filter(o => o.value !== 'all'));
    const selectedStatuses = useMemo(() => {
        if (sharingStatusFilter.length === 0) {
            return ["pending", "cancelled"];
        }
        return sharingStatusFilter;
    }, [sharingStatusFilter]);

    const { medicineSharing, loading: loadingShare, error: errorShare, fetchMedicineSharing } = useMedicineSharingStatus(loggedInHospital, selectedStatuses);
    // console.log("medicineSharingsssss", medicineSharing)
    const handleApproveClick = (med: any) => {
        setSelectedMed(med);
        setConfirmDialogOpen(true);
    }

    const handleReConfirmClick = (med: any) => {
        //console.log('handleReConfirmClick', med);
        setSelectedMed(med);
        setAcceptSharingDialogOpen(true);
    }

    const handleDeliveryClick = async (med: any) => {
        //console.log('handleDeliveryClick', med);
        setSelectedMed(med);
        setDeliveryDialogOpen(true);
    }

    const handleReturnClick = async (med: any) => {
        //console.log('handleReturnClick', med);
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
            //console.log(result)
            toast.success(status === "to-transfer" ? "ยืนยันการส่งมอบเรียบร้อยแล้ว" : "ยืนยันการรับคืนเรียบร้อยแล้ว", {
                description: result.message,
            })
            fetchMedicineRequests();
            setLoading(false)
        } catch (error) {
            //console.error("Error submitting form:", error)
            toast.error("เกิดข้อผิดพลาดในการยืนยัน", {
                description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการยืนยัน",
            })
            setLoading(false)
        }
    }

    // Helper function to configure dialog for different actions
    const openConfirmationDialog = (med: any, actionType: 'receive-delivery' | 'delivery' | 'confirm-return' | 'to-transfer') => {
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
            'confirm-return': {
                title: "ยืนยันการรับคืน",
                description: "คุณต้องการยืนยันการรับคืนจาก {hospitalName} หรือไม่?",
                confirmButtonText: "ยืนยันการรับคืน",
                successMessage: "ยืนยันการรับคืนเรียบร้อยแล้ว",
                errorMessage: "เกิดข้อผิดพลาดในการยืนยัน",
                onConfirm: confirmReturn,
                refetchFunction: fetchMedicineRequests,
            },
            'to-transfer': {
                title: "ยืนยันการจัดส่ง",
                description: "คุณต้องการยืนยันการจัดส่งของไปยัง {hospitalName} หรือไม่?",
                confirmButtonText: "ยืนยันการจัดส่ง",
                successMessage: "ยืนยันการจัดส่งเรียบร้อยแล้ว",
                errorMessage: "เกิดข้อผิดพลาดในการยืนยัน",
                onConfirm: confirmDeliveryFromRequests,
                refetchFunction: fetchMedicineRequests,
            }
        };

        setDialogConfig(configs[actionType]);
        setConfirmReceiveDeliveryDialogOpen(true);
    };

    const handleConfirmReceiveDelivery = async (med: any) => {
        //console.log('handleConfirmReceiveDelivery', med);
        openConfirmationDialog(med, 'receive-delivery');
    }

    const handleDeliveryConfirm = async (med: any) => {
        //console.log('handleDeliveryConfirm', med);
        openConfirmationDialog(med, 'delivery');
    }

    const handleReturnConfirm = async (med: any) => {
        //console.log('handleReturnConfirm', med);
        openConfirmationDialog(med, 'confirm-return');
    }

    const handleEditClick = async (med: any) => {
        //console.log('handleEditClick', med);
        setSelectedMed(med);
        setEditDialogOpen(true);
    }



    const handleconfirmDeliveryFromRequests = async (med: any) => {
        //console.log('handleconfirmDeliveryFromRequests', med);
        openConfirmationDialog(med, 'to-transfer');
    }

    const confirmDeliveryFromRequests = async (med: any) => {
        //console.log(med)
        const responseBody = {
            responseId: med.id,
            offeredMedicine: med.offeredMedicine,
            status: 'to-return',
        }
        //console.log('responseBody', responseBody)
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
            //console.log('result', result)
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
        //console.log(med)
        const responseBody = {
            sharingId: med.responseId,
            acceptOffer: med.acceptedOffer,
            status: "to-confirm",
            returnTerm: med.responseDetail.returnTerm,
        }
        //console.log('responseBody', responseBody)
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
            //console.log('result', result)
            fetchMedicineRequests();
            setLoading(false)
            return true;
        } catch (error) {
            //console.error("Error submitting form:", error)
            setLoading(false)
            return false;
        }
    }

    // Additional submit functions for different scenarios
    const confirmReturn = async (med: any) => {
        //console.log("med.ticketTypeadsd",med.ticketType)
        if (med.ticketType === "request") {
            const responseBody = {
            responseId: med.id,
            offeredMedicine: med.offeredMedicine,
            status: 'returned',
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

        } else {
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
    }

    const confirmReceiveDelivery = async (med: any) => {
        const responseBody = {
            sharingId: med.id,
            status: "in-return",
        }
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

    const handleReturnSharingClick = async (med: any) => {
        // //console.log('handleReturnSharingClick', med);
        setSelectedMed(med);
        setReturnSharingDialogOpen(true);
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
    //         //console.error("Error confirming return:", error)
    //         setLoading(false)
    //         toast.error("เกิดข้อผิดพลาดในการยืนยันการรับคืน")
    //     }
    // }

    useEffect(() => {
        fetchMedicineRequests();
        fetchMedicineSharing();
        fetchMedicineSharingInReturn();
    }, [fetchMedicineRequests, fetchMedicineSharing, fetchMedicineSharingInReturn]);
    // //console.log("medicineSharingInReturn", medicineSharingInReturn)

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div /> {/* Placeholder for alignment, can add search if needed */}
                <div className="flex items-center space-x-2">
                    <Button variant={"outline"} onClick={() => {
                        fetchMedicineRequests();
                        fetchMedicineSharing();
                        fetchMedicineSharingInReturn();
                        setUpdatedLast(new Date());
                    }}>
                        <RefreshCcwIcon />
                        {updatedLast ? `อัปเดต ${formatDistanceToNow(updatedLast, { addSuffix: true, locale: th })}` : ""}
                    </Button>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h1>ให้ยืมยา (ขาดแคลน)</h1>
                    <div className="w-auto">
                        <MultiSelect
                            options={requestStatusFilterOptions}
                            selected={requestStatusFilter}
                            onChange={setRequestStatusFilter}
                            placeholder="All"
                        />
                    </div>
                </div>

                {
                    loadingRequest ? (
                        <div className="p-8 flex flex-col items-center justify-center">
                            <LoadingSpinner width="48" height="48" />
                            <p className="mt-4 text-gray-500">กำลังโหลดข้อมูลยา...</p>
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded">
                            <DataTable columns={columnsRequestToHospital(handleStatusClick, handleconfirmDeliveryFromRequests, handleReturnConfirm)} data={medicineRequests} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
                        </div>
                    )
                }
            </div>

            <div className="mt-12">
                <div className="flex items-center justify-between mb-4">
                    <h1>ให้ยืม (แบ่งปัน)</h1>
                    <div className="w-auto">
                         <MultiSelect
                            options={sharingStatusFilterOptions}
                            selected={sharingStatusFilter}
                            onChange={setSharingStatusFilter}
                            placeholder="All"
                        />
                    </div>
                </div>
                <div className="bg-white shadow rounded">
                    <DataTable columns={columnSharing(handleApproveClick, handleReConfirmClick, handleDeliveryClick, handleReturnClick, handleReturnConfirm, handleEditClick)} data={medicineSharing} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} loading={loadingShare} />
                </div>
            </div>

            {selectedMed && editDialogOpen && (
                <EditSharingDialog
                    selectedMed={selectedMed}
                    openDialog={editDialogOpen}
                    onOpenChange={(open: boolean) => {
                        setEditDialogOpen(open);
                        if (!open) {
                            setSelectedMed(null);
                        }
                    }}
                />
            )}

            {selectedMed && selectedMed.ticketType === "sharing" && confirmDialogOpen && (
                <ConfirmSharingDialog
                    data={selectedMed}
                    dialogTitle={"ยืนยันการยอมรับแบ่งปัน"}
                    status="to-transfer"
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

            {selectedMed && selectedMed.ticketType === "sharing" && acceptSharingDialogOpen && (
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

            {selectedMed && selectedMed.ticketType === "sharing" && deliveryDialogOpen && (
                // <ConfirmSharingDialog
                //     data={selectedMed}
                //     dialogTitle="ยืนยันการจัดส่ง -- "
                //     status="to-confirm"
                //     openDialog={deliveryDialogOpen}
                //     onOpenChange={(open: boolean) => {
                //         setDeliveryDialogOpen(open);
                //         if (!open) {
                //             fetchMedicineSharing();
                //             setSelectedMed(null);
                //         }
                //     }}
                //     onConfirm={confirmDelivery}
                // />
                <ConfirmationDialog
                    open={deliveryDialogOpen}
                    onOpenChange={(open: boolean) => {
                        setDeliveryDialogOpen(open);
                        if (!open) {
                            fetchMedicineSharing();
                            setSelectedMed(null);
                        }
                    }}
                    selectedMed={selectedMed}
                    title="ยืนยันการจัดส่ง"
                    description="คุณต้องการยืนยันการจัดส่งของไปยัง {hospitalName} หรือไม่?"
                    confirmButtonText="ยืนยันการจัดส่ง"
                    successMessage="ยืนยันการจัดส่งเรียบร้อยแล้ว"
                    errorMessage="เกิดข้อผิดพลาดในการยืนยัน"
                    onConfirm={confirmDelivery}
                    loading={loading}
                />
            )}

            {/* <ReturnDialog
                selectedMed={selectedMed}
                open={returnDialogOpen}
                onOpenChange={(open: boolean) => {
                    setReturnDialogOpen(open);
                    if (!open) {
                        fetchMedicineSharingInReturn();
                        setSelectedMed(null);
                    }
                }}
            /> */}

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
        </div>
    )
}