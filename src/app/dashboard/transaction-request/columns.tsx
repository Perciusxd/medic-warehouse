"use client"
import { useEffect, useState } from "react"
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

import { ArrowUpDown, Pencil, MoreHorizontal, Check, Trash2, Copy, CheckCircle2Icon, LoaderIcon, ShieldAlertIcon, Truck, Clock, TicketCheck, BookDown, BookUp, SquareX, SquareCheck, History } from "lucide-react"
import CreateResponseDialog from "@/components/dialogs/create-response-dialog"
import StatusIndicator from "@/components/ui/status-indicator"
import ReturnConditionIndicator from "@/components/ui/return-condition-indicator"
import ImageHoverPreview from "@/components/ui/image-hover-preview"
export const columns = (
    handleApproveClick: (med: any) => void,
    handleDeliveryClick: (med: any) => void,
    handleReturnClick: (med: any) => void,
    handleReConfirmClick: (med: any) => void,
    handleEditClick: (med: any) => void,
    handleconfirReceiveDelivery:(med:any) => void,
    ticketType: string,
): ColumnDef<any>[] => [
        {
            id: "edit",
            size: 50,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center">
                        <Button variant={'link'} className="flex p-0 justify-center hover:bg-indigo-300" onClick={() => handleEditClick(row.original)}><Pencil className="cursor-pointer" /></Button>
                    </div>
                )
            }
        },
        {
                    id: "image",
                    size: 70,
                    header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ภาพ</div>,
                    cell: ({ row }) => {
                        const original: any = row.original as any
                        //console.log("original", original)
                        const imgUrl: string | null = original.requestMedicine.requestMedicineImage || original.requestMedicineImage?.imageRef || null
                        if (!imgUrl) {
                            return <div className="text-xs text-muted-foreground">-</div>
                        }
                        return (
                            <div className="flex items-center gap-2">
                                {/* eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={imgUrl}
                                    alt="thumb"
                                    className="h-10 w-10 object-cover rounded border"
                                /> */}
                                <ImageHoverPreview previewUrl={imgUrl} />
                            </div>
                        )
                    }
                },
        {
            accessorKey: "createdAt",
            size: 80,
            header: ({ column }) => {

                return (

                    <div className="flex justify-start items-center text-gray-600">
                        วันที่แจ้ง
                        <Button
                            className="font-medium text-muted-foreground text-left cursor-pointer ่"
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >

                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
                    </div>

                )
            },
            cell: ({ row }) => {
                //const raw = row.getValue("updatedAt");
                const raw = row.original.updatedAt
                const date = new Date(Number(raw)); // convert string to number, then to Date
                const isValid = !isNaN(date.getTime());
                const formattedDate = isValid ? format(new Date(Number(date)), 'dd-MM-') + (new Date(Number(date)).getFullYear() + 543) : "-"; // format to date only
                const timeOnly = isValid ? format(date, 'HH:mm:ss') : "-"; // format to time only

                return (<div>
                    <div className="text-md font-medium ">{formattedDate}</div>
                    <div className="text-xs text-muted-foreground">{timeOnly}</div>
                </div>);

            },
            enableGlobalFilter: true
        },
        {
            accessorKey: "requestMedicine.name",
            size: 180,
            header: ({ column }) => {
                return (
                    <div className="flex justify-start items-center text-gray-600">
                        ชื่อยา/ชื่อการค้า
                        <Button
                            className="font-medium text-muted-foreground text-left cursor-pointer"
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
            cell: ({ row }) => {
                const medName = row.original.requestMedicine.name;
                const medTrademark = row.original.requestMedicine.trademark;

                return (
                    <div className="flex flex-col">
                        <div className="text-md font-medium ">{medName}</div>
                        <div className="text-xs text-muted-foreground">{medTrademark}</div>
                    </div>
                )

            },
            enableGlobalFilter: true
        },
        {
            accessorKey: "requestMedicine.requestAmount",
            size: 80,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวนที่ขอยืม (ยืนยัน)</div>,
            cell: ({ row }) => {
                const med = row.original;
                const requestAmount = med.requestMedicine.requestAmount;
                const remainingAmount = med.remainingAmount;
                const pricePerUnit = med.requestMedicine.pricePerUnit;
                const totalPrice = requestAmount * pricePerUnit;
                //console.log('medasdasdasd', med)
                return (
                    <div  className="flex flex-col">
                        <div className="text-md font-medium ">{requestAmount.toLocaleString()} ( {remainingAmount.toLocaleString()} )</div>
                        <div className="text-xs text-muted-foreground">รวม {totalPrice.toLocaleString()} บาท</div>
                    </div>
                )
            },
            enableGlobalFilter: false
        },
        {
            accessorKey: "requestMedicine.quantity",
            size: 120,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ขนาด/หน่วย</div>,
            cell: ({ row }) => {
                const med = row.original;
                const quantity = med.requestMedicine.quantity;
                const unit = med.requestMedicine.unit
                return (
                    <div className="flex flex-col">
                        <div className="text-md font-medium ">{quantity}</div>
                        <div className="text-xs text-muted-foreground">{unit}</div>
                    </div>
                )
            },
            enableGlobalFilter: true
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
                            <div className="text-center basis-2/3">
                                ยืมรายการทดแทนได้
                            </div>
                            <div className="text-center basis-1/3">
                                ขอสนับสนุน
                            </div>
                        </div>
                    </div>

                )
            },
            cell: ({ row }) => {
                const med = row.original;
                const condition = med.requestTerm.receiveConditions.condition
                const supportType = med.requestTerm.receiveConditions.supportType

                let supportTypetDiv;
                let conditionDiv;

                if (condition === "exactType") {
                    conditionDiv = <div className="flex text-red-600 items-center gap-x-1 "> <SquareX className="w-5 h-5"/>ยืมรายการทดแทนไม่ได้</div>
                } else {
                    conditionDiv = <div className="flex text-green-600 items-center gap-x-1"> <SquareCheck className="w-5 h-5" />ยืมรายการทดแทนได้</div>;
                }


                if (supportType === true) {
                    supportTypetDiv = <div className="flex text-green-600 items-center gap-x-1"> <SquareCheck className="w-5 h-5"/>ขอสนับสนุน</div>
                } else {
                    supportTypetDiv = <div className="flex text-red-600 items-center gap-x-1"> <SquareX className="w-5 h-5"/>ขอสนับสนุน</div>;
                }

                return (

                    <div className="flex flex-row gap-x-2 text-center font-medium justify-between">

                            <div className="text-center basis-2/3">
                                {conditionDiv}
                            </div>
                            
                            <div className="text-center basis-1/3">
                                {supportTypetDiv}
                            </div>
                    </div>
                )
            },
            enableGlobalFilter: false
        },
        // {
        //     accessorKey: "updatedAt",
        //     size: 120,
        //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันอัพเดทล่าสุด</div>,
        //     cell: ({ row }) => {
        //         const responseDetails = row.original.responseDetails;
        //         const med = row.original;
        //         if (!Array.isArray(responseDetails) || responseDetails.length === 0) {
        //             return <div className="text-muted-foreground">-</div>;
        //         }

        //         return (
        //             // <div className="flex flex-row  items-center  justify-between">
        //             //      {med.responseDetails.map((detail: any, index: any) =>{
        //             //         const date = new Date(Number(detail.updatedAt));
        //             //         const isValid = !isNaN(date.getTime());
        //             //         const formattedDate = isValid ? format(date, 'dd/MM/yyyy') : "-";
        //             //         const timeOnly = isValid ? format(date, 'HH:mm:ss') : "-";

        //             //         return (
        //             //             // <div key={index} className="">
        //             //             //     <div className="text-sm font-medium ">{formattedDate}</div>
        //             //             //     {/* <div className="text-xs text-muted-foreground">{timeOnly}</div> */}
        //             //             // </div>
        //             //              <div className="text-md font-medium  flex justify-center ">
        //             //                 <span>{detail.updatedAt}:</span>
        //             //             </div>
        //             //         );
        //             //     })}
        //             // </div>
        //              <div className="" >
        //                 {med.responseDetails.map((detail: any, index: any) => (
        //                     <div key={index} className="flex flex-row  items-start  justify-between">
        //                         <div className="text-md font-medium  flex justify-center basis-1/3">
        //                             <span>{detail.updatedAt}:</span>
        //                         </div>
        //                     </div>  
        //                 ))}
        //             </div>
                        
        //         );
        //     },
        //     enableGlobalFilter: false
        // },
        {
            accessorKey: "responseDetails",
            size: 360,
            header: () => (
                <div className="flex flex-row  justify-between">
                    <div className="font-medium text-muted-foreground text-left cursor-default min-w-[120px]">
                        วันอัพเดทล่าสุด
                    </div>
                    <div className="font-medium text-muted-foreground text-left cursor-default min-w-[150px] ">
                        โรงพยาบาลที่ให้ยืม
                    </div>
                    <div className="font-medium text-muted-foreground  cursor-default text-left  min-w-[180px] ">
                        สถานะ(จำนวนยาที่ได้ยืม)
                    </div>
                </div>
            ),
            cell: ({ row }) => {
                const med = row.original;
                const maxDisplay = 3;
                const details = med.responseDetails.slice(0, maxDisplay);
                const hasMore = med.responseDetails.length > maxDisplay;
                //console.log("med ssds" ,)
                // const [dialogOpen, setDialogOpen] = useState(false);
                // const handleConfirm = () => {
                //     setDialogOpen(false);
                // }

                return (
                    <div className="" >
                        {med.responseDetails.map((detail: any, index: any) => (
                            <div key={index} className="flex flex-row  items-center  justify-between">
                                 <div className="text-md font-medium  flex justify-start min-w-[120px]">
                                   <span>
                                        {detail.updatedAt && !isNaN(Number(detail.updatedAt))
                                            ? format(new Date(Number(detail.updatedAt)), 'dd-MM-') + (new Date(Number(detail.updatedAt)).getFullYear() + 543)
                                            : "-"}
                                        </span>
                                </div>
                                <div className="text-md font-medium  flex justify-start min-w-[150px] ">
                                    <span>{detail.respondingHospitalNameTH}:</span>
                                </div>
                                <div className="text-sm font-medium text-gray-600 flex    items-center text-left  justify-start min-w-[180px]">
                                    <div className="flex items-center gap-x-1 basis-1/2">
                                        {detail.status === 'offered' ? (
                                            <Button
                                                variant={"link"}
                                                className="flex gap-x-1 !px-0 "
                                                onClick={() => handleApproveClick({
                                                    ...med,
                                                    responseId: detail.id,
                                                    offeredMedicine: detail.offeredMedicine,
                                                    requestDetails: med.requestMedicine,
                                                    responseDetail: detail,
                                                })}>ได้รับการยืนยัน <StatusIndicator status={detail.status} />
                                            </Button>

                                        )
                                            : detail.status === 'pending'
                                                ? (<Button variant={'link'} disabled className="flex gap-x-1  ">รอการยืนยันให้ยืม<StatusIndicator status={detail.status} /></Button>)
                                                : detail.status === 'to-transfer'
                                                    ? (<Button variant={'link'} className="flex gap-x-1  " disabled>รอรับมอบ<StatusIndicator status={detail.status} /></Button>)
                                                    : detail.status === 'to-return'
                                                        ? (<Button variant={'link'} className="flex gap-x-1  " onClick={() => handleconfirReceiveDelivery({
                                                            ...med,
                                                            displayHospitalName: detail.respondingHospitalNameTH,
                                                            displayMedicineName: detail.offeredMedicine.name,
                                                            displayMedicineAmount: detail.offeredMedicine.offerAmount,//dalog ต้องทำใหม่ให้อัพเดท สเตตัส ให้ถูก
                                                            responseId: detail.id,
                                                            offeredMedicine: detail.offeredMedicine,
                                                            requestDetails: med.requestMedicine,
                                                        })}>ยืนยันการรับยา<StatusIndicator status={detail.status} /></Button>)
                                                        : detail.status === 'in-return'
                                                            ? (<Button variant={'link'} className="flex gap-x-1  " onClick={() => handleReturnClick(
                                                                {
                                                                    ...med,
                                                                    responseId: detail.id,
                                                                    offeredMedicine: detail.offeredMedicine,
                                                                    requestDetails: med.requestMedicine,
                                                                    responseDetail: detail,
                                                                })
                                                            }>ส่งคืนยา<StatusIndicator status={detail.status} /></Button>)
                                                            : detail.status === "confirm-return"
                                                                ? (<span className="flex gap-x-1  ">รอยืนยันการได้รับคืน< StatusIndicator status={detail.status} /></span>)
                                                                : detail.status === 'returned'
                                                                    ? (<span className="flex gap-x-1   ">เสร็จสิ้น<StatusIndicator status={detail.status} /></span>)
                                                                    : detail.status === 'cancelled'
                                                                        ? (<span className="flex gap-x-1  ">ยกเลิก<StatusIndicator status={detail.status} /></span>)
                                                                        : null
                                        }
                                    </div>
                                    <div className="flex ">({detail.offerAmount})</div>
                                </div>
                            </div>
                        ))}
                        {hasMore && <Button variant={'link'} className="">เพิ่มเติม...</Button>}
                    </div>
                );
            },
        },
        {
            accessorKey: "history",
            size: 150,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">สถานะ</div>,
            cell: ({ row }: { row: any }) => {
                const med = row.original;
                const status = med.status;
                return (

                    <div className="flex justify-start items-center gap-x-2 flex-row">
                        <div className="flex flex-row items-center gap-x-2">
                            {status === 'pending' ? "กำลังดำเนินการ"
                                : status === "cancelled" ? "ยกเลิก"
                                    : ""
                            }

                            <StatusIndicator status={status} />
                        </div>
                        <div><History className="w-4 h-4 text-muted-foreground cursor-pointer" /></div>
                    </div>

                )
            },
            enableGlobalFilter: false
        },
    ]