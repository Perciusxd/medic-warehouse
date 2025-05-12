import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "../borrow/data-table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { useMedicineRequestsStatus } from "@/hooks/useMedicineAPI";

import { columns } from "./columns";
import ConfirmResponseDialog from "@/components/dialogs/confirm-response-dialog";

export default function StatusDashboard(loggedInHospital) {
    const { medicineRequests, loading: loadingRequest, error: errorRequest, fetchMedicineRequests } = useMedicineRequestsStatus(loggedInHospital.loggedInHospital);
    const [selectedMed, setSelectedMed] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");

    const handleApproveClick = (med) => {
        setSelectedMed(med);
        setConfirmDialogOpen(true);
    }

    useEffect(() => {
        fetchMedicineRequests();
    }, [fetchMedicineRequests]);
    return (
        <>
            {
                loadingRequest ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        <DataTable
                            columns={columns(handleApproveClick)}
                            data={medicineRequests}
                            globalFilter={globalFilter}
                            setGlobalFilter={setGlobalFilter} />
                        {selectedMed && (
                            <ConfirmResponseDialog
                                data={selectedMed}
                                dialogTitle={"ยืนยันการตอบรับคำขอ"}
                                status={"to-transfer"}
                                openDialog={confirmDialogOpen}
                                onOpenChange={(open) => {
                                    setConfirmDialogOpen(open);
                                    if (!open) {
                                        fetchMedicineRequests();
                                        setSelectedMed(null);
                                    }
                                }}
                            />
                        )}
                    </>

                )
            }
        </>
    )
}