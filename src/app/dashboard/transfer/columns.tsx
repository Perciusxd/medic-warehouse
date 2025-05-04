"use client"
import { useState } from "react"
import { ResponseAsset } from "@/types/responseMed"
import { ColumnDef } from "@tanstack/react-table"
import { formatDate } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CreateResponse from "@/components/dialogs/create-response-dialog"
import { Badge } from "@/components/ui/badge"

import { ArrowUpDown, Pencil, MoreHorizontal, Check, Trash2, Copy, CheckCircle2Icon, LoaderIcon, ShieldAlertIcon } from "lucide-react"

export const columns = (handleApproveClick: (med: ResponseAsset) => void): ColumnDef<ResponseAsset>[] => [
    {
        accessorKey: "requestMedicine.name",
        header: ({ column }) => {
            return (
                <Button
                    className="font-medium text-muted-foreground text-left cursor-pointer"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        enableGlobalFilter: true
    },
    {
        accessorKey: "updatedAt",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">Updated At</div>,
        cell: ({ row }) => { return <div>{formatDate(row.getValue("updatedAt"))}</div> },
        enableGlobalFilter: false
    },
    {
        accessorKey: "status",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">Status</div>,
        enableGlobalFilter: false
    },
    {
        accessorKey: "postingHospitalNameEN",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">From Hospital</div>,
        enableGlobalFilter: true
    },
    {
        id: "actions",
        size: 48,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">Actions</div>,
        cell: ({ row }) => {
            const med = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer hover:border-2">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => handleApproveClick(med)}
                            className="cursor-pointer"
                        ><Check></Check>Approve</DropdownMenuItem>
                        <DropdownMenuItem><Pencil />Edit</DropdownMenuItem>
                        <DropdownMenuItem><Trash2 />Delete</DropdownMenuItem>
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
        },
        enableGlobalFilter: false
    }
]