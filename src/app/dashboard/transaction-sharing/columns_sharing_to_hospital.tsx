"use client"
import { useState } from "react"
import { SharingAsset } from "@/types/sharingMed"
import { ColumnDef } from "@tanstack/react-table"
// import { formatDate } from "@/lib/utils"
import { format, differenceInCalendarDays } from "date-fns"
import { History } from "lucide-react"

import { Button } from "@/components/ui/button"
import StatusIndicator from "@/components/ui/status-indicator"
import ReturnConditionIndicator from "@/components/ui/return-condition-indicator"

export const columns = (
    handleApproveClick: (med: any) => void,
    handleReConfirmClick: (med: any) => void,
    handleDeliveryClick: (med: any) => void,
): ColumnDef<SharingAsset>[] => [
    {
        accessorKey: "createdAt",
        size: 100,
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
        size: 100,
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
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวน</div>,
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
        id: "sharingMedicinePricePerUnit",
        accessorFn: (row) => row.sharingMedicine.pricePerUnit,
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ราคาต่อหน่วย</div>,
        cell: ({ row }) => {
            const pricePerUnit = row.original.sharingMedicine.pricePerUnit;

            return (
                <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-600">{pricePerUnit} บาท</div>
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
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ผู้ตอบกลับ</div>,
        cell: ({ row }) => {
            const med = row.original;
            const responseDetails = row.original.responseDetails;
            const maxDisplay = 3;
            const details = responseDetails.slice(0, maxDisplay);
            const hasMore = responseDetails.length > maxDisplay;
            console.log('med ====>>', med)

            return (
                <div className="flex flex-col">
                    {med.responseDetails.map((detail, index) => (
                        <div key={index} className="flex items-center gap-x-2 h-4">
                            <div className="basis-1/2">
                                <span>{detail.respondingHospitalNameTH}:</span>
                            </div>
                            <div className="basis-1/2">
                                { detail.status === 'pending' ? (
                                    <Button variant={'link'} className="flex gap-x-2">แจ้งแบ่งปัน<StatusIndicator status={detail.status} /></Button>
                                ) : detail.status === 'offered' ? (
                                    <Button variant={'link'} className="flex gap-x-2" onClick={() => handleReConfirmClick({
                                        ...med,
                                        responseId: detail.id,
                                        offeredMedicine: detail.acceptedOffer,
                                        sharingDetails: med.sharingMedicine,
                                    })}>แจ้งขอยืม ({detail.acceptedOffer.responseAmount})<StatusIndicator status={detail.status} /></Button>
                                ) : detail.status === 're-confirm' ? (
                                    <Button variant={'link'} className="flex gap-x-2">รอยืนยันให้ยืม ({detail.acceptedOffer.responseAmount})<StatusIndicator status={detail.status} /></Button>
                                ) : detail.status === 'to-transfer' ? (
                                    <Button variant={'link'} className="flex gap-x-2" onClick={() => handleDeliveryClick({
                                        ...med,
                                        responseId: detail.id,
                                        offeredMedicine: detail.acceptedOffer,
                                        sharingDetails: med.sharingMedicine,
                                    })}>รอส่งมอบ<StatusIndicator status={detail.status} /></Button>
                                ) : detail.status === 'in-return' ? (
                                    <Button variant={'link'} className="flex gap-x-2">รอรับคืน<StatusIndicator status={detail.status} /></Button> 
                                ) : detail.status === 'to-return' ? (
                                    <Button variant={'link'} className="flex gap-x-2">รอรับคืน<StatusIndicator status={detail.status} /></Button>
                                ) : detail.status === 'returned' ? (
                                    <Button variant={'link'} className="flex gap-x-2">เสร็จสิ้น<StatusIndicator status={detail.status} /></Button>
                                ) : detail.status === 'cancelled' ? (
                                    <Button variant={'link'} className="flex gap-x-2">ยกเลิก<StatusIndicator status={detail.status} /></Button>
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