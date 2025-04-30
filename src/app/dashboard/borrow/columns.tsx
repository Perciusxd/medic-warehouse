"use client"
import { ResponseAsset } from "@/types/responseMed"
import { ColumnDef } from "@tanstack/react-table"


export const columns: ColumnDef<ResponseAsset>[] = [
    {
        accessorKey: "responseId",
        header: "Response ID",
    },
    {
        accessorKey: "updatedAt",
        header: "Updated At",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "offeredMedicine.name",
        header: "Medicine Name",
    },
    {
        accessorKey: "offeredMedicine.trademark",
        header: "Trademark",
    },
    {
        accessorKey: "offeredMedicine.quantity",
        header: "Quantity",
    },
    {
        accessorKey: "offeredMedicine.pricePerUnit",
        header: "Price Per Unit",
    },
    {
        accessorKey: "offeredMedicine.unit",
        header: "Unit",
    },
    {
        accessorKey: "offeredMedicine.batchNumber",
        header: "Batch Number",
    },
]