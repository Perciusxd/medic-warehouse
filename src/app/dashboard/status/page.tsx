import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "../borrow/data-table";
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

import { useMedicineRequestsStatus } from "@/hooks/useMedicineAPI";

import { columns } from "./columns";
import ConfirmResponseDialog from "@/components/dialogs/confirm-response-dialog";

export default function StatusDashboard(loggedInHospital) {
    const { medicineRequests, loading: loadingRequest, error: errorRequest, fetchMedicineRequests } = useMedicineRequestsStatus(loggedInHospital.loggedInHospital);
    const [loading, setLoading] = useState(false);
    const [selectedMed, setSelectedMed] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");

    const handleApproveClick = (med) => {
        setSelectedMed(med);
        setConfirmDialogOpen(true);
    }

    const handleDeliveryClick = async (med) => {
        setSelectedMed(med);
        setDeliveryDialogOpen(true);
    }

    const confirmDelivery = async (med) => {
        const responseBody = {
            responseId: med.id,
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
            console.log(result);
            fetchMedicineRequests();
            setLoading(false)
        } catch (error) {
            console.error("Error submitting form:", error)
            setLoading(false)
        }
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
                            columns={columns(handleApproveClick, handleDeliveryClick)}
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

                        {/* AlertDialog for delivery */}
                        <AlertDialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to deliver this medicine? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        
                                    >
                                        {
                                            loading 
                                            ? <Button className="flex flex-row items-center gap-2 text-muted-foreground"><LoadingSpinner /> ยืนยันการจัดส่ง</Button> 
                                            : <Button onClick={() => {
                                                        confirmDelivery(selectedMed);
                                            }} variant="default">ยืนยันการจัดส่ง</Button>
                                        }
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>

                )
            }
        </>
    )
}