"use client"
import { useState } from "react"
import { ResponseAsset } from "@/types/responseMed"
import { ColumnDef } from "@tanstack/react-table"
// import { formatDate } from "@/lib/utils"
import { format, differenceInCalendarDays } from "date-fns"
import { History, SquareX, SquareCheck } from "lucide-react"
import clsx from "clsx";
import { Button } from "@/components/ui/button"
import StatusIndicator, { getStatusColor, getTextStatusColor } from "@/components/ui/status-indicator"
import { Badge } from "@/components/ui/badge"
import { text } from "stream/consumers"
import textHover from "@/components/ui/text_hover"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"

export const columns = (
    handleStatusClick: (med: ResponseAsset, status: string) => void,
    handleconfirmDeliveryFromRequests: (med: any) => void,
    handleReturnConfirm: (med: any) => void,
): ColumnDef<ResponseAsset>[] => [
        {
            accessorKey: "createdAt",
            size: 80,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันที่แจ้ง</div>,
            cell: ({ row }) => {
                const createdAt = row.original.requestDetails.updatedAt
                // console.log("row response", row.original)
                const date = new Date(Number(createdAt)); // convert string to number, then to Date
                return (
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
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default"> รายการยา/ชื่อการค้า</div>,
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
            id: "returnAmount",
            accessorFn: (row) => {
                const rm: any = (row as any).returnMedicine;
                if (Array.isArray(rm)) {
                    return rm.reduce((sum: number, item: any) => {
                        const nested = item && item.returnMedicine ? item.returnMedicine : item;
                        const amt = Number(nested?.returnAmount ?? 0);
                        return sum + (isNaN(amt) ? 0 : amt);
                    }, 0);
                }
                return (rm?.returnMedicine?.returnAmount ?? 0);
            },
            size: 100,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวนที่ตอบกลับ (คืนแล้ว/ต้องคืน)</div>,
            cell: ({ row }) => {
                const rm: any = row.original.returnMedicine as any;
                const returnedTotal = Array.isArray(rm)
                    ? rm.reduce((sum: number, item: any) => {
                        const nested = item && item.returnMedicine ? item.returnMedicine : item;
                        const amt = Number(nested?.returnAmount ?? 0);
                        return sum + (isNaN(amt) ? 0 : amt);
                    }, 0)
                    : (rm?.returnMedicine?.returnAmount ?? 0);
                const offered = Number(row.original.offeredMedicine?.offerAmount ?? 0);

                return (
                    <div>
                        <div className="text-md font-medium">{Number(returnedTotal).toLocaleString()} / {Number(offered).toLocaleString()}</div>
                    </div>
                )
            }
        },
        // {
        //     id: "requestAmount",
        //     accessorFn: (row) => row.requestDetails.requestMedicine.requestAmount,
        //     size: 100,
        //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวน(คงเหลือ)</div>,
        //     cell: ({ row }) => {
        //         console.log(row.original)
        //         const requestAmount = row.original.requestDetails.requestMedicine.requestAmount as number
        //         const pricePerUnit = row.original.requestDetails.requestMedicine.pricePerUnit as number
        //         const offerAmount = row.original.offeredMedicine.offerAmount as number
        //         const totalAmount = pricePerUnit - offerAmount
        //         // console.log("totalAmount", totalAmount)
        //         const totalPrice = requestAmount * pricePerUnit

        //         return (
        //             <div>
        //                 <div className="text-md font-medium">{requestAmount.toLocaleString()} ({offerAmount.toLocaleString()}) </div>
        //                 <div className="text-xs text-muted-foreground">รวม {totalPrice.toLocaleString()} บาท</div>
        //             </div>
        //         )
        //     }
        // },
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
                const exactType = med.condition === "exactType" ? (<div className="text-md text-red-600 flex flex-row items-center"><SquareX className="w-5 h-5" />  ยืมรายการทดแทนไม่ได้ </div>) : (<div className="text-md text-green-600 flex flex-row items-center"><SquareX className="w-5 h-5" />  ยืมรายการทดแทนได้ </div>);
                const supportType = med.supportType === true ? (<div className="text-md text-green-600 flex flex-row items-center"><SquareCheck className="w-5 h-5" />  ขอสนับสนุน </div>) : (<div className="text-md text-red-600 flex flex-row items-center"><SquareX className="w-5 h-5" />  ขอสนับสนุน </div>);
                return (
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
            size: 300,
            header: () => <div className="flex font-medium text-muted-foreground text-left cursor-default">
                <div className="basis-1/2">ผู้ตอบกลับ</div>
                <div className="basis-1/2">สถานะ</div>
            </div>,
            cell: ({ getValue, row }) => {
                const status = getValue() as string
                const postingHospitalNameTH = row.original.requestDetails.postingHospitalNameTH || "ไม่ระบุ"
                const med = row.original
                const offerAmount = row.original.offeredMedicine.offerAmount as number
                return (
                    <div className="flex flex-row  items-center">
                        <div className="basis-1/2">
                            <span>{postingHospitalNameTH}:</span>
                        </div>
                        <div className={"flex items-center basis-1/2  justify-start"}>{

                            status === "offered" ?
                                <Badge
                                    variant={"text_status"}

                                    className={clsx(
                                        // "flex content-center h-6 font-bold justify-center",
                                        getStatusColor(status),
                                        getTextStatusColor(status)
                                    )}>
                                    รอยืนยัน
                                    {/* <StatusIndicator status={status}/> */}
                                </Badge>
                                : status === "to-transfer" ? (
                                    <div>
                                        <HoverCard>
                                            <HoverCardTrigger >
                                                <Button
                                                    variant={"text_status"}
                                                    size={"text_status"}
                                                    className={clsx(
                                                        // "flex content-center h-6 font-bold justify-center",
                                                        getStatusColor(status),
                                                        getTextStatusColor(status)
                                                    )}
                                                    onClick={() => handleconfirmDeliveryFromRequests({
                                                        ...med,
                                                        displayHospitalName: med.requestDetails.postingHospitalNameTH,
                                                        displayMedicineName: med.requestDetails.requestMedicine.name,
                                                        displayMedicineAmount: med.offeredMedicine.offerAmount,
                                                    })}>
                                                    รอส่งมอบ
                                                    {/* <textHover previewUrl={"อัพเดทข้อมูลเมื่อส่งมอบยาแล้วเท่านั้น"} /> */}
                                                    <SquareCheck className="h-4 w-4" />
                                                </Button>
                                            </HoverCardTrigger>
                                            <HoverCardContent>
                                                <div className="text-xs text-red-700 flex justify-center">โปรดอัพเดทหลังจากส่งมอบยาเสร็จสิ้น</div>
                                            </HoverCardContent>
                                        </HoverCard>
                                        {/* <div>
                                        <div className="text-xs text-muted-foreground">โปรดคลิกเพื่อยืนยันการส่งมอบยา</div>
                                        </div> */}
                                    </div>
                                ) : status === "to-return" ? (
                                    <Badge
                                        variant={"text_status"}

                                        className={clsx(
                                            // "flex content-center h-6 font-bold justify-center",
                                            getStatusColor(status),
                                            getTextStatusColor(status)
                                        )}
                                    >
                                        รอยืนยันรับยา
                                        {/* <StatusIndicator status={status} /> */}
                                    </Badge>
                                ) : status === "confirm-return" ? (
                                    <HoverCard>
                                        <HoverCardTrigger >
                                            <Button
                                                variant={"text_status"}
                                                    size={"text_status"}
                                                    className={clsx(
                                                        // "flex content-center h-6 font-bold justify-center",
                                                        getStatusColor(status),
                                                        getTextStatusColor(status)
                                                    )}
                                                onClick={() => handleReturnConfirm({
                                                    ...med,
                                                    displayHospitalName: med.requestDetails.postingHospitalNameTH,
                                                    displayMedicineName: (() => {
                                                        const r: any = med.returnMedicine as any;
                                                        const last = Array.isArray(r) ? r[r.length - 1] : r;
                                                        const nested = last && last.returnMedicine ? last.returnMedicine : last;
                                                        return nested?.name;
                                                    })(),
                                                    displayMedicineAmount: (() => {
                                                        const r: any = med.returnMedicine as any;
                                                        const last = Array.isArray(r) ? r[r.length - 1] : r;
                                                        const nested = last && last.returnMedicine ? last.returnMedicine : last;
                                                        return nested?.returnAmount;
                                                    })(),
                                                })}
                                            >
                                                {(() => {
                                                    const rm: any = med.returnMedicine as any;
                                                    const returnedTotal = Array.isArray(rm)
                                                        ? rm.reduce((sum: number, item: any) => {
                                                            const nested = item && item.returnMedicine ? item.returnMedicine : item;
                                                            const amt = Number(nested?.returnAmount ?? 0);
                                                            return sum + (isNaN(amt) ? 0 : amt);
                                                        }, 0)
                                                        : Number(rm?.returnMedicine?.returnAmount ?? 0);
                                                    const offered = Number(med.offeredMedicine?.offerAmount ?? 0);
                                                    const remaining = Math.max(0, offered - returnedTotal);
                                                    return `โปรดยืนยันการคืนยา (${Number(returnedTotal).toLocaleString()} เหลือ ${Number(remaining).toLocaleString()})`;
                                                })()}
                                                <SquareCheck className="h-4 w-4" />
                                                {/* <StatusIndicator status={status} /> */}
                                            </Button>
                                        </HoverCardTrigger>
                                        {/* <HoverCardContent>
                                            <div className="text-xs text-red-700 flex justify-center"></div>
                                        </HoverCardContent> */}
                                    </HoverCard>
                                ) : status === "in-return"
                                    ? <Badge
                                        variant={"text_status"}
                                        className={clsx(
                                            // "flex content-center h-6 font-bold justify-center",
                                            getStatusColor(status),
                                            getTextStatusColor(status)
                                        )}
                                    >
                                        {(() => {
                                            const rm: any = med.returnMedicine as any;
                                            const returnedTotal = Array.isArray(rm)
                                                ? rm.reduce((sum: number, item: any) => {
                                                    const nested = item && item.returnMedicine ? item.returnMedicine : item;
                                                    console.log("nested", nested)
                                                    const amt = Number(nested?.returnAmount ?? 0);
                                                    return sum + (isNaN(amt) ? 0 : amt);
                                                }, 0)
                                                : Number(rm?.returnMedicine?.returnAmount ?? 0);
                                            const offered = Number(med.offeredMedicine?.offerAmount ?? 0);
                                            const remaining = Math.max(0, offered - returnedTotal);
                                            return `รอรับคืน (${Number(returnedTotal).toLocaleString()} เหลือ ${Number(remaining).toLocaleString()})`;
                                        })()}
                                        {/* <StatusIndicator status={status} /> */}
                                    </Badge>
                                    : status === "returned"
                                        ? <HoverCard>
                                            <HoverCardTrigger>
                                                <Badge
                                                    variant={"text_status"}
                                                    className={clsx(
                                                        // "flex content-center h-6 font-bold justify-center",
                                                        getStatusColor(status),
                                                        getTextStatusColor(status),
                                                        "cursor-pointer"
                                                    )}
                                                >
                                                    เสร็จสิ้น ({(() => {
                                                        const rm: any = med.returnMedicine as any;
                                                        const returnedTotal = Array.isArray(rm)
                                                            ? rm.reduce((sum: number, item: any) => {
                                                                const nested = item && item.returnMedicine ? item.returnMedicine : item;
                                                                const amt = Number(nested?.returnAmount ?? 0);
                                                                return sum + (isNaN(amt) ? 0 : amt);
                                                            }, 0)
                                                            : Number(rm?.returnMedicine?.returnAmount ?? 0);
                                                        return Number(returnedTotal).toLocaleString();
                                                    })()})
                                                </Badge>
                                            </HoverCardTrigger>
                                            <HoverCardContent>
                                                <div className="text-sm">
                                                    <div className="font-semibold mb-2">รายละเอียดการคืนยา</div>
                                                    {(() => {
                                                        const rm: any = med.returnMedicine as any;
                                                        const returnList = Array.isArray(rm) ? rm : (rm ? [rm] : []);
                                                        return returnList.map((item: any, index: number) => {
                                                            const nested = item && item.returnMedicine ? item.returnMedicine : item;
                                                            const returnAmount = Number(nested?.returnAmount ?? 0);
                                                            const returnDate = nested?.returnDate ? new Date(Number(nested.returnDate)) : null;
                                                            const formattedDate = returnDate && !isNaN(returnDate.getTime()) 
                                                                ? format(returnDate, 'dd/MM/') + (returnDate.getFullYear() + 543)
                                                                : "ไม่ระบุวันที่";
                                                            
                                                            return (
                                                                <div key={index} className="flex justify-between py-1 border-b last:border-b-0">
                                                                    <span className="text-xs text-muted-foreground">{formattedDate}</span>
                                                                    <span className="text-xs font-medium">{returnAmount.toLocaleString()} หน่วย</span>
                                                                </div>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            </HoverCardContent>
                                        </HoverCard>
                                        : status === "cancelled"
                                            ? <div
                                                className="flex gap-x-2 "
                                            >
                                                ยกเลิก
                                                <StatusIndicator status={status} />
                                            </div>
                                            : ""
                        }</div>
                    </div>
                )
            }
        },
        // {
        //     id: "history",
        //     size: 50,
        //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ประวัติ</div>,
        //     cell: ({ row }) => {
        //         const status = row.original.requestDetails.status
        //         return <div className="text-md font-medium text-gray-600 flex flex-row items-center gap-x-1">
        //             {/* <div className="flex flex-row gap-x-1">
        //             {status === 'pending' ? "กำลังดำเนินการ"
        //                     : status === "cancelled" ? "ยกเลิก"
        //                     : ""
        //                 } <StatusIndicator status={status} />
        //         </div> */}
        //             <History className="w-4 h-4" />
        //         </div>
        //     }
        // }
    ]