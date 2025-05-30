"use client"
import * as React from "react"
import { useState, useEffect } from 'react';
import { z } from "zod";
import { formatDistanceToNow } from 'date-fns';

import { useMedicineRequests } from "@/hooks/useMedicineAPI";

// Components
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import CreateRequestDialog from "@/components/dialogs/create-request-dialog";
import CreateResponseDialog from "@/components/dialogs/create-response-dialog";
import { Input } from "@/components/ui/input"

// Icons
import { MoveLeft, MoveRight, Ban, RefreshCcwIcon } from 'lucide-react';

// Types
import { ResponseAsset } from "@/types/responseMed";
import { RequestAsset } from "@/types/requestMed";

import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function BorrowDashboard(loggedInHospital: string) {
    const { medicineRequests, loading, error, fetchMedicineRequests } = useMedicineRequests(loggedInHospital.loggedInHospital);
    const [updatedLast, setUpdatedLast] = useState<Date | null>(null);
    const [tick, setTick] = useState(0);
    const [selectedMed, setSelectedMed] = useState(null);
    const [createRespDialogOpen, setCreateRespDialogOpen] = useState(false);
    const [createRequestDialogOpen, setCreateRequestDialogOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");

    const handleApproveClick = (med: ResponseAsset) => {
        setSelectedMed(med);
        setCreateRespDialogOpen(true);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setTick((prev) => prev + 1);
        }, 30000); // every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // console.log('medicineRequests', medicineRequests);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <Input value={globalFilter} placeholder="Search..." className="w-[300px]" onChange={(e) => setGlobalFilter(e.target.value)} />
                <div className="flex items-center space-x-2">
                    <Button variant={"outline"} onClick={() => {
                        fetchMedicineRequests();
                        setUpdatedLast(new Date());
                    }}>
                        <RefreshCcwIcon />
                        {updatedLast ? `Updated ${formatDistanceToNow(updatedLast, { addSuffix: true })}` : ""}
                    </Button>

                    <Button onClick={() => (setCreateRequestDialogOpen(true))}>ขอยืมยา</Button>
                </div>
                <CreateRequestDialog
                    requestData={selectedMed}
                    loggedInHospital={loggedInHospital.loggedInHospital}
                    openDialog={createRequestDialogOpen}
                    onOpenChange={(open) => {
                        setCreateRequestDialogOpen(open);
                        if (!open) {
                            fetchMedicineRequests();
                            setUpdatedLast(new Date());
                        }
                    }} />

            </div>
            <div className="bg-white shadow rounded">
                {loading ? (
                    <div className="p-8 flex flex-col items-center justify-center">
                        <LoadingSpinner width="48" height="48" />
                        <p className="mt-4 text-gray-500">Loading medicines...</p>
                    </div>
                ) :
                    <div>
                        <DataTable columns={columns(handleApproveClick)} data={medicineRequests} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
                        {selectedMed && (
                            <CreateResponseDialog
                                requestData={selectedMed.requestDetails}
                                responseId={selectedMed.id}
                                status="offered"
                                dialogTitle={"เวชภัณฑ์ยาที่ขาดแคลน"}
                                openDialog={createRespDialogOpen}
                                onOpenChange={(open) => {
                                    setCreateRespDialogOpen(open);
                                    if (!open) {
                                        fetchMedicineRequests();
                                        setUpdatedLast(new Date());
                                    }
                                }}
                            />
                        )}
                    </div>
                }
            </div>
        </div>
    );
}