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
import { useState, useRef, useEffect } from "react"
import { RequiredMark, OptionalMark } from "@/components/ui/field-indicator"
import dynamic from 'next/dynamic';
const SharingPdfPreview = dynamic(() => import('@/components/ui/pdf_creator/sharing_pdf'), { ssr: false });
import { useAuth } from "@/components/providers";
import clsx from "clsx"

function RequestDetails({ sharingMed }: any) {
    // console.log('sharingReturnTerm', sharingMed.sharingReturnTerm.returnConditions)
    const { createdAt } = sharingMed
    const date = new Date(Number(createdAt)); // convert string to number, then to Date
    // Thai date formatting helper (Buddhist calendar)
    const formattedDate = format(new Date(Number(date)), 'dd/MM/') + (new Date(Number(date)).getFullYear() + 543)
    const sharingDetails = sharingMed.sharingDetails
    const sharingMedicine = sharingMed.offeredMedicine ? sharingMed.sharingMedicine : sharingDetails.sharingMedicine
    const { name, trademark, quantity, unit, manufacturer, expiryDate, batchNumber, sharingAmount, pricePerUnit } = sharingMedicine
    const sharingReturnTerm = sharingMed.offeredMedicine ? sharingMed.sharingReturnTerm.returnConditions : sharingMed.sharingDetails.sharingReturnTerm
    const imgUrl: string | null = sharingMed.sharingDetails.sharingMedicineImage || sharingMed.sharingMedicineImage || null;
    const responseStatus = sharingMed.responseStatus
    const respondingHospitalNameTH = sharingMed.respondingHospitalNameTH

    const totalAmount = sharingAmount as number * pricePerUnit as number
    //console.log('sharingDetails', sharingMed)
    //console.log('sharingReturnTermsชชชชชชชชชชชชชชชชชชช', sharingDetails.sharingMedicine)
    /* const formattedExpiryDate = format(new Date(Number(expiryDate)), 'dd/MM/yyyy'); */
    // const formattedExpiryDate = format(sharingDetails.sharingMedicine.expiryDate, 'dd/MM/yyyy'); //ดึงมาก่อนนะอิงจากที่มี ดึงไว้ใน columns.tsx
    const formattedExpiryDate = format(new Date(Number(expiryDate)), 'dd/MM/') + (new Date(Number(expiryDate)).getFullYear() + 543)
    console.log('returnConditions', sharingMed.sharingReturnTerm)
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
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-1">
                            <input type="checkbox" checked={
                                sharingMed?.sharingReturnTerm?.returnConditions?.exactTypeCondition
                                    ? sharingMed?.sharingReturnTerm?.returnConditions?.exactTypeCondition
                                    : sharingMed?.sharingDetails.sharingReturnTerm?.returnConditions?.exactTypeCondition
                            } disabled />
                            <Label>คืนยารายการนี้</Label>
                        </div>
                        <div className="flex flex-row gap-1">
                            <input type="checkbox" checked={
                                sharingMed?.sharingReturnTerm?.returnConditions?.otherTypeCondition
                                    ? sharingMed?.sharingReturnTerm?.returnConditions?.otherTypeCondition
                                    : sharingMed?.sharingDetails.sharingReturnTerm?.returnConditions?.otherTypeCondition
                            } disabled />
                            <Label>คืนยารายการอื่น</Label>
                            {
                                sharingMed.responseStatus === 'offered' && (
                                    <Label>
                                        ( {sharingMed?.sharingReturnTerm?.returnConditions?.otherTypeSpecification ?? "-"} )
                                    </Label>
                                )
                            }
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-1">
                            <input type="checkbox" checked={
                                sharingMed?.sharingReturnTerm?.supportCondition?.servicePlan
                                    ? sharingMed?.sharingReturnTerm?.supportCondition?.servicePlan
                                    : sharingMed?.sharingDetails.sharingReturnTerm?.supportCondition?.servicePlan} disabled />
                            <Label>ตามสิทธิ์แผนบริการ</Label>
                        </div>
                        <div className="flex flex-row gap-1">
                            <input type="checkbox" checked={
                                sharingMed?.sharingReturnTerm?.supportCondition?.budgetPlan
                                    ? sharingMed?.sharingReturnTerm?.supportCondition?.budgetPlan
                                    : sharingMed?.sharingDetails.sharingReturnTerm?.supportCondition?.budgetPlan
                            } disabled />
                            <Label>ตามงบประมาณสนับสนุน</Label>
                        </div>
                        <div className="flex flex-row gap-1">
                            <input type="checkbox" checked={sharingMed?.sharingReturnTerm?.supportCondition?.freePlan
                                ? sharingMed?.sharingReturnTerm?.supportCondition?.freePlan
                                : sharingMed?.sharingDetails.sharingReturnTerm?.supportCondition?.freePlan
                            } disabled />
                            <Label>สนับสนุนโดยไม่คิดค่าใช้จ่าย</Label>
                        </div>
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
            // exactType: z.boolean(),
            // otherType: z.boolean(),
            // subType: z.boolean(),
            // supportType: z.boolean(),
            // noReturn: z.boolean(),
            returnType: z.enum(["normalReturn", "supportReturn", "all"]).optional(),
            returnConditions: z.object({
                condition: z.enum(["exactType", "otherType"]).optional(),
                otherTypeSpecification: z.string().optional(),
            }).optional(),
            supportCondition: z.enum(["servicePlan", "budgetPlan", "freePlan"]).optional(),
        })
        // .refine((data) =>
        //     Object.values(data).some(value => value === true),
        //     {
        //         message: "กรุณาเลือกอย่างน้อย 1 เงื่อนไข",
        //         path: []
        //     }
        // )
    })
}

