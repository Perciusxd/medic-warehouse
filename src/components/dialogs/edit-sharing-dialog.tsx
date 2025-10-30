"use client"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { RequiredMark, OptionalMark } from "@/components/ui/field-indicator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { format } from "date-fns"
import { useAuth } from "../providers"
import { HospitalList } from "@/context/HospitalList"

// import { format } from "date-fns"
import { Calendar1 } from "lucide-react"


function EditSharingFormSchema({selectedMed}: any) {
    return z.object({
        sharingMedicine: z.object({
            name: z.string().min(1, "กรุณาระบุชื่อยา"),
            trademark: z.string().min(1, "กรุณาระบุยี่ห้อยา"),
            quantity: z.string().optional(),
            sharingAmount: z.number().min(1, "กรุณาระบุจำนวนยา"),
            pricePerUnit: z.number().min(1, "กรุณาระบุราคาต่อหน่วย"),
            unit: z.string().min(1, "กรุณาระบุหน่วยยา"),
            batchNumber: z.string().min(1, "กรุณาระบุหมายเลขกลุ่มยา"),
            manufacturer: z.string().min(1, "กรุณาระบุผู้ผลิต"),
            expiryDate: z.string().min(1, "กรุณาระบุวันที่หมดอายุ"),
        }),
        sharingReturnTerm: z.object({
                // ทำให้เลือกได้ตามเงื่อนไข (ต้องกรอกเมื่อเป็น normalReturn เท่านั้น)
                returnType: z.enum(["normalReturn", "supportReturn", "all"]),
                // อนุญาตให้เป็น null ได้เมื่อเป็น supportReturn
                returnConditions: z.object({
                    // condition: z.enum(["exactType", "otherType"]).optional(),
                    exactTypeCondition: z.boolean().optional(),
                    otherTypeCondition: z.boolean().optional(),
                    otherTypeSpecification: z.string().optional(),
                }).optional(),
                // supportCondition: z.enum(["servicePlan", "budgetPlan", "freePlan"]).optional(),
                supportCondition: z.object({
                    servicePlan: z.boolean().optional(),
                    budgetPlan: z.boolean().optional(),
                    freePlan: z.boolean().optional(),
                }).optional(),
            }),
            selectedHospitals: z.array(z.number()).min(1, "กรุณาเลือกโรงพยาบาลอย่างน้อย 1 แห่ง"),
        }).superRefine((data, ctx) => {
            const term = data.sharingReturnTerm;
            if (term.returnType === "supportReturn") {
                if (!term.supportCondition) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["sharingReturnTerm", "supportCondition"],
                        message: "กรุณาเลือกเงื่อนไขการสนับสนุน",
                    });
                }
            }
            if (term.returnType === "normalReturn") {
        
            }
        });
}


