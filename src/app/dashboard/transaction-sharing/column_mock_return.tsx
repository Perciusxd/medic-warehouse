"use client"

import { Button } from "@/components/ui/button";
import StatusIndicator from "@/components/ui/status-indicator";

export const columns = (
    handleReturnSharingClick: (med: any) => void,
    handleConfirmReceiveDelivery: (med: any) => void,
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
            const status = row.original.status;
            // //console.log('status', status)
            // //console.log('mock data med', med)
            return <div>
                {
                    status === 'to-confirm' ? (
                        <div>
                            <Button variant={"link"} className="flex gap-x-2" onClick={() => 
                                handleConfirmReceiveDelivery({
                                    ...med,
                                    displayHospitalName: med.sharingDetails.postingHospitalNameTH,
                                    displayMedicineName: med.sharingDetails.sharingMedicine.name,
                                    displayMedicineAmount: med.acceptedOffer.responseAmount,
                                    // displayHospi
                                })}>ยืนยันการรับยา<StatusIndicator status={status} /></Button>
                        </div>
                    ) : status === 'in-return' ? (
                        <div>
                            <Button variant={"link"} className="flex gap-x-2" onClick={() => handleReturnSharingClick(med)}>ต้องส่งคืน<StatusIndicator status={status} /></Button>
                        </div>
                    ) : null
                }
            </div>
        }
    },
]