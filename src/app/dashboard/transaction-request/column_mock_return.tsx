"use client"

import { Button } from "@/components/ui/button";
import StatusIndicator, { getStatusColor, getTextStatusColor } from "@/components/ui/status-indicator"
import { access } from "fs";
import { format } from "date-fns"
import { ArrowUpDown, Pencil, MoreHorizontal, Check, Trash2, Copy, CheckCircle2Icon, LoaderIcon, ShieldAlertIcon, Truck, Clock, TicketCheck, BookDown, BookUp, SquareX, SquareCheck, History } from "lucide-react"
import { _maxSize } from "zod/v4/core";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import ReturnPdfMultiButton from "@/components/ui/pdf_creator/ReturnPdfMultiButton"
import clsx from "clsx";
export const columns = (
    handleReturnSharingClick: (med: any) => void,
    handleConfirmReceiveDelivery: (med: any) => void,
    handleReconfirmClickSharingTicket: (med: any) => void
) => [
        {
            accessorKey: "createdAt",
            size: 100,
            header: ({ column }: { column: any }) => <div className="font-medium text-muted-foreground text-left cursor-default">
                วันที่แจ้ง
                <Button
                    className="font-medium text-muted-foreground text-left cursor-pointer"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </div>,
            cell: ({ row }: { row: any }) => {
                const raw = row.original.createdAt
                const date = new Date(Number(raw)); // convert string to number, then to Date
                const isValid = !isNaN(date.getTime());
                const formattedDate = isValid ? format(new Date(Number(date)), 'dd/MM/') + (new Date(Number(date)).getFullYear() + 543) : "-"; // format to date only
                const timeOnly = isValid ? format(date, 'HH:mm:ss') : "-"; // format to time only
                return (<div>
                    <div className="text-md font-medium">{formattedDate}</div>
                    <div className="text-xs text-muted-foreground">{timeOnly}</div>
                </div>);
            }
        },
        {
            accessorKey: "sharingDetails.sharingMedicine.name",
            size: 200,
            header: ({ column }: { column: any }) => <div className="font-medium text-muted-foreground text-left cursor-default">
                รายการยา/ชื่อการค้า
                <Button
                    className="font-medium text-muted-foreground text-left cursor-pointer"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </div>,
            cell: ({ row }: { row: any }) => {
                const med = row.original;
                const name = med.sharingDetails?.sharingMedicine?.name || "-";
                const trademark = med.sharingDetails?.sharingMedicine?.trademark || "-";
                return (
                    <div className="flex flex-col">
                        <div className="text-md font-medium ">{name}</div>
                        <div className="text-xs text-muted-foreground">{trademark}</div>
                    </div>
                )
            },
            enableGlobalFilter: true
        },
        {
            accessorKey: "sharingDetails.sharingMedicine.sharingAmount",
            size: 100,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวนขอแบ่งปัน</div>,
            cell: ({ row }: { row: any }) => {
                const med = row.original;
                const sharingAmount = med.sharingDetails?.sharingMedicine?.sharingAmount || "-";
                const pricePerUnit = med.sharingDetails?.sharingMedicine?.pricePerUnit || "-";
                const responseAmount = med.acceptedOffer?.responseAmount || "-";
                const amount = responseAmount * pricePerUnit;
                return (
                    <div className="flex flex-col">
                        <div className="text-md font-medium items-center">{responseAmount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">มูลค่า: {amount.toLocaleString()} บาท</div>
                    </div>
                )
            },
            enableGlobalFilter: false
        },
        {
            accessorKey: "sharingDetails.sharingMedicine.quantity",
            size: 100,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ขนาด/หน่วย</div>,
            cell: ({ row }: { row: any }) => {
                const med = row.original;
                const quantity = med.sharingDetails?.sharingMedicine?.quantity || "-";
                const unit = med.sharingDetails?.sharingMedicine?.unit || "-";
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
            accessorKey: "sharingDetails.sharingReturnTerm.receiveConditions",
            size: 380,
            header: () => (
                <div className="font-medium text-muted-foreground text-center cursor-default">
                    <div>เงื่อนไขการคืนยา</div>
                </div>
            ),
            cell: ({ row }: { row: any }) => {
                const med = row.original;
                const sharingReturnTerm = med.sharingDetails?.sharingReturnTerm || {};
                //const returnTerm = med.responseDetails?.returnTerm || {};
                const renderCondition = (label: string, value: boolean) => (
                    <div className="flex items-center gap-2">
                        {value ? <SquareCheck className="text-green-600 w-5 h-5" /> : <SquareX className="text-red-600 w-5 h-5" />}
                        <span>{label}</span>
                    </div>
                );

                    return (
                        <div className="text-md font-medium  flex flex-row gap-2 items-start">
                            <div className="basis-1/2 justify-end flex flex-col ">
                                {renderCondition("คืนรายการที่ให้ยืม", sharingReturnTerm.returnConditions.exactTypeCondition)}
                                {renderCondition("คืนรายการทดแทน", sharingReturnTerm.returnConditions.otherTypeCondition)}
                            </div>
                            <div className="basis-1/2 flex flex-col">
                                {renderCondition("ตามสิทธิ์แผนบริการ", sharingReturnTerm.supportCondition.servicePlan)}
                                {renderCondition("ตามงบประมาณสนับสนุน", sharingReturnTerm.supportCondition.budgetPlan)}
                                {renderCondition("สนับสนุนโดยไม่คิดค่าใช้จ่าย", sharingReturnTerm.supportCondition.freePlan)}
                            </div>
                            {/* <div>
                                {renderCondition("สนับสนุนโดยไม่คิดค่าใช้จ่าย", sharingReturnTerm.returnConditions.freePlan)}
                            </div> */}
                        </div>
                    );
                
            },
            enableGlobalFilter: false
        },
        // {
        //     accessorKey: "updatedAt",
        //     size: 100,
        //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันอัพเดทล่าสุด</div>,
        //     cell: ({ row }: { row: any }) => {
        //         const raw = row.original.updatedAt
        //         console.log("roww",row.original)
        //         const date = new Date(String(raw)); // convert string to number, then to Date
        //         const isValid = !isNaN(date.getTime());
        //         const formattedDate = isValid ? format(date, 'dd/MM/yyyy') : "-"; // format to date only
        //         const timeOnly = isValid ? format(date, 'HH:mm:ss') : "-"; // format to time only
        //         return (<div>
        //             <div className="text-md font-medium ">{formattedDate}</div>
        //             <div className="text-xs text-muted-foreground">{timeOnly}</div>
        //         </div>);
        //     }
        // },
        {
            accessorKey: "status",
            size: 350,
            header: () => <div className="font-medium text-muted-foreground  text-left cursor-default flex flex-row  justify-between">
                <div className="flex justify-start basis-1/2">โรงพยาบาลที่ให้ยืม</div>
                <div className="flex justify-start basis-1/2">สถานะ(จำนวนยาที่ได้ยืม)</div>
            </div>,
            cell: ({ row }: { row: any }) => {
                const med = row.original;
                //console.log("med sharing", med)
                const postingHospitalName = med.sharingDetails?.postingHospitalNameTH || "ไม่ระบุ";
                const responseAmount = med.acceptedOffer?.responseAmount || "-";
                const status = row.original.status;

                return <div className="flex flex-row  items-center  justify-between">
                    <div className="text-sm font-medium text-gray-600 flex justify-start basis-1/2">
                        {postingHospitalName}
                    </div>
                    <div className="text-sm font-medium text-gray-600 flex justify-start basis-1/2">
                        {
                            status === 'to-transfer' ? (
                                <div className="flex items-center gap-x-2">
                                    <Badge
                                        variant={'text_status'}
                                        className={clsx(
                                            // "flex content-center h-6 font-bold",
                                            getStatusColor(status),
                                            getTextStatusColor(status)
                                        )}
                                    >
                                        รอรับมอบ
                                        {/* <StatusIndicator status={status} /> */}
                                    </Badge>
                                    {/* <div>( {responseAmount} )</div> */}
                                </div>
                            ) : status === 'to-confirm' ? (
                                <div className="flex flex-col items-center gap-x-2">
                                    <HoverCard>
                                        <HoverCardTrigger >
                                            <Button
                                                variant={"text_status"}
                                                size={"text_status"}
                                                className={clsx(
                                                    // "flex content-center h-6 font-bold text-xs",
                                                    getStatusColor(status),
                                                    getTextStatusColor(status)
                                                )}
                                                onClick={() =>
                                                    handleConfirmReceiveDelivery({
                                                        ...med,
                                                        displayHospitalName: med.sharingDetails.postingHospitalNameTH,
                                                        displayMedicineName: med.sharingDetails.sharingMedicine.name,
                                                        displayMedicineAmount: med.acceptedOffer.responseAmount,
                                                        // displayHospi
                                                    })}
                                            >
                                                ยืนยันการรับของ
                                                <SquareCheck className="h-4 w-4" />
                                                {/* <StatusIndicator status={status} /> */}
                                            </Button>
                                            {/* <span>(กดได้เมื่อได้รับการยืนยัน)</span> */}
                                            {/* <div>( {responseAmount} )</div> */}
                                        </HoverCardTrigger>
                                        {/* <HoverCardContent>
                                                <div className="text-xs text-red-700 flex justify-center">โปรดยืนยันเมื่อได้รับยาแล้ว</div>
                                            </HoverCardContent> */}
                                    </HoverCard>
                                </div>
                            ) : status === 'offered'
                                ? (
                                    <Badge
                                        variant={'text_status'}
                                        className={clsx(
                                            // "flex content-center h-6 font-bold",
                                            getStatusColor(status),
                                            getTextStatusColor(status)
                                        )}
                                    >
                                        แจ้งขอยืม
                                        {/* <div className=" text-xs">{(responseAmount) ? "(" + (responseAmount) + ")" : "(-)"}</div> */}
                                    </Badge>
                                ) : status === 're-confirm'
                                    ? (
                                        <HoverCard>
                                            <HoverCardTrigger >
                                                <Button
                                                    variant={"text_status"}
                                                    size={"text_status"}
                                                    className={clsx(
                                                        // "flex content-center h-6 font-bold text-xs",
                                                        getStatusColor(status),
                                                        getTextStatusColor(status)
                                                    )}
                                                    onClick={() =>
                                                        handleReconfirmClickSharingTicket({
                                                            sharingMedicineDetail: med.sharingDetails,
                                                            responseDetail: med,
                                                            ...med
                                                        })
                                                    }>
                                                    ยืนยันการขอยืม
                                                    <SquareCheck className="h-4 w-4" />
                                                    {/* <StatusIndicator status={status} /> */}
                                                </Button>
                                                {/* <div>( {responseAmount} )</div>  */}
                                            </HoverCardTrigger>
                                            {/* <HoverCardContent>
                                                <div className="text-xs text-red-700 flex justify-center">โปรดยืนยันเมื่อได้รับยาแล้ว</div>
                                            </HoverCardContent> */}
                                        </HoverCard>
                                    )
                                    : status === 'in-return'
                                        ? (
                                            <HoverCard>
                                                <HoverCardTrigger >
                                                    <Button
                                                        variant={"text_status"}
                                                        size={"text_status"}
                                                        className={clsx(
                                                            // "flex content-center h-6 font-bold text-xs",
                                                            getStatusColor(status),
                                                            getTextStatusColor(status)
                                                        )}
                                                        onClick={() => handleReturnSharingClick(med)}
                                                    >
                                                        ส่งคืนยา
                                                        {(() => {
                                                            const offered = Number(med?.acceptedOffer?.responseAmount ?? 0);
                                                            const rm: any = (med as any).returnMedicine;
                                                            const returnedTotal = Array.isArray(rm)
                                                                ? rm.reduce((sum: number, item: any) => {
                                                                    const nested = item && item.returnMedicine ? item.returnMedicine : item;
                                                                    const amt = Number(nested?.returnAmount ?? 0);
                                                                    return sum + (isNaN(amt) ? 0 : amt);
                                                                }, 0)
                                                                : Number(rm?.returnMedicine?.returnAmount ?? 0);
                                                            return (
                                                                <div className=" text-xs">({Number(returnedTotal).toLocaleString()}/{Number(offered).toLocaleString()})</div>
                                                            );
                                                        })()}
                                                        <SquareCheck className="h-4 w-4" />
                                                        {/* <StatusIndicator status={status} /> */}
                                                    </Button>
                                                    {/* <div>( {responseAmount} )</div>  */}
                                                </HoverCardTrigger>
                                                {/* <HoverCardContent>
                                                <div className="text-xs text-red-700 flex justify-center">โปรดยืนยันเมื่อได้รับยาแล้ว</div>
                                            </HoverCardContent> */}
                                            </HoverCard>
                                        ) : status === 'returned' ? (
                                            <HoverCard>
                                                <HoverCardTrigger>
                                                    <div className="flex flex-row gap-x-2 items-center">
                                                        <Badge
                                                            variant={'text_status'}
                                                            className={clsx(
                                                                // "flex content-center h-6 font-bold",
                                                                getStatusColor(status),
                                                                getTextStatusColor(status),
                                                                "cursor-pointer"
                                                            )}
                                                        >
                                                            เสร็จสิ้น ({(() => {
                                                                const rm: any = (med as any).returnMedicine;
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
                                                        <ReturnPdfMultiButton
                                                            data={med}
                                                            returnList={(med as any).returnMedicine}
                                                            buttonText="ออกเอกสาร PDF การคืนยา"
                                                        />
                                                    </div>
                                                </HoverCardTrigger>
                                                <HoverCardContent>
                                                    <div className="text-sm">
                                                        <div className="font-semibold mb-2">รายละเอียดการคืนยา</div>
                                                        {(() => {
                                                            const rm: any = (med as any).returnMedicine;
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
                                        ) : status === 'confirm-return' ? (
                                            // <div className="flex flex-col items-start gap-x-2 cursor-not-allowed">
                                            <Badge
                                                variant={'text_status'}
                                                className={clsx(
                                                    // "flex content-center h-6 font-bold",
                                                    getStatusColor(status),
                                                    getTextStatusColor(status)
                                                )}
                                            >
                                                รอยืนยันการได้รับคืน
                                                {(() => {
                                                    const offered = Number(med?.acceptedOffer?.responseAmount ?? 0);
                                                    const rm: any = (med as any).returnMedicine;
                                                    const returnedTotal = Array.isArray(rm)
                                                        ? rm.reduce((sum: number, item: any) => {
                                                            const nested = item && item.returnMedicine ? item.returnMedicine : item;
                                                            const amt = Number(nested?.returnAmount ?? 0);
                                                            return sum + (isNaN(amt) ? 0 : amt);
                                                        }, 0)
                                                        : Number(rm?.returnMedicine?.returnAmount ?? 0);
                                                    const remaining = Math.max(0, offered - returnedTotal);
                                                    return (
                                                        <div className=" text-xs">({Number(returnedTotal).toLocaleString()} เหลือ {Number(remaining).toLocaleString()})</div>
                                                    );
                                                })()}
                                                {/* <StatusIndicator status={status} /> */}
                                                {/* <div className="text-xs font-extralight text-muted-foreground">(กดได้เมื่อได้รับการยืนยัน)</div> */}
                                                {/* <div>( {responseAmount} )</div> */}
                                            </Badge>
                                        ) : null
                        }
                    </div>
                </div >
            }
        },
        // {
        //     accessorKey: "history",
        //     size: 150,
        //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">สถานะ</div>,
        //     cell: ({ row }: { row: any }) => {
        //         const med = row.original;
        //         const status = row.original.sharingDetails.status;
        //         // console.log('roww req', row.original)
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