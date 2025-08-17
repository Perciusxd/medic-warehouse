'use client'
import { useForm } from "react-hook-form"
import { z } from "zod"
// Thai date formatting helper (Buddhist calendar)
const formatThaiDate = (input: string | number | Date | undefined): string => {
    if (!input) return '';
    let date: Date;
    if (input instanceof Date) {
        date = input;
    } else if (typeof input === 'string') {
        date = isNaN(Number(input)) ? new Date(input) : new Date(Number(input));
    } else {
        date = new Date(input);
    }
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date);
}
// import { format, formatDate, sub } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRef, useState } from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
// import PdfPreview from "@/components/ui/preview_pdf"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Hospital, Pill, Package, ArrowRight, DollarSign, Clock, CheckCircle2, AlertCircle, FileText } from "lucide-react"

import dynamic from 'next/dynamic';
const SharingPdfPreview = dynamic(() => import('@/components/ui/pdf_creator/sharing_pdf'), { ssr: false });
import { useAuth } from "@/components/providers";

function SharingDetailPanel({ data }: any) {
    const { createdAt, postingHospitalNameTH, sharingMedicine, sharingReturnTerm } = data;
    const { name, sharingAmount, quantity, pricePerUnit, manufacturer, unit } = sharingMedicine || {};
    const totalPrice = sharingAmount * pricePerUnit;

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Package className="h-5 w-5" />
                    รายละเอียดการแบ่งปัน
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Date and Hospital */}
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <CalendarDays className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">วันที่:</span>
                        <span className="text-sm text-blue-700">{formatThaiDate(createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <Hospital className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">โรงพยาบาล:</span>
                        <span className="text-sm text-green-700">{postingHospitalNameTH}</span>
                    </div>
                </div>

                {/* Medicine Information */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center gap-2 mb-3">
                        <Pill className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold text-purple-800">ข้อมูลยา</span>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">ชื่อยา:</span>
                            <span className="font-medium text-gray-900">{name}</span>
                        </div>
                        {manufacturer && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">ผู้ผลิต:</span>
                                <span className="text-sm text-gray-700">{manufacturer}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">จำนวนแบ่งปัน:</span>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                {sharingAmount} {unit || quantity}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">ราคาต่อหน่วย:</span>
                            <span className="text-sm text-gray-700">{pricePerUnit} บาท</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-medium text-gray-800 flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ราคารวม:
                            </span>
                            <Badge variant="default" className="bg-purple-600 text-white text-base px-3 py-1">
                                {totalPrice.toLocaleString()} บาท
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Expected Return Date */}
                {sharingReturnTerm?.expectedReturnDate && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">คาดว่าจะได้รับคืน:</span>
                        <span className="text-sm text-amber-700 font-medium">
                            {formatThaiDate(sharingReturnTerm.expectedReturnDate)}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
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

    const getReturnTermBadges = (returnTerm: any) => {
        const activeTerms = Object.keys(returnTerm).filter(key => returnTerm[key] === true);
        return activeTerms.map(term => returnTermLabels[term] || term);
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    รายละเอียดการยอมรับ
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Response Date and Hospital */}
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CalendarDays className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">วันที่ตอบรับ:</span>
                        <span className="text-sm text-green-700">{formatThaiDate(responseDetail?.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <Hospital className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">โรงพยาบาลผู้รับ:</span>
                        <span className="text-sm text-blue-700">{respondingHospitalNameTH}</span>
                    </div>
                </div>

                {/* Requested Medicine Details */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center gap-2 mb-3">
                        <Pill className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-800">ยาที่ขอรับ</span>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">ชื่อยา:</span>
                            <span className="font-medium text-gray-900">{sharingMedicine.name}</span>
                        </div>
                        {sharingMedicine.manufacturer && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">ผู้ผลิต:</span>
                                <span className="text-sm text-gray-700">({sharingMedicine.manufacturer})</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">จำนวนที่ขอ:</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {acceptedOffer.responseAmount}/{sharingMedicine.unit}
                            </Badge>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-medium text-gray-800 flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                มูลค่ารวม:
                            </span>
                            <Badge variant="default" className="bg-green-600 text-white text-base px-3 py-1">
                                {totalPrice.toLocaleString()} บาท
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Return Terms */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
                    <div className="flex items-center gap-2 mb-3">
                        <ArrowRight className="h-4 w-4 text-orange-600" />
                        <span className="font-semibold text-orange-800">เงื่อนไขการส่งคืน</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {getReturnTermBadges(returnTerm).length > 0 ? (
                            getReturnTermBadges(returnTerm).map((term, index) => (
                                <Badge key={index} variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                                    {term}
                                </Badge>
                            ))
                        ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                ไม่ระบุเงื่อนไข
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
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
    const { user } = useAuth();
    // console.log('user data at confirm sharing dialog', user)
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
        console.log('onsubmit data', data)
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
        <Dialog  open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[600px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800 pb-2">
                        <FileText className="h-5 w-5" />
                        {dialogTitle}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col overflow-y-hidden" >
                    <div className="flex-1 overflow-y-auto pr-6">
                        <div className="grid gap-6 ">
                            <div className="space-y-4">
                                <SharingDetailPanel data={data} />
                                <AcceptanceDetailPanel responseData={data} />
                            </div>

                            {/* <div className="flex flex-col">
                                <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
                                    <div className="bg-gray-50 px-4 py-2 border-b">
                                        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            ตัวอย่างเอกสาร
                                        </h3>
                                    </div>
                                    <div className="p-2">
                                        <SharingPdfPreview data={data} userData={user} ref={pdfRef} />
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-4 border-t">
                        <Button
                            type="submit"
                            className="min-w-[160px] bg-green-600 hover:bg-green-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <LoadingSpinner className="h-4 w-4" />
                                    กำลังยืนยัน...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    ยืนยันการแบ่งปัน
                                </span>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSavePdf}
                            className="min-w-[120px]"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            บันทึก PDF
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            ยกเลิก
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 