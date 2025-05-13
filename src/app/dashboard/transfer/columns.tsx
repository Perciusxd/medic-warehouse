"use client"
import { useState } from "react"
import { ResponseAsset } from "@/types/responseMed"
import { ColumnDef } from "@tanstack/react-table"
// import { formatDate } from "@/lib/utils"
import { format, differenceInCalendarDays } from "date-fns"

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
import { LoadingSpinner } from "@/components/ui/loading-spinner"

import { ArrowUpDown, Pencil, MoreHorizontal, Check, Trash2, Copy, CheckCircle2Icon, LoaderIcon, ShieldAlertIcon, TruckIcon, X } from "lucide-react"
import StatusIndicator from "@/components/ui/status-indicator"

export const columns = (
    handleApproveClick: (med: ResponseAsset) => void,
    loading: boolean = false
): ColumnDef<ResponseAsset>[] => [
    {
        accessorKey: "updatedAt",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันที่ขอยืม</div>,
        cell: ({ row }) => {
            const createdAt = row.getValue("updatedAt")
            const date = new Date(createdAt); // convert string to number, then to Date
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
    //     accessorKey: "offeredMedicine.name",
    //     header: ({ column }) => {
    //         return (
    //             <Button
    //                 className="font-medium text-muted-foreground text-left cursor-pointer"
    //                 variant="ghost"
    //                 onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //             >
    //                 ชื่อยา
    //                 <ArrowUpDown className="ml-2 h-4 w-4" />
    //             </Button>
    //         )
    //     },
    //     enableGlobalFilter: true
    // },
    // {
    //     accessorKey: "status",
    //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">สถานะการตอบกลับ</div>,
    //     cell: ({ row }) => {
    //         const status = row.getValue("status")
    //         return (
    //             <div>
    //             </div>
    //         )
    //     },
    //     enableGlobalFilter: false
    // },
    {
        accessorKey: "postingHospitalNameEN",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">โรงพยาบาลปลายทาง</div>,
        cell: ({ row }) => {
            const postingHospitalNameTH = row.original.requestDetails?.postingHospitalNameTH
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
        accessorKey: "status",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">รายละเอียดยา</div>,
        cell: ({ row }) => {
            const status = row.getValue("status")
            const offeredMedicineName = row.original.offeredMedicine?.name
            const offeredMedicineTrademark = row.original.offeredMedicine?.trademark
            const offeredAmount = row.original.offeredMedicine?.offerAmount
            const offeredUnit = row.original.offeredMedicine?.unit
            const offeredPricePerUnit = row.original.offeredMedicine?.pricePerUnit
            const price = offeredPricePerUnit * offeredAmount

            return (
                <div className="flex flex-col text-gray-600">
                    <div className="text-md font-medium">ยา {offeredMedicineName}</div>
                    <div className="text-xs">โดย {offeredMedicineTrademark}</div>
                    <div className="text-md mt-2">เป็นจำนวน {offeredAmount} {offeredUnit}</div>
                    <div className="text-xs">คิดเป็นมูลค่า {price} บาท</div>
                </div>
            )
        },
        enableGlobalFilter: false
    },
    {
        accessorKey: "offeredMedicine.name",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">รายละเอียดการคืน</div>,
        cell: ({ row }) => {
            const status = row.getValue("status")
            const respondingHospitalNameTH = row.original.respondingHospitalNameTH
            const createdAt = row.original.requestDetails?.requestTerm.expectedReturnDate
            const date = new Date(createdAt);
            const daysUntilReturn = differenceInCalendarDays(date, new Date())
            const formattedDate = format(date, 'dd/MM/yyyy');
            const timeOnly = format(date, 'HH:mm:ss');
            console.log('row.original', row.original);
            return (
                <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-600">คาดว่าจะได้รับคืนในอีก {daysUntilReturn} วัน</div>
                    <div className="text-xs font-medium text-gray-600">{formattedDate}</div>
                    {/* <div className="text-xs text-muted-foreground">จัดส่งโดย {respondingHospitalNameTH}</div> */}
                </div>
            )
        },
        enableGlobalFilter: false
    },
    {
        id: "actions",
        size: 100,
        // header: () => <div className="font-medium text-muted-foreground text-left cursor-default">Actions</div>,
        cell: ({ row }) => {
            const med = row.original
            return (
                <div className="space-x-2">
                <Button
                    variant={'outline'}
                    onClick={() => handleApproveClick(med)}
                >
                    { loading
                        ? <div className="flex flex-row items-center gap-2"><LoadingSpinner /><span className="text-gray-500">ส่งแล้ว</span></div>
                        : <div className="flex flex-row items-center gap-2"><Check />ส่งแล้ว</div>
                    }
                </Button>
                <Button
                    variant={'destructive'}
                    // onClick={() => handleApproveClick(med)}
                ><X /></Button>
                </div>
            )
        },
        enableGlobalFilter: false
    }
]