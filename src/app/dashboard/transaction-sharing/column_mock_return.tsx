"use client"

import { Button } from "@/components/ui/button";
import StatusIndicator from "@/components/ui/status-indicator";

export const columns = (
    handleReturnClick: (med: any) => void,
) => [
    {
        accessorKey: "createdAt",
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันที่แจ้ง</div>,
    },
    {
        accessorKey: "status",
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">สถานะ</div>,
        cell: ({ row }: { row: any }) => {
            const med = row.original;
            console.log('med', med)
            const status = row.original.status;
            return <div>
                <StatusIndicator status={status} />
                <div className="text-sm font-medium text-gray-600">{status}</div>
                <Button variant={"link"} className="flex gap-x-2" onClick={() => handleReturnClick(med)}>รับคืน<StatusIndicator status={status} /></Button>
            </div>
        }
    },
]