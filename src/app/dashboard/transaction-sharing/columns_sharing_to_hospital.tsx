"use client"
import { useState } from "react"
import { SharingAsset } from "@/types/sharingMed"
import { ColumnDef } from "@tanstack/react-table"
// import { formatDate } from "@/lib/utils"
import { format, differenceInCalendarDays } from "date-fns"
import { History, Edit, Pencil, SquareCheck } from "lucide-react"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import clsx from "clsx";
import { Button } from "@/components/ui/button"
import StatusIndicator, { getStatusColor, getTextStatusColor } from "@/components/ui/status-indicator"
import ReturnConditionIndicator from "@/components/ui/return-condition-indicator"
import { Progress } from "@/components/ui/progress"
import ImageHoverPreview from "@/components/ui/image-hover-preview"
import ReturnSummaryHover from "@/components/ui/return-summary-hover"
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
            size: 50,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center">
                        <Button variant={'link'} className="flex p-0 hover:bg-indigo-300" onClick={() => handleEditClick(row.original)}><Pencil className="cursor-pointer" /></Button>
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
                const imgUrl: string | null = original.sharingMedicineImage || original.sharingMedicine?.imageRef || null
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
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันที่แจ้ง</div>,
            cell: ({ row }) => {
                const createdAt = row.getValue("createdAt")
                const date = new Date(Number(createdAt)); // convert string to number, then to Date
                const isValid = !isNaN(date.getTime());
                const formattedDate = isValid ? format(new Date(Number(date)), 'dd/MM/') + (new Date(Number(date)).getFullYear() + 543) : "-"; // format to date only
                const timeOnly = isValid ? format(date, 'HH:mm:ss') : "-"; // format to time only
                return (<div>
                    <div className="text-sm font-medium text-gray-600">{formattedDate}</div>
                    <div className="text-xs text-muted-foreground">{timeOnly}</div>
                </div>);
            }
        },
        {
            id: "sharingMedicineName",
            accessorFn: (row) => row.sharingMedicine.name,
            size: 200,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default"> รายการยา/ชื่อการค้า </div>,
            cell: ({ row }) => {
                const medName = row.original.sharingMedicine.name;
                const medTrademark = row.original.sharingMedicine.trademark;
                const med = row.original
                //console.log("med", med)
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
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ขนาด/หน่วย</div>,
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
            size: 80,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวน(คงเหลือ)</div>,
            cell: ({ row }) => {
                const sharingAmount = row.original.sharingMedicine.sharingAmount;
                const pricePerUnit = row.original.sharingMedicine.pricePerUnit;

                const totalPrice = sharingAmount * pricePerUnit;
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
                return (
                    <div>
                        <div className="">{sharingAmount.toLocaleString()} ({remainingAmount.toLocaleString()})</div>
                        <div className="text-xs text-muted-foreground">รวม {totalPrice.toLocaleString()} บาท</div>

                    </div>
                )
            }
        },

        // {
        //     id: "sharingMedicinePricePerUnit",
        //     accessorFn: (row) => row.sharingMedicine.pricePerUnit,
        //     size: 70,
        //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ราคาต่อหน่วย</div>,
        //     cell: ({ row }) => {
        //         const shareAmount = row.original.sharingMedicine.sharingAmount;
        //         const pricePerUnit = row.original.sharingMedicine.pricePerUnit;
        //         const unit = row.original.sharingMedicine.unit;
        //         const totalPrice = shareAmount * pricePerUnit;

        //         return (
        //             <div className="flex flex-col">
        //                 <div className="text-sm font-medium text-gray-600">{pricePerUnit} บาท /{unit}</div>
        //                 <div className="text-xs text-muted-foreground">รวม {totalPrice} บาท</div>
        //             </div>
        //         )
        //     }
        // },
        {
            accessorKey: "updatedAt",
            size: 80,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">อัพเดทล่าสุด</div>,
            cell: ({ row }) => {
                const responseDetails = row.original.responseDetails
                // console.log("responseDetails", responseDetails)
                return (
                    <div className="flex flex-col ">
                        {responseDetails.map((item: any, index: number) => {
                            const date = new Date(Number(item.updatedAt));
                            const isValid = !isNaN(date.getTime());
                            const formattedDate = isValid ? format(date, 'dd/MM/yyyy') : "-";
                            const timeOnly = isValid ? format(date, 'HH:mm:ss') : "-";
                            // //console.log("responseDetailsaaaaaa",date)
                            return (
                                <div key={index}>
                                    <div className="flex flex-row  items-center  justify-between mt-1">{formattedDate}</div>
                                    {/* <div className="text-xs text-muted-foreground">{item.updatedAt}</div> */}
                                </div>
                            );
                        })}
                    </div>
                );
            }
        },
        // {
        //     id: "ticketStatus",
        //     accessorFn: (row) => row.status,
        //     size: 80,
        //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">สถานะ</div>,
        //     cell: ({ getValue }) => {
        //         const status = getValue() as string;
        //         return (
        //             <div className="flex items-center gap-x-2">
        //                 <StatusIndicator status={status} />
        //                 {status === 'cancelled' ? <div className="text-xs text-muted-foreground">ยกเลิก</div> : <div className="text-xs text-muted-foreground">ดำเนินการ</div>}
        //             </div>
        //         )
        //     }
        // },
        {
            id: "responseDetailsHospitalName",
            size: 350,
            header: () => <div className="flex font-medium text-muted-foreground text-left cursor-default">
                <div className="basis-1/2">ผู้ตอบกลับ</div>
                <div className="basis-1/2">สถานะ</div>
            </div>,
            cell: ({ row }) => {
                const med = row.original;
                const responseDetails = row.original.responseDetails;
                const maxDisplay = 3;
                const details = responseDetails.slice(0, maxDisplay);
                const hasMore = responseDetails.length > maxDisplay;

                // console.log('med', med)


                return (
                    <div className="flex flex-col  ">
                        {med.responseDetails.map((detail, index) => (
                            <div key={index} className="flex flex-row  items-center  justify-between ">
                                <div className="basis-1/2 text-wrap w-[120px] truncate overflow-hidden text-ellipsis whitespace-nowrap" title={detail.respondingHospitalNameTH}>
                                    <span>{detail.respondingHospitalNameTH}</span>
                                </div>
                                <div className="basis-1/2 mt-1">
                                    {detail.status === 'pending'
                                        ? (
                                            <Badge
                                                variant={'text_status'}
                                                className={clsx(
                                                    // "flex content-center h-6 font-bold",
                                                    getStatusColor(detail.status),
                                                    getTextStatusColor(detail.status)
                                                )}
                                            >
                                                แจ้งแบ่งปัน
                                                {/* <StatusIndicator status={detail.status} /> */}
                                            </Badge>
                                        ) : detail.status === 'offered'
                                            ? (
                                                
                                                        <Button
                                                            variant={"text_status"}
                                                            size={"text_status"}
                                                            className={clsx(
                                                                // "flex content-center h-6 font-bold text-xs",
                                                                getStatusColor(detail.status),
                                                                getTextStatusColor(detail.status)
                                                            )}
                                                            onClick={() => handleReConfirmClick({
                                                                ...med,
                                                                responseId: detail.id,
                                                                offeredMedicine: detail.acceptedOffer,
                                                                sharingDetails: med.sharingMedicine,
                                                                responseStatus: detail.status,
                                                                returnTerm: detail.returnTerm,
                                                                respondingHospitalNameTH: detail.respondingHospitalNameTH,

                                                            })}

                                                        >
                                                            รอยืนยันให้ยืม ({detail.acceptedOffer.responseAmount})
                                                            {/* <SquareCheck className="h-4 w-4" /> */}
                                                        </Button>
                                                    
                                                
                                            ) : detail.status === 're-confirm' ? (
                                                <Badge
                                                    variant={'text_status'}
                                                    className={clsx(
                                                        // "flex content-center h-6 font-bold",
                                                        getStatusColor(detail.status),
                                                        getTextStatusColor(detail.status)
                                                    )}
                                                >
                                                    รอยืนยันการขอยืม ({detail.acceptedOffer.responseAmount})
                                                    {/* <StatusIndicator status={detail.status} />  */}
                                                </Badge>
                                            ) : detail.status === 'to-transfer'
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
                                                                onClick={() => handleDeliveryClick({
                                                                    ...med,
                                                                    responseId: detail.id,
                                                                    // offeredMedicine: detail.acceptedOffer,
                                                                    // sharingDetails: med.sharingMedicine,
                                                                    responseDetail: detail,
                                                                    acceptedOffer: detail.acceptedOffer,
                                                                })}
                                                            >
                                                                ส่งมอบ
                                                                {/* {(() => {
                                                                    const offeredAmount = Number(detail?.returnMedicine?.offerAmount ?? 0);
                                                                    const offeredUnitPrice = Number(detail?.returnMedicine?.pricePerUnit ?? 0);
                                                                    const originalTotalPrice = (isNaN(offeredAmount) || isNaN(offeredUnitPrice)) ? 0 : (offeredAmount * offeredUnitPrice);
                                                                    const rm: any = (detail as any).returnMedicine;
                                                                    const returnedPriceTotal = Array.isArray(rm)
                                                                        ? rm.reduce((sum: number, item: any) => {
                                                                            const nested = item && item.returnMedicine ? item.returnMedicine : item;
                                                                            const amt = Number(nested?.returnAmount ?? 0);
                                                                            const unitPrice = Number(nested?.pricePerUnit ?? 0);
                                                                            const lineTotal = (isNaN(amt) || isNaN(unitPrice)) ? 0 : (amt * unitPrice);
                                                                            return sum + lineTotal;
                                                                        }, 0)
                                                                        : (() => {
                                                                            const nested = rm && rm.returnMedicine ? rm.returnMedicine : rm;
                                                                            const amt = Number(nested?.returnAmount ?? 0);
                                                                            const unitPrice = Number(nested?.pricePerUnit ?? 0);
                                                                            return (isNaN(amt) || isNaN(unitPrice)) ? 0 : (amt * unitPrice);
                                                                        })();
                                                                    const percent = originalTotalPrice > 0 ? Math.max(0, Math.min(100, (returnedPriceTotal / originalTotalPrice) * 100)) : 0;
                                                                    return (
                                                                        <div className=" text-xs">({percent.toFixed(0)}%)</div>
                                                                    );
                                                                })()} */}
                                                                ({detail.acceptedOffer.responseAmount})
                                                                {/* <SquareCheck className="h-4 w-4" /> */}
                                                                {/* <StatusIndicator status={detail.status} /> */}
                                                            </Button>
                                                        </HoverCardTrigger>
                                                        {/* <HoverCardContent>
                                                        <div className="text-xs text-red-700 flex justify-center">โปรดยืนยันเมื่อได้รับยาแล้ว</div>
                                                    </HoverCardContent> */}
                                                    </HoverCard>
                                                ) : detail.status === 'in-return' ? (
                                                    <Badge
                                                        variant={'text_status'}
                                                        className={clsx(
                                                            // "flex content-center h-6 font-bold",
                                                            getStatusColor(detail.status),
                                                            getTextStatusColor(detail.status)
                                                        )}
                                                    >รอรับคืน
                                                        {(() => {
                                                            const offeredAmount = Number(detail?.acceptedOffer?.responseAmount ?? 0);
                                                            const offeredUnitPrice = Number(detail?.acceptedOffer?.pricePerUnit ?? 0);
                                                            const originalTotalPrice = (isNaN(offeredAmount) || isNaN(offeredUnitPrice)) ? 0 : (offeredAmount * offeredUnitPrice);
                                                            const rm: any = (detail as any).returnMedicine;
                                                            const returnedPriceTotal = Array.isArray(rm)
                                                                ? rm.reduce((sum: number, item: any) => {
                                                                    const nested = item && item.returnMedicine ? item.returnMedicine : item;
                                                                    const amt = Number(nested?.returnAmount ?? 0);
                                                                    const unitPrice = Number(nested?.pricePerUnit ?? 0);
                                                                    const lineTotal = (isNaN(amt) || isNaN(unitPrice)) ? 0 : (amt * unitPrice);
                                                                    return sum + lineTotal;
                                                                }, 0)
                                                                : (() => {
                                                                    const nested = rm && rm.returnMedicine ? rm.returnMedicine : rm;
                                                                    const amt = Number(nested?.returnAmount ?? 0);
                                                                    const unitPrice = Number(nested?.pricePerUnit ?? 0);
                                                                    return (isNaN(amt) || isNaN(unitPrice)) ? 0 : (amt * unitPrice);
                                                                })();
                                                            const percent = originalTotalPrice > 0 ? Math.max(0, Math.min(100, (returnedPriceTotal / originalTotalPrice) * 100)) : 0;
                                                            return (
                                                                <div className=" text-xs">({percent.toFixed(0)}%)</div>
                                                            );
                                                        })()}
                                                        {/* {(() => {
                                                            const rm: any = detail.returnMedicine as any;
                                                            const returnedTotal = Array.isArray(rm)
                                                                ? rm.reduce((sum: number, item: any) => {
                                                                    const nested = item && item.returnMedicine ? item.returnMedicine : item;
                                                                    const amt = Number(nested?.returnAmount ?? 0);
                                                                    return sum + (isNaN(amt) ? 0 : amt);
                                                                }, 0)
                                                                : Number(rm?.returnMedicine?.returnAmount ?? 0);
                                                            const offered = Number(detail.acceptedOffer?.responseAmount ?? 0);
                                                            const remaining = Math.max(0, offered - returnedTotal);
                                                            return `รอรับคืน (${Number(returnedTotal).toLocaleString()} เหลือ ${Number(remaining).toLocaleString()})`;
                                                        })()} */}
                                                        {/* <StatusIndicator status={detail.status} /> */}
                                                    </Badge>
                                                ) : detail.status === 'to-confirm' ? (
                                                    <Badge
                                                        variant={'text_status'}
                                                        className={clsx(
                                                            // "flex content-center h-6 font-bold",
                                                            getStatusColor(detail.status),
                                                            getTextStatusColor(detail.status)
                                                        )}
                                                    >
                                                        รอยืนยันการรับของ ({detail.acceptedOffer.responseAmount})

                                                        {/* <StatusIndicator status={detail.status} /> */}
                                                    </Badge>
                                                ) : detail.status === 'to-return' ? (
                                                    <div className="flex gap-x-2">รอรับคืน ({detail.acceptedOffer.responseAmount})<StatusIndicator status={detail.status} /></div>
                                                ) : detail.status === 'confirm-return' ? (
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

                                                                onClick={() => handleReturnConfirm({
                                                                    ...med,
                                                                    responseId: detail.id,
                                                                    offeredMedicine: detail.acceptedOffer,
                                                                    sharingDetails: med.sharingMedicine,
                                                                    responseStatus: detail.status,
                                                                    displayMedicineName: (() => {
                                                                        const r: any = detail.returnMedicine as any;
                                                                        const last = Array.isArray(r) ? r[r.length - 1] : r;
                                                                        const nested = last && last.returnMedicine ? last.returnMedicine : last;
                                                                        return nested?.name;
                                                                    })(),
                                                                    displayMedicineAmount: (() => {
                                                                        const r: any = detail.returnMedicine as any;
                                                                        const last = Array.isArray(r) ? r[r.length - 1] : r;
                                                                        const nested = last && last.returnMedicine ? last.returnMedicine : last;
                                                                        return r?.returnType === 'supportType' ? "ขอสนับสนุน" : nested?.returnAmount;
                                                                    })(),
                                                                    displayHospitalName: detail.respondingHospitalNameTH,
                                                                })}
                                                            >โปรดยืนยันการคืนยา
                                                                {(() => {
                                                                    const offeredAmount = Number(detail?.acceptedOffer?.responseAmount ?? 0);
                                                                    const offeredUnitPrice = Number(detail?.acceptedOffer?.pricePerUnit ?? 0);
                                                                    const originalTotalPrice = (isNaN(offeredAmount) || isNaN(offeredUnitPrice)) ? 0 : (offeredAmount * offeredUnitPrice);
                                                                    const rm: any = (detail as any).returnMedicine;
                                                                    const returnedPriceTotal = Array.isArray(rm)
                                                                        ? rm.reduce((sum: number, item: any) => {
                                                                            const nested = item && item.returnMedicine ? item.returnMedicine : item;
                                                                            const amt = Number(nested?.returnAmount ?? 0);
                                                                            const unitPrice = Number(nested?.pricePerUnit ?? 0);
                                                                            const lineTotal = (isNaN(amt) || isNaN(unitPrice)) ? 0 : (amt * unitPrice);
                                                                            return sum + lineTotal;
                                                                        }, 0)
                                                                        : (() => {
                                                                            const nested = rm && rm.returnMedicine ? rm.returnMedicine : rm;
                                                                            const amt = Number(nested?.returnAmount ?? 0);
                                                                            const unitPrice = Number(nested?.pricePerUnit ?? 0);
                                                                            return (isNaN(amt) || isNaN(unitPrice)) ? 0 : (amt * unitPrice);
                                                                        })();
                                                                    const percent = originalTotalPrice > 0 ? Math.max(0, Math.min(100, (returnedPriceTotal / originalTotalPrice) * 100)) : 0;
                                                                    return (
                                                                        <div className=" text-xs">({percent.toFixed(0)}%)</div>
                                                                    );
                                                                })()}
                                                                {/* {(() => {
                                                                    const rm: any = detail.returnMedicine as any;
                                                                    const returnedTotal = Array.isArray(rm)
                                                                        ? rm.reduce((sum: number, item: any) => {
                                                                            console.log("nested", item)
                                                                            const nested = item && item.returnMedicine ? item.returnMedicine : item;
                                                                            const amt = Number(nested?.returnAmount ?? 0);
                                                                            return sum + (isNaN(amt) ? 0 : amt);
                                                                        }, 0)
                                                                        : Number(rm?.returnMedicine?.returnAmount ?? 0);
                                                                    const offered = Number(detail.acceptedOffer?.responseAmount ?? 0);
                                                                    const remaining = Math.max(0, offered - returnedTotal);
                                                                    return `โปรดยืนยันการคืนยา (${Number(returnedTotal).toLocaleString()} เหลือ ${Number(remaining).toLocaleString()})`;
                                                                })()} */}
                                                                <SquareCheck className="h-4 w-4" />
                                                                {/* <StatusIndicator status={detail.status} /> */}
                                                            </Button>
                                                        </HoverCardTrigger>
                                                        {/* <HoverCardContent>
                                                        <div className="text-xs text-red-700 flex justify-center">โปรดยืนยันเมื่อได้รับยาแล้ว</div>
                                                    </HoverCardContent> */}
                                                    </HoverCard>
                                                ) : detail.status === 'returned' ? (
                                                    <HoverCard>
                                                        <HoverCardTrigger>
                                                            <Badge
                                                                variant={'text_status'}
                                                                className={clsx(
                                                                    // "flex content-center h-6 font-bold",
                                                                    getStatusColor(detail.status),
                                                                    getTextStatusColor(detail.status),
                                                                    "cursor-pointer"
                                                                )}
                                                            >
                                                                เสร็จสิ้น
                                                                {
                                                                    detail?.returnTerm?.returnType === 'normalReturn' ?
                                                                    (<div className="flex gap-1"> 
                                                                         {(() => {
                                                                            const offeredAmount = Number(detail?.acceptedOffer?.responseAmount ?? 0);
                                                                            const offeredUnitPrice = Number(detail?.acceptedOffer?.pricePerUnit ?? 0);
                                                                            const originalTotalPrice = (isNaN(offeredAmount) || isNaN(offeredUnitPrice)) ? 0 : (offeredAmount * offeredUnitPrice);
                                                                            const rm: any = (detail as any).returnMedicine;
                                                                            console.log('asd', detail)
                                                                            const returnedPriceTotal = Array.isArray(rm)
                                                                                ? rm.reduce((sum: number, item: any) => {
                                                                                    const nested = item && item.returnMedicine ? item.returnMedicine : item;
                                                                                    const amt = Number(nested?.returnAmount ?? 0);
                                                                                    const unitPrice = Number(nested?.pricePerUnit ?? 0);
                                                                                    const lineTotal = (isNaN(amt) || isNaN(unitPrice)) ? 0 : (amt * unitPrice);
                                                                                    return sum + lineTotal;
                                                                                }, 0)
                                                                                : (() => {
                                                                                    const nested = rm && rm.returnMedicine ? rm.returnMedicine : rm;
                                                                                    const amt = Number(nested?.returnAmount ?? 0);
                                                                                    const unitPrice = Number(nested?.pricePerUnit ?? 0);
                                                                                    return (isNaN(amt) || isNaN(unitPrice)) ? 0 : (amt * unitPrice);
                                                                                })();
                                                                            const percent = originalTotalPrice > 0 ? Math.max(0, Math.min(100, (returnedPriceTotal / originalTotalPrice) * 100)) : 0;
                                                                            return (
                                                                                <div className="flex  items-center">
                                                                                    <div className=" text-xs">({percent.toFixed(0)}%)</div>
                                                                                    <div className="flex items-center flex-row">
                                                                                        <ReturnSummaryHover
                                                                                            requestMedicine={row.original?.sharingMedicine}
                                                                                            // offeredMedicine={row.original?.offeredMedicine}
                                                                                            acceptedOffer={detail?.acceptedOffer}
                                                                                            returnMedicine={detail?.returnMedicine}
                                                                                        /></div>

                                                                                </div>
                                                                            );

                                                                        })()}
                                                                        </div>
                                                                    ):" (ขอสนับสนุน)"
                                                                }
                                                                    
                                                                       

                                                                {/* ({(() => {
                                                                    const rm: any = detail.returnMedicine as any;
                                                                    const returnedTotal = Array.isArray(rm)
                                                                        ? rm.reduce((sum: number, item: any) => {
                                                                            const nested = item && item.returnMedicine ? item.returnMedicine : item;
                                                                            const amt = Number(nested?.returnAmount ?? 0);
                                                                            return sum + (isNaN(amt) ? 0 : amt);
                                                                        }, 0)
                                                                        : Number(rm?.returnMedicine?.returnAmount ?? 0);
                                                                    return Number(returnedTotal).toLocaleString();
                                                                })()}) */}
                                                                {/* <StatusIndicator status={detail.status} */}
                                                            </Badge>
                                                        </HoverCardTrigger>
                                                        {/* <HoverCardContent>
                                                            <div className="text-sm">
                                                                <div className="font-semibold mb-2">รายละเอียดการคืนยา</div>
                                                                {(() => {
                                                                    const rm: any = detail.returnMedicine as any;
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
                                                        </HoverCardContent> */}
                                                    </HoverCard>

                                                ) : detail.status === 'cancelled' ? (
                                                    <Badge
                                                        variant={'text_status'}
                                                        className={clsx(
                                                            // "flex content-center h-6 font-bold",
                                                            getStatusColor(detail.status),
                                                            getTextStatusColor(detail.status)
                                                        )}
                                                    >
                                                        ยกเลิก
                                                        {/* <StatusIndicator status={detail.status} /> */}
                                                    </Badge>
                                                ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        },
        // {
        //     id: "history",
        //     size: 150,
        //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ประวัติ</div>,
        //     cell: ({ row }) => {
        //         const status = row.original.status
        //         return <div className="text-md font-medium text-gray-600 flex flex-row items-center gap-x-1">
        //             <div className="flex flex-row gap-x-1">
        //                 {status === "cancelled" ? "ยกเลิก" : "กำลังดำเนินการ"} <StatusIndicator status={status} />
        //             </div>
        //             <History className="w-4 h-4" />
        //         </div>
        //     }
        // }
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