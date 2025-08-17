'use client';
import { useEffect, useState, useMemo } from "react";

import { DataTable } from "../request/data-table"
import { columns } from "./columns"

import { useHospital } from "@/context/HospitalContext"
import { useMedicineSharing } from "@/hooks/useMedicineAPI";


import { LoadingSpinner } from "@/components/ui/loading-spinner";
import AcceptSharingDialog from "@/components/dialogs/accept-sharing-dialog";
import CreateSharingDialog from "@/components/dialogs/create-sharing-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CancelDialog from "@/components/dialogs/cancel-dialog";

import { RefreshCcwIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

export default function SharingContent() {
    const { loggedInHospital } = useHospital()

    // Stabilize the status array reference to prevent infinite re-fetching
    const statusFilter = useMemo(() => ['pending', 're-confirm'], []);

    const { medicineSharing, loading, error, fetchMedicineSharing } = useMedicineSharing(loggedInHospital, statusFilter);
    //console.log("medicineSharing", medicineSharing)
    const [updatedLast, setUpdatedLast] = useState<Date | null>(null);
    const [createSharingDialogOpen, setCreateSharingDialogOpen] = useState(false);
    const [loadingRowId, setLoadingRowId] = useState(null);
    const [selectedMed, setSelectedMed] = useState<any>(null);
    const [openAcceptSharingDialog, setOpenAcceptSharingDialog] = useState(false);
    const [cancleRespDialogOpen, setCancleRespDialogOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");

    const handleApproveClick = (med: any) => {
        setLoadingRowId(med.id);
        setSelectedMed(med);
        setOpenAcceptSharingDialog(true);
        //console.log('selected sharing medicine', med)
    }

    const handleCancelClick = (med: any) => {
        setSelectedMed(med);
        setCancleRespDialogOpen(true);
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <Input value={globalFilter} placeholder="Search..." className="w-[300px]" onChange={(e) => setGlobalFilter(e.target.value)} />
                <div className="flex items-center space-x-2">
                    <Button variant={"outline"} onClick={() => {
                        fetchMedicineSharing();
                        setUpdatedLast(new Date());
                    }}>
                        <RefreshCcwIcon />
                        {updatedLast ? `อัปเดต ${formatDistanceToNow(updatedLast, { addSuffix: true, locale: th })}` : ""}
                    </Button>

                    <Button onClick={() => (setCreateSharingDialogOpen(true))}>แบ่งปันยา</Button>
                </div>
                <CreateSharingDialog
                    openDialog={createSharingDialogOpen}
                    onOpenChange={(open: boolean) => {
                        setCreateSharingDialogOpen(open);
                        if (!open) {
                            fetchMedicineSharing();
                            setUpdatedLast(new Date());
                        }
                    }} />

            </div>
            <div className="bg-white shadow rounded">
                {loading ? (
                    <div className="p-8 flex flex-col items-center justify-center">
                        <LoadingSpinner width="48" height="48" />
                        <p className="mt-4 text-gray-500">กำลังโหลดข้อมูลยา...</p>
                    </div>
                ) :
                    <div>
                        <DataTable columns={columns(handleApproveClick, handleCancelClick, loadingRowId)} data={medicineSharing} />
                        {selectedMed && openAcceptSharingDialog && (
                            <AcceptSharingDialog
                                sharingMed={selectedMed}
                                openDialog={openAcceptSharingDialog}
                                onOpenChange={(open: boolean) => {
                                    setOpenAcceptSharingDialog(open);
                                    if (!open) {
                                        setSelectedMed(null);
                                        fetchMedicineSharing();
                                    }
                                }}
                            />
                        )}

                        {selectedMed && cancleRespDialogOpen && (
                            <CancelDialog
                                selectedMed={selectedMed}
                                title={"ยกเลิกการแบ่งปันยา"}
                                cancelID={selectedMed.id}
                                description={"คุณต้องการยกเลิกการแบ่งปันยาใช่หรือไม่"}
                                confirmButtonText={"ยกเลิก"}
                                successMessage={"ยกเลิกการแบ่งปันยาเรียบร้อย"}
                                errorMessage={"ยกเลิกการแบ่งปันยาไม่สำเร็จ"}
                                loading={false}
                                onConfirm={() => Promise.resolve(true)}
                                open={cancleRespDialogOpen}
                                onOpenChange={(open: boolean) => {
                                    setCancleRespDialogOpen(open);
                                    if (!open) {
                                        fetchMedicineSharing();
                                        setUpdatedLast(new Date());
                                    }
                                }}
                            />
                        )}
                    </div>
                }
            </div>
        </div>
    )
}