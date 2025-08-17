"use client"
import { useState } from "react"
import { ResponseAsset } from "@/types/responseMed"
import { ColumnDef } from "@tanstack/react-table"
// import { formatDate } from "@/lib/utils"
import { format, differenceInCalendarDays } from "date-fns"
import { History ,SquareX, SquareCheck} from "lucide-react"

import { Button } from "@/components/ui/button"
import StatusIndicator from "@/components/ui/status-indicator"

export const columns = (
    handleStatusClick: (med: ResponseAsset, status: string) => void,
    handleconfirmDeliveryFromRequests : (med: any) => void,
    handleReturnConfirm : (med: any) => void,
    ): ColumnDef<ResponseAsset>[] => [
    {
        accessorKey: "createdAt",
        size: 80,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันที่แจ้ง</div>,
        cell: ({ row }) => {
            const createdAt = row.original.requestDetails.updatedAt
            console.log("row response", row.original)
            const date = new Date(Number(createdAt)); // convert string to number, then to Date
            return(
            <div>
                <div className="text-md font-medium">{format(new Date(Number(date)), 'dd/MM/') + (new Date(Number(date)).getFullYear() + 543)}</div>
                <div className="text-xs text-muted-foreground">{format(date, 'HH:mm:ss')}</div>
            </div> 
            )
        }
    },
    {
        id: "medicineName",
        accessorFn: (row) => row.requestDetails.requestMedicine.name,
        size: 200,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default"> ชื่อยา/ชื่อการค้า</div>,
        cell: ({ getValue }) => {
            const name = getValue() as string
            const trademark = getValue() as string
            return (
            <div>
                <div className="text-md font-medium">{name}</div>
                <div className="text-xs text-muted-foreground">{trademark}</div>
                
            </div>
        )
        }
    },
    {
        id: "quantity",
        accessorFn: (row) => row.requestDetails.requestMedicine.quantity,
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ขนาด/หน่วย</div>,
        cell: ({ getValue }) => {
            const quantity = getValue() as number
            const unit = getValue() as string
            return (
            <div>
                <div className="text-md font-medium">{quantity}</div>
                <div className="text-xs text-muted-foreground">{unit}</div>
            </div>
            )
            
        }
    },
    {
        id: "requestAmount",
        accessorFn: (row) => row.requestDetails.requestMedicine.requestAmount,
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวน(คงเหลือ)</div>,
        cell: ({ row }) => {
            const requestAmount = row.original.requestDetails.requestMedicine.requestAmount as number
            const pricePerUnit = row.original.requestDetails.requestMedicine.pricePerUnit as number
            const offerAmount = row.original.offeredMedicine.offerAmount as number
            console.log("offerAmount", row)
            const totalAmount = pricePerUnit - offerAmount
            const totalPrice = requestAmount * pricePerUnit
            
           return (
            <div>
                <div className="text-md font-medium">{requestAmount.toLocaleString()} ({totalAmount.toLocaleString()}) </div>
                <div className="text-xs text-muted-foreground">รวม {totalPrice.toLocaleString()} บาท</div>
            </div>
            )
        }
    },
    {
        id: "updatedAt",
        accessorFn: (row) => row.updatedAt,
        size: 100,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันที่อัพเดต</div>,
        cell: ({ getValue }) => {
            const updatedAt = getValue() as string || "0";
            const date = new Date(Number(updatedAt)); // convert string to number, then to Date
            return (
                <div >
                    <div className="text-md font-medium"> {format(new Date(Number(date)), 'dd/MM/') + (new Date(Number(date)).getFullYear() + 543)}</div>
                    <div className="text-xs text-muted-foreground"> {format(date, " HH:mm:ss")}</div>
                    
                </div>
            )
        }
    },
     {
        accessorKey: "returnConditions",
        size: 280,
        header: () => <div className="font-medium text-muted-foreground text-center cursor-default">
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
                    </div>,
        cell: ({ row }) => {
            const med = row.original.requestDetails.requestTerm.receiveConditions;
            const exactType = med.condition === "exactType" ? ( <div className="text-md text-red-600 flex flex-row items-center"><SquareX className="w-5 h-5"/>  ยืมรายการทดแทนไม่ได้ </div>): ( <div className="text-md text-green-600 flex flex-row items-center"><SquareX className="w-5 h-5"/>  ยืมรายการทดแทนได้ </div>);
            const supportType = med.supportType === true ? ( <div className="text-md text-green-600 flex flex-row items-center"><SquareCheck className="w-5 h-5"/>  ขอสนับสนุน </div>): ( <div  className="text-md text-red-600 flex flex-row items-center"><SquareX className="w-5 h-5"/>  ขอสนับสนุน </div>);
            return(
            <div className="flex flex-row justify-around items-center">
                <div className="text-md font-medium flex basic-1/2">
                     {exactType}
                </div>
                 <div className="text-md font-medium flex basic-1/2">
                     {supportType}
                </div>
            </div> 
            )
        }
    },
    // {
    //     id: "postingHospitalNameTH",
    //     accessorFn: (row) => row.requestDetails.postingHospitalNameTH,
    //     size: 100,
    //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ผู้ขอรับ</div>,
    //     cell: ({ getValue }) => {
    //         return <div className="text-md font-medium text-gray-600">{getValue() as string}</div>
    //     }
    // },
    {
        id: "status",
        accessorFn: (row) => row.status,
        size: 300 ,
        header: () => <div className="flex font-medium text-muted-foreground text-left cursor-default">
                <div className="basis-1/2">ผู้ตอบกลับ</div>
                <div className="basis-1/2">สถานะ</div>
            </div>,
        cell: ({ getValue, row }) => {
            const status = getValue() as string
            const postingHospitalNameTH = row.original.requestDetails.postingHospitalNameTH || "ไม่ระบุ"
            const med = row.original
            return (
            <div className="flex flex-row  items-center"> 
                <div className="basis-1/2">
                    <span>{postingHospitalNameTH}:</span>
                </div>
                <div className="text-md font-medium text-gray-600 basis-1/2">{
                    
                        status === "offered" ? <div className="flex gap-x-2">รอยืนยัน<StatusIndicator status={status} /></div>  
                        : status === "to-transfer" ? (
                            <Button variant={"link"} className="flex gap-x-2" onClick={() => handleconfirmDeliveryFromRequests({...med,
                                            displayHospitalName: med.requestDetails.postingHospitalNameTH,
                                            displayMedicineName: med.requestDetails.requestMedicine.name,
                                            displayMedicineAmount: med.offeredMedicine.offerAmount,
                                        })}>รอส่งมอบ<StatusIndicator status={status} /></Button>
                    )   : status === "to-return" ? (
                            <div className="flex gap-x-2">รอยืนยันรับยา<StatusIndicator status={status} /></div>
                    )   : status === "confirm-return" ? (
                            <Button variant={"link"} className="flex gap-x-2" onClick={() => handleReturnConfirm({...med,
                                            displayHospitalName: med.requestDetails.postingHospitalNameTH,
                                            displayMedicineName: med.returnMedicine?.returnMedicine?.name,
                                            displayMedicineAmount: med.returnMedicine?.returnMedicine?.returnAmount,})} >โปรดยืนยันการคืนยา<StatusIndicator status={status} /></Button> 
                            ///ซิ้งยืนยีนดารคืนยาอีกรอบ
                    )   : status === "in-return" ? <div className="flex gap-x-2">รอรับคืนยา<StatusIndicator status={status} /></div> 
                        : status === "returned" ? <div className="flex gap-x-2 ">ได้รับคืนแล้ว<StatusIndicator status={status} /></div> 
                        : status === "cancelled" ? <div className="flex gap-x-2 ">ยกเลิก<StatusIndicator status={status} /></div> 
                        : ""
                }</div>
            </div>
            )
        }
    },
    {
        id: "history",
        size: 150,
        header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ประวัติ</div>,
        cell: ({ row }) => {
            const status = row.original.requestDetails.status
            return <div className="text-md font-medium text-gray-600 flex flex-row items-center gap-x-1">
                <div className="flex flex-row gap-x-1">
                    {status === 'pending' ? "กำลังดำเนินการ"
                            : status === "cancelled" ? "ยกเลิก"
                            : ""
                        } <StatusIndicator status={status} />
                </div>
                <History className="w-4 h-4" /> 
            </div>
        }
    }
]