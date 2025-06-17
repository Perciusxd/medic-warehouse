'use client'
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { formatDate } from "@/lib/utils"
// import { format, formatDate, sub } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
// import PdfPreview from "@/components/ui/preview_pdf"
import { Separator } from "@/components/ui/separator"

import { Calendar1Icon, ShieldAlert } from "lucide-react"

import RequestDetails from "./request-details"

import dynamic from 'next/dynamic';
const PdfPreview = dynamic(() => import('@/components/ui/preview_pdf'), { ssr: false });

function RequestDetailPanel({ data }: any) {
    const { updatedAt, postingHospitalNameTH, name, requestDetails, requestTerm } = data;
    const { requestAmount, quantity, pricePerUnit } = requestDetails || {};
    const totalPrice = requestAmount * pricePerUnit;

    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">รายละเอียดการขอยืม</h2>
            <div className="grid grid-rows-2 gap-1 font-light">
                <div>วันที่ {formatDate(updatedAt)}</div>
                <div>{postingHospitalNameTH}</div>
                <div>ขอยืมยา {name}</div>
                <div>จำนวน {requestAmount} {quantity} เป็นเงิน {totalPrice} บาท</div>
                <div>คาดว่าจะส่งคืนวันที่ {formatDate(requestTerm?.expectedReturnDate)}</div>
            </div>
        </div>
    );
}


function ResponseDetailPanel({ responseData }: any) {
    const {
        offeredMedicine,
        responseDetails,
        responseId,
        updatedAt
    } = responseData;

    const totalPrice = offeredMedicine.pricePerUnit * offeredMedicine.offerAmount;

    const responseDetail = responseDetails.find((item:any) => item.id === responseId);
    const respondingHospitalNameTH = responseDetail?.respondingHospitalNameTH || "-";

    const returnTermLabels: any = {
        exactType: "ส่งคืนตามประเภท",
        otherType: "คืนรายการอื่น",
        supportType: "แบบสนับสนุน",
        subType: "คืนรายการทดแทน"
    };

    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">รายละเอียดการตอบรับ</h2>
            <div className="grid grid-rows-2 gap-1 font-light">
                <div>วันที่ {formatDate(updatedAt)}</div>
                <div>{respondingHospitalNameTH}</div>
                <div>
                    ให้ยืมยา {offeredMedicine.name} ({offeredMedicine.manufacturer})
                    จำนวน {offeredMedicine.offerAmount}/{offeredMedicine.unit}
                    เป็นเงิน {totalPrice}
                </div>
                <div className="flex flex-row gap-2">
                    <div>โดยเงื่อนไขการส่งคืน:</div>
                    <div>{returnTermLabels[offeredMedicine.returnTerm] || "ไม่ระบุ"}</div>
                </div>
            </div>
        </div>
    );
}


function getConfirmationSchema(requestData: any) {
    return z.object({
        responseId: z.string(),
        offeredMedicine: z.object({
            name: z.string(),
            unit: z.string(),
            // quantity: z.string(),
            offerAmount: z.number()
                .min(1, "กรุณากรอกมากว่า 0")
                .max(requestData.requestAmount, `กรุณากรอกน้อยกว่า ${requestData.requestAmount}`),
            trademark: z.string(),
            pricePerUnit: z.number()
                .min(1, "Price per unit must be greater than 0")
                .max(100000, "Price per unit must be less than 100000"),
            manufacturer: z.string(),
            returnTerm: z.enum(["exactType", "subType"]),
            returnConditions: z.object({
                exactType: z.boolean(),
                subType: z.boolean(),
                otherType: z.boolean(),
                supportType: z.boolean(),
            }),
        }),
    });
}

export default function ConfirmResponseDialog({ data, dialogTitle, status, openDialog, onOpenChange }: any) {
    const pdfRef = useRef<{ savePdf?: () => void }>(null);
    const [loading, setLoading] = useState(false);

    const requestData = data.requestDetails;
    const ConfirmSchema = getConfirmationSchema(requestData);

    const {
        register,
        getValues,
        watch,
        handleSubmit,
    } = useForm<z.infer<typeof ConfirmSchema>>({
        resolver: zodResolver(ConfirmSchema),
        defaultValues: {
            responseId: data.responseId,
            offeredMedicine: {
                name: data.offeredMedicine.name,
                unit: data.offeredMedicine.unit,
                offerAmount: data.offeredMedicine.offerAmount,
                trademark: data.offeredMedicine.trademark,
                pricePerUnit: data.offeredMedicine.pricePerUnit,
                manufacturer: data.offeredMedicine.manufacturer,
                returnTerm: data.offeredMedicine.returnTerm,
                returnConditions: { ...data.offeredMedicine.returnConditions },
            },
        }
    });

    const handleSavePdf = () => {
        pdfRef.current?.savePdf?.();
    };

    const onSubmit = async (formData: z.infer<typeof ConfirmSchema>) => {
        setLoading(true);

        try {
            const response = await fetch("/api/updateRequest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, status }),
            });

            if (!response.ok) throw new Error("Failed to submit");

            await response.json();
            onOpenChange(false);
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[80vw]">
                <DialogTitle>{dialogTitle}</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="basis-[60%]">
                            <RequestDetailPanel data={data} />
                            <Separator className="my-4" />
                            <ResponseDetailPanel responseData={data} />
                        </div>

                        <div className="basis-[40%] overflow-auto border rounded-md shadow-sm">
                            <PdfPreview data={data} ref={pdfRef} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit">
                            {loading ? (
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <LoadingSpinner /> ยืนยันการให้ยืม
                                </span>
                            ) : (
                                "ยืนยันการให้ยืม"
                            )}
                        </Button>
                        <Button variant="outline" onClick={handleSavePdf}>Save PDF</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}