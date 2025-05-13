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
import ConfirmResponseDialog from "@/components/dialogs/confirm-response-dialog"

import { ArrowUpDown, Pencil, MoreHorizontal, Check, Trash2, Copy, CheckCircle2Icon, LoaderIcon, ShieldAlertIcon, Truck, Clock, TicketCheck } from "lucide-react"
import CreateResponseDialog from "@/components/dialogs/create-response-dialog"
import StatusIndicator from "@/components/ui/status-indicator"

export const columns = (handleApproveClick: (med: any) => void): ColumnDef<any>[] => [
    {
        accessorKey: "updatedAt",
        header: ({column}) => {
            return (
                <Button
                    className="font-medium text-muted-foreground text-left cursor-pointer"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    วันที่ขอยืม
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const raw = row.getValue("updatedAt");
            const date = new Date(Number(raw)); // convert string to number, then to Date
            const formattedDate = format(date, 'dd/MM/yyyy'); // format to date only
            const timeOnly = format(date, 'HH:mm:ss'); // format to time only

            return (<div>
                <div className="text-sm font-medium text-gray-600">{formattedDate}</div>
                <div className="text-xs text-muted-foreground">{timeOnly}</div>
            </div>);
        },
        enableGlobalFilter: true
    },
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
        cell: ({ row }) => {
            const medName = row.original.requestMedicine.name
            const medTrademark = row.original.requestMedicine.trademark

            return (
                <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-600">{medName}</div>
                    <div className="text-xs text-muted-foreground">{medTrademark}</div>
                </div>
            )
        },
        enableGlobalFilter: true
    },
    {
        accessorKey: "requestMedicine.quantity",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ขนาด</div>,
        enableGlobalFilter: true
    },
    {
        accessorKey: "requestMedicine.unit",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">หน่วย</div>,
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
                สถานะการตอบกลับ (จำนวนที่ให้ยืม)
            </div>
        ),
        cell: ({ row }) => {
            const med = row.original;
            console.log(med);
            const maxDisplay = 3;
            const details = med.responseDetails.slice(0, maxDisplay);
            const hasMore = med.responseDetails.length > maxDisplay;

            const [dialogOpen, setDialogOpen] = useState(false);
            const handleConfirm = () => {
                setDialogOpen(false);
            }

            return (
                <div className="flex flex-col gap-y-1 text-gray-600">
                    {med.responseDetails.map((detail, index) => (
                        <div key={index} className="flex items-center gap-x-2 h-4">
                            <span>{detail.respondingHospitalNameTH}:</span>
                            {detail.status === 'offered' ? (
                                    <Button 
                                        variant={"link"} 
                                        className="flex gap-x-2" 
                                    onClick={() => handleApproveClick(detail)}>ได้รับการยืนยัน ({detail.offeredMedicine.offerAmount})<StatusIndicator status={detail.status} />
                                    </Button>
                            )
                                : detail.status === 'pending'
                                    ? (<Button variant={'link'} disabled className="flex gap-x-2">รอการตอบกลับ (-)<StatusIndicator status={detail.status} /></Button>)
                                    : detail.status === 'to-transfer'
                                        ? (<Button variant={'link'} className="flex gap-x-2">รอการจัดส่ง<StatusIndicator status={detail.status} /></Button>)
                                        : detail.status === 'completed'
                                            ? (<span className="flex gap-x-2">เสร็จสิ้น<StatusIndicator status={detail.status} /></span>)
                                            : detail.status === 'cancelled'
                                                ? (<span className="flex gap-x-2">ยกเลิก<StatusIndicator status={detail.status} /></span>)
                                                : null
                            }
                        </div>
                    ))}
                    {hasMore && <Button variant={'link'} className="">เพิ่มเติม...</Button>}
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