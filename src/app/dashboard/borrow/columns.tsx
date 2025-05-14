"use client"
import { useState } from "react"
import { ResponseAsset } from "@/types/responseMed"
import { ColumnDef } from "@tanstack/react-table"
// import { formatDate } from "@/lib/utils"
import { format } from "date-fns"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import StatusIndicator from "@/components/ui/status-indicator"

import { ArrowUpDown, Pencil, MoreHorizontal, Check, Trash2, Copy, CheckCircle2Icon, LoaderIcon, ShieldAlertIcon } from "lucide-react"

export const columns = (handleApproveClick: (med: ResponseAsset) => void): ColumnDef<ResponseAsset>[] => [
    // {
    //     accessorKey: "id",
    //     size: 200,
    //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ID</div>,
    //     enableGlobalFilter: false
    // },
    {
        accessorKey: "requestDetails.name",
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
        cell: ({ row }) => {
            const med = row.original
            const requestDetails = med.requestDetails
            const name = requestDetails.requestMedicine.name
            const trademark = requestDetails.requestMedicine.trademark
            return (
                <div className="flex flex-col">
                    <div className="text-md">{name}</div>
                    <div className="text-xs text-gray-600">{trademark}</div>
                </div>
            )
        },
        enableGlobalFilter: true
    },
    {
        accessorKey: "updatedAt",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ประกาศเมื่อ</div>,
        cell: ({ row }) => {
            const med = row.original
            const requestDetails = med.requestDetails
            const createdAt = requestDetails.updatedAt
            const date = Number(createdAt); // convert string to number, then to Date
            const formattedDate = format(date, 'dd/MM/yyyy'); // format to date only
            const timeOnly = format(date, 'HH:mm:ss'); // format to time only
            return <div>
                <div className="text-sm font-medium text-gray-600">{formattedDate}</div>
                <div className="text-xs text-muted-foreground">{timeOnly}</div>
            </div>
        },
        enableGlobalFilter: false
    },
    // {
    //     accessorKey: "status",
    //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">Status</div>,
    //     enableGlobalFilter: false
    // },
    {
        accessorKey: "postingHospitalNameEN",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จากโรงพยาบาล</div>,
        cell: ({ row }) => {
            const postingHospitalNameTH: string = row.original.postingHospitalNameTH
            return (
                <div className="flex flex-row">
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col ml-2">
                        <div className="text-md">{postingHospitalNameTH}</div>
                        <div className="text-xs text-gray-600">คุณ xxx xxx</div>
                        <div className="text-xs text-gray-600">ติดต่อ 080xxxxx</div>
                    </div>

                </div>
            )
        },
        enableGlobalFilter: true
    },

    {
        accessorKey: "requestDetails.quantity",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ปริมาณ</div>,
        size: 100,
        cell: ({ row }) => {
            const med = row.original
            const requestDetails = med.requestDetails
            return (
                <div className="flex flex-col space-x-2">
                    <span>{requestDetails.requestAmount} {requestDetails.requestMedicine.unit}</span>
                    <span className="text-xs text-gray-600">{requestDetails.requestMedicine.quantity}</span>

                    {/* <Button className="cursor-default" variant="link" onClick={() => alert("Edit quantity")}>
                        <Pencil className="h-4 w-4" />
                    </Button> */}
                </div>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: "requestDetails.urgent",
        size: 100,
        header: ({ column }) => {
            return (
                <Button
                    className="font-medium text-muted-foreground text-left cursor-pointer"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    ความเร่งด่วน
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const med = row.original
            return (
                <div className="flex items-center space-x-2">
                    <div>
                        <StatusIndicator status={med.urgent} />
                    </div>

                    <div>
                        {med.urgent === "urgent" ? "ด่วนที่สุด" : med.urgent === "immediate" ? "ด่วน" : "ปกติ"}
                    </div>
                </div>
            )
        },
        enableSorting: true,
        enableResizing: true,
    },
    {
        id: "actions",
        size: 48,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default"></div>,
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
                        ><Check className="text-green-700" />ยืนยัน</DropdownMenuItem>
                        {/* <DropdownMenuItem><Pencil />Edit</DropdownMenuItem> */}
                        <DropdownMenuItem className="cursor-pointer"><Trash2 className="text-red-600" />ปฎิเสธ</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer"
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