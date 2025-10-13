import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import ImageHoverPreview from "@/components/ui/image-hover-preview"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { RequiredMark, OptionalMark } from "@/components/ui/field-indicator"

import RequestDetails from "./request-details"
// removed unused lucide icons
import { format } from "date-fns"
import { HospitalList } from "@/context/HospitalList"
// removed unused import
import { Calendar as CalendarIcon } from "lucide-react"
import { th, tr } from "date-fns/locale" // ใช้ locale ภาษาไทย
import * as React from "react"
import { fa } from "zod/v4/locales"

// Convert a Blob/File to a Base64 data URL
const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(blob);
    });
};

type CompressOptions = { maxWidth?: number; maxHeight?: number; quality?: number };

// Compress an image file by resizing (keeping aspect ratio) and JPEG encoding
const compressImageFile = async (
    file: File,
    { maxWidth = 1024, maxHeight = 1024, quality = 0.7 }: CompressOptions = {}
): Promise<Blob> => {
    const dataUrl = await blobToDataUrl(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (e) => reject(e);
        image.src = dataUrl;
    });

    let targetWidth = img.width;
    let targetHeight = img.height;
    const widthRatio = maxWidth / img.width;
    const heightRatio = maxHeight / img.height;
    const shouldResize = img.width > maxWidth || img.height > maxHeight;
    if (shouldResize) {
        const ratio = Math.min(widthRatio, heightRatio);
        targetWidth = Math.floor(img.width * ratio);
        targetHeight = Math.floor(img.height * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to get 2D context for image compression');
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const blob: Blob = await new Promise((resolve, reject) => {
        if (canvas.toBlob) {
            canvas.toBlob((b) => {
                if (b) resolve(b);
                else reject(new Error('Image compression failed'));
            }, 'image/jpeg', quality);
        } else {
            // Fallback for environments without toBlob
            const fallbackDataUrl = canvas.toDataURL('image/jpeg', quality);
            // Convert data URL to Blob
            const byteString = atob(fallbackDataUrl.split(',')[1]);
            const mimeString = fallbackDataUrl.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            resolve(new Blob([ab], { type: mimeString }));
        }
    });

    return blob;
};

const allHospitalList = HospitalList;


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

// removed unused FormSchema

// field indicators moved to shared ui component

const RequestSchema = z.object({
    urgent: z.enum(["urgent", "immediate", "normal"]),
    requestMedicine: z.object({
        name: z.string().min(1, "กรุณากรอกชื่อยา"),
        trademark: z.string().min(1, "กรุณากรอกชื่อการค้า"),
        description: z.string().optional(),
        requestAmount: z.coerce.number({ required_error: "กรุณากรอกจำนวนที่ต้องการยืม" })
            .min(1, "จำนวนที่ต้องการยืมต้องมากกว่า 0")
            .max(10000, "จำนวนที่ต้องการยืมต้องไม่เกิน 10000"),
        quantity: z.string().optional(),
        pricePerUnit: z.coerce.number({ required_error: "กรุณากรอกราคาต่อหน่วย" })
            .min(1, "ราคาต่อหน่วยต้องมากกว่า 0")
            .max(100000, "ราคาต่อหน่วยต้องไม่เกิน 100,000"),
        unit: z.string().min(1, "กรุณากรอกรูปแบบ/หน่วย"),
        manufacturer: z.string().min(1, "กรุณากรอกผู้ผลิต"),
        // เก็บไฟล์ภาพที่อัปโหลดไว้ในฟอร์ม (ไม่บังคับ)
        image: z.custom<File | undefined>((value) => value === undefined || value instanceof File, {
            message: "กรุณาอัปโหลดไฟล์ภาพที่ถูกต้อง",
        }).optional(),
    }),
    requestTerm: z.object({
        // ทำให้เลือกได้ตามเงื่อนไข (ต้องกรอกเมื่อเป็น normalReturn เท่านั้น)
        expectedReturnDate: z.string().optional(),
        returnType: z.enum(["normalReturn", "supportReturn"]),
        receiveConditions: z.object({
            condition: z.enum(["exactType", "subType"]).optional(),
        }).optional().nullable(),
        // อนุญาตให้เป็น null ได้เมื่อเป็น supportReturn
        returnConditions: z.object({
            condition: z.enum(["exactType", "otherType"]).optional(),
            otherTypeSpecification: z.string().optional(),
        }).optional().nullable(),
        supportCondition: z.enum(["servicePlan", "budgetPlan", "freePlan"]).optional(),
    }),
    selectedHospitals: z.array(z.number()).min(1, "กรุณาเลือกโรงพยาบาลอย่างน้อย 1 แห่ง"),
}).superRefine((data, ctx) => {
    const term = data.requestTerm;
    if (term.returnType === "supportReturn") {
        if (!term.supportCondition) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["requestTerm", "supportCondition"],
                message: "กรุณาเลือกเงื่อนไขการสนับสนุน",
            });
        }
        if (term.returnConditions && term.returnConditions.condition) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["requestTerm", "returnConditions"],
                message: "เมื่อเลือกขอสนับสนุน ไม่ต้องระบุข้อเสนอการคืน",
            });
        }
    } else {
        // normalReturn
        if (!term.expectedReturnDate || String(term.expectedReturnDate).trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["requestTerm", "expectedReturnDate"],
                message: "กรุณาเลือกวันที่คาดว่าจะคืน",
            });
        }
    }
})

