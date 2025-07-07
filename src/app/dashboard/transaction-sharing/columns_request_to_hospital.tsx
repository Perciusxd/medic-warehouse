"use client"
import { useState } from "react"
import { ResponseAsset } from "@/types/responseMed"
import { ColumnDef } from "@tanstack/react-table"
// import { formatDate } from "@/lib/utils"
import { format, differenceInCalendarDays } from "date-fns"
import { History } from "lucide-react"

import { Button } from "@/components/ui/button"
import StatusIndicator from "@/components/ui/status-indicator"

export const columns = (handleStatusClick: (med: ResponseAsset, status: string) => void): ColumnDef<ResponseAsset>[] => [
    {
        accessorKey: "updatedAt",
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันที่แจ้ง</div>,
        cell: ({ row }) => {
            const createdAt = row.getValue("updatedAt")
            const date = new Date(Number(createdAt)); // convert string to number, then to Date
            return <div className="text-sm font-medium text-gray-600">{format(date, "dd/MM/yyyy")}</div>
        }
    },
    {
        id: "medicineName",
        accessorFn: (row) => row.requestDetails.requestMedicine.name,
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">รายการ</div>,
        cell: ({ getValue }) => {
            return <div className="text-sm font-medium text-gray-600">{getValue() as string}</div>
        }
    },
    {
        id: "quantity",
        accessorFn: (row) => row.requestDetails.requestMedicine.quantity,
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวน</div>,
        cell: ({ getValue }) => {
            return <div className="text-sm font-medium text-gray-600">{getValue() as string}</div>
        }
    },
    {
        id: "unit",
        accessorFn: (row) => row.requestDetails.requestMedicine.unit,
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">หน่วย</div>,
        cell: ({ getValue }) => {
            return <div className="text-sm font-medium text-gray-600">{getValue() as string}</div>
        }
    },
    {
        id: "requestAmount",
        accessorFn: (row) => row.requestDetails.requestMedicine.requestAmount,
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวนที่ขอ</div>,
        cell: ({ getValue }) => {
            return <div className="text-sm font-medium text-gray-600">{getValue() as string}</div>
        }
    },
    {
        id: "postingHospitalNameEN",
        accessorFn: (row) => row.requestDetails.postingHospitalNameEN,
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ผู้ขอรับ</div>,
        cell: ({ getValue }) => {
            return <div className="text-sm font-medium text-gray-600">{getValue() as string}</div>
        }
    },
    {
        id: "status",
        accessorFn: (row) => row.status,
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">สถานะ</div>,
        cell: ({ getValue, row }) => {
            const status = getValue() as string
            return <div className="text-sm font-medium text-gray-600">{
                status === "offered" ? "รอยืนยัน" : status === "to-transfer" ? (
                    <Button variant={"link"} className="p-0" onClick={() => handleStatusClick(row.original, "to-return")}>รอส่งมอบ<StatusIndicator status={status} /></Button>
                ) : status === "to-return" ? (
                    <Button variant={"link"} className="p-0" onClick={() => handleStatusClick(row.original, "returned")}>รอส่งคืน<StatusIndicator status={status} /></Button>
                ) : status === "in-return" ? "รอยืนยันการได้รับคืน" : status === "returned" ? "ได้รับคืนแล้ว" : status === "cancelled" ? "ยกเลิก" : ""
            }</div>
        }
    },
    {
        id: "action",
        size: 10,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ประวัติ</div>,
        cell: ({  }) => {
            return <div className="text-sm font-medium text-gray-600">
                <History className="w-4 h-4" />
            </div>
        }
    }
]