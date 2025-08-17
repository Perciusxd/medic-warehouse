'use client'
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { formatDate } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRef, useState } from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"// import PdfPreview from "@/components/ui/preview_pdf"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { CalendarDays, Hospital, Pill, Package, ArrowRight, DollarSign, Clock, CheckCircle2, AlertCircle, FileText } from "lucide-react"

import dynamic from 'next/dynamic';
const PdfPreview = dynamic(() => import('@/components/ui/pdf_creator/preview_pdf'), { ssr: false });
import { useAuth } from "@/components/providers";

function RequestDetailPanel({ data }: any) {
    const { updatedAt, postingHospitalNameTH, requestDetails, requestTerm, manufacturer } = data;
    const { name, requestAmount, unit, pricePerUnit } = requestDetails || {};
    const totalPrice = requestAmount * pricePerUnit;

    return (
        <Card className="w-full">
            <CardHeader className="">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Package className="h-5 w-5" />
                    รายละเอียดการขอยืม
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Date and Hospital */}
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                        <CalendarDays className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">วันที่:</span>
                        <span className="text-sm text-amber-700">{formatDate(updatedAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <Hospital className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">โรงพยาบาล:</span>
                        <span className="text-sm text-blue-700">{postingHospitalNameTH}</span>
                    </div>
                </div>

                {/* Medicine Information */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center gap-2 mb-3">
                        <Pill className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold text-purple-800">ข้อมูลยาที่ขอยืม</span>
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
                            <span className="text-sm text-gray-600">จำนวนที่ขอยืม:</span>
                            <Badge variant="default" className="bg-purple-100 text-purple-800">
                                {requestAmount} {unit}
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
                {requestTerm?.expectedReturnDate && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">คาดว่าจะส่งคืน:</span>
                        <span className="text-sm text-amber-700 font-medium">
                            {formatDate(requestTerm.expectedReturnDate)}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
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
    
    const getReturnTermBadges = (returnTerm: any) => {
        const activeTerms = Object.keys(returnTerm).filter(key => returnTerm[key] === true);
        return activeTerms.map(term => returnTermLabels[term] || term);
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    รายละเอียดการตอบรับ
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Response Date and Hospital */}
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                        <CalendarDays className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">วันที่ตอบรับ:</span>
                        <span className="text-sm text-amber-700">{formatDate(updatedAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <Hospital className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">โรงพยาบาลผู้รับ:</span>
                        <span className="text-sm text-green-700">{respondingHospitalNameTH}</span>
                    </div>
                </div>

                {/* Requested Medicine Details */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center gap-2 mb-3">
                        <Pill className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-800">ยาที่ให้ยืม</span>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">ชื่อยา:</span>
                            <span className="font-medium text-gray-900">{offeredMedicine.name}</span>
                        </div>
                        {offeredMedicine.manufacturer && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">ผู้ผลิต:</span>
                                <span className="text-sm text-gray-700">({offeredMedicine.manufacturer})</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">จำนวนที่ให้:</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {offeredMedicine.offerAmount} {offeredMedicine.unit}
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
                        {getReturnTermBadges(offeredMedicine.returnConditions).length > 0 ? (
                            getReturnTermBadges(offeredMedicine.returnConditions).map((term, index) => (
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
    const { user } = useAuth();
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
            //console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog  open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1200px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800 pb-2">
                        <FileText className="h-5 w-5" />
                        {dialogTitle}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col overflow-y-hidden" >
                    <div className="flex-1 overflow-y-auto pr-6">
                        <div className="grid lg:grid-cols-2 gap-6 ">
                            <div className="space-y-4">
                                <RequestDetailPanel data={data} />
                                <ResponseDetailPanel responseData={data} />
                            </div>

                            <div className="flex flex-col">
                                <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
                                    <div className="bg-gray-50 px-4 py-2 border-b">
                                        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            ตัวอย่างเอกสาร
                                        </h3>
                                    </div>
                                    <div className="p-2 ">
                                        <PdfPreview data={data} userData={user} ref={pdfRef} />
                                    </div>
                                </div>
                            </div>
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
                                    ยืนยันการขอยืม
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