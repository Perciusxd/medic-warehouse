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

function SharingDetailPanel({ data }: any) {
    const { createdAt, postingHospitalNameTH, sharingMedicine, sharingReturnTerm } = data;
    const { name, sharingAmount, quantity, pricePerUnit } = sharingMedicine || {};
    const totalPrice = sharingAmount * pricePerUnit;

    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">รายละเอียดการแบ่งปัน</h2>
            <div className="grid grid-rows-2 gap-1 font-light">
                <div>วันที่ {formatDate(createdAt)}</div>
                <div>{postingHospitalNameTH}</div>
                <div>แบ่งปันยา {name}</div>
                <div>จำนวน {sharingAmount} {quantity} เป็นเงิน {totalPrice} บาท</div>
                <div>คาดว่าจะได้รับคืนวันที่ {formatDate(sharingReturnTerm?.expectedReturnDate)}</div>
            </div>
        </div>
    );
}


function AcceptanceDetailPanel({ responseData }: any) {
    const {
        responseDetails,
        responseId,
        sharingMedicine
    } = responseData;

    const responseDetail = responseDetails.find((item:any) => item.id === responseId);
    const respondingHospitalNameTH = responseDetail?.respondingHospitalNameTH || "-";
    const acceptedOffer = responseDetail?.acceptedOffer || {};
    const returnTerm = responseDetail?.returnTerm || {};
    
    const totalPrice = sharingMedicine.pricePerUnit * acceptedOffer.responseAmount;

    const returnTermLabels: any = {
        exactType: "ส่งคืนตามประเภท",
        otherType: "คืนรายการอื่น",
        supportType: "แบบสนับสนุน",
        subType: "คืนรายการทดแทน"
    };

    const getReturnTermText = (returnTerm: any) => {
        const activeTerms = Object.keys(returnTerm).filter(key => returnTerm[key] === true);
        return activeTerms.map(term => returnTermLabels[term] || term).join(", ") || "ไม่ระบุ";
    };

    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">รายละเอียดการยอมรับ</h2>
            <div className="grid grid-rows-2 gap-1 font-light">
                <div>วันที่ {formatDate(responseDetail?.createdAt)}</div>
                <div>{respondingHospitalNameTH}</div>
                <div>
                    ขอรับยา {sharingMedicine.name} ({sharingMedicine.manufacturer})
                    จำนวน {acceptedOffer.responseAmount}/{sharingMedicine.unit}
                    เป็นเงิน {totalPrice}
                </div>
                <div className="flex flex-row gap-2">
                    <div>โดยเงื่อนไขการส่งคืน:</div>
                    <div>{getReturnTermText(returnTerm)}</div>
                </div>
            </div>
        </div>
    );
}


function getConfirmationSchema(sharingData: any) {
    return z.object({
        responseId: z.string(),
        acceptedOffer: z.object({
            responseAmount: z.number()
                .min(1, "กรุณากรอกมากว่า 0")
                .max(sharingData.sharingAmount, `กรุณากรอกน้อยกว่า ${sharingData.sharingAmount}`),
            expectedReturnDate: z.string(),
        }),
        returnTerm: z.object({
            exactType: z.boolean(),
            subType: z.boolean(),
            otherType: z.boolean(),
            supportType: z.boolean(),
            noReturn: z.boolean(),
        }),
    });
}

export default function ConfirmSharingDialog({ data, dialogTitle, status, openDialog, onOpenChange }: any) {
    const pdfRef = useRef<{ savePdf?: () => void }>(null);
    const [loading, setLoading] = useState(false);

    const sharingData = data.sharingMedicine;
    const ConfirmSchema = getConfirmationSchema(sharingData);

    // Get the response detail for this specific response
    const responseDetail = data.responseDetails.find((item: any) => item.id === data.responseId);
    const acceptedOffer = responseDetail?.acceptedOffer || {};
    const returnTerm = responseDetail?.returnTerm || {};

    const {
        register,
        getValues,
        watch,
        handleSubmit,
    } = useForm<z.infer<typeof ConfirmSchema>>({
        resolver: zodResolver(ConfirmSchema),
        defaultValues: {
            responseId: data.responseId,
            acceptedOffer: {
                responseAmount: acceptedOffer.responseAmount || 0,
                expectedReturnDate: acceptedOffer.expectedReturnDate || "",
            },
            returnTerm: {
                exactType: returnTerm.exactType || false,
                subType: returnTerm.subType || false,
                otherType: returnTerm.otherType || false,
                supportType: returnTerm.supportType || false,
                noReturn: returnTerm.noReturn || false,
            },
        }
    });

    const handleSavePdf = () => {
        pdfRef.current?.savePdf?.();
    };

    const onSubmit = async (formData: z.infer<typeof ConfirmSchema>) => {
        setLoading(true);

        try {
            const sharingId = data.responseId; // Get the sharing ID from the data
            const response = await fetch("/api/updateSharingStatus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sharingId, status }),
            });
            console.log('formData', JSON.stringify({ sharingId, status }))

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
            <DialogContent className="max-w-[1000px]">
                <DialogTitle>{dialogTitle}</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex gap-10">
                        <div className="">
                            <SharingDetailPanel data={data} />
                            <Separator className="my-4" />
                            <AcceptanceDetailPanel responseData={data} />
                        </div>

                        <div className=" overflow-auto border rounded-md shadow-sm max-w-fit">
                            <PdfPreview data={data} ref={pdfRef} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit">
                            {loading ? (
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <LoadingSpinner /> ยืนยันการแบ่งปัน
                                </span>
                            ) : (
                                "ยืนยันการแบ่งปัน"
                            )}
                        </Button>
                        <Button variant="outline" onClick={handleSavePdf}>Save PDF</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 