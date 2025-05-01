"use client"
import * as React from "react"
import { useState } from 'react';

import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { MoveLeft, MoveRight, Ban } from 'lucide-react';
import { z } from "zod";
import { useMedicineRequests } from "@/hooks/useMedicineAPI";
import { RequestAsset } from "@/types/requestMed";
import { ResponseAsset } from "@/types/responseMed";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import CreateResponseDialog from "@/components/dialogs/create-response-dialog";
import DynamicForm from "@/components/dialogs/create-request-dialog";

export default function BorrowDashboard(loggedInHospital: string) {
    const { medicineRequests, loading, error, fetchMedicineRequests } = useMedicineRequests(loggedInHospital.loggedInHospital);
    const [openPopoverIndex, setOpenPopoverIndex] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    // const [isLoading, setIsLoading] = useState(true);
    const [selectedMed, setSelectedMed] = useState(null);
    const [createRespDialogOpen, setCreateRespDialogOpen] = useState(false);

    const handleApproveClick = (med: ResponseAsset) => {
        setSelectedMed(med);
        setCreateRespDialogOpen(true);
    }

    return (
        <div>
            {/* <OpenModal onSuccess={fetchData} /> */}
            <div className="bg-white shadow rounded">
                {loading ? (
                    <div className="p-8 flex flex-col items-center justify-center">
                        <LoadingSpinner width="48" height="48" />
                        <p className="mt-4 text-gray-500">Loading medicines...</p>
                    </div>
                ) :
                    <div>
                        <DataTable columns={columns(handleApproveClick)} data={medicineRequests}/>
                        {selectedMed && (
                            <CreateResponseDialog 
                                requestData={selectedMed} 
                                openDialog={createRespDialogOpen} 
                                onOpenChange={(open) => {
                                    setCreateRespDialogOpen(open);
                                    if (!open) {
                                        fetchMedicineRequests();
                                    }
                                }}/>
                        )}
                    </div>
                }
            </div>
        </div>
    );
}