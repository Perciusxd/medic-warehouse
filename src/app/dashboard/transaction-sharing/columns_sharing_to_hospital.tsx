"use client"
import { useState } from "react"
import { SharingAsset } from "@/types/sharingMed"
import { ColumnDef } from "@tanstack/react-table"
// import { formatDate } from "@/lib/utils"
import { format, differenceInCalendarDays } from "date-fns"
import { History, Edit, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import StatusIndicator from "@/components/ui/status-indicator"
import ReturnConditionIndicator from "@/components/ui/return-condition-indicator"
import { Progress } from "@/components/ui/progress"

export const columns = (
    handleApproveClick: (med: any) => void,
    handleReConfirmClick: (med: any) => void,
    handleDeliveryClick: (med: any) => void,
    handleReturnClick: (med: any) => void,
    handleReturnConfirm: (med: any) => void,
    handleEditClick: (med: any) => void,
): ColumnDef<SharingAsset>[] => [
    {
        id: "edit",
        size: 25,
        cell: ({ row }) => {
            return <Button variant={'link'} className="flex p-0 hover:bg-indigo-300" onClick={() => handleEditClick(row.original)}><Pencil className="cursor-pointer" /></Button>
        }
    },
    {
        accessorKey: "createdAt",
        size: 60,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันที่แจ้ง</div>,
        cell: ({ row }) => {
            const createdAt = row.getValue("createdAt")
            const date = new Date(Number(createdAt)); // convert string to number, then to Date
            const isValid = !isNaN(date.getTime());
            const formattedDate = isValid ? format(date, 'dd/MM/yyyy'): "-"; // format to date only
            const timeOnly = isValid ? format(date, 'HH:mm:ss'): "-"; // format to time only
            return (<div>
                <div className="text-sm font-medium text-gray-600">{formattedDate}</div>
                <div className="text-xs text-muted-foreground">{timeOnly}</div>
            </div>);
        }
    },
    {
        id: "sharingMedicineName",
        accessorFn: (row) => row.sharingMedicine.name,
        size: 60,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ชื่อยา</div>,
        cell: ({ row }) => {
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
    {
        id: "sharingMedicineQuantity",
        accessorFn: (row) => row.sharingMedicine.quantity,
        size: 40,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ขนาด</div>,
        cell: ({ row }) => {
            const quantity = row.original.sharingMedicine.quantity;
            const unit = row.original.sharingMedicine.unit;

            return (
                <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-600">{quantity}</div>
                    <div className="text-xs text-muted-foreground">{unit}</div>
                </div>
            )
        }
    },
    {
        id: "sharingMedicineRemainingAmount",
        accessorFn: (row) => row.remainingAmount,
        size: 70,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวน (ยืนยัน)</div>,
        cell: ({ row }) => {
            const sharingAmount = row.original.sharingMedicine.sharingAmount;
            const remainingAmount = row.original.remainingAmount;
            const remainingAmountPercentage = ((sharingAmount - remainingAmount) / sharingAmount) * 100;
            let progressClass = "w-full h-4";
            if (remainingAmountPercentage === 100) {
                progressClass += " [&>div]:bg-green-500";
            } else if (remainingAmountPercentage >= 50) {
                progressClass += " [&>div]:bg-yellow-500";
            } else if (remainingAmountPercentage < 25) {
                progressClass += " [&>div]:bg-orange-500";
            }
            // return (
            //     <div className="relative w-[50px]">
            //         <div className="text-xs text-muted-foreground">{(sharingAmount - remainingAmount)} / {sharingAmount}</div>
            //         <Progress value={remainingAmountPercentage} className={progressClass} />
            //         <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-foreground">
            //             {Math.round(remainingAmountPercentage)}%
            //         </div>
            //     </div>
            // )
            return <div className="">{ sharingAmount } ({remainingAmount})</div>
        }
    },
    {
        id: "sharingMedicinePricePerUnit",
        accessorFn: (row) => row.sharingMedicine.pricePerUnit,
        size: 70,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ราคาต่อหน่วย</div>,
        cell: ({ row }) => {
            const shareAmount = row.original.sharingMedicine.sharingAmount;
            const pricePerUnit = row.original.sharingMedicine.pricePerUnit;
            const unit = row.original.sharingMedicine.unit;
            const totalPrice = shareAmount * pricePerUnit;

            return (
                <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-600">{pricePerUnit} บาท /{unit}</div>
                    <div className="text-xs text-muted-foreground">รวม {totalPrice} บาท</div>
                </div>
            )
        }
    },
    // {
    //     id: "sharingReturnTerm",
    //     accessorFn: (row) => row.sharingReturnTerm,
    //     size: 300,
    //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">รับคืนยา</div>,
    //     cell: ({ row }) => {
    //         const returnTerm = row.original.sharingReturnTerm;
    //         const receiveConditions = returnTerm.receiveConditions;

    //         const exactType = receiveConditions.exactType;
    //         const subType = receiveConditions.subType;
    //         const supportType = receiveConditions.supportType;
    //         const otherType = receiveConditions.otherType;
    //         const noReturn = receiveConditions.noReturn;
    //         console.log('receiveConditions', receiveConditions)

    //         return (
    //             <ReturnConditionIndicator status={{ exactType, subType, supportType, otherType, noReturn }} />
    //         )
    //     }
    // },
    {
        id: "responseDetailsHospitalName",
        size: 200,
        header: () => <div className="flex font-medium text-muted-foreground text-left cursor-default">
            <div className="basis-1/2">ผู้ตอบกลับ</div>
            <div className="basis-1/2">สถานะ</div>
        </div>,
        cell: ({ row }) => {
            const med = row.original;
            const responseDetails = row.original.responseDetails;
            console.log('responseDetails????????????', responseDetails)
            const maxDisplay = 3;
            const details = responseDetails.slice(0, maxDisplay);
            const hasMore = responseDetails.length > maxDisplay;
            


            
            return (
                <div className="flex flex-col">
                    {med.responseDetails.map((detail, index) => (
                        <div key={index} className="flex items-center gap-x-2 gap-y-2 h-4">
                            <div className="basis-1/2">
                                <span>{detail.respondingHospitalNameTH}:</span>
                            </div>
                            <div className="basis-1/2">
                                { detail.status === 'pending' ? (
                                    <div className="flex gap-x-2">แจ้งแบ่งปัน<StatusIndicator status={detail.status} /></div>
                                ) : detail.status === 'offered' ? (
                                    <Button variant={'link'} className="flex gap-x-2 p-0" onClick={() => handleReConfirmClick({
                                        ...med,
                                        responseId: detail.id,
                                        offeredMedicine: detail.acceptedOffer,
                                        sharingDetails: med.sharingMedicine,
                                        responseStatus: detail.status,
                                        returnTerm: detail.returnTerm,
                                    })}>แจ้งขอยืม ({detail.acceptedOffer.responseAmount})<StatusIndicator status={detail.status} /></Button>
                                ) : detail.status === 're-confirm' ? (
                                    <Button variant={'link'} className="flex gap-x-2 p-0">รอยืนยันให้ยืม ({detail.acceptedOffer.responseAmount})<StatusIndicator status={detail.status} /></Button>
                                ) : detail.status === 'to-transfer' ? (
                                    <Button variant={'link'} className="flex gap-x-2 p-0" onClick={() => handleDeliveryClick({
                                        ...med,
                                        responseId: detail.id,
                                        offeredMedicine: detail.acceptedOffer,
                                        sharingDetails: med.sharingMedicine,
                                        acceptedOffer: detail.acceptedOffer,
                                    })}>ส่งมอบ<StatusIndicator status={detail.status} /></Button>
                                ) : detail.status === 'in-return' ? (
                                    <div className="flex gap-x-2">รอรับคืน<StatusIndicator status={detail.status} /></div> 
                                ) : detail.status === 'to-confirm' ? (
                                    <div className="flex gap-x-2">รอยืนยันการรับของ<StatusIndicator status={detail.status} /></div>
                                )  : detail.status === 'to-return' ? (
                                    <div className="flex gap-x-2">รอรับคืน<StatusIndicator status={detail.status} /></div>
                                ) : detail.status === 'confirm-return' ? (
                                    <Button variant={'link'} className="flex gap-x-2 p-0" onClick={() => handleReturnConfirm({
                                        ...med,
                                        responseId: detail.id,
                                        offeredMedicine: detail.acceptedOffer,
                                        sharingDetails: med.sharingMedicine,
                                        responseStatus: detail.status,
                                    })}>โปรดยืนยันการคืนยา<StatusIndicator status={detail.status} /></Button>
                                ) : detail.status === 'returned' ? (
                                    <div className="flex gap-x-2">เสร็จสิ้น<StatusIndicator status={detail.status} /></div>
                                ) : detail.status === 'cancelled' ? (
                                    <div className="flex gap-x-2">ยกเลิก<StatusIndicator status={detail.status} /></div>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            )
        }
    },
    // {
    //     id: "responseIds",
    //     accessorFn: (row) => row.responseIds,
    //     size: 100,
    //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">รหัสรายการ</div>,
    //     cell: ({ getValue }) => {
    //         const ids = getValue() as string[];
    //         const maxDisplay = 3;
    //         const displayed = ids.slice(0, maxDisplay);
    //         const extra = ids.length - maxDisplay;

    //         return (
    //             <div className="flex flex-col gap-2">
    //                 {displayed.map((id, idx) => (
    //                     <span key={idx} className="px-2 py-1 bg-gray-200 rounded">
    //                         {id}
    //                     </span>
    //                 ))}
    //                 {extra > 0 && (
    //                     <span className="text-xs text-gray-500">+{extra} more</span>
    //                 )}
    //             </div>
    //         );
    //     }
    // },
]