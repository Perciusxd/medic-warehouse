"use client"
import { useState } from "react"
import { ResponseAsset } from "@/types/responseMed"
import { ColumnDef } from "@tanstack/react-table"
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

export const columnsConfirmReturn = (
    handleConfirmReturn: (med: ResponseAsset) => void,
    loading: boolean = false,
    loadingRowId: string | null = null
): ColumnDef<any>[] => [
     {
        accessorKey: "ticketType",
        size:100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ประเภทคำขอ</div>,
        cell: ({ row }) => {
            const ticketType = row.original.ticketType
            let Type ;
            switch(ticketType){
                case "request":
                    Type = "รายการจากคำขอยืมยา";

                case  "sharing" :
                    Type = "รายการจากคำขอแบ่งปันยา";

                
            }
            return (
            <div>
                <div className="text-sm font-medium text-gray-600 ">{Type}</div>
                
            </div>
            )
        },
        enableGlobalFilter: false
    },
    {
        accessorKey: "updatedAt",
        size:100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันที่ส่งคืน</div>,
        cell: ({ row }) => {
            const createdAt = row.getValue("updatedAt")
            const date = new Date(Number(createdAt));
            const formattedDate = format(date, 'dd/MM/yyyy');
            const timeOnly = format(date, 'HH:mm:ss');
            return <div>
                <div className="text-sm font-medium text-gray-600">{formattedDate}</div>
                <div className="text-xs text-muted-foreground">{timeOnly}</div>
            </div>
        },
        enableGlobalFilter: false
    },
    {
        accessorKey: "postingHospitalNameEN",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">โรงพยาบาลที่ส่งคืน</div>,
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
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">รายละเอียดยาที่ส่งคืน</div>,
        cell: ({ row }) => {
            const status = row.getValue("status")
            console.log("row ===== row ", row.original)
            const offeredMedicineName = row.original.offeredMedicine?.name
            const offeredMedicineTrademark = row.original.offeredMedicine?.trademark
            const offeredAmount = row.original.offeredMedicine?.offerAmount
            const offeredUnit = row.original.offeredMedicine?.unit
            const offeredPricePerUnit = row.original.offeredMedicine?.pricePerUnit
            const price = offeredPricePerUnit * offeredAmount
            const manufacturer = row.original.offeredMedicine?.manufacturer
            const returnTermData = row.original.offeredMedicine?.returnTerm
            
            let returnTerm;
            if (returnTermData === "exactType"){
                returnTerm = "ยาตามรายการ"
            } else {
                returnTerm = "ยาทดแทน"
            }

            return (
                <div className="flex flex-col">
                    <div className="text-md font-medium text-gray-600">ยา: {offeredMedicineName}</div>
                    <div className="text-md font-medium text-gray-600">ชื่อการค้า: {offeredMedicineTrademark}</div>
                    <div className="text-md font-medium text-gray-600">ผลิตโดย: {manufacturer}</div>
                    <div className="text-md font-medium text-gray-600">เป็นจำนวน: {offeredAmount} {offeredUnit}</div>
                    <div className="text-md font-medium text-gray-600">คิดเป็นมูลค่า: {price} บาท</div>
                    <div className="text-md font-medium text-gray-600">ประเภทยาที่ส่งคืน: {returnTerm}</div>
                </div>
            )
        },
        enableGlobalFilter: false
    },
    {
        accessorKey: "offeredMedicine.name",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">สถานะการส่งคืน</div>,
        cell: ({ row }) => {
            const status = row.original.status
            let statusBadge;
            let statusText;

            switch(status) {
                case "to-return":
                    statusBadge = <Badge variant="secondary">รอส่งคืน</Badge>
                    statusText = "รอการส่งคืนจากโรงพยาบาล"
                    break;
                case "returned":
                    statusBadge = <Badge variant="default">ส่งคืนแล้ว</Badge>
                    statusText = "ได้รับการส่งคืนเรียบร้อย"
                    break;
                default:
                    statusBadge = <Badge variant="outline">ไม่ทราบสถานะ</Badge>
                    statusText = "สถานะไม่ชัดเจน"
            }

            return (
                <div className="flex flex-col">
                    {statusBadge}
                    <div className="text-xs text-muted-foreground mt-1">{statusText}</div>
                </div>
            )
        },
        enableGlobalFilter: false
    },
    {
        id: "actions",
        size: 100,
        cell: ({ row }) => {
            const med = row.original
            const isLoading = loadingRowId === med.id
            const status = med.status
            
            if (status === "returned") {
                return (
                    <div className="flex flex-row gap-2 max-w-[200px]">
                        <Badge variant="default" className="flex items-center gap-1">
                            <CheckCircle2Icon className="h-3 w-3" />
                            ยืนยันแล้ว
                        </Badge>
                    </div>
                )
            }

            return (
                <div className="flex flex-row gap-2 max-w-[200px]">
                    <Button 
                        variant={'default'}
                        onClick={() => handleConfirmReturn(med)}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex flex-row items-center gap-2 max-w-[100px]">
                                <LoadingSpinner />
                                <span className="text-gray-500">ยืนยัน...</span>
                            </div>
                        ) : (
                            <div className="flex flex-row items-center gap-2 max-w-[100px]">
                                <Check />
                                ยืนยันรับคืน
                            </div>
                        )}
                    </Button>
                </div>
            )
        },
        enableGlobalFilter: false
    }
]
