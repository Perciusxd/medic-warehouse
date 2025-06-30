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
        accessorKey: "createdAt",
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันที่แจ้ง</div>,
        cell: ({ row }) => {
            const createdAt = row.getValue("createdAt")
            console.log(createdAt)
            const date = new Date(Number(createdAt)); // convert string to number, then to Date
            return <div className="text-sm font-medium text-gray-600">{format(date, "dd/MM/yyyy")}</div>
        }
    }
]