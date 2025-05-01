"use client"
import { useState } from "react"
import { ResponseAsset } from "@/types/responseMed"
import { ColumnDef } from "@tanstack/react-table"
import { formatDate } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Pen, Pencil, MoreHorizontal, Check, Trash2, Copy } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateResponse } from "@/components/dialogs/create-response-dialog"

export const columns = (handleApproveClick: (med: ResponseAsset) => void): ColumnDef<ResponseAsset>[] => [
    {
        accessorKey: "id",
        header: () => <div className="font-black">ID</div>
    },
    {
        accessorKey: "updatedAt",
        header: "Updated At",
        cell: ({ row }) => { return <div>{formatDate(row.getValue("updatedAt"))}</div> },
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "postingHospitalNameEN",
        header: "From Hospital",
    },
    {
        accessorKey: "requestMedicine.name",
        header: "Name",
    },
    {
        accessorKey: "requestMedicine.quantity",
        header: "Quantity",
        cell: ({ row }) => {
            const med = row.original
            return (
                <div className="flex items-center space-x-2">
                    <span>{med.requestMedicine.quantity}</span>
                    <Button className="cursor-default" variant="link" onClick={() => alert("Edit quantity")}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
        enableSorting: true,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const med = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => handleApproveClick(med)}
                            className="cursor-pointer"
                        ><Check></Check>Approve</DropdownMenuItem>
                        <DropdownMenuItem><Pencil></Pencil>Edit</DropdownMenuItem>
                        <DropdownMenuItem><Trash2></Trash2>Delete</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(med.id)}
                        >
                            <Copy></Copy>
                            Copy ID
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]