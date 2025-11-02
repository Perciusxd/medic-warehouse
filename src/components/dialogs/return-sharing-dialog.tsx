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
import { Calendar1, RotateCcw } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RequiredMark } from "@/components/ui/field-indicator";
import dynamic from 'next/dynamic';
import { toast } from "sonner";
import { useAuth } from "../providers";

const ReturnPdfMultiPreview = dynamic(() => import('@/components/ui/pdf_creator/return_pdf_multi'), { ssr: false });

function SharingMedicineDetails({ sharingMedicine, receiveConditions, selectedMed, acceptedOffer }: any) {
    const { name, trademark, unit, quantity, manufacturer, sharingAmount, pricePerUnit } = sharingMedicine;
    const { createdAt, postingHospitalNameTH, sharingDetails ,  } = selectedMed;
    const { responseAmount } = acceptedOffer;
    
    const returnConditions = sharingDetails.sharingReturnTerm
    const returnTerm = selectedMed.returnTerm
    const totalPrice = responseAmount * pricePerUnit;
    const formattedDate = format(new Date(Number(createdAt)), 'dd/MM/') + (new Date(Number(createdAt)).getFullYear() + 543);
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
                    <Input disabled value={sharingDetails.postingHospitalNameTH} />
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
                    <Label>ชื่อการค้า</Label>
                    <Input disabled value={trademark} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ขนาดบรรจุ</Label>
                    <Input disabled value={quantity} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ผู้ผลิต</Label>
                    <Input disabled value={manufacturer} />
                </div>
            </div>
            <div className="flex flex-row col-span-2 gap-2 flex-wrap">
                <div className="flex flex-col gap-1">
                    <Label>จำนวนที่ขอยืม</Label>
                    <Input disabled value={responseAmount} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ราคาต่อหน่วย</Label>
                    <Input disabled value={pricePerUnit} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>รวม</Label>
                    <span className="font-bold text-sm text-gray-600"> {totalPrice.toFixed(2)} บาท</span>
                </div>
            </div>
            <div className="flex flex-col gap-2 mt-2">
                <Label>เงื่อนไขการคืน</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-row gap-2 items-center">
                        <input type="checkbox" checked={returnConditions?.returnConditions?.exactTypeCondition} disabled />
                        <Label>รับคืนเฉพาะรายการนี้</Label>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <input type="checkbox" checked={returnConditions?.returnConditions?.otherTypeCondition} disabled />
                        <Label>รับคืนรายการอื่นได้</Label>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <input type="checkbox" checked={returnConditions?.supportCondition?.servicePlan} disabled />
                        <Label>รับคืนรายการทดแทน</Label>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <input type="checkbox" checked={returnConditions?.supportCondition?.budgetPlan} disabled />
                        <Label>สามารถสนับสนุนได้</Label>
                    </div>
                    <div className="flex flex-row gap-2 items-center col-span-2">
                        <input type="checkbox" checked={returnConditions?.supportCondition?.freePlan} disabled />
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
                expiryDate: z.coerce.string().optional(),
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
                quantity: z.string().optional(),
                unit: z.string().min(1, "กรุณาระบุรูปแบบ/หน่วยของยา"),
                manufacturer: z.string().min(1, "กรุณาระบุผู้ผลิตของยา"),
                pricePerUnit: z.number().min(1, "ราคาต่อหน่วยควรมากกว่า 0").max(100000, "ราคาต่อหน่วยควรน้อยกว่า 100000"),
                batchNumber: z.string().min(1, "กรุณาระบุหมายเลขล็อตของยา"),
                expiryDate: z.coerce.string({ invalid_type_error: "กรุณาระบุวันหมดอายุ" }),
                returnDate: z.coerce.string().optional(),
                reason: z.string().optional(),
            }),
        }),
    ])
}

