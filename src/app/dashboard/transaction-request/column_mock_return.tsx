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
) => [
        {
            accessorKey: "createdAt",
            size: 100,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันที่แจ้ง</div>,
            cell: ({ row }: { row: any }) => {
                const raw = row.original.createdAt
                const date = new Date(Number(raw)); // convert string to number, then to Date
                const isValid = !isNaN(date.getTime());
                const formattedDate = isValid ? format(date, 'dd/MM/yyyy') : "-"; // format to date only
                const timeOnly = isValid ? format(date, 'HH:mm:ss') : "-"; // format to time only
                return (<div>
                    <div className="text-sm font-medium text-gray-600">{formattedDate}</div>
                    <div className="text-xs text-muted-foreground">{timeOnly}</div>
                </div>);
            }
        },
        {
            accessorKey: "sharingDetails.sharingMedicine.name",
            size: 200,
            header: ({ }) => <div className="font-medium text-muted-foreground text-left cursor-default">Name</div>,
            enableGlobalFilter: true
        },
        {
            accessorKey: "sharingDetails.sharingMedicine.quantity",
            size: 100,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ขนาด/หน่วย</div>,
            enableGlobalFilter: true
        },
        {
            accessorKey: "sharingDetails.sharingMedicine.sharingAmount",
            size: 100,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวนที่ขอยืม</div>,
            enableGlobalFilter: false
        },
        {
            accessorKey: "sharingDetails.sharingReturnTerm.receiveConditions",
            size: 250,
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
                        {value ? <SquareCheck className="text-green-600 w-4 h-4" /> : <SquareX className="text-red-600 w-4 h-4" />}
                        <span>{label}</span>
                    </div>
                );

                if (noReturn) {
                    return (
                        <div className="text-sm font-medium text-gray-600 flex items-center gap-2 justify-center">
                            <SquareCheck className="text-green-600 w-4 h-4" />
                            ไม่ต้องคืน
                        </div>
                    );
                } else {
                    return (
                        <div className="text-sm font-medium text-gray-600 flex flex-row gap-1 ">
                            <div className="basis-1/2 justify-end">
                                {renderCondition("exactType", receiveConditions.exactType)}
                                {renderCondition("supportType", receiveConditions.supportType)}
                            </div>
                            <div className="basis-1/2">
                                {renderCondition("subType", receiveConditions.subType)}
                                {renderCondition("otherType", receiveConditions.otherType)}
                            </div>
                        </div>
                    );
                }
            },
            enableGlobalFilter: false
        },
        {
            accessorKey: "updatedAt",
            size: 100,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันอัพเดทล่าสุด</div>,
            cell: ({ row }: { row: any }) => {
                const raw = row.original.updatedAt
                const date = new Date(Number(raw)); // convert string to number, then to Date
                const isValid = !isNaN(date.getTime());
                const formattedDate = isValid ? format(date, 'dd/MM/yyyy') : "-"; // format to date only
                const timeOnly = isValid ? format(date, 'HH:mm:ss') : "-"; // format to time only
                return (<div>
                    <div className="text-sm font-medium text-gray-600">{formattedDate}</div>
                    <div className="text-xs text-muted-foreground">{timeOnly}</div>
                </div>);
            }
        },
        {
            accessorKey: "status",
            size: 350,
            header: () => <div className="font-medium text-muted-foreground  text-center cursor-default flex flex-row  justify-between">
                <div className="flex justify-center basis-1/3">โรงพยาบาลที่ให้ยืม</div>
                <div className="flex justify-center basis-1/3">สถานะ(จำนวนยาที่ได้ยืม)</div>
                <div className="flex justify-center basis-1/6"><History className="w-4 h-4 text-muted-foreground cursor-pointer" /></div>
            </div>,
            cell: ({ row }: { row: any }) => {
                const med = row.original;
                const postingHospitalName = med.sharingDetails?.postingHospitalNameTH || "ไม่ระบุ";
                console.log('sharingDetails.sharingMedicine====', med.status)
                const responseAmount = med.acceptedOffer?.responseAmount || "-";
                const status = row.original.status;
                // console.log('status', status)
                // console.log('mock data med', med)
                return <div className="flex flex-row  items-center  justify-between">
                    <div className="text-sm font-medium text-gray-600 flex justify-center basis-1/3">
                        {postingHospitalName} :
                    </div>
                    <div className="text-sm font-medium text-gray-600 flex justify-center basis-1/3">
                        {

                            status === 'to-transfer' ? (
                                <div className="flex items-center">
                                    <Button variant={"link"} className="flex " disabled>รอส่งมอบ<StatusIndicator status={status} /></Button>
                                    <div>( {responseAmount} )</div>
                                </div>
                            ) : status === 'to-confirm' ? (
                                <div className="flex items-center">
                                    <Button variant={"link"} className="flex " onClick={() =>
                                        handleConfirmReceiveDelivery({
                                            ...med,
                                            displayHospitalName: med.sharingDetails.postingHospitalNameTH,
                                            displayMedicineName: med.sharingDetails.sharingMedicine.name,
                                            displayMedicineAmount: med.acceptedOffer.responseAmount,
                                            // displayHospi
                                        })}>ยืนยันการรับของ<StatusIndicator status={status} /></Button>
                                    <div>( {responseAmount} )</div>
                                </div>
                            ) : status === 'offered' ? (
                                <div className="flex items-center">
                                    <Button variant={"link"} className="flex " disabled>offered<StatusIndicator status={status} /></Button>
                                    <div>( {responseAmount} )</div>
                                </div>
                            ) : status === 're-confirm' ? (
                                <div className="flex items-center">
                                    <Button variant={"link"} className="flex " disabled>re-confirm<StatusIndicator status={status} /></Button>
                                    <div>( {responseAmount} )</div>
                                </div>
                            )
                                : status === 'in-return' ? (
                                    <div className="flex items-center">
                                        <Button variant={"link"} className="flex " onClick={() => handleReturnSharingClick(med)}>ต้องส่งคืน<StatusIndicator status={status} /></Button>
                                        <div>( {responseAmount} )</div>
                                    </div>
                                ) : status === 'returned' ? (
                                    <div className="flex items-center">
                                        <Button variant={"link"} className="flex  " disabled >เสร็จสิ้น<StatusIndicator status={status} /></Button>
                                        <div>( {responseAmount} )</div>
                                    </div>
                                ) : status === 'confirm-return' ? (
                                    <div className="flex items-center">
                                        <Button variant={"link"} className="flex " >รอยืนยันการคืน<StatusIndicator status={status} /></Button>
                                        <div>( {responseAmount} )</div>
                                    </div>
                                ) : null
                        }
                    </div>
                    <div className="flex justify-center basis-1/6"><History className="w-4 h-4 text-muted-foreground cursor-pointer" /></div>
                </div>
            }
        },
    ]