export default function EditSharingDialog({ selectedMed, openDialog, onOpenChange }: any) {
    const { user } = useAuth();
    const loggedInHospital = user?.hospitalName;
    const hospitalList = HospitalList;
    const allHospitals = hospitalList.map(hospital => hospital.id)
    const [allSelected, setAllSelected] = useState(false);
    const postingHospital = hospitalList.find((hospital) => hospital.nameEN === loggedInHospital);
    
    const { responseDetails } = selectedMed;
    const prevSelectedHospitals = responseDetails.map((item: any) => item.respondingHospitalNameEN);
    
    const { sharingMedicine, sharingReturnTerm } = selectedMed;
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateError, setDateError] = useState("");
    
    const editSharingFormSchema = EditSharingFormSchema({selectedMed})
    const { register, handleSubmit, watch, setValue, getValues, resetField, formState: { errors , isSubmitted  } } = useForm<z.infer<typeof editSharingFormSchema>>({
        resolver: zodResolver(editSharingFormSchema),
        defaultValues: {
            sharingMedicine: {
                name: sharingMedicine.name,
                trademark: sharingMedicine.trademark,
                quantity: sharingMedicine.quantity,
                sharingAmount: selectedMed.remainingAmount || sharingMedicine.sharingAmount,
                pricePerUnit: sharingMedicine.pricePerUnit,
                unit: sharingMedicine.unit,
                batchNumber: sharingMedicine.batchNumber,
                manufacturer: sharingMedicine.manufacturer,
                expiryDate: sharingMedicine.expiryDate
            },
            sharingReturnTerm: {
                returnType: sharingReturnTerm.returnType,
                returnConditions: {
                    exactTypeCondition: sharingReturnTerm.returnConditions.exactTypeCondition,
                    otherTypeCondition: sharingReturnTerm.returnConditions.otherTypeCondition,
                    otherTypeSpecification: sharingReturnTerm.returnConditions.otherTypeSpecification??"",
                },
                supportCondition: {
                    servicePlan: sharingReturnTerm.supportCondition.servicePlan,
                    budgetPlan: sharingReturnTerm.supportCondition.servicePlan,
                    freePlan: sharingReturnTerm.supportCondition.freePlan,
                }
            },
            selectedHospitals: []
        }
    })
    const selectedHospitals = watch("selectedHospitals")
    const quantity = watch("sharingMedicine.quantity")
    const pricePerUnit = watch("sharingMedicine.pricePerUnit")
    const expiryDate = watch("sharingMedicine.expiryDate")
    const [loading, setLoading] = useState(false);
    // const receiveConditions = watch("sharingReturnTerm.receiveConditions");
    // const isAnyChecked = Object.values(receiveConditions || {}).some(Boolean);

    const onSubmit = async (data: z.infer<typeof editSharingFormSchema>) => {
        const filterPendingResponse = responseDetails.filter((item: any) => item.status === 'pending')
        //console.log('filterPendingResponse', filterPendingResponse)
        const filterHospital = hospitalList.filter(hospital => data.selectedHospitals.includes(hospital.id))
        const sharingMedicine = {
            id: `SHARE-${Date.now()}`,
            postingHospitalId: postingHospital?.id,
            postingHospitalNameEN: postingHospital?.nameEN,
            postingHospitalNameTH: postingHospital?.nameTH,
            postingHospitalAddress: postingHospital?.address,
            status: 'pending',
            createdAt: Date.now().toString(),
            updatedAt: Date.now().toString(),
            sharingMedicine: data.sharingMedicine,
            sharingReturnTerm: data.sharingReturnTerm,
        }
        const sharingBody = {
            sharingMedicine: sharingMedicine,
            selectedHospitals: filterHospital
        }
        try {
            setLoading(true)
            const response = await fetch("/api/createSharing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(sharingBody)
            })

            if (!response.ok) {
                throw new Error("Failed to submit")
            }
            
            const result = await response.json()
            // update ticket status to cancelled
            const selectedMedBody = {
                sharingId: selectedMed.id,
                status: 'cancelled'
            }
            await fetch("/api/updateSharingStatus", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(selectedMedBody)
            })
            // update response status to cancelled
            filterPendingResponse.forEach(async (item: any) => {
                const responseBody = {
                    sharingId: item.id,
                    status: 'cancelled'
                }
                await fetch("/api/updateSharingStatus", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(responseBody)
                })
            })
            setLoading(false)
            onOpenChange(false)
            toast.success("แก้ไขข้อมูลยาเรียบร้อย")
            
        }
         catch (error) {
            //console.error("Error submitting form:", error)
            toast.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูลยา")
        }
    }

    const toggleAllHospitals = () => {
        if (allSelected) { 
            setValue("selectedHospitals", [], { shouldValidate: true })
        }
        else {
            setValue("selectedHospitals", allHospitals, { shouldValidate: true })
        }
    }
    const toggleHospitalSelection = (hospitalId: number) => {
        //console.log('toggleHospitalSelection', hospitalId)
        const current = getValues("selectedHospitals") || []
        //console.log('current', current)
        const updated = current.includes(hospitalId)
            ? current.filter((id) => id !== hospitalId)
            : [...current, hospitalId]
        setValue("selectedHospitals", updated, { shouldValidate: true })
    }
  const returnType = watch("sharingReturnTerm.returnType")
 const otherTypeCondition = watch("sharingReturnTerm.returnConditions.otherTypeCondition")
    return (
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1200px]">
                <DialogHeader>
                    <DialogTitle>แก้ไขข้อมูลยา</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit , (invalid) => {
                    console.log("invalid:", invalid)})}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 flex flex-col gap-2">
                                <Label className="font-bold">รายการยา</Label>
                                <Input type="text" {...register("sharingMedicine.name")} placeholder="Chlorpheniramine (CPM)" />
                                {errors.sharingMedicine?.name && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.sharingMedicine.name.message}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">ขนาดบรรจุ</Label>
                                <Input type="text" {...register("sharingMedicine.quantity")} placeholder="10 mg/ 1 ml" />
                                {errors.sharingMedicine?.quantity && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.sharingMedicine.quantity.message}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">รูปแบบ/หน่วย</Label>
                                <Input type="text" {...register("sharingMedicine.unit")} placeholder="AMP" />
                                {errors.sharingMedicine?.unit && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.sharingMedicine.unit.message}</span>
                                )}
                            </div>
                            <div className="col-span-2 flex flex-col gap-2">
                                <Label className="font-bold">ชื่อการค้า</Label>
                                <Input type="text" {...register("sharingMedicine.trademark")} placeholder="Chlorpheno" />
                                {errors.sharingMedicine?.trademark && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.sharingMedicine.trademark.message}</span>
                                )}
                            </div>
                            <div className="col-span-2 flex flex-col gap-2">
                                <Label className="font-bold">ผู้ผลิต</Label>
                                <Input type="text" {...register("sharingMedicine.manufacturer")} placeholder="ที.แมน. ฟาร์มาซูติคอล" />
                                {errors.sharingMedicine?.manufacturer && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.sharingMedicine.manufacturer.message}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">จำนวน</Label>
                                <Input
                                    inputMode="numeric"
                                    placeholder="10"
                                    onKeyDown={(e) => {
                                        const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight"];
                                        if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}

                                    {...register("sharingMedicine.sharingAmount", { valueAsNumber: true })} className={errors.sharingMedicine?.sharingAmount ? "border-red-500" : ""}
                                />
                                {errors.sharingMedicine?.sharingAmount && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.sharingMedicine.sharingAmount.message}</span>
                                )}
                            </div><div className="flex flex-col gap-2">
                                <Label className="font-bold">ภาพประกอบ</Label>
                                <Input type="file" placeholder="Image" />
                            </div>
                            <div className="col-span-2 flex flex-col gap-2">
                                <Label className="font-bold">หมายเลขล็อต</Label>
                                <Input type="text" {...register("sharingMedicine.batchNumber")} placeholder="LOT-135270" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">ราคาต่อหน่วย</Label>
                                <Input
                                    inputMode="numeric"
                                    placeholder="10"
                                    onKeyDown={(e) => {
                                        const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight"];
                                        if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    {...register("sharingMedicine.pricePerUnit", { valueAsNumber: true })} />
                                {errors.sharingMedicine?.pricePerUnit && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.sharingMedicine.pricePerUnit.message}</span>
                                )}
                            </div>
                            <div className="items-end flex flex-row">
                                <div className="font-extralight">
                                    รวม <span className="font-bold text-gray-950"> {(Number(quantity) || 0) * (Number(pricePerUnit) || 0)} </span> บาท
                                </div>
                            </div>


                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">วันที่คาดว่าจะคืน</Label>
                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start text-left font-normal">
                                            {expiryDate
                                                ? new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: '2-digit',
                                                }).format(new Date(Number(expiryDate)))
                                                : "เลือกวันที่"
                                            }
                                            <Calendar1 className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            captionLayout="dropdown"
                                            selected={expiryDate ? new Date(expiryDate) : undefined}
                                            onSelect={(date) => {
                                                if (date instanceof Date && !isNaN(date.getTime())) {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0); // normalize time
                                                    const stringDate = date.getTime().toString();

                                                    if (date > today) {
                                                        setValue("sharingMedicine.expiryDate", stringDate, { shouldValidate: true });
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
                            </div>

                        </div>
                        <div className="ml-10">
                            <div className="flex items-center justify-between">
                                <Label>โรงพยาบาลที่ต้องการแจ้งแบ่งปัน</Label>
                            </div>
                            <span className="text-sm text-gray-500 mb-2">
                                กรุณาเลือกโรงพยาบาลที่ต้องการแจ้งแบ่งปัน โดยสามารถเลือกได้มากกว่า 1 โรงพยาบาล
                            </span>
                            <div className="flex items-center gap-2 my-4">
                                <Checkbox
                                    id="select-all"
                                    className="cursor-pointer"
                                    checked={allSelected}
                                    onCheckedChange={toggleAllHospitals} />
                                <Label htmlFor="select-all">เลือกทั้งหมด</Label>
                            </div>
                            <ScrollArea className="h-85 w-full rounded-md border">
                                <div className="p-4">
                                    {hospitalList.map(hospital => {
                                        const isChecked = selectedHospitals.includes(hospital.id)
                                        const isPrevChecked = prevSelectedHospitals.includes(hospital.nameEN)
                                        return (
                                            <div className="" key={hospital.id}>
                                                <div className="flex items-center gap-2" key={hospital.id}>
                                                    <Checkbox
                                                        id={`hospital-${hospital.id}`}
                                                        className="cursor-pointer"
                                                        checked={isChecked || isPrevChecked}
                                                        disabled={isPrevChecked}
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
                                <span className="text-red-500 text-sm">{errors.selectedHospitals.message}</span>
                            )}

                            <div className="flex flex-col">
                                                            <Label className="font-medium mt-2">รูปแบบการแบ่งปัน <RequiredMark /></Label>
                                                            <div className="flex flex-row items-center gap-4">
                                                                <Label className="mt-2 w-[190px]">
                                                                    <input type="radio" value="supportReturn" {...register("sharingReturnTerm.returnType")} />
                                                                    ขอสนับสนุน
                                                                </Label>
                                                                <Label className="mt-2 w-[120px]">
                                                                    <input type="radio" value="normalReturn" {...register("sharingReturnTerm.returnType")} />
                                                                    แบ่งปัน
                                                                </Label>
                                                                <Label className="mt-2 ">
                                                                    <input type="radio" value="all"  {...register("sharingReturnTerm.returnType")} />
                                                                    ทั้งแบ่งปันและขอสนับสนุน
                                                                </Label>
                                                            </div>
                            
                                                            {
                                                                returnType === "all" && (
                                                                    <div className="flex flex-row  mt-4 gap-4 " >
                            
                                                                        <div className="flex items-start w-[190px] ">
                                                                            <div className="flex flex-col space-y-2 ">
                                                                                <Label className="font-medium items-center">เงื่อนไขการสนับสนุน <RequiredMark /></Label>
                                                                                <Label className="font-normal">
                                                                                    <input type="checkbox"
                                                                                        // value="servicePlan"  
                                                                                        {...register("sharingReturnTerm.supportCondition.servicePlan")} />
                                                                                    ตามสิทธิ์แผนบริการ
                                                                                </Label>
                                                                                <Label className="font-normal">
                                                                                    <input type="checkbox"
                                                                                        // value="budgetPlan" 
                                                                                        {...register("sharingReturnTerm.supportCondition.budgetPlan")} />
                                                                                    ตามงบประมาณสนับสนุน
                                                                                </Label>
                                                                                <Label className="font-normal">
                                                                                    <input type="checkbox"
                                                                                        // value="freePlan"  
                                                                                        {...register("sharingReturnTerm.supportCondition.freePlan")} />
                                                                                    สนับสนุนโดยไม่คิดค่าใช้จ่าย
                                                                                </Label>
                                                                                {errors.sharingReturnTerm?.supportCondition && (
                                                                                    <span className="text-red-500 text-xs">{String(errors.sharingReturnTerm.supportCondition.message)}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col gap-2 items-start " >
                                                                            <Label className="font-medium">เงื่อนไขการรับคืน <RequiredMark /></Label>
                                                                            <div className="flex flex-col flex-wrap items-start gap-2">
                                                                                <Label className="font-normal whitespace-nowrap">
                                                                                    <input type="checkbox"
                                                                                        // value="exactType"  
                                                                                        {...register("sharingReturnTerm.returnConditions.exactTypeCondition")} />
                                                                                    คืนยารายการนี้
                                                                                </Label>
                                                                                <div >
                                                                                    <Label className="font-normal whitespace-nowrap">
                                                                                        <input type="checkbox"
                                                                                            // value="otherType"  
                                                                                            {...register("sharingReturnTerm.returnConditions.otherTypeCondition")} />
                                                                                        คืนยารายการอื่น
                                                                                    </Label>
                                                                                    <Input type="text" placeholder="ระบุรายรายการยา/ผู้ผลิต/ราคาต่อหน่วย" disabled={otherTypeCondition === false} className="w-[250px] mt-1" {...register("sharingReturnTerm.returnConditions.otherTypeSpecification")} />
                                                                                </div>
                            
                                                                                {errors.sharingReturnTerm?.returnConditions?.exactTypeCondition && (
                                                                                    <span className="text-red-500 text-xs">{String(errors.sharingReturnTerm.returnConditions.exactTypeCondition.message)}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                            
                                                                    </div>
                                                                )
                                                            }
                                                            {
                                                                returnType === "normalReturn" && (
                                                                    <div className="flex flex-row  mt-4 gap-4 " >
                            
                                                                        <div className="flex items-start w-[190px] ">
                                                                            <div className="flex flex-col space-y-2 ">
                                                                                <Label className="font-medium items-center">เงื่อนไขการสนับสนุน <RequiredMark /></Label>
                                                                                <Label className="font-normal">
                                                                                    <input type="checkbox" disabled {...register("sharingReturnTerm.supportCondition.servicePlan")} />
                                                                                    ตามสิทธิ์แผนบริการ
                                                                                </Label>
                                                                                <Label className="font-normal">
                                                                                    <input type="checkbox" disabled {...register("sharingReturnTerm.supportCondition.budgetPlan")} />
                                                                                    ตามงบประมาณสนับสนุน
                                                                                </Label>
                                                                                <Label className="font-normal">
                                                                                    <input type="checkbox" disabled {...register("sharingReturnTerm.supportCondition.freePlan")} />
                                                                                    สนับสนุนโดยไม่คิดค่าใช้จ่าย
                                                                                </Label>
                                                                                {errors.sharingReturnTerm?.supportCondition && (
                                                                                    <span className="text-red-500 text-xs">{String(errors.sharingReturnTerm.supportCondition.message)}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col gap-2 items-start " >
                                                                            <Label className="font-medium">เงื่อนไขการรับคืน <RequiredMark /></Label>
                                                                            <div className="flex flex-col flex-wrap items-start gap-2">
                                                                                <Label className="font-normal whitespace-nowrap">
                                                                                    <input type="checkbox"
                                                                                        // value="exactType" 
                                                                                        {...register("sharingReturnTerm.returnConditions.exactTypeCondition")} />
                                                                                    คืนยารายการนี้
                                                                                </Label>
                                                                                <div >
                                                                                    <Label className="font-normal whitespace-nowrap">
                                                                                        <input type="checkbox"
                                                                                            // value="otherType"  
                                                                                            {...register("sharingReturnTerm.returnConditions.otherTypeCondition")} />
                                                                                        คืนยารายการอื่น
                                                                                    </Label>
                                                                                    <Input type="text" placeholder="ระบุรายรายการยา/ผู้ผลิต/ราคาต่อหน่วย" disabled={otherTypeCondition === false} className="w-[250px] mt-1" {...register("sharingReturnTerm.returnConditions.otherTypeSpecification")} />
                                                                                </div>
                            
                                                                                {errors.sharingReturnTerm && (
                                                                                    <span className="text-red-500 text-xs">{String(errors.sharingReturnTerm.message)}</span>
                                                                                )}
                            
                                                                            </div>
                                                                        </div>
                            
                                                                    </div>
                                                                )
                                                            }
                                                            {
                                                                returnType === "supportReturn" && (
                                                                    <div className="flex flex-row  mt-4 gap-4 " >
                            
                                                                        <div className="flex items-start w-[190px] ">
                                                                            <div className="flex flex-col space-y-2 ">
                                                                                <Label className="font-medium items-center">เงื่อนไขการสนับสนุน <RequiredMark /></Label>
                                                                                <Label className="font-normal">
                                                                                    <input type="checkbox" {...register("sharingReturnTerm.supportCondition.servicePlan")} />
                                                                                    ตามสิทธิ์แผนบริการ
                                                                                </Label>
                                                                                <Label className="font-normal">
                                                                                    <input type="checkbox"  {...register("sharingReturnTerm.supportCondition.budgetPlan")} />
                                                                                    ตามงบประมาณสนับสนุน
                                                                                </Label>
                                                                                <Label className="font-normal">
                                                                                    <input type="checkbox"   {...register("sharingReturnTerm.supportCondition.freePlan")} />
                                                                                    สนับสนุนโดยไม่คิดค่าใช้จ่าย
                                                                                </Label>
                                                                                {errors.sharingReturnTerm?.supportCondition && (
                                                                                    <span className="text-red-500 text-xs">{String(errors.sharingReturnTerm.supportCondition.message)}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col gap-2 items-start " >
                                                                            <Label className="font-medium">เงื่อนไขการรับคืน <RequiredMark /></Label>
                                                                            <div className="flex flex-col flex-wrap items-start gap-2">
                                                                                <Label className="font-normal whitespace-nowrap">
                                                                                    <input type="checkbox"
                                                                                        // value="exactType" 
                                                                                        disabled {...register("sharingReturnTerm.returnConditions.exactTypeCondition")} />
                                                                                    คืนยารายการนี้
                                                                                </Label>
                                                                                <div >
                                                                                    <Label className="font-normal whitespace-nowrap">
                                                                                        <input type="checkbox"
                                                                                            // value="otherType" 
                                                                                            disabled {...register("sharingReturnTerm.returnConditions.otherTypeCondition")} />
                                                                                        คืนยารายการอื่น
                                                                                    </Label>
                                                                                    <Input type="text" placeholder="ระบุรายรายการยา/ผู้ผลิต/ราคาต่อหน่วย" disabled className="w-[250px] mt-1" {...register("sharingReturnTerm.returnConditions.otherTypeSpecification")} />
                                                                                </div>
                            
                                                                                {errors.sharingReturnTerm?.returnConditions && (
                                                                                    <span className="text-red-500 text-xs">{String(errors.sharingReturnTerm.returnConditions.message)}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                            
                                                                    </div>
                                                                )
                                                            }
                            
                                                            {/* <div className="flex flex-row  mt-4 gap-4 " >
                            
                                                                <div className="flex items-start w-[190px] ">
                                                                    <div className="flex flex-col space-y-2 ">
                                                                        <Label className="font-medium items-center">เงื่อนไขการสนับสนุน <RequiredMark /></Label>
                                                                        <Label className="font-normal">
                                                                            <input type="radio" value="servicePlan" disabled={returnType === "normalReturn"} {...register("sharingReturnTerm.supportCondition")} />
                                                                            ตามสิทธิ์แผนบริการ
                                                                        </Label>
                                                                        <Label className="font-normal">
                                                                            <input type="radio" value="budgetPlan" disabled={returnType === "normalReturn"}{...register("sharingReturnTerm.supportCondition")} />
                                                                            ตามงบประมาณสนับสนุน
                                                                        </Label>
                                                                        <Label className="font-normal">
                                                                            <input type="radio" value="freePlan" disabled={returnType === "normalReturn"} {...register("sharingReturnTerm.supportCondition")} />
                                                                            สนับสนุนโดยไม่คิดค่าใช้จ่าย
                                                                        </Label>
                                                                        {errors.sharingReturnTerm?.supportCondition && (
                                                                            <span className="text-red-500 text-xs">{String(errors.sharingReturnTerm.supportCondition.message)}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-2 items-start " >
                                                                    <Label className="font-medium">เงื่อนไขการรับคืน <RequiredMark /></Label>
                                                                    <div className="flex flex-col flex-wrap items-start gap-2">
                                                                        <Label className="font-normal whitespace-nowrap">
                                                                            <input type="radio" value="exactType" disabled={returnType !== "normalReturn"} {...register("sharingReturnTerm.returnConditions.condition")} />
                                                                            คืนยารายการนี้
                                                                        </Label>
                                                                        <div >
                                                                            <Label className="font-normal whitespace-nowrap">
                                                                                <input type="radio" value="otherType" disabled={returnType !== "normalReturn"} {...register("sharingReturnTerm.returnConditions.condition")} />
                                                                                คืนยารายการอื่น
                                                                            </Label>
                                                                            <Input type="text" placeholder="ระบุรายรายการยา/ผู้ผลิต/ราคาต่อหน่วย" className="w-[250px] mt-1" disabled={returnConditions === "exactType"} {...register("sharingReturnTerm.returnConditions.otherTypeSpecification")} />
                                                                        </div>
                            
                                                                        {errors.sharingReturnTerm?.returnConditions?.condition && (
                                                                            <span className="text-red-500 text-xs">{String(errors.sharingReturnTerm.returnConditions.condition.message)}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                            
                                                            </div> */}
                            
                                                        </div>
                                                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" className="">
                            {loading
                                ? <div className="flex flex-row items-center gap-2"><LoadingSpinner /><span className="text-gray-500">สร้าง</span></div>
                                : "สร้าง"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}