function ReturnMedicineDetails({ selectedMed, onOpenChange, loading, setLoading, formId = "return-sharing-form", onFormChange, onSavePdf }: any) {
    const { id, respondingHospitalNameEN, sharingId, sharingDetails, returnTerm, acceptedOffer } = selectedMed;
    const { postingHospitalNameEN, sharingMedicine } = sharingDetails;
    const { responseAmount } = acceptedOffer;
    const receiveConditions = returnTerm || {};
    const returnFormSchema = ReturnFormSchema({ selectedMed });

    // Calculate offered price - using responseAmount as the amount borrowed
    const offeredPrice = sharingMedicine?.pricePerUnit || 0;
    const totalOfferedPrice = responseAmount * offeredPrice;

    // Compute previously returned totals from existing return list
    const existingReturnList: any = (selectedMed as any)?.returnMedicine;
    const previousReturnsArray: any[] = Array.isArray(existingReturnList)
        ? existingReturnList
        : (existingReturnList ? [existingReturnList] : []);
    const returnedAmountSum: number = previousReturnsArray.reduce((sum: number, item: any) => {
        try {
            const nested = item && item.returnMedicine ? item.returnMedicine : item;
            const rawAmt = nested && nested.returnAmount !== undefined && nested.returnAmount !== null ? nested.returnAmount : 0;
            const amt = Number(rawAmt);
            return sum + (isNaN(amt) ? 0 : amt);
        } catch {
            return sum;
        }
    }, 0);
    const returnedPriceSum: number = previousReturnsArray.reduce((sum: number, item: any) => {
        try {
            const nested = item && item.returnMedicine ? item.returnMedicine : item;
            const rawAmt = nested && nested.returnAmount !== undefined && nested.returnAmount !== null ? nested.returnAmount : 0;
            const rawPrice = nested && nested.pricePerUnit !== undefined && nested.pricePerUnit !== null ? nested.pricePerUnit : 0;
            const amt = Number(rawAmt);
            const unitPrice = Number(rawPrice);
            const lineTotal = (isNaN(amt) || isNaN(unitPrice)) ? 0 : (amt * unitPrice);
            return sum + lineTotal;
        } catch {
            return sum;
        }
    }, 0);
    const previousReturnPercent = totalOfferedPrice > 0 ? Math.min(100, Math.max(0, (returnedPriceSum / totalOfferedPrice) * 100)) : 0;
    const remainingReturnPrice = Math.max(0, (Number(totalOfferedPrice) || 0) - (Number(returnedPriceSum) || 0));

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
                pricePerUnit: undefined,
                batchNumber: "",
                expiryDate: undefined,
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
        const nowStr = Date.now().toString();
        const finalReturnMedicine = { ...data.returnMedicine, returnDate: nowStr };
        const returnData = {
            id: `RET-${Date.now()}`,
            sharingId: sharingId,
            sharingMedicine : sharingDetails.sharingMedicine,
            responseId: id,
            fromHospitalId: respondingHospitalNameEN,
            toHospitalId: postingHospitalNameEN,
            createAt: Date.now().toString(),
            updatedAt: Date.now().toString(),
            returnMedicine: finalReturnMedicine,    // should be empty if supportRequest is true??
            returnType: supportRequest ? "supportType" : data.returnType,
        }
        const returnBody = {
            returnData: returnData,
            selectedHospital: respondingHospitalNameEN,
            responseId: id,
        }
        console.log("returnBody",returnBody)
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

    const expiredDate = watch("returnMedicine.expiryDate");
    const watchReturnType = watch("returnType");
    const supportSelection = watch("supportRequest") || "none";
    const isSupportSelected = supportSelection === "support";
    const returnAmount = watch("returnMedicine.returnAmount");
    const pricePerUnit = watch("returnMedicine.pricePerUnit");
    const watchedValues = useWatch({ control });
    const watchedValuesKey = JSON.stringify(watchedValues);

    // Calculate user input total and comparison against offered total price
    const inputTotal = (Number(returnAmount) || 0) * (Number(pricePerUnit) || 0);
    const ratioPercent = totalOfferedPrice > 0 ? (inputTotal / totalOfferedPrice) * 100 : 0;
    const clampedPercent = Math.max(0, Math.min(100, ratioPercent));
    const differenceAmount = inputTotal - totalOfferedPrice;

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
    //console.log('allowedReturnTypes', allowedReturnTypes)

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
        <form id={formId} onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-6 border p-4 rounded-lg">
            <h2 className="text-lg font-semibold">รายการคืน</h2>
            <div className="flex flex-col gap-2 border rounded-md p-3 bg-muted/20">
                <Label>สรุปการคืนก่อนหน้า</Label>
                <div className="text-sm text-gray-700">คืนแล้ว: {returnedAmountSum} หน่วย ({returnedPriceSum.toFixed(2)} บาท)</div>
                <div className="text-sm text-gray-700">เหลือคืน (ตามราคา): {remainingReturnPrice.toFixed(2)} บาท</div>
                <div className="mt-1">
                    <Progress value={previousReturnPercent} />
                    <div className="flex justify-between text-xs mt-1">
                        <span>{previousReturnPercent.toFixed(0)}% ของราคาที่ต้องคืน</span>
                        <span>รวมที่ต้องคืน: {totalOfferedPrice.toFixed(2)} บาท</span>
                    </div>
                </div>
            </div>
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
                                <input type="radio" value="exactType" checked={returnTerm.returnConditions.condition==="exactType"} {...register("returnType")}  disabled={returnTerm.returnConditions.condition==="otherType"} />
                                <Label>คืนรายการที่ยืม</Label>
                            </div>
                            <div className="flex flex-row gap-2">
                                <input type="radio" value="subType" checked={returnTerm.returnConditions.condition==="otherType"}  {...register("returnType")} disabled={returnTerm.returnConditions.condition==="exactType"} />
                                <Label>คืนรายการทดแทน</Label>
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
                    <div className="flex flex-col gap-1">
                        <Label>ชื่อการค้า</Label>
                        <Input placeholder="ชื่อการค้า" {...register("returnMedicine.trademark")} disabled={isSupportSelected || watchReturnType === "exactType"} />
                        {errors.returnMedicine?.trademark && <span className="text-red-500 text-xs">{errors.returnMedicine.trademark.message}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col col-span-2 gap-1">
                        <Label>ผู้ผลิต</Label>
                        <Input placeholder="ผู้ผลิต" {...register("returnMedicine.manufacturer")} disabled={isSupportSelected || watchReturnType === "exactType"} />
                        {errors.returnMedicine?.manufacturer && <span className="text-red-500 text-xs">{errors.returnMedicine.manufacturer.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>หมายเลขล็อต <RequiredMark /></Label>
                        <Input placeholder="B234" {...register("returnMedicine.batchNumber")} disabled={isSupportSelected} />
                        {errors.returnMedicine?.batchNumber && <span className="text-red-500 text-xs">{errors.returnMedicine.batchNumber.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>ขนาดบรรจุ <RequiredMark /></Label>
                        <Input placeholder="1mg" {...register("returnMedicine.quantity")} disabled={isSupportSelected} />
                        {errors.returnMedicine?.quantity && <span className="text-red-500 text-xs">{errors.returnMedicine.quantity.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>รูปแบบ/หน่วย <RequiredMark /></Label>
                        <Input placeholder="Tablet" {...register("returnMedicine.unit")} disabled={isSupportSelected} />
                        {errors.returnMedicine?.unit && <span className="text-red-500 text-xs">{errors.returnMedicine.unit.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label className="font-bold">วันที่หมดอายุ <RequiredMark /></Label>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left font-normal" disabled={isSupportSelected}>
                                    {expiredDate
                                        ? format(new Date(Number(expiredDate)), 'dd/MM/') + (new Date(Number(expiredDate)).getFullYear() + 543)
                                        : "เลือกวันที่"}
                                    <Calendar1 className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={expiredDate ? new Date(Number(expiredDate)) : undefined}
                                    captionLayout="dropdown"
                                    fromYear={2020}
                                    toYear={new Date().getFullYear() + 20}
                                    formatters={{
                                        formatYearCaption: (year: Date) => (year.getFullYear() + 543).toString(),
                                    }}
                                    onSelect={(date) => {
                                        if (date instanceof Date && !isNaN(date.getTime())) {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const dateString = date.getTime().toString()
                                            if (date > today) {
                                                setValue("returnMedicine.expiryDate", dateString, { shouldValidate: true, shouldDirty: true });
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
                        {errors.returnMedicine?.expiryDate && <span className="text-red-500 text-xs">{errors.returnMedicine.expiryDate.message}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">    
                    <div className="flex flex-col gap-1">
                        <Label>จำนวนที่ให้คืน <RequiredMark /></Label>
                        <Input placeholder="500" type="number" {...register("returnMedicine.returnAmount", { valueAsNumber: true })} disabled={isSupportSelected} />
                        {errors.returnMedicine?.returnAmount?.message && <span className="text-red-500 text-xs">{String(errors.returnMedicine.returnAmount.message)}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>ราคาต่อหน่วย <RequiredMark /></Label>
                        <Input placeholder="20" type="number" {...register("returnMedicine.pricePerUnit", { valueAsNumber: true })} disabled={isSupportSelected} />
                        {errors.returnMedicine?.pricePerUnit?.message && <span className="text-red-500 text-xs">{String(errors.returnMedicine.pricePerUnit.message)}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>รวม</Label>
                        <span className="font-bold text-sm text-gray-600"> {inputTotal.toFixed(2)} บาท</span>
                        <span className="text-xs text-gray-500">จากราคา {totalOfferedPrice.toFixed(2)} บาท</span>
                    </div>
                </div>

            </div>

            <div className="flex flex-row gap-2 items-center justify-center">
                <Button type="submit" disabled={!isValid}>
                    {loading
                        ? <div className="flex flex-row items-center gap-2"><LoadingSpinner /><span className="text-gray-500">สร้าง</span></div>
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
                    ออกเอกสาร PDF การคืนยา
                </Button>
            </div>
        </form>
    )
}

export default function ReturnSharingDialog({ open, onOpenChange, selectedMed }: any) {
    const { user } = useAuth();
    const { sharingDetails, acceptedOffer, respondingHospitalNameTH } = selectedMed;
    const { sharingMedicine } = sharingDetails;
    const receiveConditions = sharingDetails?.sharingReturnTerm?.receiveConditions || {};
    const [loading, setLoading] = useState(false);
    const formId = "return-sharing-form";
    const pdfRef = useRef<{ savePdf?: () => void }>(null);
    const [returnFormValues, setReturnFormValues] = useState<any>(null);

    // Prepare data structure for PDF matching columns.tsx format
    const pdfData = {
        ...selectedMed,
        respondingHospitalNameTH: respondingHospitalNameTH || sharingDetails?.postingHospitalNameTH,
        offeredMedicine: {
            ...sharingMedicine,
            offerAmount: acceptedOffer?.responseAmount,
        }
    };

    const handleSavePdf = async () => {
        const formEl = document.getElementById(formId) as HTMLFormElement | null;
        if (!formEl) return;
        
        const isSupport = returnFormValues?.supportRequest === 'support' || returnFormValues?.supportRequest === true;
        
        // Check for missing fields
        const missingFields: string[] = [];
        
        if (isSupport) {
            const hasReason = !!returnFormValues?.returnMedicine?.reason && String(returnFormValues?.returnMedicine?.reason).trim().length > 0;
            if (!hasReason) {
                missingFields.push("เหตุผล");
            }
        } else {
            if (!returnFormValues?.returnMedicine?.name) missingFields.push("รายการยา");
            if (!returnFormValues?.returnMedicine?.trademark) missingFields.push("ชื่อการค้า");
            if (!returnFormValues?.returnMedicine?.manufacturer) missingFields.push("ผู้ผลิต");
            if (!returnFormValues?.returnMedicine?.batchNumber) missingFields.push("หมายเลขล็อต");
            if (!returnFormValues?.returnMedicine?.quantity) missingFields.push("ขนาดบรรจุ");
            if (!returnFormValues?.returnMedicine?.unit) missingFields.push("รูปแบบ/หน่วย");
            if (!returnFormValues?.returnMedicine?.expiryDate) missingFields.push("วันหมดอายุ");
            if (!(returnFormValues?.returnMedicine?.returnAmount > 0)) missingFields.push("จำนวนที่ให้คืน");
            if (typeof returnFormValues?.returnMedicine?.pricePerUnit !== "number" || 
                isNaN(returnFormValues?.returnMedicine?.pricePerUnit) ||
                returnFormValues?.returnMedicine?.pricePerUnit <= 0) {
                missingFields.push("ราคาต่อหน่วย");
            }
        }

        if (missingFields.length > 0) {
            const fieldList = missingFields.join(", ");
            toast.error(
                `กรุณากรอกข้อมูลให้ครบถ้วนก่อนสร้างเอกสาร\n\nฟิลด์ที่ยังไม่ครบ: ${fieldList}`,
                {
                    duration: 5000,
                    style: {
                        whiteSpace: 'pre-line'
                    }
                }
            );
            return;
        }
        
        pdfRef.current?.savePdf?.();
        toast.success("สร้างเอกสารคืนยาแล้ว");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1100px]">
                <DialogHeader>
                    <DialogTitle>ส่งคืน</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2">
                    <SharingMedicineDetails sharingMedicine={sharingMedicine} receiveConditions={receiveConditions} selectedMed={selectedMed} acceptedOffer={acceptedOffer} />
                    <ReturnMedicineDetails selectedMed={selectedMed} onOpenChange={onOpenChange} loading={loading} setLoading={setLoading} formId={formId} onFormChange={setReturnFormValues} onSavePdf={handleSavePdf} />
                </div>
                <div style={{ display: 'none' }}>
                    <ReturnPdfMultiPreview 
                        ref={pdfRef} 
                        data={pdfData}
                        returnList={returnFormValues?.returnMedicine ? [returnFormValues.returnMedicine] : []} 
                        userData={user ?? {}} 
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}