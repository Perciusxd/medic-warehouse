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
import ConfirmResponseDialog from "@/components/dialogs/confirm-response-dialog"

import { ArrowUpDown, Pencil, MoreHorizontal, Check, Trash2, Copy, CheckCircle2Icon, LoaderIcon, ShieldAlertIcon, Truck, Clock, TicketCheck } from "lucide-react"
import CreateResponseDialog from "@/components/dialogs/create-response-dialog"

export const columns = (handleApproveClick: (med: any) => void): ColumnDef<any>[] => [
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
        cell: ({ row }) => { return <div className="">{formatDate(row.getValue("updatedAt"))}</div> },
        enableGlobalFilter: false
    },
    {
        accessorKey: "status",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">Status</div>,
        enableGlobalFilter: false
    },
    {
        accessorKey: "requestMedicine.requestAmount",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวนที่ขอยืม</div>,
        enableGlobalFilter: false
    },
    {
        accessorKey: "responseDetails",
        header: () => (
            <div className="font-medium text-muted-foreground text-left cursor-default">
                สถานะการตอบกลับ
            </div>
        ),
        cell: ({ row }) => {
            const med = row.original;
            const maxDisplay = 3;
            const details = med.responseDetails.slice(0, maxDisplay);
            const hasMore = med.responseDetails.length > maxDisplay;

            const [dialogOpen, setDialogOpen] = useState(false);
            const handleConfirm = () => {
                console.log('Confirmed response');
                setDialogOpen(false);
            }

            return (
                <div className="flex flex-col gap-y-1">
                    {med.responseDetails.map((detail, index) => (
                        <div key={index} className="flex items-center gap-x-2 h-8">
                            <span>{detail.respondingHospitalNameEN}:</span>
                            {detail.status === 'offered' ? (
                                <>
                                    <Button 
                                        variant={"link"} 
                                        className="flex gap-x-2" 
                                        onClick={() => handleApproveClick(detail)}>
                                        ได้รับการยืนยัน<TicketCheck className="w-5 h-5" />
                                    </Button>
                                </>
                            )
                                : detail.status === 'pending'
                                    ? (<span className="flex gap-x-2">รอการตอบกลับ<Clock className="w-5 h-5" /></span>)
                                    : detail.status === 'to-transfer'
                                        ? (<span className="flex gap-x-2">จัดส่ง<Truck className="w-5 h-5" /></span>)
                                        : detail.status === 'completed'
                                            ? (<span className="flex gap-x-2">เสร็จสิ้น<CheckCircle2Icon className="w-5 h-5" /></span>)
                                            : detail.status === 'cancelled'
                                                ? (<span className="flex gap-x-2">ยกเลิก<Trash2 className="w-5 h-5" /></span>)
                                                : null
                            }
                        </div>
                    ))}
                    {hasMore && <span className="text-muted-foreground">...</span>}
                </div>
            );
        },
        size: 300
    },
    // {
    //     id: "actions",
    //     size: 48,
    //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">Actions</div>,
    //     cell: ({ row }) => {
    //         const med = row.original
    //         return (
    //             <DropdownMenu>
    //                 <DropdownMenuTrigger asChild>
    //                     <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer hover:border-2">
    //                         <span className="sr-only">Open menu</span>
    //                         <MoreHorizontal className="h-4 w-4" />
    //                     </Button>
    //                 </DropdownMenuTrigger>
    //                 <DropdownMenuContent align="end">
    //                     <DropdownMenuItem
    //                         onClick={() => handleApproveClick(med)}
    //                         className="cursor-pointer"
    //                     ><Check></Check>Approve</DropdownMenuItem>
    //                     <DropdownMenuItem><Pencil />Edit</DropdownMenuItem>
    //                     <DropdownMenuItem><Trash2 />Delete</DropdownMenuItem>
    //                     <DropdownMenuSeparator />
    //                     <DropdownMenuItem
    //                         onClick={() => navigator.clipboard.writeText(med.id)}
    //                     >
    //                         <Copy></Copy>
    //                         Copy ID
    //                     </DropdownMenuItem>
    //                 </DropdownMenuContent>
    //             </DropdownMenu>
    //         )
    //     },
    //     enableGlobalFilter: false
    // }
]