import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import CancelDialog from "@/components/dialogs/cancel-dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ImageHoverPreview } from "@/components/ui/image-hover-preview"
// Icons
import { Calendar1, FileText, Download } from "lucide-react"

import { format } from "date-fns"
import { z } from "zod"
import { useForm, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useRef } from "react"

import dynamic from 'next/dynamic';
const SharingPdfPreview = dynamic(() => import('@/components/ui/pdf_creator/sharing_pdf'), { ssr: false });
import { useAuth } from "@/components/providers";

function RequestDetails({ sharingMed }: any) {
    console.log('sharingMed RequestDetails', sharingMed)
    const { createdAt } = sharingMed
    const date = new Date(Number(createdAt)); // convert string to number, then to Date
    // Thai date formatting helper (Buddhist calendar)
    const formattedDate = format(new Date(Number(date)), 'dd/MM/') + (new Date(Number(date)).getFullYear() + 543)
    const sharingDetails = sharingMed.sharingDetails
    const sharingMedicine = sharingMed.offeredMedicine ? sharingMed.sharingMedicine : sharingDetails.sharingMedicine
    const { name, trademark, quantity, unit, manufacturer, expiryDate, batchNumber, sharingAmount, pricePerUnit } = sharingMedicine
    const sharingReturnTerm = sharingMed.offeredMedicine ? sharingMed.sharingReturnTerm.receiveConditions : sharingMed.sharingDetails.sharingReturnTerm.receiveConditions
    const imgUrl: string | null = sharingMed.sharingDetails.sharingMedicineImage || sharingMed.sharingMedicineImage || null;
    const responseStatus = sharingMed.responseStatus
    const respondingHospitalNameTH = sharingMed.respondingHospitalNameTH

    const totalAmount = sharingAmount as number * pricePerUnit as number

    //console.log('sharingReturnTermsชชชชชชชชชชชชชชชชชชช', sharingDetails.sharingMedicine)
    /* const formattedExpiryDate = format(new Date(Number(expiryDate)), 'dd/MM/yyyy'); */
    // const formattedExpiryDate = format(sharingDetails.sharingMedicine.expiryDate, 'dd/MM/yyyy'); //ดึงมาก่อนนะอิงจากที่มี ดึงไว้ใน columns.tsx
    const formattedExpiryDate = format(new Date(Number(expiryDate)), 'dd/MM/') + (new Date(Number(expiryDate)).getFullYear() + 543)
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <Label>วันที่แจ้ง</Label>
                    <Input disabled value={formattedDate} />
                </div>
                <div className="flex flex-col gap-1">
                    {responseStatus === 'offered' ? <Label>โรงพยาบาลที่ขอแบ่งปัน</Label> : <Label>โรงพยาบาลที่แบ่งปัน</Label>}
                    {/* <Label>โรงพยาบาลที่แบ่งปัน</Label> */}
                    {responseStatus === 'offered' ? <Input disabled value={respondingHospitalNameTH} /> : <Input disabled value={sharingDetails.postingHospitalNameTH} />}
                    {/* <Input disabled value={sharingDetails.postingHospitalNameTH} /> */}
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ชื่อยา</Label>
                    <Input disabled value={name} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ผู้ผลิต</Label>
                    <Input disabled value={manufacturer} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ชื่อการค้า</Label>
                    <Input disabled value={trademark} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>หมายเลขล็อต</Label>
                    <Input disabled value={batchNumber} />
                </div>

                <div className="flex flex-col gap-1">
                    <Label>จำนวน</Label>
                    <Input disabled value={sharingAmount.toLocaleString()} />
                </div>
                <div className="grid grid-cols-2 gap-1">
                    <div className="flex flex-col col-span-1 gap-1">
                        <Label>รูปแบบ/หน่วย</Label>
                        <Input disabled value={unit} />
                    </div>
                    <div className="flex flex-col col-span-1 gap-1">
                        <Label>ขนาดบรรจุ</Label>
                        <Input disabled value={quantity} />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ราคาต่อหน่วย (รวม)</Label>
                    <Input disabled value={sharingMedicine.pricePerUnit ? sharingMedicine.pricePerUnit.toLocaleString('en-US', { style: 'currency', currency: 'THB' }) + " ( " + totalAmount.toLocaleString() + " )" : '-'} />
                </div>
                <div className="grid grid-cols-2 gap-1">
                    <div className="flex flex-col col-span-1 gap-1">
                        <Label className="">ภาพประกอบ</Label>
                        <div className="flex flex-row items-end gap-x-0.5">
                            {imgUrl &&
                                <Button asChild variant="outline" className="" >
                                    <a href={imgUrl} download="file.jpg">
                                        ดาวน์โหลด
                                    </a>

                                </Button>
                            }
                            {imgUrl &&
                                <ImageHoverPreview previewUrl={imgUrl} />
                            }

                            {
                                !imgUrl &&
                                <Input className="text-sm text-gray-500 italic" type="text" value={"ไม่มีภาพประกอบ"} disabled />
                            }
                        </div>
                    </div>
                    <div className="flex flex-col col-span-1 gap-1">
                        <Label>วันหมดอายุ</Label>
                        <Input disabled value={formattedExpiryDate} />
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Label>เงื่อนไขการคืนยาที่ยอมรับ</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-row gap-1">
                        <input type="checkbox" checked={sharingReturnTerm.exactType} disabled />
                        <Label>รับคืนเฉพาะรายการนี้</Label>
                    </div>
                    <div className="flex flex-row gap-1">
                        <input type="checkbox" checked={sharingReturnTerm.otherType} disabled />
                        <Label>รับคืนรายการอื่นได้</Label>
                    </div>
                    <div className="flex flex-row gap-1">
                        <input type="checkbox" checked={sharingReturnTerm.subType} disabled />
                        <Label>รับคืนรายการทดแทน</Label>
                    </div>
                    <div className="flex flex-row gap-1">
                        <input type="checkbox" checked={sharingReturnTerm.supportType} disabled />
                        <Label>สามารถสนับสนุนได้</Label>
                    </div>
                    <div className="flex flex-row gap-1">
                        <input type="checkbox" checked={sharingReturnTerm.noReturn} disabled />
                        <Label>ไม่รับคืน</Label>
                    </div>
                </div>

            </div>
        </div>
    )
}