function ResponseDetails({ sharingMed, onOpenChange, onSubmittingChange }: any) {
    console.log('sharingMedsssss', sharingMed)
    console.log('responseStatus', sharingMed?.responseDetails?.returnTerm?.returnType)
    console.log('responseDetails', sharingMed?.responseDetails)
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
                returnType: sharingMed?.responseStatus === 'offered'
                    ? sharingMed?.returnTerm?.returnType
                    : sharingMed?.responseStatus === 're-confirm'
                        ? sharingMed?.returnTerm?.returnType
                        : sharingMed?.sharingDetails?.sharingReturnTerm?.returnType === "all"
                            ? "normalReturn"
                            : sharingMed?.responseDetails?.returnTerm?.returnType,
                returnConditions: {
                    condition: sharingMed.responseStatus === 'offered' ? sharingMed?.returnTerm?.returnConditions?.condition : undefined,
                    // ? sharingMed.responseDetails?.returnTerm?.returnConditions?.condition ,
                    otherTypeSpecification: sharingMed.responseStatus === 'offered' ? sharingMed?.returnTerm?.returnConditions?.otherTypeSpecification : "",
                },
                supportCondition: sharingMed?.sharingDetails?.sharingReturnTerm?.supportCondition ?? sharingMed.responseDetails?.returnTerm?.supportCondition ?? sharingMed.returnTerm.supportCondition ?? undefined,
                // exactType: Boolean(existingReturnTerm?.exactType),
                // otherType: Boolean(existingReturnTerm?.otherType),
                // subType: Boolean(existingReturnTerm?.subType),
                // supportType: Boolean(existingReturnTerm?.supportType),
                // noReturn: Boolean(existingReturnTerm?.noReturn),
            }
        }
    })
    const expectedReturn = watch("expectedReturnDate");
    const returnTerm = watch("returnTerm"); // Get the current values of receiveConditions
    const isAnyChecked = Object.values(returnTerm || {}).some(Boolean);// Check if any checkbox is checked
    const onSubmit = async (data: z.infer<typeof ResponseShema>) => {
        const isResponse = sharingMed.id.startsWith('RESP');
        const updateId = isResponse ? sharingMed.id : sharingMed.responseId;
        const newStatus = existingOffer ? 're-confirm' : sharingMed.acceptedOffer ? 'to-transfer' : 'offered';
        // หาวิธีแก้ข้างล่างนี้ถ้่ ขก เอาของที่แก้แล้วขึ้น จบ
        const pricePerUnit = sharingMed.sharingDetails?.sharingMedicine?.pricePerUnit
            ? sharingMed.sharingDetails?.sharingMedicine?.pricePerUnit
            : sharingMed?.offeredMedicine.pricePerUnit
                ? sharingMed?.offeredMedicine.pricePerUnit
                : sharingMed?.sharingMedicine?.sharingMedicine?.pricePerUnit
                    ? sharingMed?.sharingMedicine?.sharingMedicine?.pricePerUnit
                    : 0;
        console.log('data', data)
        console.log('sharingMed', sharingMed)
        const responseBody = {
            sharingId: updateId,
            acceptOffer: {
                responseAmount: data.responseAmount,
                expectedReturnDate: data.expectedReturnDate,
                description: data.description || "",
                pricePerUnit: pricePerUnit
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

    const returnType = watch("returnTerm.returnType")
    const sharingReturnTerm = watch("returnTerm")
    console.log("returnTerm", sharingReturnTerm)

    const responseStatus = sharingMed.responseStatus
    const returnConditions = watch("returnTerm.returnConditions.condition")
    console.log("errors", errors)
    useEffect(() => {
        if (returnConditions === "exactType") {
            // ถ้าเลือก "คืนยารายการนี้" ให้ล้างค่าในช่อง text
            setValue("returnTerm.returnConditions.otherTypeSpecification", "");
            console.log(setValue);
        }
        if (returnType === "supportReturn") {
            // clear the enum field using undefined so it matches the expected type ("exactType" | "otherType" | undefined)
            setValue("returnTerm.returnConditions.otherTypeSpecification", "");
            setValue("returnTerm.returnConditions.condition", undefined);
        }
        if (returnType === "normalReturn") {
            setValue("returnTerm.supportCondition", undefined);
        }
    }, [returnConditions, returnType, setValue]);

    return (
        <form id="accept-sharing-form" onSubmit={handleSubmit(onSubmit, onError)}>
            <div className="flex flex-col gap-4">
                {/* <div  className=" grid grid-cols-2  gap-2 "> */}
                <div className={clsx(
                    sharingMed?.responseDetail?.status === 're-confirm' && "",
                    sharingMed?.status !== "re-confirm" && "grid grid-cols-2 gap-2"
                )
                }>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row gap-4">
                            <div className="flex flex-col gap-1 flex-1/2">
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
                            <div className="flex flex-col gap-1 flex-1/2">
                                <Label className="">วันที่คาดว่าจะคืน</Label>
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
                        </div>


                        {/* <div className="flex flex-col gap-1">
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
                    </div> */}

                        <div className="flex flex-col gap-1">
                            <Label>เหตุผลการยืม</Label>
                            <Input
                                placeholder="ระบุเหตุผลการยืม"
                                type="text"
                                disabled={sharingMed?.status === 're-confirm' || sharingMed?.responseDetail?.status === 'offered'}
                                {...register("description")}
                            />
                            {errors.description?.message && <span className="text-red-500 text-sm">{errors.description.message}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col ">
                        <Label className="font-medium mt-2" hidden={sharingMed?.responseDetail?.status === 're-confirm'} >ประเภทรายการ <RequiredMark /></Label>
                        <div className="flex flex-row items-center gap-4" hidden={sharingMed?.responseDetail?.status === 're-confirm'} >
                            <Label className="mt-2 w-[190px]" >
                                <input type="radio"
                                    disabled={sharingMed?.responseDetail?.status === 're-confirm'}
                                    value="supportReturn"
                                    {...register("returnTerm.returnType")} />
                                ขอสนับสนุน
                            </Label>
                            <Label className="mt-2 w-[120px]">
                                <input type="radio"
                                    disabled={sharingMed?.responseDetail?.status === 're-confirm'}
                                    value="normalReturn"
                                    {...register("returnTerm.returnType")} />
                                ขอยืม
                            </Label>
                        </div>
                        {
                            sharingMed?.responseDetail?.status === 're-confirm' && sharingMed?.responseDetail?.returnTerm.returnType === 'supportReturn' && (
                                <div className="gap-4">
                                    <Label className="font-medium mt-2" >ประเภทรายการ <RequiredMark /></Label>
                                    <div className="flex gap-4 mt-2 text-">

                                        <input type="radio" checked
                                            className=""
                                            value={sharingMed?.responseDetail?.returnTerm.returnType}
                                            {...register("returnTerm.returnType")}
                                        />
                                        <Label>{sharingMed?.responseDetail?.returnTerm.returnType === 'supportReturn' ? "ขอสนับสนุน" : "ขอยืม"}</Label>

                                    </div>
                                    <Label className="font-medium mt-2" >เงื่อนไขการคืน </Label>
                                    <div className="flex gap-4 mt-2">

                                        <input type="radio" checked
                                            value={sharingMed?.responseDetail?.returnTerm.supportCondition}
                                            {...register("returnTerm.supportCondition")}
                                        />
                                        <Label> {sharingMed?.responseDetail?.returnTerm.returnType === 'supportReturn'
                                            ? sharingMed?.responseDetail?.returnTerm.supportCondition === 'servicePlan'
                                                ? "ตามสิทธิ์แผนบริการ"
                                                : sharingMed?.responseDetail?.returnTerm.supportCondition === 'budgetPlan'
                                                    ? "ตามงบประมาณสนับสนุน" : "สนับสนุนโดยไม่คิดค่าใช้จ่าย" : ""}
                                        </Label>

                                    </div>
                                </div>
                            )
                        }
                        {
                            sharingMed?.responseDetail?.status === 're-confirm' && sharingMed?.responseDetail?.returnTerm.returnType === 'normalReturn' && (
                                <div>
                                    <div>
                                        <Label className="font-medium mt-2" >ประเภทรายการ <RequiredMark /></Label>
                                        <div className="flex gap-4 mt-2">
                                            <input type="radio"
                                                {...register("returnTerm.returnType")}
                                                value={sharingMed?.responseDetail?.returnTerm.returnType}
                                                checked
                                            />
                                             <Label>{sharingMed?.responseDetail?.returnTerm.returnType === 'supportReturn' ? "ขอสนับสนุน" : "ขอยืม"}</Label>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="font-medium mt-2" >เงื่อนไขการคืน </Label>
                                        <div className="flex gap-4 mt-2">
                                            <input type="radio"
                                                checked
                                                value={sharingMed?.responseDetail?.returnTerm.returnConditions.condition}
                                                {...register("returnTerm.returnConditions.condition")}
                                            />
                                            <Label> {sharingMed?.responseDetail?.returnTerm.returnType === 'normalReturn'
                                                ? sharingMed?.responseDetail?.returnTerm.returnConditions.condition === 'exactType'
                                                    ? "คืนเฉพาะยารายการนี้" : "คืนยารายการอื่น" : ""}
                                            </Label>
                                        </div>
                                    </div>
                                    <div hidden={sharingMed?.responseDetail?.returnTerm.returnConditions.condition === 'exactType'}>
                                        <div className="flex gap-4 mt-2">
                                            <Label>ระบุ </Label>
                                        <input type="text"
                                         className="text-sm underline"
                                            checked
                                            value={sharingMed?.responseDetail?.returnTerm.returnConditions.otherTypeSpecification !== ""
                                                ? sharingMed?.responseDetail?.returnTerm.returnConditions.otherTypeSpecification : "ไม่ได้ระบุ"}
                                            {...register("returnTerm.returnConditions.otherTypeSpecification")}
                                        />
                                            </div>
                                        
                                    </div>
                                </div>
                            )
                        }
                        <div>

                        </div>

                        {
                            returnType === "all" && sharingMed?.responseDetail?.status !== 're-confirm' && (
                                <div className="flex flex-row  mt-4 gap-4 " >

                                    <div className="flex items-start w-[190px] ">
                                        <div className="flex flex-col space-y-2 ">
                                            <Label className="font-medium items-center">เงื่อนไขการสนับสนุน <RequiredMark /></Label>
                                            <Label className="font-normal">
                                                <input type="radio" value="servicePlan"  {...register("returnTerm.supportCondition")} />
                                                ตามสิทธิ์แผนบริการ
                                            </Label>
                                            <Label className="font-normal">
                                                <input type="radio" value="budgetPlan" {...register("returnTerm.supportCondition")} />
                                                ตามงบประมาณสนับสนุน
                                            </Label>
                                            <Label className="font-normal">
                                                <input type="radio" value="freePlan"  {...register("returnTerm.supportCondition")} />
                                                สนับสนุนโดยไม่คิดค่าใช้จ่าย
                                            </Label>
                                            {errors.returnTerm?.supportCondition && (
                                                <span className="text-red-500 text-xs">{String(errors.returnTerm.supportCondition.message)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-start " >
                                        <Label className="font-medium">เงื่อนไขการรับคืน <RequiredMark /></Label>
                                        <div className="flex flex-col flex-wrap items-start gap-2">
                                            <Label className="font-normal whitespace-nowrap">
                                                <input type="radio" value="exactType"  {...register("returnTerm.returnConditions.condition")} />
                                                คืนยารายการนี้
                                            </Label>
                                            <div >
                                                <Label className="font-normal whitespace-nowrap">
                                                    <input type="radio" value="otherType"  {...register("returnTerm.returnConditions.condition")} />
                                                    คืนยารายการอื่น
                                                </Label>
                                                <Input type="text" placeholder="ระบุรายรายการยา/ผู้ผลิต/ราคาต่อหน่วย" disabled={returnConditions === "exactType"} className="w-[250px] mt-1" {...register("returnTerm.returnConditions.otherTypeSpecification")} />
                                            </div>

                                            {errors.returnTerm?.returnConditions?.condition && (
                                                <span className="text-red-500 text-xs">{String(errors.returnTerm.returnConditions.condition.message)}</span>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            )
                        }

                        {
                            returnType === "normalReturn" && sharingMed?.responseDetail?.status !== 're-confirm' && (
                                <div className="flex flex-row  mt-4 gap-4 "  >

                                    <div className="flex items-start w-[190px] ">
                                        <div className="flex flex-col space-y-2 ">
                                            <Label className="font-medium items-center">เงื่อนไขการสนับสนุน <RequiredMark /></Label>
                                            <Label className="font-normal">
                                                <input type="radio" value={returnType === "normalReturn" ? "servicePlan" : undefined} disabled {...register("returnTerm.supportCondition")} />
                                                ตามสิทธิ์แผนบริการ
                                            </Label>
                                            <Label className="font-normal">
                                                <input type="radio" value={returnType === "normalReturn" ? "budgetPlan" : undefined} disabled {...register("returnTerm.supportCondition")} />
                                                ตามงบประมาณสนับสนุน
                                            </Label>
                                            <Label className="font-normal">
                                                <input type="radio" value={returnType === "normalReturn" ? "freePlan" : undefined} disabled {...register("returnTerm.supportCondition")} />
                                                สนับสนุนโดยไม่คิดค่าใช้จ่าย
                                            </Label>
                                            {errors.returnTerm?.supportCondition && (
                                                <span className="text-red-500 text-xs">{String(errors.returnTerm.supportCondition.message)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-start " >
                                        <Label className="font-medium">เงื่อนไขการรับคืน <RequiredMark /></Label>
                                        <div className="flex flex-col flex-wrap items-start gap-2">
                                            <Label className="font-normal whitespace-nowrap">
                                                <input type="radio" value="exactType" disabled={sharingMed?.responseDetail?.status === 're-confirm'
                                                    // ? true : returnConditions === "exactType" ? true : false
                                                } {...register("returnTerm.returnConditions.condition")} />
                                                คืนยารายการนี้
                                            </Label>
                                            <div >
                                                <Label className="font-normal whitespace-nowrap">
                                                    <input type="radio" value="otherType" disabled={sharingMed?.responseDetail?.status === 're-confirm'
                                                        // ? true : returnConditions === "exactType" ? true : false
                                                    } {...register("returnTerm.returnConditions.condition")} />
                                                    คืนยารายการอื่น
                                                </Label>
                                                <Input type="text" placeholder="ระบุรายรายการยา/ผู้ผลิต/ราคาต่อหน่วย" disabled={sharingMed?.responseDetail?.status === 're-confirm' || returnConditions === "exactType"
                                                    // ? true : returnConditions === "exactType" ? true : false
                                                }
                                                    className="w-[250px] mt-1" {...register("returnTerm.returnConditions.otherTypeSpecification")} />
                                            </div>

                                            {errors.returnTerm?.returnConditions?.condition && (
                                                <span className="text-red-500 text-xs">{String(errors.returnTerm.returnConditions.condition.message)}</span>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            )
                        }
                        {
                            returnType === "supportReturn" && sharingMed?.responseDetail?.status !== 're-confirm' && (
                                <div className="flex flex-row  mt-4 gap-4 " >

                                    <div className="flex items-start w-[190px] ">
                                        <div className="flex flex-col space-y-2 ">
                                            <Label className="font-medium items-center">เงื่อนไขการสนับสนุน <RequiredMark /></Label>
                                            <Label className="font-normal">
                                                <input type="radio" value={returnType === "supportReturn" ? "servicePlan" : undefined} disabled={sharingMed?.responseDetail?.status === 're-confirm'} {...register("returnTerm.supportCondition")} />
                                                ตามสิทธิ์แผนบริการ
                                            </Label>
                                            <Label className="font-normal">
                                                <input type="radio" value={returnType === "supportReturn" ? "budgetPlan" : undefined} disabled={sharingMed?.responseDetail?.status === 're-confirm'}  {...register("returnTerm.supportCondition")} />
                                                ตามงบประมาณสนับสนุน
                                            </Label>
                                            <Label className="font-normal">
                                                <input type="radio" value={returnType === "supportReturn" ? "freePlan" : undefined} disabled={sharingMed?.responseDetail?.status === 're-confirm'}  {...register("returnTerm.supportCondition")} />
                                                สนับสนุนโดยไม่คิดค่าใช้จ่าย
                                            </Label>
                                            {errors.returnTerm?.supportCondition && (
                                                <span className="text-red-500 text-xs">{String(errors.returnTerm.supportCondition.message)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-start " >
                                        <Label className="font-medium">เงื่อนไขการรับคืน <RequiredMark /></Label>
                                        <div className="flex flex-col flex-wrap items-start gap-2">
                                            <Label className="font-normal whitespace-nowrap">
                                                <input type="radio" value="exactType" disabled {...register("returnTerm.returnConditions.condition")} />
                                                คืนยารายการนี้
                                            </Label>
                                            <div >
                                                <Label className="font-normal whitespace-nowrap">
                                                    <input type="radio" value="otherType" disabled {...register("returnTerm.returnConditions.condition")} />
                                                    คืนยารายการอื่น
                                                </Label>
                                                <Input type="text" placeholder="ระบุรายรายการยา/ผู้ผลิต/ราคาต่อหน่วย" disabled className="w-[250px] mt-1" {...register("returnTerm.returnConditions.otherTypeSpecification")} />
                                            </div>

                                            {errors.returnTerm?.returnConditions?.condition && (
                                                <span className="text-red-500 text-xs">{String(errors.returnTerm.returnConditions.condition.message)}</span>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            )
                        }

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
        //console.log('sharingMed', sharingMed)
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