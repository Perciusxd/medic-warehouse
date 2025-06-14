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

import { ArrowUpDown, Pencil, MoreHorizontal, Check, Trash2, Copy, CheckCircle2Icon, LoaderIcon, ShieldAlertIcon, Truck, Clock, TicketCheck,BookDown ,BookUp, SquareX ,SquareCheck} from "lucide-react"
import CreateResponseDialog from "@/components/dialogs/create-response-dialog"
import StatusIndicator from "@/components/ui/status-indicator"

export const columns = (
    
    loggedInHospital : string,
    handleApproveClick: (med: any) => void,
    handleDeliveryClick: (med: any) => void,
    handleReturnClick: (med: any) => void,
): ColumnDef<any>[] => [
    { accessorKey: "postingHospitalNameEN",
        size:200,
        header: () => <div className="">Status </div>,
        cell:({row})=>{
            const med = row.original;
            const postingHospitalNameEN = med.postingHospitalNameEN;
            console.log("row.original in status dashbroad ===",med);
            
            const  loggedInHospital  = useHospital();
            
            
        if (postingHospitalNameEN === loggedInHospital) {
            return(
                <div className="text-orange-600 flex">
                    <BookUp/> {postingHospitalNameEN}
                </div>
            )
        }else{
            return(
                <div className="text-yellow-600 flex">
                    <BookDown/> {postingHospitalNameEN}
                </div>
            )
        }

        }

    },
    {
        accessorKey: "updatedAt",
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
            const raw = row.getValue("updatedAt");
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
        enableGlobalFilter: false
    },
    {
         accessorKey: "requestDetails.id", 
         size: 280,
         header: () => (
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
         ),
         cell:({row})=>{
            const med = row.original;
            const condition = med.requestTerm.receiveConditions.condition
            const supportType = med.requestTerm.receiveConditions.supportType
            console.log("===============>>>",loggedInHospital)

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
            const med = row.original;
            const maxDisplay = 3;
            const details = med.responseDetails.slice(0, maxDisplay);
            const hasMore = med.responseDetails.length > maxDisplay;

            const [dialogOpen, setDialogOpen] = useState(false);
            const handleConfirm = () => {
                setDialogOpen(false);
            }

            return (
                <div className="flex flex-col gap-y-1 text-gray-600" >
                    {med.responseDetails.map((detail, index) => (
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
                                                    ? (<Button variant={'link'} className="flex gap-x-2" onClick={() => handleReturnClick({
                                                        ...med,
                                                        responseId: detail.id,
                                                        offeredMedicine: detail.offeredMedicine,
                                                        requestDetails: med.requestMedicine,
                                                    })}>ต้องส่งคืน<StatusIndicator status={detail.status} /></Button>)
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
        },
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