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
import { zodResolver } from "@hookform/resolvers/zod"
import { useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"// import PdfPreview from "@/components/ui/preview_pdf"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { FileText } from "lucide-react"

import dynamic from 'next/dynamic';
const PdfPreview = dynamic(() => import('@/components/ui/pdf_creator/preview_pdf'), { ssr: false });
import { useAuth } from "@/components/providers";
import CancelDialog from "./cancel-dialog";

function RequestDetailPanel({ data }: any) {
    console.log('requestdetailpanel', data)
    const { updatedAt, postingHospitalNameTH, requestDetails, requestTerm } = data;
    const { name, requestAmount, unit, pricePerUnit, manufacturer } = requestDetails || {};
    const totalPrice = requestAmount * pricePerUnit;

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <Label>วันที่แจ้ง</Label>
                    <Input disabled value={formatThaiDate(updatedAt)} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>โรงพยาบาลที่แจ้ง</Label>
                    <Input disabled value={postingHospitalNameTH} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ชื่อยา</Label>
                    <Input disabled value={name} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>รูปแบบ/หน่วย</Label>
                    <Input disabled value={unit} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ผู้ผลิต</Label>
                    <Input disabled value={manufacturer || ""} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>จำนวนที่ขอยืม</Label>
                    <Input disabled value={requestAmount} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ราคาต่อหน่วย</Label>
                    <Input disabled value={typeof pricePerUnit === 'number' ? pricePerUnit.toFixed(2) : pricePerUnit} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ราคารวม</Label>
                    <Input disabled value={new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalPrice)} />
                </div>
            </div>
            {requestTerm?.expectedReturnDate && (
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                        <Label>คาดว่าจะส่งคืน</Label>
                        <Input disabled value={formatThaiDate(requestTerm.expectedReturnDate)} />
                    </div>
                </div>
            )}
        </div>
    );
}

function ResponseDetailPanel({ responseData }: any) {
    const {
        offeredMedicine,
        responseDetails,
        responseId,
        updatedAt,
        requestTerm
    } = responseData;

    const totalPrice = offeredMedicine.pricePerUnit * offeredMedicine.offerAmount;

    const responseDetail = responseDetails.find((item: any) => item.id === responseId);
    const respondingHospitalNameTH = responseDetail?.respondingHospitalNameTH || "-";
    const { returnConditions } = requestTerm;
    console.log("returnConditions", returnConditions)

    return (
        <div className="flex flex-col gap-4">
            <Separator />
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <Label>วันที่ตอบรับ</Label>
                    <Input disabled value={formatThaiDate(updatedAt)} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>โรงพยาบาลผู้รับ</Label>
                    <Input disabled value={respondingHospitalNameTH} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ยาที่ให้ยืม</Label>
                    <Input disabled value={offeredMedicine.name} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>รูปแบบ/หน่วย</Label>
                    <Input disabled value={offeredMedicine.unit} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ผู้ผลิต</Label>
                    <Input disabled value={offeredMedicine.manufacturer || ""} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>จำนวนที่ให้</Label>
                    <Input disabled value={offeredMedicine.offerAmount} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ราคาต่อหน่วย</Label>
                    <Input disabled value={typeof offeredMedicine.pricePerUnit === 'number' ? offeredMedicine.pricePerUnit.toFixed(2) : offeredMedicine.pricePerUnit} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>มูลค่ารวม</Label>
                    <Input disabled value={`${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalPrice)} บาท`} />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Label>เงื่อนไขการส่งคืน</Label>
                {returnConditions.condition === "exactType" && (
                    <Badge variant="outline">ส่งคืนรายการนี้</Badge>
                )}
                {returnConditions.condition === "otherType" && (
                    <div>
                        <Badge variant="outline">ส่งคืนรายการอื่น

                        <Badge variant="secondary">{returnConditions.otherTypeSpecification}</Badge>
                        </Badge>
                    </div>
                )}
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
            offerAmount: z.coerce.number({ required_error: "กรุณากรอกจำนวนที่ให้ยืม" })
                .gt(0, "กรุณากรอกมากว่า 0")
                .max(requestData.requestAmount, `กรุณากรอกน้อยกว่า ${requestData.requestAmount}`),
            trademark: z.string(),
            pricePerUnit: z.coerce.number({ required_error: "กรุณากรอกราคาต่อหน่วย" })
                .gt(0, "ราคาต่อหน่วยต้องมากกว่า 0")
                .max(100000, "ราคาต่อหน่วยต้องไม่เกิน 100,000"),
            manufacturer: z.string(),
            returnTerm: z.string(),
            returnConditions: z.object({
                condition: z.string(),
                otherTypeSpecification: z.string().optional(),
            }),
        }),
    });
}

