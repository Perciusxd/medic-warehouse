import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { format, sub } from "date-fns"
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
import { ImageHoverPreview } from "@/components/ui/image-hover-preview"
import { Calendar1Icon, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react"
import { Calendar1, Hospital } from "lucide-react"
import RequestDetails from "./request-details"
import { RequiredMark } from "@/components/ui/field-indicator"

export default function CreateResponseDialog({ requestData, responseId, dialogTitle, status, openDialog, onOpenChange }: any) {
    const { requestTerm } = requestData;
    const { receiveConditions, returnConditions } = requestTerm;
    console.log("requestTerm:", requestTerm)
    // Safe fallbacks when requestTerm.receiveConditions or requestTerm.returnConditions can be null

    const ResponseSchema = z.object({
        offeredMedicine: z.object({
            // offerAmount: z.number().min(1, "กรุณากรอกมากว่า 0").max(requestData.requestMedicine.requestAmount, `กรุณากรอกน้อยกว่า ${requestData.requestMedicine.requestAmount}`),
            offerAmount: z.number().min(1, "กรุณากรอกมากว่า 0"),
            trademark: z.string(),
            pricePerUnit: z.number().gt(0, "Price per unit must be greater than 0").max(100000, "Price per unit must be less than 100000"),
            manufacturer: z.string(),
            batchNumber: z.string().min(1, "กรุณาระบุหมายเลขล็อต"),
            expiryDate: z.string().min(1, "กรุณาระบุวันที่หมดอายุ"),
            // manufactureDate: z.string(),
            // expiryDate: z.date(),
            // imageRef: z.string(),
            recieveCondition: z.string(),
            returnConditions: z.object({
                condition: z.string().optional(),
                otherTypeSpecification: z.string().optional(),
            }),
            supportCondition: z.string().optional(),
            returnType: z.string().optional(),
            
        })
    })
    //     .superRefine((data, ctx) => {

    //     const med = data.offeredMedicine
    //     if (med.recieveCondition === "subType") {
    //         if (!med.trademark || med.trademark.trim() === "") {
    //             ctx.addIssue({
    //                 code: z.ZodIssueCode.custom,
    //                 path: ["offeredMedicine", "trademark"],
    //                 message: "กรุณากรอกชื่อการค้า",
    //             })
    //         }
    //         if (!med.manufacturer || med.manufacturer.trim() === "") {
    //             ctx.addIssue({
    //                 code: z.ZodIssueCode.custom,
    //                 path: ["offeredMedicine", "manufacturer"],
    //                 message: "กรุณากรอกผู้ผลิต",
    //             })
    //         }
    //     }
    // })
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const {
        register,
        watch,
        handleSubmit,
        setValue,
        getValues,
        resetField,
        control,
        formState: { errors, isSubmitted, isValid },
    } = useForm<z.infer<typeof ResponseSchema>>({
        resolver: zodResolver(ResponseSchema),
        mode: "onChange",
        defaultValues: {
            offeredMedicine: {
                offerAmount: requestData.requestMedicine.requestAmount,
                trademark: requestData.requestMedicine.trademark,
                pricePerUnit: requestData.requestMedicine.pricePerUnit,
                manufacturer: requestData.requestMedicine.manufacturer,
                batchNumber: requestData.requestMedicine.batchNumber,
                expiryDate: requestData.requestMedicine.expiryDate,
                // manufactureDate: requestData.requestMedicine.manufactureDate,
                //expiryDate: requestData.requestMedicine.expiryDate,
                // imageRef: requestData.requestMedicine.imageRef,
                recieveCondition: receiveConditions?.condition ?? undefined,
                returnConditions: {
                    condition: returnConditions?.condition ?? undefined,
                    otherTypeSpecification: returnConditions?.otherTypeSpecification ?? undefined
                },
                returnType: requestTerm.returnType,
                supportCondition : requestTerm.supportCondition
            }
        }
    })
    const recieveCondition = watch("offeredMedicine.recieveCondition")
    const offeredAmount = watch("offeredMedicine.offerAmount")
    const offeredPrice = watch("offeredMedicine.pricePerUnit")
    const expiryDate = watch("offeredMedicine.expiryDate")
    const offeredMedicineRef = useRef(requestData.requestMedicine.name);
    const [subTypeName, setSubTypeName] = useState(requestData.requestMedicine.name);
    const [dateError, setDateError] = useState(""); // for error message
    const subTypeFields = useRef({
        trademark: requestData.requestMedicine.trademark,
        offerAmount: requestData.requestMedicine.offerAmount,
        pricePerUnit: requestData.requestMedicine.pricePerUnit,
        manufacturer: requestData.requestMedicine.manufacturer,
        batchNumber: requestData.requestMedicine.batchNumber,
        expiryDate: requestData.requestMedicine.expiryDate,
        // manufactureDate: requestData.requestMedicine.manufactureDate,
        // expiryDate: requestData.requestMedicine.expiryDate,
    })

    const imgUrl: string | null = requestData.requestMedicine.requestMedicineImage || requestData.requestMedicine?.imageRef || null;
    const isAnyChecked = Object.values(returnConditions || {}).some(Boolean);// Check if any checkbox is checked

    useEffect(() => {
        const currentValues = getValues("offeredMedicine");
        if (recieveCondition === "exactType") {
            // save the current values to ref
            subTypeFields.current = {
                trademark: currentValues.trademark,
                offerAmount: currentValues.offerAmount,
                pricePerUnit: currentValues.pricePerUnit,
                manufacturer: currentValues.manufacturer,
                batchNumber: currentValues.batchNumber,
                expiryDate: currentValues.expiryDate,
                // manufactureDate: currentValues.manufactureDate,
                // expiryDate: currentValues.expiryDate,
            }
            // set the values to the default values
            const r = requestData.requestMedicine;
            setValue("offeredMedicine.trademark", r.trademark);
            setValue("offeredMedicine.offerAmount", r.requestAmount);
            setValue("offeredMedicine.pricePerUnit", r.pricePerUnit);
            setValue("offeredMedicine.manufacturer", r.manufacturer);
            // setValue("offeredMedicine.manufactureDate", r.manufactureDate);
            // setValue("offeredMedicine.expiryDate", r.expiryDate);
        } else if (recieveCondition === "subType") {
            const r = subTypeFields.current;
            setValue("offeredMedicine.trademark", r.trademark);
            setValue("offeredMedicine.offerAmount", r.offerAmount);
            setValue("offeredMedicine.pricePerUnit", r.pricePerUnit);
            setValue("offeredMedicine.manufacturer", r.manufacturer);
            // setValue("offeredMedicine.manufactureDate", r.manufactureDate);
            // setValue("offeredMedicine.expiryDate", r.expiryDate);
        }
    }, [recieveCondition, setValue, getValues, requestData]);

    const onSubmit = async (data: z.infer<typeof ResponseSchema>) => {
        const responseBody = {
            ...data,
            offeredMedicine: {
                ...data.offeredMedicine,
                name: requestData.requestMedicine.name,
                quantity: requestData.requestMedicine.quantity,
                unit: requestData.requestMedicine.unit,
                batchNumber: data.offeredMedicine.batchNumber,
                expiryDate: data.offeredMedicine.expiryDate,
            },
            responseId: responseId,
            status: status
        }
        console.log("responseBody sssss:", responseBody)
        console.log("data sssss:", data)
        try {
            setLoading(true)
            const response = await fetch("/api/updateRequest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(responseBody),
            })

            if (!response.ok) {
                throw new Error("Failed to submit")
            }

            const result = await response.json()
            //console.log("Success:", result)
            setLoading(false)
            onOpenChange(false)
        } catch (error) {
            //console.error("Error submitting form:", error)
            setLoading(false)
        }
    }
    type UrgentType = "normal" | "immediate" | "urgent"

    const URGENT_CONFIG: Record<UrgentType, {
        variant: "normal" | "immediate" | "destructive",
        label: string,
        icon: React.ReactNode
    }> = {
        normal: {
            variant: "normal", // เขียว
            label: "ปกติ",
            icon: <ShieldAlert />
        },
        immediate: {
            variant: "immediate", // ส้ม
            label: "ด่วน",
            icon: <ShieldAlert />
        },
        urgent: {
            variant: "destructive", // แดง
            label: "ด่วนที่สุด",
            icon: <ShieldAlert />
        }
    }
    const priority: UrgentType = requestData.urgent || "normal"
    const config = URGENT_CONFIG[priority]
    const supportConditionValue = requestTerm.supportCondition === "budgetPlan" ? "ตามงบประมาณสนับสนุน"  : requestTerm.supportCondition === "servicePlan" ? "ตามสิทธิ์แผนบริการ" : "สนับสนุนโดยไม่คิดค่าใช้จ่าย"
    //console.log('requestTerm.supportCondition',requestTerm.supportCondition)
    return (
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1200px]">
                <DialogTitle>
                    <div className="grid grid-cols-4 gap-4 items-center">
                        {dialogTitle}
                    </div>

                </DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <RequestDetails requestData={requestData} responseForm={true} />
                        <div className="ml-15">
                            <div className="flex items-center space-x-2 mb-2">
                                <Badge
                                    variant={config.variant}
                                    className="flex gap-1 px-1.5 [&_svg]:size-3 mb-4"
                                >
                                    {config.icon}
                                    <div className="text-sm">{config.label}</div>
                                </Badge>
                                <Badge
                                    variant={"outline"}
                                    className="flex gap-1 px-1.5 [&_svg]:size-3 mb-4">
                                    <div className="text-sm text-gray-600 text-wrap">
                                        {requestData.requestTerm.returnType === "supportReturn" ? "ขอสนับสนุน" : requestData.requestTerm.receiveConditions.condition === "exactType" && requestData.requestTerm.returnType === "normalReturn" ? "ยืมรายการที่ต้องการ" : "ให้ยืมรายการที่ต้องการหรือยืมรายการทดแทนได้"}
                                    </div>
                                </Badge>
                            </div>

                            <div className="flex items-center space-x-4">
                                {requestData.requestTerm.receiveConditions.condition === "exactType" && requestData.requestTerm.returnType === "normalReturn" &&(
                                    <div>
                                        <Label>
                                            <input type="radio" value="exactType" {...register("offeredMedicine.recieveCondition")} disabled={requestTerm.receiveConditions.condition === "exactType"} />
                                            ให้ยืมรายการที่ต้องการ
                                        </Label>
                                        <Label>
                                            <input type="radio" value="subType" {...register("offeredMedicine.recieveCondition")} disabled={requestTerm.receiveConditions.condition === "exactType"} />
                                            ให้ยืมรายการที่ต้องการหรือยืมรายการทดแทนได้
                                        </Label>
                                    </div>
                                )}
                                {requestData.offeredMedicine?.requestTerm.returnType === "supportReturn" &&(
                                    <div>
                                         <Label>
                                            <input type="radio" checked value={String(requestTerm.supportCondition)}  disabled />
                                            {supportConditionValue}
                                        </Label>
                                    </div>
                                )}



                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <Label className="flex flex-col items-start">
                                    <div className="flex items-center gap-1">
                                        <span>ชื่อการค้า</span> <RequiredMark />
                                    </div>
                                    <Input
                                        type="text"
                                        {...register("offeredMedicine.trademark")}
                                        disabled={recieveCondition === "exactType"}
                                        className="border p-1"
                                    />
                                    {errors.offeredMedicine?.trademark && (
                                        <span className="text-red-500 text-xs -mt-1">{errors.offeredMedicine.trademark.message}</span>
                                    )}
                                </Label>
                                <Label className="flex flex-col items-start">
                                    <div className="flex items-center gap-1">
                                        <span>ผู้ผลิต</span> <RequiredMark />
                                    </div>
                                    <Input
                                        type="text"
                                        {...register("offeredMedicine.manufacturer")}
                                        disabled={recieveCondition === "exactType"}
                                        className="border p-1"
                                    />
                                    {errors.offeredMedicine?.manufacturer && (
                                        <span className="text-red-500 text-xs -mt-1">{errors.offeredMedicine.manufacturer.message}</span>
                                    )}
                                </Label>
                                <Label className="flex flex-col items-start">
                                    <div className="flex items-center gap-1">
                                        <span>จำนวนที่ให้ยืม</span> <RequiredMark />
                                    </div>
                                    <Input
                                        inputMode="decimal"
                                        placeholder="10"
                                        className="border p-1 font-light"
                                        {...register("offeredMedicine.offerAmount", { valueAsNumber: true })}
                                        onKeyDown={(e) => {
                                            const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"];

                                            if (e.key === ".") {
                                                if ((e.currentTarget.value || "").includes(".")) {
                                                    e.preventDefault();
                                                }
                                                return;
                                            }

                                            if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const raw = e.target.value.replace(/,/g, "");
                                            if (raw === "" || isNaN(Number(raw))) return;
                                            e.target.value = Number(raw).toLocaleString("th-TH", {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 2,
                                            });
                                        }}
                                    />


                                    {errors.offeredMedicine?.offerAmount && (
                                        <span className="text-red-500 text-xs -mt-1">{errors.offeredMedicine.offerAmount.message}</span>
                                    )}
                                </Label>
                                <div >
                                    <Label className="flex flex-col items-start">
                                        <div className="flex items-center gap-1">
                                            <span>ราคาต่อหน่วย</span> <RequiredMark />
                                        </div>
                                        <div className="flex">
                                            <Input
                                                inputMode="decimal"
                                                placeholder="10"
                                                {...register("offeredMedicine.pricePerUnit", { valueAsNumber: true })}
                                                onKeyDown={(e) => {
                                                    const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"];

                                                    if (e.key === ".") {
                                                        if ((e.currentTarget.value || "").includes(".")) {
                                                            e.preventDefault();
                                                        }
                                                        return;
                                                    }

                                                    if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    const raw = e.target.value.replace(/,/g, "");
                                                    if (raw === "" || isNaN(Number(raw))) return;
                                                    e.target.value = Number(raw).toLocaleString("th-TH", {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 2,
                                                    });
                                                }}
                                                className="border p-1 font-light"
                                            />
                                            {errors.offeredMedicine?.pricePerUnit && (
                                                <span className="text-red-500 text-xs -mt-1">{errors.offeredMedicine.pricePerUnit.message}</span>
                                            )}
                                            <div className="flex items-center font-bold">
                                                &nbsp;รวม&nbsp;
                                                <span className="">
                                                    {((Number(offeredAmount) || 0) * (Number(offeredPrice) || 0)).toLocaleString("th-TH", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </span>&nbsp;บาท
                                            </div>
                                        </div>
                                    </Label>
                                </div>
                                <Label className="flex flex-col items-start">
                                    <div className="flex items-center gap-1">
                                        <span>หมายเลขล็อต</span> <RequiredMark />
                                    </div>
                                    <Input
                                        type="text"
                                        {...register("offeredMedicine.batchNumber")}
                                        className="border p-1"
                                        placeholder="LOT-135270"
                                    />
                                    {errors.offeredMedicine?.batchNumber && (
                                        <span className="text-red-500 text-xs -mt-1">{errors.offeredMedicine.batchNumber.message}</span>
                                    )}
                                </Label>

                                <div className="flex flex-col gap-2">
                                    <Label className="font-bold">
                                        <div className="flex items-center gap-1">
                                            <span>วันหมดอายุ</span> <RequiredMark />
                                        </div>
                                    </Label>
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="justify-start text-left font-normal">
                                                {expiryDate
                                                    ? format(new Date(Number(expiryDate)), 'dd/MM/') + (new Date(Number(expiryDate)).getFullYear() + 543)
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
                                                selected={expiryDate ? new Date(expiryDate) : undefined}
                                                onSelect={(date) => {
                                                    if (date instanceof Date && !isNaN(date.getTime())) {
                                                        const today = new Date();
                                                        today.setHours(0, 0, 0, 0); // normalize time
                                                        const dateString = date.getTime().toString()

                                                        if (date > today) {
                                                            setValue("offeredMedicine.expiryDate", dateString, { shouldValidate: true });
                                                            setDateError(""); // clear error
                                                            setIsCalendarOpen(false); // close popover
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
                                                <div className="text-red-500 text-sm px-4 py-2">{dateError}</div>
                                            )}
                                        </PopoverContent>
                                    </Popover>
                                    {errors.offeredMedicine?.expiryDate && (
                                        <span className="text-red-500 text-xs -mt-1">กรุณาเลือกวันหมดอายุ</span>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>


                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? <div className="flex flex-row items-center gap-2 text-muted-foreground"><LoadingSpinner /> <span className="text-gray-500">ยืนยันการให้ยืม</span></div> : "ยืนยันการให้ยืม"}
                        </Button>


                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
