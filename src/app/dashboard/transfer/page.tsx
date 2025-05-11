"use client";
import BorrowDashboard from "./borrow/page";
import ReturnDashboard from "./return/page";
import StatusDashboard from "./status/page";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "../../components/ui/button";

import { DataTable } from "../borrow/data-table";
import { columns } from "./columns";

import { useMedicineRequests, useMedicineResponsesInTransfer } from "@/hooks/useMedicineAPI";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ResponseAsset } from "@/types/responseMed";

export default function TransferDashboard(loggedInHospital) {
    const { medicineResponses, loading: loadingResponse, error: errorResponse, fetchMedicineResponses } = useMedicineResponsesInTransfer(loggedInHospital.loggedInHospital);
    const [selectedMed, setSelectedMed] = useState(null);
    const [createRespDialogOpen, setCreateRespDialogOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");

    const handleApproveClick = (med: ResponseAsset) => {
            setSelectedMed(med);
            setCreateRespDialogOpen(true);
    }

    useEffect(() => {
        fetchMedicineResponses();
    }, [fetchMedicineResponses]);

    console.log("medicineResponses", medicineResponses);

    return (
        <div>
            <DataTable columns={columns(handleApproveClick)} data={medicineResponses} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        </div>
    )
}