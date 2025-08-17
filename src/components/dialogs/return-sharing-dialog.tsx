import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm, useWatch } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Calendar1, RotateCcw, Package } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Textarea } from "@/components/ui/textarea";
import dynamic from 'next/dynamic';
import { toast } from "sonner";

const ReturnPdfPreview = dynamic(() => import('@/components/ui/pdf_creator/return_pdf'), { ssr: false });

function SharingMedicineDetails({ sharingMedicine, receiveConditions ,selectedMed}: any) {
    const { name, trademark, unit, quantity, manufacturer } = sharingMedicine;
    const { createdAt, postingHospitalNameTH ,sharingDetails } = selectedMed;
    const formattedDate = format(new Date(Number(createdAt)), 'dd/MM/') + (new Date(Number(createdAt)).getFullYear() + 543); // Format to dd/MM/yyyy in Thai Buddhist calendar
    return (
        <div className="flex flex-col gap-4 border p-4 rounded-lg">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
                <Package className="h-5 w-5" />
                รายละเอียดรายการยืม
            </h2>
            <div className="grid grid-cols-2 gap-2 font-light">
                <div className="flex flex-col gap-1">
                    <Label>วันที่แจ้งขอยืม</Label>
                    <Input disabled value={formattedDate || ''} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>โรงพยาบาลที่ให้ยืม</Label>
                    <Input disabled value={sharingDetails.postingHospitalNameTH || ''} />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                    <Label>รายการยา</Label>
                    <Input disabled value={name || ''} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>รูปแบบ/หน่วย</Label>
                    <Input disabled value={unit || ''} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ขนาด</Label>
                    <Input disabled value={quantity || ''} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ชื่อการค้า</Label>
                    <Input disabled value={trademark || ''} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ผู้ผลิต</Label>
                    <Input disabled value={manufacturer || ''} />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Label>เงื่อนไขการรับคืน</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-row gap-2 items-center">
                        <input type="checkbox" checked={!!receiveConditions?.exactType} disabled />
                        <Label>รับคืนเฉพาะรายการนี้</Label>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <input type="checkbox" checked={!!receiveConditions?.otherType} disabled />
                        <Label>รับคืนรายการอื่นได้</Label>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <input type="checkbox" checked={!!receiveConditions?.subType} disabled />
                        <Label>รับคืนรายการทดแทน</Label>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <input type="checkbox" checked={!!receiveConditions?.supportType} disabled />
                        <Label>สามารถสนับสนุนได้</Label>
                    </div>
                    <div className="flex flex-row gap-2 items-center col-span-2">
                        <input type="checkbox" checked={!!receiveConditions?.noReturn} disabled />
                        <Label>ไม่รับคืน</Label>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ReturnFormSchema({ selectedMed }: any) {
    const { sharingDetails, acceptedOffer } = selectedMed;
    const { sharingMedicine } = sharingDetails;
    const { responseAmount } = acceptedOffer;
    const { name, trademark, unit, size, manufacturer } = sharingMedicine;

    return z.discriminatedUnion('supportRequest', [
        z.object({
            supportRequest: z.literal('support'),
            returnType: z.enum(["exactType", "otherType", "subType"]),
            returnMedicine: z.object({
                reason: z.string().min(1, 'กรุณาระบุเหตุผล'),
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
}

function ReturnMedicineDetails({ selectedMed, onOpenChange, loading, setLoading, formId = "return-sharing-form", onFormChange, onSavePdf }: any) {
    const { id, respondingHospitalNameEN, sharingId, sharingDetails, returnTerm } = selectedMed;
    const { postingHospitalNameEN } = sharingDetails;
    // const receiveConditions = sharingDetails?.sharingReturnTerm?.receiveConditions || {};
    const receiveConditions = returnTerm || {};
    console.log('returnTerm', returnTerm)
    const returnFormSchema = ReturnFormSchema({ selectedMed });

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateError, setDateError] = useState("");

    const {
        register,
        watch,
        handleSubmit,
        setValue,
        control,
        trigger,
        formState: { errors, isValid },
    } = useForm<z.infer<typeof returnFormSchema>>({
        resolver: zodResolver(returnFormSchema),
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
                unit: "",
                manufacturer: "",
                pricePerUnit: 1,
                batchNumber: "",
                returnDate: undefined,
                reason: "",
            }
        }
    })

    const onError = () => { /* silent, UI shows field errors */ };

    const onSubmit = async (data: z.infer<typeof returnFormSchema>) => {
        //console.log('data', data)
        const supportRequest = data.supportRequest === "support" ? true : false;
        setLoading(true);
        const returnData = {
            id: `RET-${Date.now()}`,
            sharingId: sharingId,
            responseId: id,
            fromHospitalId: respondingHospitalNameEN,
            toHospitalId: postingHospitalNameEN,
            createAt: Date.now().toString(),
            updatedAt: Date.now().toString(),
            returnMedicine: data.returnMedicine,    // should be empty if supportRequest is true??
            returnType: supportRequest ? "supportType" : data.returnType,
        }
        //console.log('returnData', returnData)
        const returnBody = {
            returnData: returnData,
            selectedHospital: respondingHospitalNameEN,
            responseId: id,
        }
        //console.log('returnBody', returnBody)
        try {
            const response = await fetch("/api/createReturn", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(returnBody),
            })
            if (!response.ok) throw new Error("Failed to submit")
            await response.json()
            onOpenChange(false);
        } catch (error) {
            //console.log("Error submitting form:", error)
        } finally {
            setLoading(false);
        }
    };

    const expiredDate = watch("returnMedicine.returnDate");
    const watchReturnType = watch("returnType");
    const supportSelection = watch("supportRequest") || "none";
    const isSupportSelected = supportSelection === "support";
    const watchedValues = useWatch({ control });
    const watchedValuesKey = JSON.stringify(watchedValues);

    useEffect(() => {
        onFormChange?.(watchedValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedValuesKey]);

    // Autofill and lock fields when returning the exact borrowed item
    useEffect(() => {
        if (watchReturnType === "exactType") {
            const { name, trademark, manufacturer } = sharingDetails?.sharingMedicine || {};
            if (name) setValue("returnMedicine.name", name);
            if (trademark) setValue("returnMedicine.trademark", trademark);
            if (manufacturer) setValue("returnMedicine.manufacturer", manufacturer);
        }
    }, [watchReturnType, sharingDetails, setValue]);

    // Determine which return types are allowed; default to allowed if unspecified
    const allowedReturnTypes = {
        exactType: receiveConditions?.exactType ?? true,
        otherType: receiveConditions?.otherType ?? true,
        subType: receiveConditions?.subType ?? true,
        supportType: receiveConditions?.supportType ?? false,
    } as const;
    console.log('allowedReturnTypes', allowedReturnTypes)

    // Ensure selected returnType is allowed
    useEffect(() => {
        const currentType = watch("returnType");
        const isCurrentAllowed =
            (currentType === "exactType" && allowedReturnTypes.exactType) ||
            (currentType === "otherType" && allowedReturnTypes.otherType) ||
            (currentType === "subType" && allowedReturnTypes.subType);
        if (!isCurrentAllowed) {
            const firstAllowed = allowedReturnTypes.exactType
                ? "exactType"
                : allowedReturnTypes.subType
                ? "subType"
                : "otherType";
            setValue("returnType", firstAllowed, { shouldDirty: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [receiveConditions]);

    useEffect(() => {
        if (allowedReturnTypes.supportType) {
            setValue('supportRequest', 'support', { shouldDirty: true, shouldValidate: true });
        } else {
            setValue('supportRequest', 'none', { shouldDirty: true, shouldValidate: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowedReturnTypes.supportType]);

    return (
        <form id={formId} onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col col-span-2 gap-6 border p-4 rounded-lg">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                <RotateCcw className="h-5 w-5" />
                รายการคืน
            </h2>
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
                                <input type="radio" value="exactType" {...register("returnType")} disabled={!allowedReturnTypes.exactType || isSupportSelected} />
                                <Label>คืนรายการที่ยืม</Label>
                            </div>
                            <div className="flex flex-row gap-2">
                                <input type="radio" value="subType" {...register("returnType")} disabled={!allowedReturnTypes.subType || isSupportSelected} />
                                <Label>คืนรายการทดแทน</Label>
                            </div>
                            <div className="flex flex-row gap-2">
                                <input type="radio" value="otherType" {...register("returnType")} disabled={!allowedReturnTypes.otherType || isSupportSelected} />
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
                        <Label className="font-bold">วันหมดอายุ</Label>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left font-normal" disabled={isSupportSelected}>
                                    {expiredDate
                                        ? new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                        }).format(new Date(Number(expiredDate)))
                                        : "เลือกวันที่"}
                                    <Calendar1 className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={expiredDate ? new Date(Number(expiredDate)) : undefined}
                                    onSelect={(date) => {
                                        if (date instanceof Date && !isNaN(date.getTime())) {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const dateString = date.getTime().toString()

                                            if (date > today) {
                                                setValue("returnMedicine.returnDate", dateString, { shouldValidate: true, shouldDirty: true });
                                                setDateError("");
                                                setIsCalendarOpen(false);
                                            } else {
                                                setDateError("กรุณาเลือกวันที่ในอนาคต");
                                            }
                                        } else {
                                            setDateError("Invalid date selected.");
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
                    <Separator className="col-span-3 my-1" />
                    <div className="flex items-center gap-4 col-span-3 mb-2">
                        {/* <div className="flex items-center gap-2">
                            <input type="radio" value="none" {...register("supportRequest")} disabled={allowedReturnTypes.supportType} />
                            <Label>ไม่ขอสนับสนุน</Label>
                        </div> */}
                        <div className="flex items-center gap-2">
                            <input type="checkbox" value="support" checked={isSupportSelected} {...register("supportRequest")} disabled={!allowedReturnTypes.supportType} />
                            <Label>ขอสนับสนุน</Label>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 col-span-3">
                        <Label>เหตุผล</Label>
                        <Textarea placeholder="เหตุผล" {...register("returnMedicine.reason")} disabled={!isSupportSelected} />
                    </div>
                </div>

            </div>

            <div className="flex flex-row gap-2 items-center justify-center">
                <Button type="submit" disabled={loading}>
                    {loading
                        ? <div className="flex flex-row items-center gap-2"><LoadingSpinner className="h-4 w-4" /><span className="text-gray-500">กำลังบันทึก...</span></div>
                        : "ตกลง"}
                </Button>
                <Button
                    variant="outline"
                    type="button"
                    onClick={onSavePdf}
                    disabled={
                        isSupportSelected
                            ? !(Boolean((watchedValues?.returnMedicine?.reason || '').trim()))
                            : !isValid
                    }
                >
                    สร้างเอกสาร
                </Button>
            </div>
        </form>
    )
}

export default function ReturnSharingDialog({ open, onOpenChange, selectedMed }: any) {
    const { sharingDetails } = selectedMed;
    const { sharingMedicine } = sharingDetails;
    const receiveConditions = sharingDetails?.sharingReturnTerm?.receiveConditions || {};
    const [loading, setLoading] = useState(false);
    const formId = "return-sharing-form";
    const pdfRef = useRef<{ savePdf?: () => void }>(null);
    const [returnFormValues, setReturnFormValues] = useState<any>(null);

    const handleSavePdf = async () => {
        const formEl = document.getElementById(formId) as HTMLFormElement | null;
        if (!formEl) return;
        const invalid = formEl.querySelector(':invalid');
        const isSupport = returnFormValues?.supportRequest === 'support' || returnFormValues?.supportRequest === true;
        const hasReason = !!returnFormValues?.returnMedicine?.reason && String(returnFormValues?.returnMedicine?.reason).trim().length > 0;
        const requiredOk = isSupport
            ? hasReason
            : !!(returnFormValues?.returnMedicine?.name
                && returnFormValues?.returnMedicine?.quantity
                && returnFormValues?.returnMedicine?.unit
                && returnFormValues?.returnMedicine?.manufacturer
                && returnFormValues?.returnMedicine?.batchNumber
                && returnFormValues?.returnMedicine?.returnDate
                && (returnFormValues?.returnMedicine?.returnAmount ?? 0) > 0
                && (returnFormValues?.returnMedicine?.pricePerUnit ?? 0) > 0);
        if (invalid || !requiredOk) {
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วนก่อนสร้างเอกสาร");
            return;
        }
        pdfRef.current?.savePdf?.();
        toast.success("สร้างเอกสารคืนยาแล้ว");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 max-w-[1400px]">
                <div className="flex flex-col max-h-[90vh]">
                    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-t-xl">
                        <div className="px-6 py-4">
                            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
                                <RotateCcw className="h-5 w-5 text-green-600" />
                                <span>ส่งคืน</span>
                            </DialogTitle>
                        </div>
                    </div>

                    <div className="overflow-y-auto px-6 py-5">
                        <div className="grid grid-cols-3 gap-2">
                            <SharingMedicineDetails sharingMedicine={sharingMedicine} receiveConditions={receiveConditions} selectedMed={selectedMed}/>
                            <ReturnMedicineDetails selectedMed={selectedMed} onOpenChange={onOpenChange} loading={loading} setLoading={setLoading} formId={formId} onFormChange={setReturnFormValues} onSavePdf={handleSavePdf} />
                        </div>
                    </div>

                    <div style={{ display: 'none' }}>
                        <ReturnPdfPreview data={selectedMed} returnData={returnFormValues} ref={pdfRef} />
                    </div>

                    {/* Footer removed to match return-dialog; actions moved into the form */}
                </div>
            </DialogContent>
        </Dialog>
    )
}