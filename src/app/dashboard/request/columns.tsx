"use client"
import { ResponseAsset } from "@/types/responseMed"
import { ColumnDef } from "@tanstack/react-table"
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
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowUpDown, MoreHorizontal, Check, Trash2, Copy ,SquareX, SquareCheck, SquareMinus} from "lucide-react"

export const columns = (handleApproveClick: (med: ResponseAsset) => void, handleCancelClick: (med: ResponseAsset) => void): ColumnDef<ResponseAsset>[] => [
    {
        accessorKey: "requestDetails.name",
        size: 200,
        header: ({ column }) => {
            return (
                <div className="font-medium text-muted-foreground text-left cursor-default">
                    รายการยา/ชื่อการค้า
                </div>
            )
        },
        cell: ({ row }) => {
            const med = row.original
            const requestDetails = med.requestDetails
            const { requestTerm } = requestDetails
            const { returnType, supportCondition, receiveConditions, returnConditions } = requestTerm
            const condition = receiveConditions?.condition
            const conditionLabel = condition === 'exactType' ? 'ยาจากผู้ผลิตรายนี้' : condition === 'subType' ? 'ยาจากผู้ผลิตรายอื่น' : undefined
            const name = requestDetails.requestMedicine.name
            const trademark = requestDetails.requestMedicine.trademark
            return (
                <div className="flex flex-col">
                    <div className="text-md">{name}</div>
                    <div className="text-xs text-gray-600">{trademark}</div>

                    <div className="flex items-center gap-2 flex-wrap mt-2">
                        <Badge variant="outline" className="text-xs text-gray-600">{returnType === "supportReturn" ? "ขอสนับสนุน" : "ขอยืม"}
                            {returnType === "supportReturn" && supportCondition && (
                                <Badge variant="secondary" className="text-[10px] text-gray-600">
                                    {supportCondition === "servicePlan" ? "ตามแผนบริการ" : supportCondition === "budgetPlan" ? "ตามงบประมาณ" : "ให้ฟรี"}
                                </Badge>
                            )}
                            {returnType === "normalReturn" && conditionLabel && (
                                <Badge variant="secondary" className="text-[10px] text-gray-600">{conditionLabel}</Badge>
                            )}
                        </Badge>
                    </div>
                    {returnType === "normalReturn" && returnConditions && (
                        <Badge variant="outline" className="text-xs mt-1 text-gray-600">
                            การคืนยา
                            {returnConditions.condition === "exactType" ? (
                                <Badge variant="secondary" className="text-[10px] text-gray-600">คืนยารายการนี้</Badge>
                            ) : (
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge variant="secondary" className="text-[10px] text-gray-600 cursor-pointer">คืนยารายการอื่น</Badge>
                                        </TooltipTrigger>
                                        {returnConditions.otherTypeSpecification && returnConditions.otherTypeSpecification.trim().length > 0 && (
                                            <TooltipContent side="top">
                                                <div className="max-w-[280px] whitespace-pre-wrap">{returnConditions.otherTypeSpecification}</div>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </Badge>
                    )}

                </div>
            )
        },
        enableGlobalFilter: true
    },

    {
        accessorKey: "requestDetails.quantity",
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ขนาด/หน่วย</div>,
        size: 100,
        cell: ({ row }) => {
            const med = row.original
            const requestDetails = med.requestDetails
            return (
                <div className="flex flex-col space-x-2">
                    <span>{requestDetails.requestMedicine.unit}</span>
                    <span className="text-xs text-muted-foreground">{requestDetails.requestMedicine.quantity || "ไม่ระบุ"}</span>

                </div>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: "updatedAt",
        size: 80,
        header: ({ column }) =>
            <div className="font-medium text-muted-foreground text-left cursor-default items-center flex">
                วันที่แจ้ง
                <Button
                    className="font-medium text-muted-foreground text-left cursor-pointer"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >

                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </div>,
        cell: ({ row }) => {
            const med = row.original
            const requestDetails = med.requestDetails
            const createdAt = requestDetails.updatedAt
            const date = Number(createdAt); // convert string to number, then to Date
            const formattedDate = format(new Date(Number(date)), 'dd/MM/') + (new Date(Number(date)).getFullYear() + 543)
            const timeOnly = format(date, 'HH:mm:ss'); // format to time only
            return <div>
                <div className="text-sm font-medium">{formattedDate}</div>
                <div className="text-xs text-muted-foreground ">{timeOnly}</div>

            </div>
        },
        enableGlobalFilter: false
    },

    {
        accessorKey: "postingHospitalNameEN",
        size: 180,
        header: ({ column }) =>
            <div className="font-medium text-muted-foreground text-left cursor-default items-center flex">
                แจ้งโดย
                <Button
                    className="font-medium text-muted-foreground text-left cursor-pointer"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >

                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </div>,
        cell: ({ row }) => {
            const postingHospitalNameTH: string = row.original.requestDetails.postingHospitalNameTH
            return (
                <div className="flex flex-row">
                    <div className="flex flex-col justify-start">
                        <div className="text-md  overflow-hidden ">{postingHospitalNameTH}</div>
                    </div>

                </div>
            )
        },
        enableGlobalFilter: true
    },
    {
        accessorKey: "requestDetails.requestMedicine.quantity",
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวน</div>,
        cell: ({ row }) => {
            const med = row.original
            const requestDetails = med.requestDetails
            const requestAmount = requestDetails.requestMedicine.requestAmount
            const pricePerUnit = requestDetails.requestMedicine.pricePerUnit
            const totalPrice = requestAmount * pricePerUnit
            return (
                <div className="text-sm font-medium  flex flex-col">
                    <div>
                        {requestAmount}
                    </div>

                    <div className="text-xs text-muted-foreground">
                        รวม {totalPrice.toFixed(2)} บาท
                    </div>

                </div>
            )
        },
        enableGlobalFilter: false
    },
    {
        accessorKey: "manufacturer",
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ผู้ผลิต</div>,
        cell: ({ row }) => {
            const manufacturer: string = row.original.requestDetails.requestMedicine.manufacturer
            ////console.log("Posting Hospital Name:", postingHospitalNameTH)
            return (
                <div className="flex flex-row">
                    <div className="flex flex-col justify-start">
                        <div className="text-md  ">{manufacturer}</div>
                        {/* <div className="text-xs text-gray-600">คุณ xxx xxx</div>
                        <div className="text-xs text-gray-600">ติดต่อ 080xxxxx</div> */}
                    </div>

                </div>
            )
        },
        enableGlobalFilter: false
    },
    {
        accessorKey: "requestDetails.requestTerm.returnType",
        size: 130,
        header: () => 
            <div>
                <div className="font-medium text-muted-foreground text-center cursor-default">ความต้องการ</div>
                <div className="font-medium text-muted-foreground text-center cursor-default  flex justify-around gap-2">
                    <div>
                        ขอยืม
                    </div>
                    <div>
                        ขอสนับสนุน
                    </div>
                </div>
            </div>
            
        ,
        cell: ({ row }) => {
            const med = row.original
            const returnType = med.requestDetails.requestTerm.returnType
        return(
           
                // condition === 'exactType' ? 'รับคืนเฉพาะยารายการนี้' : condition === 'subType' ? 'รับคืนยาอื่นที่ไม่ใช่รายการนี้' : 'ไม่ระบุ'
                <div className="flex justify-around gap-2">
                    <div className="flex text-center">
                        {returnType === 'normalReturn' ? <SquareCheck className="text-green-600"/> : <SquareX className="text-red-600"/>}
                    </div>
                    <div className="flex text-center">
                        {returnType !== 'normalReturn' ? <SquareCheck className="text-green-600"/> : <SquareX className="text-red-600"/>}
                    </div>
                </div>
            
          
        )
        }
    },
    {
        accessorKey: "requestDetails.requestTerm.receiveConditions.condition",
        size: 120,
        header: () => 
            <div>
                <div className="font-medium text-muted-foreground text-center cursor-default">เงื่อนไขการรับคืน</div>
                <div className="font-medium text-muted-foreground text-center cursor-default  flex justify-between gap-2">
                    <div>
                        ยาจากผู้ผลิตรายนี้
                    </div>
                    <div>
                        ยาจากผู้ผลิตรายอื่น
                    </div>
                </div>
            </div>
            
        ,
        cell: ({ row }) => {
            const med = row.original
            const condition = med.requestDetails.requestTerm.receiveConditions?.condition
            const returnType = med.requestDetails.requestTerm.returnType
        return(
            returnType !== 'normalReturn' ? (
                <div className="flex justify-around gap-2">
                        <SquareMinus className="text-gray-300"></SquareMinus>
                        <SquareMinus className="text-gray-300"></SquareMinus>
                    </div>

                    // <div className="flex flex-col col-span-2 text-center">
                    //     <div className="m-2 p-2 border rounded-md bg-gray-100">
                    //         ขอสนับสนุน
                    //     </div>
                    // </div>
            ):(
                // condition === 'exactType' ? 'รับคืนเฉพาะยารายการนี้' : condition === 'subType' ? 'รับคืนยาอื่นที่ไม่ใช่รายการนี้' : 'ไม่ระบุ'
                <div className="flex justify-around gap-2">
                    <div className="flex text-center">
                        {condition === 'exactType' ? <SquareCheck className="text-green-600"/> : <SquareX className="text-red-600"/>}
                    </div>
                    <div className="flex text-center">
                        {condition !== 'exactType' ? <SquareCheck className="text-green-600"/> : <SquareX className="text-red-600"/>}
                    </div>
                </div>
            )
          
        )
        }
    },
    // removed: ความต้องการ & เงื่อนไขการรับยา columns (redundant with badges)
    {
        accessorKey: "requestDetails.urgent",
        size: 80,
        header: ({ column }) => {
            return (
                <div className="font-medium text-muted-foreground text-center cursor-default items-center flex justify-center">
                    ความเร่งด่วน
                    <Button
                        className="font-medium text-muted-foreground text-center cursor-pointer justify-center"
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >

                        <ArrowUpDown className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const med = row.original
            //console.log("med:", med)
            const status = med.requestDetails.urgent
            const label = status === "urgent" ? "ด่วนที่สุด" : status === "immediate" ? "ด่วน" : "ปกติ"
            const badgeClass = status === "urgent"
                ? "bg-red-100 text-red-700 border-red-200"
                : status === "immediate"
                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                    : "bg-gray-100 text-gray-700 border-gray-200"
            return (
                <div className="flex items-center text-center justify-center">
                    <Badge variant="outline" className={`text-xs  ${badgeClass}`}>{label}</Badge>
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
                        <DropdownMenuItem className="cursor-pointer"
                            onClick={() => handleCancelClick(med)}><Trash2 className="text-red-600" />ยกเลิก</DropdownMenuItem>
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