export default function ConfirmResponseDialog({ data, dialogTitle, status, openDialog, onOpenChange }: any) {
    const { user } = useAuth();
    const pdfRef = useRef<{ savePdf?: () => void }>(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
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
            responseId: String(data.responseId ?? ""),
            offeredMedicine: {
                name: String(data.offeredMedicine?.name ?? ""),
                unit: String(data.offeredMedicine?.unit ?? ""),
                offerAmount: Number(data.offeredMedicine?.offerAmount ?? 0),
                trademark: String(data.offeredMedicine?.trademark ?? ""),
                pricePerUnit: Number(data.offeredMedicine?.pricePerUnit ?? 0),
                manufacturer: String(data.offeredMedicine?.manufacturer ?? ""),
                returnTerm: data.offeredMedicine?.returnTerm ?? "exactType",
                returnConditions: { ...(data.offeredMedicine?.returnConditions ?? { condition: "exactType", otherTypeSpecification: "" }) },
            },
        }
    });

    const handleSavePdf = () => {
        pdfRef.current?.savePdf?.();
    };

    const handleCancel = () => {
        setCancelDialogOpen(true);
    }

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
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 max-w-[1400px]">
                <div className="flex flex-col max-h-[90vh]">
                    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-t-xl">
                        <div className="px-6 py-4">
                            <DialogTitle className="text-xl font-semibold text-foreground">{dialogTitle}</DialogTitle>
                        </div>
                    </div>

                    <div className="overflow-y-auto px-6 py-5">
                        <form id="confirm-response-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid lg:grid-cols-2 gap-6 ">
                                <div className="space-y-4">
                                    <RequestDetailPanel data={data} />
                                    <ResponseDetailPanel responseData={data} />
                                </div>

                                <div className="flex flex-col">
                                    <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
                                        <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                ตัวอย่างเอกสาร
                                            </h3>
                                        </div>
                                        <div className="p-2">
                                            <PdfPreview data={data} userData={user} ref={pdfRef} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-b-2xl">
                        <DialogFooter className="px-6 py-4">
                            <Button className="min-w-[160px]" type="submit" form="confirm-response-form" disabled={loading}>
                                {loading ? (
                                    <div className="flex flex-row items-center gap-2"><LoadingSpinner /><span className="text-gray-500 ">กำลังยืนยัน...</span></div>
                                ) : (
                                    "ยืนยันการขอยืม"
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSavePdf}
                            >
                                ดาวน์โหลด PDF
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                            >
                                ยกเลิก
                            </Button>
                            {cancelDialogOpen && (
                                <CancelDialog
                                    selectedMed={data}
                                    title={"ยกเลิกการให้ยืมยา"}
                                    cancelID={data.responseId}
                                    description={"คุณต้องการยกเลิกการให้ยืมยาใช่หรือไม่"}
                                    confirmButtonText={"ยกเลิก"}
                                    successMessage={"ยกเลิกการให้ยืมยาเรียบร้อย"}
                                    errorMessage={"ยกเลิกการให้ยืมยาไม่สำเร็จ"}
                                    loading={false}
                                    onConfirm={() => Promise.resolve(true)}
                                    open={cancelDialogOpen}
                                    onOpenChange={(open: boolean) => {
                                        setCancelDialogOpen(open);
                                        if (!open) {
                                            onOpenChange(false);
                                        }
                                    }}
                                />
                            )}
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}