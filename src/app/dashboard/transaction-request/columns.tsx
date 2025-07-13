"use client"
import { useEffect,useState } from "react"
import { ResponseAsset } from "@/types/responseMed"
import { ColumnDef } from "@tanstack/react-table"
// import { formatDate } from "@/lib/utils"
import { format } from "date-fns"
import { useHospital } from "@/context/HospitalContext";
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
import ConfirmSharingDialog from "@/components/dialogs/confirm-sharing-dialog"

import { ArrowUpDown, Pencil, MoreHorizontal, Check, Trash2, Copy, CheckCircle2Icon, LoaderIcon, ShieldAlertIcon, Truck, Clock, TicketCheck,BookDown ,BookUp, SquareX ,SquareCheck, History} from "lucide-react"
import CreateResponseDialog from "@/components/dialogs/create-response-dialog"
import StatusIndicator from "@/components/ui/status-indicator"
import ReturnConditionIndicator from "@/components/ui/return-condition-indicator"

export const columns = (
    handleApproveClick: (med: any) => void,
    handleDeliveryClick: (med: any) => void,
    handleReturnClick: (med: any) => void,
    handleReConfirmClick: (med: any) => void,
    ticketType: string,
): ColumnDef<any>[] => [
    {
        accessorKey: "requestMedicine",
        size: 150,
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
                //const raw = row.getValue("updatedAt");
                const raw = row.original.updatedAt
                const date = new Date(Number(raw)); // convert string to number, then to Date
                const isValid = !isNaN(date.getTime());
                const formattedDate = isValid ? format(date, 'dd/MM/yyyy'): "-"; // format to date only
                const timeOnly = isValid ? format(date, 'HH:mm:ss'): "-"; // format to time only

                return (<div>
                    <div className="text-sm font-medium text-gray-600">{formattedDate}</div>
                    <div className="text-xs text-muted-foreground">{timeOnly}</div>
                </div>);
            
        },
        enableGlobalFilter: true
    },
    {
        accessorKey: "requestMedicine.name",
        size: 250,
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
            const medName = row.original.requestMedicine.name;
            const medTrademark = row.original.requestMedicine.trademark;

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
        size: 150,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ขนาด/หน่วย</div>,
        cell:({ row }) => {
                const med = row.original;
                const quantity = med.requestMedicine.quantity;
                const unit = med.requestMedicine.unit
                return(
                <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-600">{quantity}</div>
                        <div className="text-xs text-muted-foreground">{unit}</div>
                    </div>
                )           
        },  
        enableGlobalFilter: true
    },
    {
        accessorKey: "requestMedicine.requestAmount",
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวนที่ขอยืม</div>,
        cell: ({ row }) => {
                const med = row.original;
                const requestAmount = med.requestMedicine.requestAmount;
                return (
                    <div className="text-sm font-medium text-gray-600">{requestAmount}</div>
                )         
        },
        enableGlobalFilter: false
    },
    {
         accessorKey: "requestDetails.id", 
         size: 280,
         header: () => {
                return (
                    <div className="font-medium text-muted-foreground text-center cursor-default">
                        <div>
                            เงื่อนไขการรับยา
                        </div> 
                        <div className="flex flex-row gap-x-2 text-center font-medium justify-center">
                            <div className="text-center basis-1/2">
                                ยืมรายการทดแทนได้
                            </div>
                            <div className="text-center basis-1/2">
                                ขอสนับสนุน
                            </div>
                        </div>
                    </div>
                    
                )        
         },
         cell:({row})=>{
                const med = row.original;
                const condition = med.requestTerm.receiveConditions.condition
                const supportType = med.requestTerm.receiveConditions.supportType

                let supportTypetDiv;
                let conditionDiv;

                if (condition === "exactType"){
                    conditionDiv = <div className="flex text-red-600 items-center"> <SquareX/>Exact Type</div>
                }else{
                    conditionDiv = <div className="flex text-green-600 items-center"> <SquareCheck/>Not Exact Type</div>;
                }


                if (supportType === true) { 
                supportTypetDiv = <div className="flex text-green-600 items-center"> <SquareCheck/>TRUE </div>
                } else {
                supportTypetDiv = <div className="flex text-red-600 items-center"> <SquareX/> FALSE</div>;
                }
                
                return(
                    
                <div className="flex flex-row gap-x-2 text-center font-medium justify-center">

                        <div className="text-center basis-1/2">
                            <div className="flex flex-row justify-center">
                                {conditionDiv} 
                            </div>
                    </div>
                    
                    <div className="text-center basis-1/2">
                            <div className="flex flex-row justify-center">
                                {supportTypetDiv} 
                            </div>
                    </div>

                </div>
                )    
         },
         enableGlobalFilter: false
    },
    {
        accessorKey: "responseDetails",
        size: 350,
        header: () => (
            <div className="flex flex-row gap-x-2 justify-between">
                <div className="font-medium text-muted-foreground text-center cursor-default basis-1/3 justify-center">
                    โรงพยาบาลที่ให้ยืม
                </div>
                <div className="font-medium text-muted-foreground  cursor-default text-center  basis-1/2 justify-center ">
                    สถานะ(จำนวนยาที่ได้ยืม)
                </div>
                <div className="flex justify-center basis-1/6">
                    <History className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </div>
            </div>
        ),
        cell: ({ row }) => {
                const med = row.original;
                const maxDisplay = 3;
                const details = med.responseDetails.slice(0, maxDisplay);
                const hasMore = med.responseDetails.length > maxDisplay;
                
            // const [dialogOpen, setDialogOpen] = useState(false);
            // const handleConfirm = () => {
            //     setDialogOpen(false);
            // }
            
            return (
                    <div className="" >
                        {med.responseDetails.map((detail: any, index: any) => (
                            <div key={index} className="flex flex-row  items-center  justify-between">
                                <div className="text-sm font-medium text-gray-600 flex justify-center basis-1/3">
                                    <span>{detail.respondingHospitalNameTH}:</span>
                                </div>
                                <div className="text-sm font-medium text-gray-600 flex  basis-1/2 items-center text-center justify-center">
                                    <div className="flex items-center gap-x-1 basis-1/2">
                                        {detail.status === 'offered' ? (
                                            <Button 
                                                variant={"link"} 
                                                className="flex gap-x-1  " 
                                            onClick={() => handleApproveClick({
                                                ...med,
                                                responseId: detail.id,
                                                offeredMedicine: detail.offeredMedicine,
                                                requestDetails: med.requestMedicine,
                                            })}>ได้รับการยืนยัน <StatusIndicator status={detail.status} />
                                            </Button>
                                            
                                        )
                                        : detail.status === 'pending'
                                            ? (<Button variant={'link'} disabled className="flex gap-x-1  ">รอการยืนยันให้ยืม<StatusIndicator status={detail.status} /></Button>)
                                            : detail.status === 'to-transfer'
                                                ? (<Button variant={'link'} className="flex gap-x-1  " disabled>รอส่งมอบ<StatusIndicator status={detail.status} /></Button>)
                                                : detail.status === 'to-return'
                                                    ? (<Button variant={'link'} className="flex gap-x-1  " onClick={() => handleDeliveryClick({
                                                        ...med,
                                                        responseId: detail.id,
                                                        offeredMedicine: detail.offeredMedicine,
                                                        requestDetails: med.requestMedicine,
                                                    })}>อยู่ระหว่างการจัดส่ง (เช็คสถานะ)<StatusIndicator status={detail.status} /></Button>)
                                                    : detail.status === 'in-return'
                                                        ? (<Button variant={'link'} className="flex gap-x-1  " onClick={() => handleReturnClick(
                                                            {
                                                                ...med,
                                                                responseId: detail.id,
                                                                offeredMedicine: detail.offeredMedicine,
                                                                requestDetails: med.requestMedicine,
                                                            })
                                                        }>ได้รับยาที่ยืม(ส่งคืน)<StatusIndicator status={detail.status} /></Button>)
                                                        : detail.status === "confirm-return"
                                                            ? (<span className="flex gap-x-1  ">รอยืนยันการได้รับคืน< StatusIndicator status={detail.status} /></span>)
                                                            : detail.status === 'returned'
                                                                ? (<span className="flex gap-x-1   ">ได้คืนยาแล้ว<StatusIndicator status={detail.status} /></span>)
                                                                : detail.status === 'cancelled'
                                                                    ? (<span className="flex gap-x-1  ">ยกเลิก<StatusIndicator status={detail.status} /></span>)
                                                                    : null
                                            }
                                    </div>
                                    {/* <div className="flex ">({detail.offeredMedicine.offerAmount})</div> */}
                                </div>
                                <div className="flex justify-center basis-1/6"><History className="w-4 h-4 text-muted-foreground cursor-pointer" /></div>
                            </div>
                        ))}
                        {hasMore && <Button variant={'link'} className="">เพิ่มเติม...</Button>}
                    </div>
                );
        },
    },
]