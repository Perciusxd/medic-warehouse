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

import { ArrowUpDown, Pencil, MoreHorizontal, Check, Trash2, Copy, CheckCircle2Icon, LoaderIcon, ShieldAlertIcon, Truck, Clock, TicketCheck,BookDown ,BookUp, SquareX ,SquareCheck} from "lucide-react"
import CreateResponseDialog from "@/components/dialogs/create-response-dialog"
import StatusIndicator from "@/components/ui/status-indicator"

export const columns = (
    
    handleApproveClick: (med: any) => void,
    handleDeliveryClick: (med: any) => void,
    handleReturnClick: (med: any) => void,
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
            if(row.original.ticketType === "request"){
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
            }else{
                //const raw = row.getValue("createdAt");
                const raw = row.original.createdAt
                console.log("raw===createdAt==", raw);
                const date = new Date(Number(raw)); // convert string to number, then to Date
                const isValid = !isNaN(date.getTime());
                const formattedDate = isValid ? format(date, 'dd/MM/yyyy'): "-"; // format to date only
                const timeOnly = isValid ? format(date, 'HH:mm:ss'): "-"; // format to time only

                return (<div>
                    <div className="text-sm font-medium text-gray-600">{formattedDate}</div>
                    <div className="text-xs text-muted-foreground">{timeOnly}</div>
                </div>);
            }
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
            console.log("row===", row.original);
            if(row.original.ticketType === "request"){
            const medName = row.original.requestMedicine.name;
            const medTrademark = row.original.requestMedicine.trademark;

            return (
                <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-600">{medName}</div>
                    <div className="text-xs text-muted-foreground">{medTrademark}</div>
                </div>
            )
            }else{
                const medName = row.original.sharingMedicine.name;
                const medTrademark = row.original.sharingMedicine.trademark;

                return (
                    <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-600">{medName}</div>
                        <div className="text-xs text-muted-foreground">{medTrademark}</div>
                    </div>
                )
            }
        },
        enableGlobalFilter: true
    },
    {
        accessorKey: "requestMedicine.quantity",
        size: 150,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ขนาด/หน่วย</div>,
        cell:({ row }) => {
            if(row.original.ticketType === "request"){
                const med = row.original;
                const quantity = med.requestMedicine.quantity;
                const unit = med.requestMedicine.unit
                return(
                <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-600">{quantity}</div>
                        <div className="text-xs text-muted-foreground">{unit}</div>
                    </div>
                )
            }else{
                const med = row.original;
                const quantity = med.sharingMedicine.quantity;
                const unit = med.sharingMedicine.unit
                return(
                    <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-600">{quantity}</div>
                        <div className="text-xs text-muted-foreground">{unit}</div>
                    </div>
                )
            }
        },  
        enableGlobalFilter: true
    },
    {
        accessorKey: "requestMedicine.requestAmount",
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวนที่ขอยืม</div>,
        cell: ({ row }) => {
            if(row.original.ticketType === "request"){
                const med = row.original;
                const requestAmount = med.requestMedicine.requestAmount;
                return (
                    <div className="text-sm font-medium text-gray-600">{requestAmount}</div>
                )
            }else{
                const med = row.original;
                const sharingAmount = med.sharingMedicine.sharingAmount;
                return (
                    <div className="text-sm font-medium text-gray-600">{sharingAmount}</div>
                )
            }
        },
        enableGlobalFilter: false
    },
    {
         accessorKey: "requestDetails.id", 
         size: 280,
         header: () => {
        
            if(ticketType==="request"){
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
            }else{
                return (
                    <div className="font-medium text-muted-foreground text-left cursor-default flex flex-row justify-center">เงื่อนไขการคืน</div>
                )
            }
            
         },
         cell:({row})=>{
            if(row.original.ticketType === "request"){
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
            }else{
                const med = row.original.sharingReturnTerm

                const receiveConditions = med.receiveConditions
              
                const exactType = receiveConditions.exactType
                
                const subType = receiveConditions.subType
               
                const supportType = receiveConditions.supportType
              
                const otherType = receiveConditions.otherType
               
                const noReturn = receiveConditions.noReturn
              
                
                let exactTypeDiv;
                if (exactType === true) {
                    exactTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck/>{exactType}รับคืนเฉพาะรายการนี้</div>;
                }
                else if (exactType === false) {
                    exactTypeDiv = <div className="flex text-red-600 items-center"> <SquareX/>{exactType}รับคืนเฉพาะรายการนี้</div>;
                }

                let subTypeDiv;
                 if (subType === true) {
                    subTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck/>รับคืนรายการอื่นได้</div>;
                }
                else if (subType === false) {
                    subTypeDiv = <div className="flex text-red-600 items-center"> <SquareX/>รับคืนรายการอื่นได้</div>;
                }

                let supportTypeDiv;
                if (supportType === true) {
                    supportTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck/>ขอสนับสนุน</div>;
                }
                else if (supportType === false) {
                    supportTypeDiv = <div className="flex text-red-600 items-center"> <SquareX/>ขอสนับสนุน</div>;
                }

                let otherTypeDiv;
                if (otherType === true) {
                    otherTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck/>รับคืนรายการทดแทน</div>;
                }
                else if (otherType === false) {
                    otherTypeDiv = <div className="flex text-red-600 items-center"> <SquareX/>รับคืนรายการทดแทน</div>;
                }

                let noReturnDiv;   
                if (noReturn === true) {
                    noReturnDiv = <div className="flex text-green-600 items-center"> <SquareCheck/>ไม่ต้องคืน</div>;
                }
                else if (noReturn === false) {
                    noReturnDiv = <div className="flex text-red-600 items-center"> <SquareX/>false</div>;
                }

                if (noReturn === true) {
                    return (
                        <div className="flex flex-row justify-center">
                        {noReturnDiv}
                        </div>
                    )
                    
                }else  {
                    return (
                    <div className="flex flex-row">
                        <div className="flex flex-col items-left gap-2 basis-1/2">
                            <div className="basis-1/2 text-left gap-1">{exactTypeDiv} </div>
                            <div className="basis-1/2 text-left gap-1">{subTypeDiv}</div>
                        </div>
                         <div className="flex flex-col items-left gap-2 basis-1/2">
                            <div className="basis-1/2 text-left gap-1">{supportTypeDiv}</div>
                            <div className="basis-1/2 text-left gap-1">{otherTypeDiv}</div>
                        </div>
                    </div>
                    )
                }
            }
    
            
         },
         enableGlobalFilter: false
    },
    {
        accessorKey: "responseDetails",
        size: 300,
        header: () => (
            <div className="flex flex-row gap-x-2">
                <div className="font-medium text-muted-foreground text-left cursor-default basis-1/2">
                    สถานะการตอบกลับ
                </div>
                <div className="font-medium text-muted-foreground text-left cursor-default  basis-1/2">
                    (จำนวนที่ให้ยืม)
                </div>
            </div>
        ),
        cell: ({ row }) => {
            if(row.original.ticketType === "request"){
                const med = row.original;
                const maxDisplay = 3;
                const details = med.responseDetails.slice(0, maxDisplay);
                const hasMore = med.responseDetails.length > maxDisplay;

            // const [dialogOpen, setDialogOpen] = useState(false);
            // const handleConfirm = () => {
            //     setDialogOpen(false);
            // }

            return (
                    <div className="flex flex-col gap-y-1 text-gray-600" >
                        {med.responseDetails.map((detail: any, index: any) => (
                            <div key={index} className="flex items-center gap-x-2 h-4">
                                <div className="basis-1/2">
                                    <span>{detail.respondingHospitalNameTH}:</span>
                                </div>
                                <div className="basis-1/2">
                                    {detail.status === 'offered' ? (
                                            <Button 
                                                variant={"link"} 
                                                className="flex gap-x-2" 
                                            onClick={() => handleApproveClick({
                                                ...med,
                                                responseId: detail.id,
                                                offeredMedicine: detail.offeredMedicine,
                                                requestDetails: med.requestMedicine,
                                            })}>ได้รับการยืนยัน ({detail.offeredMedicine.offerAmount})<StatusIndicator status={detail.status} />
                                            </Button>
                                    )
                                        : detail.status === 'pending'
                                            ? (<Button variant={'link'} disabled className="flex gap-x-2">รอการตอบกลับ (-)<StatusIndicator status={detail.status} /></Button>)
                                            : detail.status === 'to-transfer'
                                                ? (<Button variant={'link'} className="flex gap-x-2">รอการจัดส่ง<StatusIndicator status={detail.status} /></Button>)
                                                : detail.status === 'to-return'
                                                    ? (<Button variant={'link'} className="flex gap-x-2" onClick={() => handleDeliveryClick({
                                                        ...med,
                                                        responseId: detail.id,
                                                        offeredMedicine: detail.offeredMedicine,
                                                        requestDetails: med.requestMedicine,
                                                    })}>อยู่ระหว่างการจัดส่ง (เช็คสถานะ)<StatusIndicator status={detail.status} /></Button>)
                                                    : detail.status === 'in-return'
                                                        ? (<Button variant={'link'} className="flex gap-x-2" onClick={() => handleReturnClick(
                                                            {
                                                                ...med,
                                                                responseId: detail.id,
                                                                offeredMedicine: detail.offeredMedicine,
                                                                requestDetails: med.requestMedicine,
                                                            })
                                                        }>ต้องส่งคืน<StatusIndicator status={detail.status} /></Button>)
                                                        : detail.status === "confirm-return"
                                                            ? (<span className = "flex gap-x-2">รอยืนยันการคืน< StatusIndicator status={detail.status} /></span>)
                                                            : detail.status === 'returned'
                                                                ? (<span className="flex gap-x-2">เสร็จสิ้น<StatusIndicator status={detail.status} /></span>)
                                                                : detail.status === 'cancelled'
                                                                    ? (<span className="flex gap-x-2">ยกเลิก<StatusIndicator status={detail.status} /></span>)
                                                                    : null
                                    }
                                </div>
                            </div>
                        ))}
                        {hasMore && <Button variant={'link'} className="">เพิ่มเติม...</Button>}
                    </div>
                );
            }else{
                const med = row.original;
                const maxDisplay = 3;
                const details = med.responseDetails.slice(0, maxDisplay);
                const hasMore = med.responseDetails.length > maxDisplay;
                console.log("detail", med.responseDetails)

                return (
                    <div className="flex flex-col gap-y-1 text-gray-600" >
                        {med.responseDetails.map((detail: any, index: any) => (
                            <div key={index} className="flex items-center gap-x-2 h-4">
                                <div className="basis-1/2">
                                    <span>{detail.respondingHospitalNameTH}:</span>
                                </div>
                                <div className="basis-1/2">
                                    {detail.status === 'offered' ? (
                                            <Button 
                                                variant={"link"} 
                                                className="flex gap-x-2" 
                                            onClick={() => handleApproveClick({
                                                ...med,
                                                responseId: detail.id,
                                                offeredMedicine: detail.acceptedOffer,
                                                sharingDetails: med.sharingMedicine,
                                            })}>ได้รับการยอมรับ ({detail.acceptedOffer?.responseAmount || '-'})<StatusIndicator status={detail.status} />
                                            </Button>
                                    )
                                        : detail.status === 'pending'
                                            ? (<Button variant={'link'} disabled className="flex gap-x-2">รอการตอบกลับ (-)<StatusIndicator status={detail.status} /></Button>)
                                            : detail.status === 'to-transfer'
                                                ? (<Button variant={'link'} className="flex gap-x-2">รอการจัดส่ง<StatusIndicator status={detail.status} /></Button>)
                                                : detail.status === 'to-return'
                                                    ? (<Button variant={'link'} className="flex gap-x-2" onClick={() => handleDeliveryClick({
                                                        ...med,
                                                        responseId: detail.id,
                                                        acceptedMedicine: detail.acceptedMedicine,
                                                        sharingDetails: med.sharingMedicine,
                                                    })}>อยู่ระหว่างการจัดส่ง (เช็คสถานะ)<StatusIndicator status={detail.status} /></Button>)
                                                    : detail.status === 'in-return'
                                                        ? (<Button variant={'link'} className="flex gap-x-2" onClick={() => handleReturnClick(
                                                            {
                                                                ...med,
                                                                responseId: detail.id,
                                                                acceptedMedicine: detail.acceptedMedicine,
                                                                sharingDetails: med.sharingMedicine,
                                                            })
                                                        }>รอการคืน<StatusIndicator status={detail.status} /></Button>)
                                                        : detail.status === "confirm-return"
                                                            ? (<span className = "flex gap-x-2">รอยืนยันการคืน< StatusIndicator status={detail.status} /></span>)
                                                            : detail.status === 'completed'
                                                                ? (<span className="flex gap-x-2">เสร็จสิ้น<StatusIndicator status={detail.status} /></span>)
                                                                : detail.status === 'cancelled'
                                                                    ? (<span className="flex gap-x-2">ยกเลิก<StatusIndicator status={detail.status} /></span>)
                                                                    : null
                                    }
                                </div>
                            </div>
                        ))}
                        {hasMore && <Button variant={'link'} className="">เพิ่มเติม...</Button>}
                    </div>
                );
            }
        },
    },
]