// removed unused defaultHospital

export default function CreateRequestDialog({ requestData, loggedInHospital, openDialog, onOpenChange }: any) {
    const postingHospital = allHospitalList.find((hospital) => hospital.nameEN === loggedInHospital);
    const hospitalList = allHospitalList.filter(hospital => hospital.nameEN !== loggedInHospital)
    const [loading, setLoading] = useState(false)
    const {
        register,
        watch,
        handleSubmit,
        setValue,
        getValues,
        resetField,
        formState: { errors, isValid },
    } = useForm<z.infer<typeof RequestSchema>>({
        resolver: zodResolver(RequestSchema),
        mode: "onChange",
        defaultValues: {
            urgent: "immediate",
            requestMedicine: {
                name: "",
                trademark: "",
                description: "",
                quantity: "",
                requestAmount: 0,
                pricePerUnit: 0,
                unit: "",
                manufacturer: "",
            },
            requestTerm: {
                expectedReturnDate: "",
                returnType: "normalReturn",
                receiveConditions: {
                    condition: "exactType",
                },
                returnConditions: {
                    condition: "exactType",
                    otherTypeSpecification: "",
                },
                supportCondition: undefined,
            },
            selectedHospitals: [],
        },
    })
    console.log("Form errors:", errors)
    const selectedHospitals = watch("selectedHospitals")
    // removed unused watch variables
    const returnType = watch("requestTerm.returnType")
    const quantity = watch("requestMedicine.requestAmount");
    const pricePerUnit = watch("requestMedicine.pricePerUnit");
    const returnConditions = watch("requestTerm.returnConditions")

    // removed unused state isCalendarOpen
    const [dateError, setDateError] = useState(""); // for error message
    const allHospitals = hospitalList.map(hospital => hospital.id)
    const allSelected = selectedHospitals.length === allHospitals.length

    const watchedImage = watch("requestMedicine.image")
    // Image preview state
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        // When form image changes, generate/revoke preview URL
        if (watchedImage instanceof File) {
            const url = URL.createObjectURL(watchedImage)
            setImagePreviewUrl(url)
            return () => {
                URL.revokeObjectURL(url)
            }
        } else {
            setImagePreviewUrl(null)
        }
    }, [watchedImage])

    // Ensure returnConditions is null when selecting supportReturn so validation passes
    useEffect(() => {
        if (returnType === "supportReturn" && returnConditions !== null) {
            setValue("requestTerm.returnConditions", null, { shouldValidate: true })
            setValue("requestTerm.receiveConditions", null, { shouldValidate: true })
        }
    }, [returnType, returnConditions, setValue])

    const toggleAllHospitals = () => {
        if (allSelected) {
            setValue("selectedHospitals", [], { shouldValidate: true })
        }
        else {
            setValue("selectedHospitals", allHospitals, { shouldValidate: true })
        }
    }

    const toggleHospitalSelection = (hospitalId: number) => {
        const current = getValues("selectedHospitals") || []
        const updated = current.includes(hospitalId)
            ? current.filter((id) => id !== hospitalId)
            : [...current, hospitalId]
        setValue("selectedHospitals", updated, { shouldValidate: true })
    }

    const sendMailsSequentially = async (filterHospital: any, requestData: any) => {
        for (const val of filterHospital) {
            try {
                // รอ 1 วิ ก่อนยิง request
                await new Promise((resolve) => setTimeout(resolve, 1000));

                const mailResponse = await fetch("/api/sendmail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        requestData: requestData,
                        selectedHospitals: val,
                    }),
                });

                if (!mailResponse.ok) {
                    console.warn("sendmail failed:", await mailResponse.text());
                } else {
                    console.log("sendmail success");
                }
            } catch (err) {
                console.error("sendmail error:", err);
            }
        }
    }

    const onSubmit = async (data: z.infer<typeof RequestSchema>) => {
        console.log("data", data)
        const filterHospital = hospitalList.filter(hospital => data.selectedHospitals.includes(hospital.id))
        // Compress and prepare Base64 image (data URL) for persistence instead of a blob URL
        let base64Image: string | null = null
        if (data.requestMedicine.image instanceof File) {
            try {
                const compressed = await compressImageFile(data.requestMedicine.image, {
                    maxWidth: 800,
                    maxHeight: 800,
                    quality: 0.6,
                })
                base64Image = await blobToDataUrl(compressed)
            } catch (e) {
                //console.error("Failed to compress/convert image to Base64", e)
            }
        }
        const requestData = {
            id: `REQ-${Date.now()}`,
            postingHospitalId: postingHospital?.id,
            postingHospitalNameEN: postingHospital?.nameEN,
            postingHospitalNameTH: postingHospital?.nameTH,
            postingHospitalAddress: postingHospital?.address,
            status: "pending",
            urgent: data.urgent,
            createdAt: Date.now().toString(),
            updatedAt: Date.now().toString(),
            requestMedicine: data.requestMedicine,
            requestTerm: {
                ...data.requestTerm,
                // ถ้าเป็นการขอสนับสนุน ให้ส่ง returnConditions เป็น null
                returnConditions: data.requestTerm.supportCondition ? null : data.requestTerm.returnConditions,
            },
            description: data.requestMedicine.description,
            // Save Base64 data URL; keep blob URL only for preview
            requestMedicineImage: base64Image,
        }

        const requestBody = {
            requestData: requestData,
            selectedHospitals: filterHospital
        }
        console.log('requestBody', requestBody)
        try {
            setLoading(true)
            const response = await fetch("/api/createRequest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })

            if (!response.ok) {
                throw new Error("Failed to submit")
            } else {
                if (filterHospital.length) {
                    // sendmail
                    sendMailsSequentially(filterHospital, requestData).catch((err) => {
                        console.error("sendMails error:", err);
                    });
                }
            }

            const result = await response.json()

            setLoading(false)
            onOpenChange(false)
            // resetForm()
            resetField("requestMedicine")
            resetField("requestTerm")
            setValue("urgent", "normal")
            setValue("selectedHospitals", [])
        } catch (error) {
            //console.error("Error submitting form:", error)
            setLoading(false)
        }
    }
    const [isOpen, setIsOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)


    return (
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1200px]">
                <DialogTitle>แจ้งขอยืม</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">รายการยา <RequiredMark /></Label>
                                <Input type="text" {...register("requestMedicine.name")} placeholder="Chlorpheniramine (CPM)" />
                                {errors.requestMedicine?.name && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.name.message}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">ขนาด <OptionalMark /></Label>
                                <Input type="text" {...register("requestMedicine.quantity")} placeholder="10 mg/ 1 ml" />
                                {errors.requestMedicine?.quantity && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.quantity.message}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">รูปแบบ/หน่วย <RequiredMark /></Label>
                                <Input type="text" {...register("requestMedicine.unit")} placeholder="AMP" />
                                {errors.requestMedicine?.unit && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.unit.message}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">ชื่อการค้า <RequiredMark /></Label>
                                <Input type="text" {...register("requestMedicine.trademark")} placeholder="Chlorpheno" />
                                {errors.requestMedicine?.trademark && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.trademark.message}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">ผู้ผลิต <RequiredMark /></Label>
                                <Input type="text" {...register("requestMedicine.manufacturer")} placeholder="ที.แมน. ฟาร์มาซูติคอล" />
                                {errors.requestMedicine?.manufacturer && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.manufacturer.message}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">ภาพประกอบ <OptionalMark /></Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) {
                                                setValue("requestMedicine.image", file, { shouldValidate: true });
                                            } else {
                                                setValue("requestMedicine.image", undefined, { shouldValidate: true });
                                            }
                                        }}
                                    />
                                    <ImageHoverPreview previewUrl={imagePreviewUrl} />
                                </div>
                                {errors.requestMedicine?.image && (
                                    <span className="text-red-500 text-xs -mt-1">{String(errors.requestMedicine.image.message)}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">จำนวน <RequiredMark /></Label>
                                <Input
                                    inputMode="decimal"
                                    placeholder="10"
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

                                    {...register("requestMedicine.requestAmount", {
                                        valueAsNumber: true,
                                        onBlur: (e) => {
                                            const raw = e.target.value.replace(/,/g, "");
                                            if (raw === "" || isNaN(Number(raw))) return;
                                            const rounded = Math.round(Number(raw) * 1000) / 1000;
                                            e.target.value = rounded.toLocaleString("th-TH", {
                                                minimumFractionDigits: 3,
                                                maximumFractionDigits: 3,
                                            });
                                        }
                                    })} className={errors.requestMedicine?.requestAmount ? "border-red-500" : ""}
                                />
                                {errors.requestMedicine?.requestAmount && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.requestAmount.message}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">ราคาต่อหน่วย <RequiredMark /></Label>
                                <Input
                                    inputMode="decimal"
                                    placeholder="10"
                                    {...register("requestMedicine.pricePerUnit", { valueAsNumber: true })}
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
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        });
                                    }}
                                />
                                {errors.requestMedicine?.pricePerUnit && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.pricePerUnit.message}</span>
                                )}
                                <div className="items-end flex flex-row">
                                    <div className="font-extralight">
                                        รวม&nbsp;
                                        <span className="font-bold text-gray-950">
                                            {((Number(quantity) || 0) * (Number(pricePerUnit) || 0)).toLocaleString("th-TH", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </span> บาท
                                    </div>
                                </div>
                            </div>


                        </div>
                        <div className="ml-10">
                            <div className="mb-4">
                                <Label className="font-bold mb-2">สถานะ <RequiredMark /></Label>
                                <div className="flex flex-row gap-2 ">
                                    <div className="flex items-center gap-2">
                                        <input type="radio" value="urgent" {...register("urgent")} />
                                        <Label className="font-normal">ด่วนที่สุด</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="radio" value="immediate" {...register("urgent")} />
                                        <Label className="font-normal">ด่วน</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="radio" value="normal" {...register("urgent")} />
                                        <Label className="font-normal">ปกติ</Label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>โรงพยาบาลที่ต้องการขอยืม <RequiredMark /></Label>
                            </div>
                            <span className="text-sm text-gray-500 mb-2">
                                กรุณาเลือกโรงพยาบาลที่ต้องการขอยืม โดยสามารถเลือกได้มากกว่า 1 โรงพยาบาล
                            </span>
                            <div className="text-xs text-muted-foreground mb-2">
                                เลือกแล้ว {selectedHospitals.length.toLocaleString("th-TH")} / {hospitalList.length.toLocaleString("th-TH")}
                            </div>
                            <div className="flex items-center gap-2 my-4">
                                <Checkbox
                                    id="select-all"
                                    className="cursor-pointer"
                                    checked={allSelected}
                                    onCheckedChange={toggleAllHospitals} />
                                <Label htmlFor="select-all">เลือกทั้งหมด</Label>
                            </div>
                            <ScrollArea className="h-40 w-full rounded-md border">
                                <div className="p-4">
                                    {[...hospitalList]
                                        .sort((a, b) => a.nameTH.localeCompare(b.nameTH, "th")) // เรียงตามชื่อ ก-ฮ
                                        .map(hospital => {
                                            const isChecked = selectedHospitals.includes(hospital.id)
                                            return (
                                                <div className="" key={hospital.id}>
                                                    <div className="flex items-center gap-2" key={hospital.id}>
                                                        <Checkbox
                                                            id={`hospital-${hospital.id}`}
                                                            className="cursor-pointer"
                                                            checked={isChecked}
                                                            onCheckedChange={() => toggleHospitalSelection(hospital.id)}
                                                        />
                                                        <Label htmlFor={`hospital-${hospital.id}`} className="font-normal">{hospital.nameTH}</Label>
                                                    </div>
                                                    <Separator className="my-2" />
                                                </div>
                                            )
                                        })}
                                </div>
                            </ScrollArea>
                            {errors.selectedHospitals && (
                                <p className="text-red-500 text-sm mt-1">{errors.selectedHospitals.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex flex-row items-center gap-4">
                            <Label className="mt-2">
                                <input type="radio" value="normalReturn" {...register("requestTerm.returnType")} />
                                ขอยืม
                            </Label>
                            <Label className="mt-2">
                                <input type="radio" value="supportReturn" {...register("requestTerm.returnType")} />
                                ขอสนับสนุน
                            </Label>
                        </div>

                        {
                            returnType === "normalReturn" && (
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="flex flex-col gap-2">
                                        <Label className="font-bold">เหตุผลการยืม <OptionalMark /></Label>
                                        <Input type="text" {...register("requestMedicine.description")} placeholder="รอการส่งมอบจากตัวแทนจำหน่าย" />
                                    </div>


                                    <div className="flex flex-col gap-2">
                                        <Label className="font-medium">เงื่อนไขการรับ <RequiredMark /></Label>
                                        <div className="flex flex-row gap-2 mt-2">
                                            <Label className="font-normal">
                                                <input type="radio" value="exactType" {...register("requestTerm.receiveConditions.condition")} />
                                                ยาจากผู้ผลิตรายนี้
                                            </Label>
                                            <Label className="font-normal">
                                                <input type="radio" value="subType" {...register("requestTerm.receiveConditions.condition")} />
                                                ยาจากผู้ผลิตรายอื่น
                                            </Label>
                                            {errors.requestTerm?.receiveConditions?.condition && (
                                                <span className="text-red-500 text-xs">{String(errors.requestTerm.receiveConditions.condition.message)}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label className="font-bold">วันที่คาดว่าจะคืน <RequiredMark /></Label>
                                        <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="justify-start text-left font-normal"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {date
                                                        ? format(date, "dd/MM/", { locale: th }) + (date.getFullYear() + 543)
                                                        : "เลือกวันที่"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 overflow-hidden">
                                                <Calendar
                                                    mode="single"
                                                    selected={date}
                                                    captionLayout="dropdown"
                                                    fromYear={2020}
                                                    toYear={new Date().getFullYear() + 20}
                                                    formatters={{
                                                        formatYearCaption: (year: Date) =>
                                                            (year.getFullYear() + 543).toString(),
                                                    }}
                                                    locale={th}
                                                    onSelect={(d) => {
                                                        setIsOpen(false)
                                                        if (d instanceof Date && !isNaN(d.getTime())) {
                                                            const today = new Date()
                                                            today.setHours(0, 0, 0, 0)

                                                            if (d > today) {
                                                                setDate(d)
                                                                setValue(
                                                                    "requestTerm.expectedReturnDate",
                                                                    d.getTime().toString(),
                                                                    { shouldValidate: true }
                                                                )
                                                                setDateError("")
                                                            } else {
                                                                setDateError("กรุณาเลือกวันที่ในอนาคต")
                                                                setValue("requestTerm.expectedReturnDate", "", {
                                                                    shouldValidate: true,
                                                                })
                                                            }
                                                        } else {
                                                            setDateError("วันที่ไม่ถูกต้อง")
                                                        }
                                                    }}
                                                    initialFocus
                                                />
                                                {/* Error จากการเลือกย้อนหลัง */}
                                                {dateError && (
                                                    <div className="text-red-500 text-sm px-4 py-2">{dateError}</div>
                                                )}
                                            </PopoverContent>
                                        </Popover>
                                        {/* {date && (
                                            <div className="text-xs text-muted-foreground pl-1">
                                                {formatThaiDate(date)}
                                            </div>
                                        )} */}

                                        {/* Error จาก Zod */}
                                        {errors.requestTerm?.expectedReturnDate && (
                                            <div className="text-red-500 text-xs">
                                                {errors.requestTerm.expectedReturnDate.message}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 items-start">
                                        <Label className="font-medium">ข้อเสนอการคืน <RequiredMark /></Label>
                                        <div className="flex flex-row flex-wrap items-start gap-3 mt-2">
                                            <Label className="font-normal whitespace-nowrap">
                                                <input type="radio" value="exactType" {...register("requestTerm.returnConditions.condition")} />
                                                คืนยารายการนี้
                                            </Label>

                                            <Label className="font-normal whitespace-nowrap">
                                                <input type="radio" value="otherType" {...register("requestTerm.returnConditions.condition")} />
                                                คืนยารายการอื่น
                                            </Label>
                                            {errors.requestTerm?.returnConditions?.condition && (
                                                <span className="text-red-500 text-xs">{String(errors.requestTerm.returnConditions.condition.message)}</span>
                                            )}
                                            <div className="basis-full mt-1">
                                                {returnConditions?.condition === "otherType" && (
                                                    <Input type="text" placeholder="ระบุรายรายการยา/ผู้ผลิต/ราคาต่อหน่วย" {...register("requestTerm.returnConditions.otherTypeSpecification")} />
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )
                        }
                    </div>

                    <div className="flex flex-col">
                        {
                            returnType === "supportReturn" && (
                                <div className="flex flex-col items-start space-y-2 mt-4">
                                    <div className="flex items-start ">
                                        <div className="flex flex-row space-x-4">
                                            <Label className="font-medium">เงื่อนไขการสนับสนุน <RequiredMark /></Label>
                                            <Label className="font-normal">
                                                <input type="radio" value="servicePlan" {...register("requestTerm.supportCondition")} />
                                                ตามสิทธิ์แผนบริการ
                                            </Label>
                                            <Label className="font-normal">
                                                <input type="radio" value="budgetPlan" {...register("requestTerm.supportCondition")} />
                                                ตามงบประมาณสนับสนุน
                                            </Label>
                                            <Label className="font-normal">
                                                <input type="radio" value="freePlan" {...register("requestTerm.supportCondition")} />
                                                สนับสนุนโดยไม่คิดค่าใช้จ่าย
                                            </Label>
                                            {errors.requestTerm?.supportCondition && (
                                                <span className="text-red-500 text-xs">{String(errors.requestTerm.supportCondition.message)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div>

                    <DialogFooter>
                        <Button type="submit" className="" disabled={loading || !isValid}>
                            {loading
                                ? <div className="flex flex-row items-center gap-2"><LoadingSpinner /><span className="text-gray-500">สร้าง</span></div>
                                : "ส่งคำขอ"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}