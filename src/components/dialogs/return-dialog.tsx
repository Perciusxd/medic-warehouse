import { useState, useEffect, useRef } from "react"
import { useHospital } from "@/context/HospitalContext";
import { FieldErrors, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import dynamic from 'next/dynamic';

// Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Textarea } from "@/components/ui/textarea";

// Icons
import { Calendar1 } from "lucide-react"

// Utils
import { format } from "date-fns"
import { z } from "zod"
import { toast } from "sonner"
import { saveAs } from "file-saver";
import { pdf } from "@react-pdf/renderer";
import MyDocument from "@/components/ui/pdf_creator/return_pdf";
import { useAuth } from "../providers";
const ReturnPdfPreview = dynamic(() => import('@/components/ui/pdf_creator/return_pdf'), { ssr: false });

interface ReturnDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedMed: any;
}

function OfferDetails({ selectedMed }: any) {
    const { offeredMedicine, requestDetails, requestTerm, responseDetail, requestMedicine } = selectedMed;
    const { name, trademark, offerAmount, pricePerUnit, unit, returnConditions, manufacturer } = offeredMedicine;
    const { quantity } = requestMedicine;
    const { requestAmount } = requestDetails;
    const { expectedReturnDate } = requestTerm;
    const totalPrice = offerAmount * pricePerUnit;

    const date = new Date(Number(expectedReturnDate));
    const isValid = !isNaN(date.getTime());
    const formattedDate = isValid ? `${format(date, 'dd/MM')}/${date.getFullYear() + 543}` : "-";
    //console.log(expectedReturnDate);

    return (
        <div className="flex flex-col gap-6 border p-4 rounded-lg">
            <h2 className="text-lg font-semibold">รายละเอียดรายการยืม</h2>
            <div className="grid grid-cols-2 gap-2 font-light">
                <div className="flex flex-col gap-1">
                    <Label>วันที่ยืม</Label>
                    <Input disabled value={formattedDate} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>โรงพยาบาลที่ให้ยืม</Label>
                    <Input disabled value={responseDetail.respondingHospitalNameTH} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>รายการยา</Label>
                    <Input disabled value={name} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>รูปแบบ/หน่วย</Label>
                    <Input disabled value={unit} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ขนาด</Label>
                    <Input disabled value={quantity} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ชื่อการค้า</Label>
                    <Input disabled value={trademark} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ผู้ผลิต</Label>
                    <Input disabled value={manufacturer} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ราคาต่อหน่วย</Label>
                    <Input disabled value={pricePerUnit} />
                </div>
                <div className="grid grid-cols-2 gap-1">
                    <div className="flex flex-col gap-1">
                        <Label>จำนวนที่ขอยืม</Label>
                        <Input disabled value={requestAmount} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>ผู้ผลิต</Label>
                        <Input disabled value={manufacturer} />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <div className="flex flex-row gap-1">
                        <input type="radio" checked={returnConditions.exactType} disabled />
                        <Label>รับคืนเฉพาะรายการนี้</Label>
                    </div>
                    <div className="flex flex-row gap-1">
                        <input type="radio" checked={returnConditions.otherType} disabled />
                        <Label>รับคืนรายการอื่นได้</Label>
                    </div>
                    <div className="flex flex-row gap-1">
                        <input type="radio" checked={returnConditions.subType} disabled />
                        <Label>รับคืนรายการทดแทน</Label>
                    </div>
                    <div className="flex flex-row gap-1">
                        <input type="radio" checked={returnConditions.supportType} disabled />
                        <Label>สามารถสนับสนุนได้</Label>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ReturnFormSchema = z.discriminatedUnion('supportRequest', [
    z.object({
        supportRequest: z.literal('support'),
        returnType: z.enum(["exactType", "otherType", "subType"]),
        returnMedicine: z.object({
            reason: z.string().optional(),
            name: z.string().optional(),
            trademark: z.string().optional(),
            description: z.string().optional(),
            returnAmount: z.any().optional(),
            quantity: z.string().optional(),
            unit: z.string().optional(),
            manufacturer: z.string().optional(),
            pricePerUnit: z.any().optional(),
            batchNumber: z.string().optional(),
            returnDate: z.coerce.string().optional(),
        }),
    }),
    z.object({
        supportRequest: z.literal('none'),
        returnType: z.enum(["exactType", "otherType", "subType"]),
        returnMedicine: z.object({
            name: z.string().min(1, "กรุณาระบุชื่อยา"),
            trademark: z.string().min(1, "กรุณาระบุชื่อการค้า"),
            description: z.string().optional(),
            returnAmount: z.number().min(1, "กรุณากรอกจำนวนมากกว่า 0").max(100000, "กรุณากรอกจำนวนน้อยกว่า 100000"),
            quantity: z.string().min(1, "กรุณาระบุขนาดของยา"),
            unit: z.string().min(1, "กรุณาระบุรูปแบบ/หน่วยของยา"),
            manufacturer: z.string().min(1, "กรุณาระบุผู้ผลิตของยา"),
            pricePerUnit: z.number().min(1, "ราคาต่อหน่วยควรมากกว่า 0").max(100000, "ราคาต่อหน่วยควรน้อยกว่า 100000"),
            batchNumber: z.string().min(1, "กรุณาระบุหมายเลขล็อตของยา"),
            returnDate: z.coerce.string({ invalid_type_error: "กรุณาระบุวันที่คืนยา" }),
            reason: z.string().optional(),
        }),
    }),
])

function ReturnDetails({ selectedMed, onOpenChange }: any) {
    const pdfRef = useRef<{ savePdf?: () => void }>(null);
    const { user } = useAuth();
    const { loggedInHospital } = useHospital();
    const { requestId, responseId, postingHospitalNameEN } = selectedMed;
    const { name, trademark, offerAmount, pricePerUnit, unit, returnConditions, manufacturer } = selectedMed.offeredMedicine;
    const { requestAmount } = selectedMed.requestDetails;
    const { expectedReturnDate } = selectedMed.requestTerm;
    const { postingHospitalNameTH } = selectedMed;
    const totalPrice = offerAmount * pricePerUnit;

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateError, setDateError] = useState(""); // for error message

    const [loading, setLoading] = useState(false);

    const {
        register,
        watch,
        handleSubmit,
        setValue,
        getValues,
        resetField,
        trigger,
        formState: { errors, isValid },
    } = useForm<z.infer<typeof ReturnFormSchema>>({
        resolver: zodResolver(ReturnFormSchema),
        mode: 'onChange',
        defaultValues: {
            returnType: "exactType",
            supportRequest: "none",
            returnMedicine: {
                name: "",
                trademark: "",
                description: "",
                returnAmount: 1,
                quantity: "",
                pricePerUnit: 1,
                batchNumber: "",
                returnDate: undefined,
                reason: "",
            }
        }
    })

    const returnDate = watch("returnMedicine.returnDate");
    const watchReturnType = watch("returnType");
    const watchAllFields = watch();
    const supportSelection = watch("supportRequest") || "none";
    const isSupportSelected = supportSelection === "support";

    const allowedReturnTypes = {
        exactType: returnConditions?.exactType ?? true,
        otherType: returnConditions?.otherType ?? true,
        subType: returnConditions?.subType ?? true,
        supportType: returnConditions?.supportType ?? false,
    } as const;

    useEffect(() => {
        if (allowedReturnTypes.supportType) {
            setValue('supportRequest', 'support', { shouldDirty: true, shouldValidate: true });
        } else {
            setValue('supportRequest', 'none', { shouldDirty: true, shouldValidate: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowedReturnTypes.supportType]);

    // set name and manufacturer to requestMedicine if returnType is exactType
    useEffect(() => {
        if (watchReturnType === "exactType") {
            setValue("returnMedicine.name", name);
            setValue("returnMedicine.manufacturer", manufacturer);
            setValue("returnMedicine.trademark", trademark);
        }
    }, [watchReturnType, name, manufacturer, trademark, setValue])

    const onError = (errors: FieldErrors<z.infer<typeof ReturnFormSchema>>) => {
        toast.error("กรุณาระบุข้อมูลให้ครบถ้วน")
    };

    const onSubmit = async (data: z.infer<typeof ReturnFormSchema>) => {
        const supportRequest = supportSelection === 'support';
        const returnData = {
            id: `RET-${Date.now()}`,
            requestId: requestId,
            responseId: responseId,
            fromHospitalId: loggedInHospital,
            toHospitalId: postingHospitalNameEN,
            createAt: Date.now().toString(),
            updatedAt: Date.now().toString(),
            returnMedicine: data.returnMedicine,
            returnType: supportRequest ? 'supportType' : data.returnType,
            supportRequest: supportRequest,
        }
        const returnBody = {
            returnData: returnData,
            selectedHospital: loggedInHospital,
            responseId: responseId,
        }
        try {
            setLoading(true);
            const response = await fetch("/api/createReturn", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(returnBody),
            })
            if (!response.ok) {
                throw new Error("Failed to submit")
            }
            const result = await response.json()
            //console.log("Success:", result)
            setLoading(false);
            onOpenChange?.(false);
        } catch (error) {
            //console.log("Error submitting form:", error)
            setLoading(false);
        }
    }

    const handleSavePdf = async () => {
        const valid = await trigger();
        if (!valid) {
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วนก่อนสร้างเอกสาร");
            return;
        }
        pdfRef.current?.savePdf?.();
        toast.success("สร้างเอกสารคืนยาแล้ว")
    };

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col col-span-2 gap-6 border p-4 rounded-lg">
            <h2 className="text-lg font-semibold">รายการคืน</h2>
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-4 gap-2">
                    {allowedReturnTypes.supportType ? (
                        <>
                            <div className="flex flex-row gap-2">
                                <input type="radio" checked={false} disabled />
                                <Label>คืนรายการที่ยืม</Label>
                            </div>
                            <div className="flex flex-row gap-2">
                                <input type="radio" checked={false} disabled />
                                <Label>คืนรายการทดแทน</Label>
                            </div>
                            <div className="flex flex-row gap-2">
                                <input type="radio" checked={false} disabled />
                                <Label>คืนรายการอื่น</Label>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-row gap-2">
                                <input type="radio" value="exactType" {...register("returnType")} disabled={returnConditions.exactType || isSupportSelected} />
                                <Label>คืนรายการที่ยืม</Label>
                            </div>
                            <div className="flex flex-row gap-2">
                                <input type="radio" value="subType" {...register("returnType")} disabled={returnConditions.exactType || isSupportSelected} />
                                <Label>คืนรายการทดแทน</Label>
                            </div>
                            <div className="flex flex-row gap-2">
                                <input type="radio" value="otherType" {...register("returnType")} disabled={returnConditions.exactType || isSupportSelected} />
                                <Label>คืนรายการอื่น</Label>
                            </div>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 font-light">
                    <div className="flex flex-col gap-1">
                        <Label>รายการยา</Label>
                        <Input placeholder="รายการยา" {...register("returnMedicine.name")} disabled={isSupportSelected || watchReturnType === "exactType"} />
                        {errors.returnMedicine?.name && <span className="text-red-500 text-xs">{errors.returnMedicine.name.message}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <Label>ขนาด</Label>
                            <Input placeholder="1mg" {...register("returnMedicine.quantity")} disabled={isSupportSelected} />
                            {errors.returnMedicine?.quantity && <span className="text-red-500 text-xs">{errors.returnMedicine.quantity.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label>รูปแบบ/หน่วย</Label>
                            <Input placeholder="Tablet" {...register("returnMedicine.unit")} disabled={isSupportSelected} />
                            {errors.returnMedicine?.unit && <span className="text-red-500 text-xs">{errors.returnMedicine.unit.message}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>ชื่อการค้า</Label>
                        <Input placeholder="ชื่อการค้า" {...register("returnMedicine.trademark")} disabled={isSupportSelected || watchReturnType === "exactType"} />
                        {errors.returnMedicine?.trademark && <span className="text-red-500 text-xs">{errors.returnMedicine.trademark.message}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <Label>ผู้ผลิต</Label>
                            <Input placeholder="ผู้ผลิต" {...register("returnMedicine.manufacturer")} disabled={isSupportSelected || watchReturnType === "exactType"} />
                            {errors.returnMedicine?.manufacturer && <span className="text-red-500 text-xs">{errors.returnMedicine.manufacturer.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label>หมายเลขล็อต</Label>
                            <Input placeholder="B234" {...register("returnMedicine.batchNumber")} disabled={isSupportSelected} />
                            {errors.returnMedicine?.batchNumber && <span className="text-red-500 text-xs">{errors.returnMedicine.batchNumber.message}</span>}
                        </div>
                    </div>

                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                        <Label className="font-bold">วันที่หมดอายุ</Label>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left font-normal" disabled={isSupportSelected}>
                                    {returnDate
                                        ? new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                        }).format(new Date(Number(returnDate)))
                                        : "เลือกวันที่"}
                                    <Calendar1 className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={returnDate ? new Date(Number(returnDate)) : undefined}
                                    onSelect={(date) => {
                                        if (date instanceof Date && !isNaN(date.getTime())) {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0); // normalize time
                                            const dateString = date.getTime().toString()

                                            if (date > today) {
                                                setValue("returnMedicine.returnDate", dateString, { shouldValidate: true, shouldDirty: true });
                                                setDateError(""); // clear error
                                                setIsCalendarOpen(false); // close popover
                                            } else {
                                                setDateError("กรุณาเลือกวันที่ในอนาคต");
                                                // //console.log('setDateError')
                                            }
                                        } else {
                                            setDateError("Invalid date selected.");
                                            // //console.log('setDateError')
                                        }
                                    }}
                                    initialFocus
                                />
                                {dateError && (
                                    <div className="text-red-500 text-xs px-4 py-2">{dateError}</div>
                                )}
                            </PopoverContent>
                        </Popover>
                        {errors.returnMedicine?.returnDate && <span className="text-red-500 text-xs">{errors.returnMedicine.returnDate.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>จำนวนที่ให้คืน</Label>
                        <Input placeholder="500" type="number" {...register("returnMedicine.returnAmount", { valueAsNumber: true })} disabled={isSupportSelected} />
                        {errors.returnMedicine?.returnAmount?.message && <span className="text-red-500 text-xs">{String(errors.returnMedicine.returnAmount.message)}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>ราคาต่อหน่วย</Label>
                        <Input placeholder="20" type="number" {...register("returnMedicine.pricePerUnit", { valueAsNumber: true })} disabled={isSupportSelected} />
                        {errors.returnMedicine?.pricePerUnit?.message && <span className="text-red-500 text-xs">{String(errors.returnMedicine.pricePerUnit.message)}</span>}
                    </div>
                </div>

                <Separator className="col-span-3 my-1" />
                <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" value="support" checked={isSupportSelected} {...register("supportRequest")} disabled={allowedReturnTypes.supportType} />
                        <Label>ขอสนับสนุน</Label>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <Label>เหตุผล</Label>
                    <Textarea placeholder="เหตุผล" {...register("returnMedicine.reason")} disabled={!isSupportSelected} />
                    {errors.returnMedicine?.reason && <span className="text-red-500 text-xs">{errors.returnMedicine.reason.message}</span>}
                </div>

                <div style={{ display: 'none' }}>
                    <ReturnPdfPreview data={selectedMed} returnData={watchAllFields} userData={user} ref={pdfRef} />
                </div>

            </div>

            <div className="flex flex-row gap-2 items-center justify-center">
                <Button type="submit">
                    {loading
                        ? <div className="flex flex-row items-center gap-2"><LoadingSpinner /><span className="text-gray-500">สร้าง</span></div>
                        : "ตกลง"}</Button>
                <Button
                    variant="outline"
                    type="button"
                    onClick={handleSavePdf}
                    disabled={
                        isSupportSelected
                            ? !(Boolean((watchAllFields?.returnMedicine?.reason || '').trim()))
                            : !isValid
                    }
                >
                    สร้างเอกสาร
                </Button>
            </div>
        </form>
    )
}

export default function ReturnDialog({ open, onOpenChange, selectedMed }: ReturnDialogProps) {
    if (!selectedMed) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>กำลังโหลดข้อมูลยา...</DialogTitle>
                    </DialogHeader>
                    <p>โปรดรอสักครู่</p>
                </DialogContent>
            </Dialog>
        );
    }
    //console.log('selectedMed', selectedMed)
    const handleClose = () => {
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1300px]">
                <DialogHeader>
                    <DialogTitle>ส่งคืน</DialogTitle>
                </DialogHeader>
                {/* <div className="flex flex-row gap-2"> */}
                <div className="grid grid-cols-3 gap-2">
                    {/* Offer Details */}
                    <OfferDetails selectedMed={selectedMed} />
                    {/* Request Details */}
                    <ReturnDetails selectedMed={selectedMed} onOpenChange={onOpenChange} className="col-span-2" />
                </div>
            </DialogContent>
        </Dialog>
    )
}