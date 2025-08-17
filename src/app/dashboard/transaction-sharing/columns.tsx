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
    loading: boolean = false,
    loadingRowId: string | null = null
): ColumnDef<any>[] => [
    {
        accessorKey: "updatedAt",
        size:100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันที่ขอยืม</div>,
        cell: ({ row }) => {
            const createdAt = row.getValue("updatedAt")
            // //console.log('createdAt', createdAt)
            const date = new Date(Number(createdAt)); // convert string to number, then to Date
            // //console.log('date', date)
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
        size:200,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">รายละเอียดยา</div>,
        cell: ({ row }) => {
            const status = row.getValue("status")
            const offeredMedicineName = row.original.offeredMedicine?.name
            const offeredMedicineTrademark = row.original.offeredMedicine?.trademark
            const offeredAmount = row.original.offeredMedicine?.offerAmount
            const offeredUnit = row.original.offeredMedicine?.unit
            const offeredPricePerUnit = row.original.offeredMedicine?.pricePerUnit
            const price = offeredPricePerUnit * offeredAmount
            const manufacturer = row.original.offeredMedicine?.manufacturer
            const returnTermData = row.original.offeredMedicine?.returnTerm
            //console.log("returnTermData.==",returnTermData)
            let returnTerm;

            if (returnTermData === "exactType"){
                returnTerm ="ยาตามรายการ"
                
            }else{
                returnTerm = "ยาทดแทน"
                
            }
            //const expiryDate = 
            //console.log("status===",row.original)

            return (
                <div className="flex flex-col">
                    <div className="text-md font-medium  text-gray-600">ยา: {offeredMedicineName}</div>
                    <div className="text-md font-medium  text-gray-600">ชื่อการค้า : {offeredMedicineTrademark}</div>
                    <div className="text-md font-medium  text-gray-600">ผลิตโดย : {manufacturer}</div>
                    <div className="text-md font-medium  text-gray-600">เป็นจำนวน : {offeredAmount} {offeredUnit}</div>
                    <div className="text-md font-medium  text-gray-600">คิดเป็นมูลค่า : {price} บาท</div>
                    <div className="text-md font-medium  text-gray-600">ประเภทยาที่ส่งมอบ : {returnTerm}</div>
                </div>
            )
        },
        enableGlobalFilter: false
    },
    {
        accessorKey: "offeredMedicine.name",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">รายละเอียดการคืน</div>,
        cell: ({ row }) => {
            const createdAt = row.original.requestDetails?.requestTerm.expectedReturnDate
            //console.log("med_ticket_type=====",row.original.ticketType)
            const date = new Date(Number(createdAt));
            const daysUntilReturn = differenceInCalendarDays(date, new Date())
            const formattedDate = format(date, 'dd/MM/yyyy');

            return (
                <div className="flex flex-col">
                    <div className="text-sm font-medium">คาดว่าจะได้รับคืนในอีก {daysUntilReturn} วัน</div>
                    <div className="text-xs font-medium text-gray-600">{formattedDate}</div>
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
            const isLoading = loadingRowId === med.id
            return (
                <div className=" flex flex-row  gap-2 max-w-[200px]   ">
                <Button 
                    variant={'outline'}
                    onClick={() => handleApproveClick(med)}
                >
                        { isLoading
                        ? <div className="flex flex-row items-center gap-2 max-w-[100px]"><LoadingSpinner /><span className="text-gray-500">ส่งแล้ว</span></div>
                        : <div className="flex flex-row items-center gap-2 max-w-[100px]"><Check />ส่งแล้ว</div>
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