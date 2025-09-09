"use client"
import { useEffect, useState } from "react"
import { ResponseAsset } from "@/types/responseMed"
import { ColumnDef } from "@tanstack/react-table"
// import { formatDate } from "@/lib/utils"
import { format } from "date-fns"
import { useHospital } from "@/context/HospitalContext";
import { Button } from "@/components/ui/button"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
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
import clsx from "clsx";
import { ArrowUpDown, Pencil, MoreHorizontal, Check, Trash2, Copy, CheckCircle2Icon, LoaderIcon, ShieldAlertIcon, Truck, Clock, TicketCheck, BookDown, BookUp, SquareX, SquareCheck, History } from "lucide-react"
import CreateResponseDialog from "@/components/dialogs/create-response-dialog"
import StatusIndicator, { getStatusColor, getTextStatusColor } from "@/components/ui/status-indicator"
import ReturnConditionIndicator from "@/components/ui/return-condition-indicator"
import ImageHoverPreview from "@/components/ui/image-hover-preview"
export const columns = (
    handleApproveClick: (med: any) => void,
    handleDeliveryClick: (med: any) => void,
    handleReturnClick: (med: any) => void,
    handleReConfirmClick: (med: any) => void,
    handleEditClick: (med: any) => void,
    handleconfirReceiveDelivery: (med: any) => void,
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

                        {/* <img
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
                const formattedDate = isValid ? format(new Date(Number(date)), 'dd/MM/') + (new Date(Number(date)).getFullYear() + 543) : "-"; // format to date only
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
                        รายการยา/ชื่อการค้า
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
                const offeredAmount = med.remainingAmount;
                const remainingAmount = requestAmount - offeredAmount
                const pricePerUnit = med.requestMedicine.pricePerUnit;
                const totalPrice = requestAmount * pricePerUnit;
                return (
                    <div className="flex flex-col">
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
                                ยืมจากผู้ผลิตรายนี้
                            </div>
                            <div className="text-center basis-1/3">
                                ยืมจากผู้ผลิตรายอื่น
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
                    conditionDiv = <div className="flex text-red-600 items-center gap-x-1 "> <SquareX className="w-5 h-5" />ยืมรายการทดแทนไม่ได้</div>
                } else {
                    conditionDiv = <div className="flex text-green-600 items-center gap-x-1"> <SquareCheck className="w-5 h-5" />ยืมรายการทดแทนได้</div>;
                }


                if (supportType === true) {
                    supportTypetDiv = <div className="flex text-green-600 items-center gap-x-1"> <SquareCheck className="w-5 h-5" />ขอสนับสนุน</div>
                } else {
                    supportTypetDiv = <div className="flex text-red-600 items-center gap-x-1"> <SquareX className="w-5 h-5" />ขอสนับสนุน</div>;
                }

                return (

                    <div className="flex flex-row gap-x-2 text-center font-medium justify-between">

                         <div className="text-left basis-1/2">
                        <div className="flex flex-row justify-center">
                           {condition === 'exactType' ? <div className="flex text-green-600 items-center"> <SquareCheck /> </div> : <div className="flex text-red-600 items-center"> <SquareX /></div>}
                        </div>
                    </div>

                    <div className="text-left basis-1/2">
                        <div className="flex flex-row justify-center">
                            {condition === 'subType' ? <div className="flex text-green-600 items-center"> <SquareCheck /> </div> : <div className="flex text-red-600 items-center"> <SquareX /></div>}
                        </div>
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
                    <div className="font-medium text-muted-foreground  cursor-default text-start  min-w-[180px] ">
                        สถานะ(จำนวนยาที่ได้ยืม)
                    </div>
                </div>
            ),
            cell: ({ row }) => {
                const med = row.original;
                const maxDisplay = 3;
                const details = med.responseDetails.slice(0, maxDisplay);
                const hasMore = med.responseDetails.length > maxDisplay;
                //console.log('med', med)
                //console.log("med ssds" ,)
                // const [dialogOpen, setDialogOpen] = useState(false);
                // const handleConfirm = () => {
                //     setDialogOpen(false);
                // }

                return (
                    <div className="" >
                        {med.responseDetails.map((detail: any, index: any) => (
                            <div key={index} className="flex flex-row  items-center  justify-between mt-1">
                                <div className="text-md font-medium  flex justify-start min-w-[120px]">
                                    <span>
                                        {detail.updatedAt && !isNaN(Number(detail.updatedAt))
                                            ? format(new Date(Number(detail.updatedAt)), 'dd/MM/') + (new Date(Number(detail.updatedAt)).getFullYear() + 543)
                                            : "-"}
                                    </span>
                                </div>
                                <div className="basis-1/2 text-wrap w-[120px] truncate overflow-hidden text-ellipsis whitespace-nowrap">
                                    <span>{detail.respondingHospitalNameTH}</span>
                                </div>
                                <div className="text-md font-medium items-center text-left  justify-start min-w-[180px] ">
                                    <div className={"flex items-center gap-x-1 basis-1/2  justify-start "}>
                                        {detail.status === 'offered' ? (
                                            <HoverCard>
                                                <HoverCardTrigger >
                                                    <Button
                                                        variant={"text_status"}
                                                        size={"text_status"}
                                                        className={clsx(
                                                            // "flex content-center h-6 font-bold text-xs",
                                                            getStatusColor(detail.status),
                                                            getTextStatusColor(detail.status)
                                                        )}
                                                        onClick={() => handleApproveClick({
                                                            ...med,
                                                            responseId: detail.id,
                                                            offeredMedicine: detail.offeredMedicine,
                                                            requestDetails: med.requestMedicine,
                                                            responseDetail: detail,
                                                        })}>
                                                        ได้รับการยืนยัน
                                                        <div className=" text-xs">{detail.offeredMedicine ? "(" + (detail.offeredMedicine.offerAmount) + ")" : "(-)"}</div>
                                                         <SquareCheck className="h-4 w-4" />
                                                    </Button>
                                                </HoverCardTrigger>
                                                <HoverCardContent>
                                                    <div className="text-xs text-red-700 flex justify-center">โปรดยืนยันเมื่อได้รับยาแล้ว</div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        )
                                            : detail.status === 'pending'
                                                ? (<Badge
                                                    variant={'text_status'}
                                                    className={clsx(
                                                        // "flex content-center h-6 font-bold",
                                                        getStatusColor(detail.status),
                                                        getTextStatusColor(detail.status)
                                                    )}
                                                    >
                                                    รอการยืนยันให้ยืม
                                                    <div className=" text-xs">{detail.offeredMedicine ? "(" + (detail.offeredMedicine.offerAmount) + ")" : "(-)"}</div>
                                                </Badge>)
                                                : detail.status === 'to-transfer'
                                                    ? (<Badge
                                                        variant={'text_status'}
                                                        className={clsx(
                                                            // "flex content-center h-6 font-bold",
                                                            getStatusColor(detail.status),
                                                            getTextStatusColor(detail.status)
                                                        )}
                                                    >
                                                        รอรับมอบ
                                                        <div className=" text-xs">{detail.offeredMedicine ? "(" + (detail.offeredMedicine.offerAmount) + ")" : "(-)"}</div>
                                                        {/* <StatusIndicator status={detail.status} /> */}
                                                    </Badge>)
                                                    : detail.status === 'to-return'
                                                        ? (
                                                            <HoverCard>
                                                                <HoverCardTrigger >
                                                                    <Button
                                                                        variant={"text_status"}
                                                                        size={"text_status"}
                                                                        className={clsx(
                                                                            // "flex content-center h-6 font-bold text-xs",
                                                                            getStatusColor(detail.status),
                                                                            getTextStatusColor(detail.status)
                                                                        )}
                                                                        onClick={() => handleconfirReceiveDelivery({
                                                                            ...med,
                                                                            displayHospitalName: detail.respondingHospitalNameTH,
                                                                            displayMedicineName: detail.offeredMedicine.name,
                                                                            displayMedicineAmount: detail.offeredMedicine.offerAmount,//dalog ต้องทำใหม่ให้อัพเดท สเตตัส ให้ถูก
                                                                            responseId: detail.id,
                                                                            offeredMedicine: detail.offeredMedicine,
                                                                            requestDetails: med.requestMedicine,
                                                                        })}>
                                                                        ยืนยันการรับยา
                                                                        <div className=" text-xs">{detail.offeredMedicine ? "(" + (detail.offeredMedicine.offerAmount) + ")" : "(-)"}</div>
                                                                        <SquareCheck className="h-4 w-4" />
                                                                    </Button>
                                                                </HoverCardTrigger>
                                                                <HoverCardContent>
                                                                    <div className="text-xs text-red-700 flex justify-center">โปรดยืนยันเมื่อได้รับยาแล้ว</div>
                                                                </HoverCardContent>
                                                            </HoverCard>
                                                        )
                                                        : detail.status === 'in-return'
                                                            ? (
                                                                <HoverCard>
                                                                    <HoverCardTrigger >
                                                                        <Button
                                                                            variant={"text_status"}
                                                                            size={"text_status"}
                                                                            className={clsx(
                                                                                // "flex content-center h-6 font-bold text-xs",
                                                                                getStatusColor(detail.status),
                                                                                getTextStatusColor(detail.status)
                                                                            )}

                                                                            onClick={() => handleReturnClick(
                                                                                {
                                                                                    ...med,
                                                                                    responseId: detail.id,
                                                                                    offeredMedicine: detail.offeredMedicine,
                                                                                    requestDetails: med.requestMedicine,
                                                                                    responseDetail: detail,
                                                                                })
                                                                            }
                                                                        >
                                                                            ส่งคืนยา
                                                                            <div className=" text-xs">{detail.offeredMedicine ? "(" + (detail.offeredMedicine.offerAmount) + ")" : "(-)"}</div>
                                                                            <SquareCheck className="h-4 w-4" />
                                                                        </Button>
                                                                    </HoverCardTrigger>
                                                                    {/* <HoverCardContent>
                                                                        <div className="text-xs text-red-700 flex justify-center">โปรดกรอกข้อมูลให้ครบถ้วน</div>
                                                                    </HoverCardContent> */}
                                                                </HoverCard>
                                                            )
                                                            : detail.status === 'confirm-return'
                                                                ? (<Badge
                                                                    variant={'text_status'}
                                                                    className={clsx(
                                                                        // "flex content-center h-6 font-bold",
                                                                        getStatusColor(detail.status),
                                                                        getTextStatusColor(detail.status)
                                                                    )}
                                                                >
                                                                    รอยืนยันการได้รับคืน
                                                                    <div className=" text-xs">{detail.offeredMedicine ? "(" + (detail.offeredMedicine.offerAmount) + ")" : "(-)"}</div>
                                                                </Badge>)
                                                                : detail.status === 'returned'
                                                                    ? (<Badge
                                                                        variant={'text_status'}
                                                                        className={clsx(
                                                                            // "flex content-center h-6 font-bold",
                                                                            getStatusColor(detail.status),
                                                                            getTextStatusColor(detail.status)
                                                                        )}
                                                                    >
                                                                        เสร็จสิ้น
                                                                    </Badge>)
                                                                    : detail.status === 'cancelled'
                                                                        ? (<Badge
                                                                        variant={'text_status'}
                                                                        className={clsx(
                                                                            // "flex content-center h-6 font-bold",
                                                                            getStatusColor(detail.status),
                                                                            getTextStatusColor(detail.status)
                                                                        )}
                                                                    >
                                                                            ยกเลิก
                                                                            {/* <div className=" text-xs">{detail.offeredMedicine ? "(" + (detail.offeredMedicine.offerAmount) + ")" : "(-)"}</div> */}
                                                                        </Badge>)
                                                                        : null
                                        }
                                        {/* <div className=" text-xs">{detail.offeredMedicine ? "("+(detail.offeredMedicine.offerAmount)+")" : "(-)"}</div> */}
                                    </div>

                                </div>
                            </div>
                        ))}
                        {hasMore && <Button variant={'link'} className="">เพิ่มเติม...</Button>}
                    </div>
                );
            },
        },
        // {
        //     accessorKey: "history",
        //     size: 150,
        //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">สถานะ</div>,
        //     cell: ({ row }: { row: any }) => {
        //         const med = row.original;
        //         const status = med.status;
        //         return (

        //             <div className="flex justify-start items-center gap-x-2 flex-row">
        //                 <div className="flex flex-row items-center gap-x-2">
        //                     {status === 'pending' ? "กำลังดำเนินการ"
        //                         : status === "cancelled" ? "ยกเลิก"
        //                             : ""
        //                     }

        //                     <StatusIndicator status={status} />
        //                 </div>
        //                 <div><History className="w-4 h-4 text-muted-foreground cursor-pointer" /></div>
        //             </div>

        //         )
        //     },
        //     enableGlobalFilter: false
        // },
    ]