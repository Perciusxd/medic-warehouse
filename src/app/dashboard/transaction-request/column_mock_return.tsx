"use client"

import { Button } from "@/components/ui/button";
import StatusIndicator from "@/components/ui/status-indicator";
import { access } from "fs";
import { format } from "date-fns"
import { ArrowUpDown, Pencil, MoreHorizontal, Check, Trash2, Copy, CheckCircle2Icon, LoaderIcon, ShieldAlertIcon, Truck, Clock, TicketCheck, BookDown, BookUp, SquareX, SquareCheck, History } from "lucide-react"
import { _maxSize } from "zod/v4/core";
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
                ชื่อยา/ชื่อการค้า
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
                        <div className="text-xs text-muted-foreground">ขื่อการค้า : {trademark}</div>
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
            size: 280,
            header: () => (
                <div className="font-medium text-muted-foreground text-center cursor-default">
                    <div>เงื่อนไขการคืนยา</div>
                </div>
            ),
            cell: ({ row }: { row: any }) => {
                const med = row.original;
                const receiveConditions = med.sharingDetails?.sharingReturnTerm?.receiveConditions || {};

                const noReturn = receiveConditions.noReturn;

                const renderCondition = (label: string, value: boolean) => (
                    <div className="flex items-center gap-2">
                        {value ? <SquareCheck className="text-green-600 w-5 h-5" /> : <SquareX className="text-red-600 w-5 h-5" />}
                        <span>{label}</span>
                    </div>
                );

                if (noReturn) {
                    return (
                        <div className="text-sm font-medium  flex items-center gap-2 justify-start">
                            <SquareCheck className="text-green-600 w-5 h-5" />
                            ไม่คืน
                        </div>
                    );
                } else {
                    return (
                        <div className="text-md font-medium  flex flex-row gap-2">
                            <div className="basis-1/2 justify-end flex flex-col ">
                                {renderCondition("คืนรายการที่ให้ยืม", receiveConditions.exactType)}
                                {renderCondition("คืนรายการทดแทน", receiveConditions.supportType)}
                            </div>
                            <div className="basis-1/2 flex flex-col">
                                {renderCondition("ขอสนับสนุน", receiveConditions.subType)}
                                {renderCondition("คืนรายการอื่นได้", receiveConditions.otherType)}
                            </div>
                        </div>
                    );
                }
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
                //console.log("med sharing",med)
                const postingHospitalName = med.sharingDetails?.postingHospitalNameTH || "ไม่ระบุ";

                const responseAmount = med.acceptedOffer?.responseAmount || "-";
                const status = row.original.status;

                return <div className="flex flex-row  items-center  justify-between">
                    <div className="text-sm font-medium text-gray-600 flex justify-start basis-1/2">
                        {postingHospitalName} :
                    </div>
                    <div className="text-sm font-medium text-gray-600 flex justify-start basis-1/2">
                        {

                            status === 'to-transfer' ? (
                                <div className="flex items-center gap-x-2">
                                    <div className="flex gap-x-2" >รอรับมอบ<StatusIndicator status={status} /></div>
                                    {/* <div>( {responseAmount} )</div> */}
                                </div>
                            ) : status === 'to-confirm' ? (
                                <div className="flex flex-col items-center gap-x-2">
                                    <Button variant={"link"} className="flex gap-x-2" onClick={() =>
                                        handleConfirmReceiveDelivery({
                                            ...med,
                                            displayHospitalName: med.sharingDetails.postingHospitalNameTH,
                                            displayMedicineName: med.sharingDetails.sharingMedicine.name,
                                            displayMedicineAmount: med.acceptedOffer.responseAmount,
                                            // displayHospi
                                        })}>ยืนยันการรับของ<StatusIndicator status={status} /></Button>
                                        <span>(กดได้เมื่อได้รับการยืนยัน)</span>
                                    {/* <div>( {responseAmount} )</div> */}
                                </div>
                            ) : status === 'offered' ? (
                                <div className="flex flex-col items-start gap-x-2 cursor-not-allowed">
                                    <div className="flex gap-x-2 text-muted-foreground" >แจ้งขอยืม<StatusIndicator status={status} /></div>
                                    <span className="text-xs font-extralight text-muted-foreground">(กดได้เมื่อได้รับการยืนยัน)</span>
                                    {/* <div>( {responseAmount} )</div> */}
                                </div>
                            ) : status === 're-confirm' ? (
                                <div className="flex items-center gap-x-2">
                                    <div className="flex" >
                                        <Button variant={"link"} className="flex gap-x-2" onClick={() =>
                                            handleReconfirmClickSharingTicket({ 
                                                sharingMedicineDetail: med.sharingDetails,
                                                responseDetail: med,
                                                ...med
                                             })
                                        }>
                                            ยืนยันการขอยืม<StatusIndicator status={status} />
                                        </Button>
                                    </div>
                                    {/* <div>( {responseAmount} )</div> */}
                                </div>
                            )
                                : status === 'in-return' ? (
                                    <div className="flex items-center gap-x-2">
                                        <Button variant={"link"} className="flex gap-x-2" onClick={() => handleReturnSharingClick(med)}>ต้องส่งคืน<StatusIndicator status={status} /></Button>
                                        {/* <div>( {responseAmount} )</div> */}
                                    </div>
                                ) : status === 'returned' ? (
                                    <div className="flex items-center gap-x-2">
                                        <div className="flex  gap-x-2"  >เสร็จสิ้น<StatusIndicator status={status} /></div>
                                        {/* <div>( {responseAmount} )</div> */}
                                    </div>
                                ) : status === 'confirm-return' ? (
                                    <div className="flex flex-col items-start gap-x-2 cursor-not-allowed">
                                        <div className="flex gap-x-2" >รอยืนยันการคืน<StatusIndicator status={status} /></div>
                                        <div className="text-xs font-extralight text-muted-foreground">(กดได้เมื่อได้รับการยืนยัน)</div>
                                        {/* <div>( {responseAmount} )</div> */}
                                    </div>
                                ) : null
                        }
                    </div>
                </div>
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