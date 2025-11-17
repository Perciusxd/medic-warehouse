"use client"
import { ColumnDef } from "@tanstack/react-table"
import type { RequestTicketRow, ApproveOfferPayload, ConfirmReceiveDeliveryPayload, ReturnClickPayload } from "@/types/tableRows"
// import { formatDate } from "@/lib/utils"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import clsx from "clsx";
import { ArrowUpDown, Pencil, SquareX, SquareCheck ,SquareMinus } from "lucide-react"
import StatusIndicator, { getStatusColor, getTextStatusColor } from "@/components/ui/status-indicator"
import ImageHoverPreview from "@/components/ui/image-hover-preview"
import ReturnPdfMultiButton from "@/components/ui/pdf_creator/ReturnPdfMultiButton"
export const columns = (
    handleApproveClick: (med: ApproveOfferPayload) => void,
    handleDeliveryClick: (med: RequestTicketRow) => void,
    handleReturnClick: (med: ReturnClickPayload) => void,
    handleReConfirmClick: (med: RequestTicketRow) => void,
    handleEditClick: (med: RequestTicketRow) => void,
    handleconfirReceiveDelivery: (med: ConfirmReceiveDeliveryPayload) => void,
    ticketType: string,
): ColumnDef<RequestTicketRow>[] => [
        {
            id: "edit",
            size: 50,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center">
                        <Button variant={'link'} className="flex p-0 justify-center hover:bg-indigo-300" onClick={() => handleEditClick(row.original)}><Pencil className="cursor-pointer" /></Button>
                    </div>
                )
            }
        },
        {
            id: "image",
            size: 70,
            header: () => <div className="font-medium text-muted-foreground text-center cursor-default">ภาพ</div>,
            cell: ({ row }) => {
                const original: any = row.original as any
                //console.log("original", original)
                const imgUrl: string | null = original.requestMedicineImage || original.requestMedicineImage?.imageRef || null
                if (!imgUrl) {
                    return <div className="text-xs text-muted-foreground text-center">-</div>
                }
                return (
                    <div className="flex items-center gap-2 justify-center">

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
            header: ({ column }) => {

                return (

                    <div className="flex justify-start items-center text-gray-600">
                        วันที่แจ้ง
                        <Button
                            className="font-medium text-muted-foreground text-left cursor-pointer ่"
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >

                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
                    </div>

                )
            },
            cell: ({ row }) => {
                //const raw = row.getValue("updatedAt");
                const raw = row.original.updatedAt
                const date = new Date(Number(raw)); // convert string to number, then to Date
                const isValid = !isNaN(date.getTime());
                const formattedDate = isValid ? format(new Date(Number(date)), 'dd/MM/') + (new Date(Number(date)).getFullYear() + 543) : "-"; // format to date only
                const timeOnly = isValid ? format(date, 'HH:mm:ss') : "-"; // format to time only

                return (<div>
                    <div className="text-md font-medium ">{formattedDate}</div>
                    <div className="text-xs text-muted-foreground">{timeOnly}</div>
                </div>);

            },
            enableGlobalFilter: true
        },
        {
            accessorKey: "requestMedicine.name",
            size: 220,
            header: ({ column }) => {
                return (
                    <div className="flex justify-start items-center text-gray-600">
                        รายการยา/ชื่อการค้า
                        <Button
                            className="font-medium text-muted-foreground text-left cursor-pointer"
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
            cell: ({ row }) => {
                const medName = row.original.requestMedicine.name;
                const medTrademark = row.original.requestMedicine.trademark;
                const requestTerm = row.original.requestTerm;
                const returnType = requestTerm.returnType;
                const receiveConditions = requestTerm.receiveConditions;
                const condition = receiveConditions.condition;
                const conditionLabel = condition === 'exactType' ? 'ยืมจากผู้ผลิตรายนี้' : 'ยืมจากผู้ผลิตรายอื่น';
                const supportCondition = row.original.requestTerm.supportCondition ? row.original.requestTerm.supportCondition : "ไม่ใช่รายการสนับสนุน";
                return (
                    <div className="flex flex-col">
                        <div className="text-md">{medName}</div>
                        <div className="text-xs text-muted-foreground">{medTrademark}</div>

                        <div className="flex item-center gap-2 flex-wrap mt-2">
                        <Badge variant="outline" className="text-xs text-gray-600">{returnType === "supportReturn" ? "ขอสนับสนุน" : "ขอยืม"}
                            {returnType === "supportReturn" && supportCondition && (
                                <Badge variant="secondary" className="text-[10px] text-gray-600">
                                    {supportCondition === "servicePlan" ? "หักงบประมาณ Service plan" : supportCondition === "budgetPlan" ? "ตามงบประมาณ" : "ให้ฟรี"}
                                </Badge>
                            )}
                            {returnType === "normalReturn" && conditionLabel && (
                                <Badge variant="secondary" className="text-[10px] text-gray-600">{conditionLabel}</Badge>
                            )}
                        </Badge>
                        </div>
                    </div>
                )

            },
            enableGlobalFilter: true
        },
        {
            accessorKey: "requestMedicine.requestAmount",
            size: 80,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวนที่ขอยืม (ยืนยัน)</div>,
            cell: ({ row }) => {
                const med = row.original;
                console.log("med sharing in col", med)
                const requestAmount = med.requestMedicine.requestAmount;
                const offeredAmount = med.remainingAmount;
                const remainingAmount = requestAmount - offeredAmount
                const pricePerUnit = med.requestMedicine.pricePerUnit;
                const totalPrice = requestAmount * pricePerUnit;
                return (
                    <div className="flex flex-col">
                        <div className="text-md font-medium ">{requestAmount.toLocaleString()} ( {remainingAmount.toLocaleString()} )</div>
                        <div className="text-xs text-muted-foreground">รวม {totalPrice.toFixed(2)} บาท</div>
                    </div>
                )
            },
            enableGlobalFilter: false
        },
        {
            accessorKey: "requestMedicine.quantity",
            size: 120,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ขนาด/หน่วย</div>,
            cell: ({ row }) => {
                const med = row.original;
                //console.log("ff",med)
                const quantity = med.requestMedicine.quantity;
                const unit = med.requestMedicine.unit
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
            accessorKey: "requestTerm.receiveConditions.condition",
            size: 120,
            header: () => 
                <div>
                    <div className="font-medium text-muted-foreground text-center cursor-default">เงื่อนไขการรับคืน</div>
                    <div className="font-medium text-muted-foreground text-center cursor-default  flex justify-between gap-2">
                        <div>
                            ยาจากผู้ผลิตรายนี้
                        </div>
                        <div>
                            ยาจากผู้ผลิตรายอื่น
                        </div>
                    </div>
                </div>
                
            ,
            cell: ({ row }) => {
                const med = row.original
                const condition = med.requestTerm.receiveConditions?.condition
                const returnType = med.requestTerm.returnType
            return(
                returnType !== 'normalReturn' ? (
                    <div className="flex justify-around gap-2">
                        <SquareMinus className="text-gray-300"></SquareMinus>
                        <SquareMinus className="text-gray-300"></SquareMinus>
                    </div>

                    // <div className="flex flex-col col-span-2 text-center">
                    //     <div className="m-2 p-2 border rounded-md bg-gray-100">
                    //         ขอสนับสนุน
                    //     </div>
                    // </div>
                ):(
                    // condition === 'exactType' ? 'รับคืนเฉพาะยารายการนี้' : condition === 'subType' ? 'รับคืนยาอื่นที่ไม่ใช่รายการนี้' : 'ไม่ระบุ'
                    <div className="flex justify-around gap-2">
                        <div className="flex text-center">
                            {condition === 'exactType' ? <SquareCheck className="text-green-600"/> : <SquareX className="text-red-600"/>}
                        </div>
                        <div className="flex text-center">
                            {condition !== 'exactType' ? <SquareCheck className="text-green-600"/> : <SquareX className="text-red-600"/>}
                        </div>
                    </div>
                )
              
            )
            }
        },
        // {
        //     accessorKey: "requestDetails.id",
        //     size: 280,
        //     header: () => {
        //         return (
        //             <div className="font-medium text-muted-foreground text-center cursor-default">
        //                 <div>
        //                     เงื่อนไขการรับยา
        //                 </div>
        //                 <div className="flex flex-row gap-x-2 text-center font-medium justify-center">
        //                     <div className="text-center basis-2/3">
        //                         ยืมจากผู้ผลิตรายนี้
        //                     </div>
        //                     <div className="text-center basis-1/3">
        //                         ยืมจากผู้ผลิตรายอื่น
        //                     </div>
        //                 </div>
        //             </div>

        //         )
        //     },
        //     cell: ({ row }) => {
        //         const med = row.original;
        //         const condition = med.requestTerm.receiveConditions.condition
        //         const supportType = med.requestTerm.receiveConditions.supportType

        //         let supportTypetDiv;
        //         let conditionDiv;

        //         if (condition === "exactType") {
        //             conditionDiv = <div className="flex text-red-600 items-center gap-x-1 "> <SquareX className="w-5 h-5" />ยืมรายการทดแทนไม่ได้</div>
        //         } else {
        //             conditionDiv = <div className="flex text-green-600 items-center gap-x-1"> <SquareCheck className="w-5 h-5" />ยืมรายการทดแทนได้</div>;
        //         }


        //         if (supportType === true) {
        //             supportTypetDiv = <div className="flex text-green-600 items-center gap-x-1"> <SquareCheck className="w-5 h-5" />ขอสนับสนุน</div>
        //         } else {
        //             supportTypetDiv = <div className="flex text-red-600 items-center gap-x-1"> <SquareX className="w-5 h-5" />ขอสนับสนุน</div>;
        //         }

        //         return (

        //             <div className="flex flex-row gap-x-2 text-center font-medium justify-between">

        //                  <div className="text-left basis-1/2">
        //                 <div className="flex flex-row justify-center">
        //                    {condition === 'exactType' ? <div className="flex text-green-600 items-center"> <SquareCheck /> </div> : <div className="flex text-red-600 items-center"> <SquareX /></div>}
        //                 </div>
        //             </div>

        //             <div className="text-left basis-1/2">
        //                 <div className="flex flex-row justify-center">
        //                     {condition === 'subType' ? <div className="flex text-green-600 items-center"> <SquareCheck /> </div> : <div className="flex text-red-600 items-center"> <SquareX /></div>}
        //                 </div>
        //             </div>
        //             </div>
        //         )
        //     },
        //     enableGlobalFilter: false
        // },
        // {
        //     accessorKey: "updatedAt",
        //     size: 120,
        //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันอัพเดทล่าสุด</div>,
        //     cell: ({ row }) => {
        //         const responseDetails = row.original.responseDetails;
        //         const med = row.original;
        //         if (!Array.isArray(responseDetails) || responseDetails.length === 0) {
        //             return <div className="text-muted-foreground">-</div>;
        //         }

        //         return (
        //             // <div className="flex flex-row  items-center  justify-between">
        //             //      {med.responseDetails.map((detail: any, index: any) =>{
        //             //         const date = new Date(Number(detail.updatedAt));
        //             //         const isValid = !isNaN(date.getTime());
        //             //         const formattedDate = isValid ? format(date, 'dd/MM/yyyy') : "-";
        //             //         const timeOnly = isValid ? format(date, 'HH:mm:ss') : "-";

        //             //         return (
        //             //             // <div key={index} className="">
        //             //             //     <div className="text-sm font-medium ">{formattedDate}</div>
        //             //             //     {/* <div className="text-xs text-muted-foreground">{timeOnly}</div> */}
        //             //             // </div>
        //             //              <div className="text-md font-medium  flex justify-center ">
        //             //                 <span>{detail.updatedAt}:</span>
        //             //             </div>
        //             //         );
        //             //     })}
        //             // </div>
        //              <div className="" >
        //                 {med.responseDetails.map((detail: any, index: any) => (
        //                     <div key={index} className="flex flex-row  items-start  justify-between">
        //                         <div className="text-md font-medium  flex justify-center basis-1/3">
        //                             <span>{detail.updatedAt}:</span>
        //                         </div>
        //                     </div>  
        //                 ))}
        //             </div>

        //         );
        //     },
        //     enableGlobalFilter: false
        // },
        {
            accessorKey: "responseDetails",
            size: 360,
            header: () => (
                <div className="flex flex-row  justify-between">
                    <div className="font-medium text-muted-foreground text-left cursor-default min-w-[120px]">
                        วันอัพเดทล่าสุด
                    </div>
                    <div className="font-medium text-muted-foreground text-left cursor-default min-w-[150px] ">
                        โรงพยาบาลที่ให้ยืม
                    </div>
                    <div className="font-medium text-muted-foreground  cursor-default text-start  min-w-[180px] ">
                        สถานะ(จำนวนยาที่ได้ยืม)
                    </div>
                </div>
            ),
            cell: ({ row }) => {
                const med = row.original;
                const maxDisplay = 3;
                const details = med.responseDetails.slice(0, maxDisplay);
                const hasMore = med.responseDetails.length > maxDisplay;
                //console.log('med', med)
                //console.log("med ssds" ,)
                // const [dialogOpen, setDialogOpen] = useState(false);
                // const handleConfirm = () => {
                //     setDialogOpen(false);
                // }

                return (
                    <div className="" >
                        {med.responseDetails.map((detail: any, index: any) => (
                            <div key={index} className="flex flex-row  items-center  justify-between mt-1">
                                <div className="text-md font-medium  flex justify-start min-w-[120px]">
                                    <span>
                                        {detail.updatedAt && !isNaN(Number(detail.updatedAt))
                                            ? format(new Date(Number(detail.updatedAt)), 'dd/MM/') + (new Date(Number(detail.updatedAt)).getFullYear() + 543)
                                            : "-"}
                                    </span>
                                </div>
                                <div className="basis-1/2 text-wrap w-[120px] truncate overflow-hidden text-ellipsis whitespace-nowrap ">
                                    <span>{detail.respondingHospitalNameTH}</span>
                                </div>
                                <div className="text-md font-medium items-center text-left  justify-start min-w-[180px] ">
                                    <div className={"flex items-center gap-x-1 basis-1/2  justify-start "}>
                                        {detail.status === 'offered' ? (
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
                                                        onClick={() => handleApproveClick({
                                                            ...med,
                                                            responseId: detail.id,
                                                            offeredMedicine: detail.offeredMedicine,
                                                            requestDetails: med.requestMedicine,
                                                            responseDetail: detail,
                                                        })}>
                                                        ได้รับการยืนยัน
                                                        <div className=" text-xs">{detail.offeredMedicine ? "(" + (detail.offeredMedicine.offerAmount) + ")" : "(-)"}</div>
                                                         <SquareCheck className="h-4 w-4" />
                                                    </Button>
                                                </HoverCardTrigger>
                                                <HoverCardContent>
                                                    <div className="text-xs text-red-700 flex justify-center">โปรดยืนยันเมื่อได้รับยาแล้ว</div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        )
                                            : detail.status === 'pending'
                                                ? (<Badge
                                                    variant={'text_status'}
                                                    className={clsx(
                                                        // "flex content-center h-6 font-bold",
                                                        getStatusColor(detail.status),
                                                        getTextStatusColor(detail.status)
                                                    )}
                                                    >
                                                    รอการยืนยันให้ยืม
                                                    <div className=" text-xs">{detail.offeredMedicine ? "(" + (detail.offeredMedicine.offerAmount) + ")" : "(-)"}</div>
                                                </Badge>)
                                                : detail.status === 'to-transfer'
                                                    ? (<Badge
                                                        variant={'text_status'}
                                                        className={clsx(
                                                            // "flex content-center h-6 font-bold",
                                                            getStatusColor(detail.status),
                                                            getTextStatusColor(detail.status)
                                                        )}
                                                    >
                                                        รอรับมอบ
                                                    <div className=" text-xs">{detail.offeredMedicine ? "(" + (detail.offeredMedicine.offerAmount) + ")" : "(-)"}</div>
                                                        {/* <StatusIndicator status={detail.status} /> */}
                                                    </Badge>)
                                                    : detail.status === 'to-return'
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
                                                                        onClick={() => handleconfirReceiveDelivery({
                                                                            ...med,
                                                                            displayHospitalName: detail.respondingHospitalNameTH,
                                                                            displayMedicineName: detail.offeredMedicine.name,
                                                                            displayMedicineAmount: detail.offeredMedicine.offerAmount,//dalog ต้องทำใหม่ให้อัพเดท สเตตัส ให้ถูก
                                                                            responseId: detail.id,
                                                                            offeredMedicine: detail.offeredMedicine,
                                                                            requestDetails: med.requestMedicine,
                                                                        })}>
                                                                        ยืนยันการรับยา
                                                                        <div className=" text-xs">{detail.offeredMedicine ? "(" + (detail.offeredMedicine.offerAmount) + ")" : "(-)"}</div>
                                                                        <SquareCheck className="h-4 w-4" />
                                                                    </Button>
                                                                </HoverCardTrigger>
                                                                <HoverCardContent>
                                                                    <div className="text-xs text-red-700 flex justify-center">โปรดยืนยันเมื่อได้รับยาแล้ว</div>
                                                                </HoverCardContent>
                                                            </HoverCard>
                                                        )
                                                        : detail.status === 'in-return'
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

                                                                            onClick={() => handleReturnClick(
                                                                                {
                                                                                    ...med,
                                                                                    responseId: detail.id,
                                                                                    offeredMedicine: detail.offeredMedicine,
                                                                                    requestDetails: med.requestMedicine,
                                                                                    responseDetail: detail,
                                                                                })
                                                                            }
                                                                        >
                                                                            ส่งคืนยา
                                                                            {(() => {
                                                                                const offeredAmount = Number(detail?.offeredMedicine?.offerAmount ?? 0);
                                                                                const offeredUnitPrice = Number(detail?.offeredMedicine?.pricePerUnit ?? 0);
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
                                                                            <SquareCheck className="h-4 w-4" />
                                                                        </Button>
                                                                    </HoverCardTrigger>
                                                                    {/* <HoverCardContent>
                                                                        <div className="text-xs text-red-700 flex justify-center">โปรดกรอกข้อมูลให้ครบถ้วน</div>
                                                                    </HoverCardContent> */}
                                                                </HoverCard>
                                                            )
                                                            : detail.status === 'confirm-return'
                                                                ? (<Badge
                                                                    variant={'text_status'}
                                                                    className={clsx(
                                                                        // "flex content-center h-6 font-bold",
                                                                        getStatusColor(detail.status),
                                                                        getTextStatusColor(detail.status)
                                                                    )}
                                                                >
                                                                    รอยืนยันการได้รับคืน
                                                                    {(() => {
                                                                        const offeredAmount = Number(detail?.offeredMedicine?.offerAmount ?? 0);
                                                                        const offeredUnitPrice = Number(detail?.offeredMedicine?.pricePerUnit ?? 0);
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
                                                                </Badge>)
                                                                : detail.status === 'returned'
                                                                    ? (
                                                                        <HoverCard>
                                                                            <HoverCardTrigger>
                                                                                <div className="flex flex-row gap-x-2 items-center">
                                                                            
                                                                                <Badge
                                                                                    variant={'text_status'}
                                                                                    className={clsx(
                                                                                        getStatusColor(detail.status),
                                                                                        getTextStatusColor(detail.status),
                                                                                        "cursor-pointer"
                                                                                    )}
                                                                                >

                                                                                    {(() => {
                                                                                        const offeredAmount = Number(detail?.offeredMedicine?.offerAmount ?? 0);
                                                                                        const offeredUnitPrice = Number(detail?.offeredMedicine?.pricePerUnit ?? 0);
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
                                                                                        return detail?.returnMedicine ? `เสร็จสิ้น (${percent.toFixed(0)}%)` :  "เสร็จสิ้น (สนับสนุน)";
                                                                                    })()}
                                                                                </Badge>
                                                                               { detail?.returnMedicine ? (
                                                                                <ReturnPdfMultiButton
                                                                                    data={{
                                                                                        ...med,
                                                                                        respondingHospitalNameTH: detail.respondingHospitalNameTH,
                                                                                        offeredMedicine: detail.offeredMedicine,
                                                                                    }}
                                                                                    returnList={(detail as any).returnMedicine}
                                                                                    buttonText="ออกเอกสาร PDF การคืนยา"
                                                                                />
                                                                               ) : ""}
                                                                                </div>
                                                                            </HoverCardTrigger>
                                                                            <HoverCardContent>
                                                                                <div className="text-sm">
                                                                                    <div className="font-semibold mb-2">รายละเอียดการคืนยา</div>
                                                                                    {(() => {
                                                                                        const rm: any = (detail as any).returnMedicine;
                                                                                        const returnList = Array.isArray(rm) ? rm : (rm ? [rm] : []);
                                                                                        return returnList.map((item: any, idx: number) => {
                                                                                            const nested = item && item.returnMedicine ? item.returnMedicine : item;
                                                                                            const returnAmount = Number(nested?.returnAmount ?? 0);
                                                                                            const returnDate = nested?.returnDate ? new Date(Number(nested.returnDate)) : null;
                                                                                            const formattedDate = returnDate && !isNaN(returnDate.getTime())
                                                                                                ? format(returnDate, 'dd/MM/') + (returnDate.getFullYear() + 543)
                                                                                                : "ไม่ระบุวันที่";
                                                                                            return (
                                                                                                <div key={idx} className="flex justify-between py-1 border-b last:border-b-0">
                                                                                                    <span className="text-xs text-muted-foreground">{formattedDate}</span>
                                                                                                    <span className="text-xs font-medium">{returnAmount.toLocaleString()} หน่วย</span>
                                                                                                </div>
                                                                                            );
                                                                                        });
                                                                                    })()}
                                                                                </div>
                                                                            </HoverCardContent>
                                                                        </HoverCard>
                                                                    )
                                                                    : detail.status === 'cancelled'
                                                                        ? (<Badge
                                                                        variant={'text_status'}
                                                                        className={clsx(
                                                                            // "flex content-center h-6 font-bold",
                                                                            getStatusColor(detail.status),
                                                                            getTextStatusColor(detail.status)
                                                                        )}
                                                                    >
                                                                            ยกเลิก
                                                                            {/* <div className=" text-xs">{detail.offeredMedicine ? "(" + (detail.offeredMedicine.offerAmount) + ")" : "(-)"}</div> */}
                                                                        </Badge>)
                                                                        : null
                                        }
                                        {/* <div className=" text-xs">{detail.offeredMedicine ? "("+(detail.offeredMedicine.offerAmount)+")" : "(-)"}</div> */}
                                    </div>

                                </div>
                            </div>
                        ))}
                        {hasMore && <Button variant={'link'} className="">เพิ่มเติม...</Button>}
                    </div>
                );
            },
        },
        // {
        //     accessorKey: "history",
        //     size: 150,
        //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">สถานะ</div>,
        //     cell: ({ row }: { row: any }) => {
        //         const med = row.original;
        //         const status = med.status;
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