function ResponseFormSchema(sharingMedicine: any) {
    const maxAmount = sharingMedicine?.sharingAmount ?? Infinity;
    return z.object({
        responseAmount: z.coerce.number({ required_error: "กรุณากรอกจำนวนที่ต้องการรับ" })
            .min(1, { message: "จำนวนที่ยืมต้องมีค่ามากกว่า 0" })
            .max(maxAmount, { message: `จำนวนที่ยืมต้องไม่เกิน ${maxAmount}` }),
        expectedReturnDate: z.string().min(1, { message: "วันที่ยืมต้องเป็นวันที่ในอนาคต" }),
        description: z.string().optional(),
        returnTerm: z.object({
            exactType: z.boolean(),
            otherType: z.boolean(),
            subType: z.boolean(),
            supportType: z.boolean(),
            noReturn: z.boolean(),
        }).refine((data) =>
            Object.values(data).some(value => value === true),
            {
                message: "กรุณาเลือกอย่างน้อย 1 เงื่อนไข",
                path: []
            }

        )
    })
}

function ResponseDetails({ sharingMed, onOpenChange, onSubmittingChange }: any) {
    console.log('sharingMedหหห', sharingMed)
    // //console.log('sharingMed.sharingMedicine', sharingMed.sharingDetails.sharingMedicine)
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateError, setDateError] = useState(""); // for error message
    const [loading, setLoading] = useState(false);

    // Check if there's existing acceptedOffer data to pre-populate the form
    const existingOffer = sharingMed.offeredMedicine;
    const existingReturnTerm = sharingMed.returnTerm;
    const isReconfirm = !!existingOffer;
    // //console.log('existingOffer', existingOffer)
    // //console.log('existingReturnTerm', existingReturnTerm)

    const ResponseShema = ResponseFormSchema(sharingMed.sharingDetails.sharingMedicine)


    const {
        register,
        watch,
        handleSubmit,
        setValue,
        getValues,
        resetField,
        formState: { errors, isSubmitted },
    } = useForm<z.infer<typeof ResponseShema>>({
        resolver: zodResolver(ResponseShema),
        defaultValues: {
            responseAmount: Number(existingOffer?.responseAmount ?? sharingMed.acceptedOffer?.responseAmount ?? 0),
            expectedReturnDate: existingOffer?.expectedReturnDate
                ? String(existingOffer.expectedReturnDate)
                : (sharingMed.acceptedOffer?.expectedReturnDate
                    ? String(sharingMed.acceptedOffer.expectedReturnDate)
                    : undefined),
            description: existingOffer?.description ?? sharingMed.acceptedOffer?.description ?? "",
            returnTerm: {
                exactType: Boolean(existingReturnTerm?.exactType),
                otherType: Boolean(existingReturnTerm?.otherType),
                subType: Boolean(existingReturnTerm?.subType),
                supportType: Boolean(existingReturnTerm?.supportType),
                noReturn: Boolean(existingReturnTerm?.noReturn),
            }
        }
    })
    const expectedReturn = watch("expectedReturnDate");
    const returnTerm = watch("returnTerm"); // Get the current values of receiveConditions
    const isAnyChecked = Object.values(returnTerm || {}).some(Boolean);// Check if any checkbox is checked

    // //console.log('expectedReturn', expectedReturn)

    const onSubmit = async (data: z.infer<typeof ResponseShema>) => {
        const isResponse = sharingMed.id.startsWith('RESP');
        const updateId = isResponse ? sharingMed.id : sharingMed.responseId;
        const newStatus = existingOffer ? 're-confirm' : sharingMed.acceptedOffer ? 'to-transfer' : 'offered';

        const responseBody = {
            sharingId: updateId,
            acceptOffer: {
                responseAmount: data.responseAmount,
                expectedReturnDate: data.expectedReturnDate,
                description: data.description || "",
            },
            returnTerm: data.returnTerm,
            updatedAt: Date.now().toString(),
            status: newStatus
        }
        console.log('accept offer responseBody', responseBody)

        try {
            setLoading(true);
            onSubmittingChange?.(true);
            const response = await fetch("/api/updateSharing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(responseBody),
            })
            const result = await response.json();
            //console.log('accpet offer result', result)
            setLoading(false);
            onSubmittingChange?.(false);
            onOpenChange(false);
        } catch (error) {
            //console.error("Error in transaction:", error);
            setLoading(false);
            onSubmittingChange?.(false);
        }
    }

    const onError = (errors: FieldErrors<z.infer<typeof ResponseShema>>) => {
        //console.error("❌ Form validation errors:", errors);
    }

    return (
        <form id="accept-sharing-form" onSubmit={handleSubmit(onSubmit, onError)}>
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                        <Label>จำนวนที่ยืม</Label>
                        <Input
                            inputMode="numeric"
                            placeholder="10"
                            onKeyDown={(e) => {
                                const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight"];
                                if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            {...register("responseAmount", { valueAsNumber: true })}
                            disabled={sharingMed.status === 're-confirm'}
                        />
                        {errors.responseAmount?.message && <span className="text-red-500 text-sm">{errors.responseAmount.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="font-bold">วันที่คาดว่าจะคืน</Label>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left font-normal" disabled={sharingMed.status === 're-confirm' || sharingMed.responseStatus === 'offered'} >
                                    {expectedReturn
                                        ?
                                        format(new Date(Number(expectedReturn)), 'dd/MM/') + (new Date(Number(expectedReturn)).getFullYear() + 543)
                                        : "เลือกวันที่"}
                                    <Calendar1 className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    captionLayout="dropdown"
                                    fromYear={2020}            // ปีเก่าสุดที่เลือกได้
                                    toYear={new Date().getFullYear() + 20}  //  เลือกได้ถึง 20 ปีข้างหน้า
                                    formatters={{
                                        formatYearCaption: (year: Date) => (year.getFullYear() + 543).toString(), // แสดงปีเป็น พ.ศ.
                                    }}
                                    selected={expectedReturn ? new Date(Number(expectedReturn)) : undefined}
                                    onSelect={(date) => {
                                        if (date instanceof Date && !isNaN(date.getTime())) {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0); // normalize time
                                            const stringDate = date.getTime().toString();
                                            //console.log('stringDate', stringDate)

                                            if (date > today) {
                                                setValue("expectedReturnDate", stringDate, { shouldValidate: true, shouldDirty: true });
                                                setDateError(""); // clear error
                                                setIsCalendarOpen(false); // close popover
                                            } else {
                                                setDateError("กรุณาเลือกวันที่ในอนาคต");
                                            }
                                        } else {
                                            setDateError("วันที่ไม่ถูกต้อง");
                                        }
                                    }}
                                    initialFocus
                                />
                                {dateError && (
                                    <div className="text-red-500 text-sm px-4 py-2">{dateError}</div>
                                )}
                            </PopoverContent>
                        </Popover>
                        {errors.expectedReturnDate?.message && <span className="text-red-500 text-sm">{errors.expectedReturnDate.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>แผนการคืน</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-row gap-1">
                                <input type="checkbox" {...register("returnTerm.exactType")} disabled={sharingMed.status === 're-confirm'} />
                                <Label className="font-normal">คืนรายการนี้</Label>
                            </div>
                            <div className="flex flex-row gap-1">
                                <input type="checkbox" {...register("returnTerm.otherType")} disabled={sharingMed.status === 're-confirm'} />
                                <Label className="font-normal">คืนรายการอื่น</Label>
                            </div>
                            <div className="flex flex-row gap-1">
                                <input type="checkbox" {...register("returnTerm.subType")} disabled={sharingMed.status === 're-confirm'} />
                                <Label className="font-normal">คืนยาทดแทน</Label>
                            </div>
                            <div className="flex flex-row gap-1">
                                <input type="checkbox" {...register("returnTerm.supportType")} disabled={sharingMed.status === 're-confirm'} />
                                <Label className="font-normal">ขอสนับสนุน</Label>
                            </div>
                            <div className="flex items-start flex-row gap-1">
                                <input type="checkbox" {...register("returnTerm.noReturn")} disabled={sharingMed.status === 're-confirm'} />
                                <Label className="font-normal">ไม่ต้องคืน</Label>
                            </div>
                            <br></br>
                            <div className="flex flex-col col-span-2">
                                {!isAnyChecked && isSubmitted && (
                                    <p className="text-red-500 text-sm mt-1">
                                        กรุณาเลือกอย่างน้อย 1 เงื่อนไข
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>เหตุผลการยืม</Label>
                        <Input
                            placeholder="ระบุเหตุผลการยืม"
                            type="text"
                            disabled={sharingMed.status === 're-confirm' || sharingMed.responseStatus === 'offered'}
                            {...register("description")}
                        />
                        {errors.description?.message && <span className="text-red-500 text-sm">{errors.description.message}</span>}
                    </div>

                </div>
            </div>

        </form>
    )
}

export default function AcceptSharingDialog({ sharingMed, openDialog, onOpenChange }: any) {
    // Check if this is a re-confirm scenario
    const { user } = useAuth();
    const pdfRef = useRef<{ savePdf?: () => void }>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const isReconfirm = !!sharingMed?.acceptedOffer;
    const dialogTitle = isReconfirm ? "ยืนยันการยืม" : "เวชภัณฑ์ยาที่ต้องการแบ่งปัน";

    const handleCancel = () => {
        // onOpenChange(false);
        setCancelDialogOpen(true);
        console.log('sharingMed', sharingMed)
    }

    return (
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 max-w-[1400px]">
                <div className="flex flex-col max-h-[90vh]">
                    {/* Sticky Header */}
                    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-t-xl">
                        <div className="px-6 py-4">
                            <DialogTitle className="text-xl font-semibold text-foreground">{dialogTitle}</DialogTitle>
                        </div>
                    </div>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto px-6 py-5">
                        <div className={`grid ${isReconfirm ? 'grid-cols-2 gap-6' : 'grid-cols-1 gap-6'}`}>
                            <div className="flex flex-col mt-2 gap-4">
                                <RequestDetails sharingMed={sharingMed} />
                                <Separator />
                                <ResponseDetails sharingMed={sharingMed} onOpenChange={onOpenChange} onSubmittingChange={setIsSubmitting} />
                            </div>
                            {isReconfirm && (
                                <div className="flex flex-col">
                                    <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
                                        <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                ตัวอย่างเอกสาร
                                            </h3>
                                        </div>
                                        <div className="p-2">
                                            <SharingPdfPreview data={sharingMed} userData={user} ref={pdfRef} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sticky Footer */}
                    <div className="bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-b-2xl">
                        <DialogFooter className="px-6 py-4">
                            <Button className="min-w-[160px]" type="submit" form="accept-sharing-form" disabled={isSubmitting}>
                                {isSubmitting
                                    ? <div className="flex flex-row items-center gap-2"><LoadingSpinner /><span className="text-gray-500 ">{isReconfirm ? "บันทึก" : "ยืนยัน"}</span></div>
                                    : (isReconfirm ? "บันทึกการแก้ไข" : "ยืนยัน")}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleCancel()}>
                                ยกเลิก
                            </Button>
                            {isReconfirm && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => pdfRef.current?.savePdf?.()}
                                >
                                    ดาวน์โหลด PDF
                                </Button>
                            )}
                        </DialogFooter>
                    </div>

                    {cancelDialogOpen && (
                        <CancelDialog
                            selectedMed={sharingMed}
                            title={"ยกเลิกการแบ่งปันยา"}
                            cancelID={sharingMed.responseId}
                            description={"คุณต้องการยกเลิกการแบ่งปันยาใช่หรือไม่"}
                            confirmButtonText={"ยกเลิก"}
                            successMessage={"ยกเลิกการแบ่งปันยาเรียบร้อย"}
                            errorMessage={"ยกเลิกการแบ่งปันยาไม่สำเร็จ"}
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
                </div>
            </DialogContent>
        </Dialog>
    )
}