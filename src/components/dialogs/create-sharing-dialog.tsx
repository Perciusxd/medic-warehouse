import { useForm, FieldErrors } from "react-hook-form"
import { z } from "zod"
import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useHospital } from "@/context/HospitalContext"

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

import RequestDetails from "./request-details"
import { Calendar1 } from "lucide-react"
import { HospitalList } from "@/context/HospitalList"

const allHospitalList = HospitalList

const SharingFormSchema = z.object({
    sharingMedicine: z.object({
        name: z.string().min(1, "กรุณาระบุชื่อยา"),
        trademark: z.string().min(1, "กรุณาระบุยี่ห้อยา"),
        quantity: z.string().min(1, "กรุณาระบุจำนวนยา"),
        sharingAmount: z.number().min(1, "กรุณาระบุจำนวนยา"),
        pricePerUnit: z.number().min(1, "กรุณาระบุราคาต่อหน่วย"),
        unit: z.string().min(1, "กรุณาระบุหน่วยยา"),
        batchNumber: z.string().min(1, "กรุณาระบุหมายเลขกลุ่มยา"),
        manufacturer: z.string().min(1, "กรุณาระบุผู้ผลิต"),
        expiryDate: z.coerce.date({ invalid_type_error: "กรุณาระบุวันที่หมดอายุ" }),
    }),
    sharingReturnTerm: z.object({
        receiveConditions: z.object({
            exactType: z.boolean(),
            subType: z.boolean(),
            otherType: z.boolean(),
            supportType: z.boolean(),
            noReturn: z.boolean(),
        }).refine((data) => 
            Object.values(data).some(value => value === true),
            {
                message: "กรุณาเลือกอย่างน้อย 1 เงื่อนไข" ,
                path: []
            }

        )
    }),
    selectedHospitals: z.array(z.number()).min(1, "กรุณาเลือกโรงพยาบาลอย่างน้อย 1 แห่ง"),
});

export default function CreateSharingDialog({ openDialog, onOpenChange }: any) {
    const { loggedInHospital } = useHospital();
    const postingHospital = allHospitalList.find((hospital) => hospital.nameEN === loggedInHospital);
    console.log("postingHospital", postingHospital)
    const hospitalList = allHospitalList.filter(hospital => hospital.nameEN !== loggedInHospital)
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, watch, setValue, getValues, resetField, formState: { errors , isSubmitted  } } = useForm<z.infer<typeof SharingFormSchema>>({
        resolver: zodResolver(SharingFormSchema),
        defaultValues: {
            selectedHospitals: []
            
        }
    });

    const selectedHospitals = watch("selectedHospitals")
    const quantity = watch("sharingMedicine.sharingAmount")
    const pricePerUnit = watch("sharingMedicine.pricePerUnit")
    const expiryDate = watch("sharingMedicine.expiryDate")

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateError, setDateError] = useState(""); // for error message
    const allHospitals = hospitalList.map(hospital => hospital.id)
    const allSelected = selectedHospitals.length === allHospitals.length

    const receiveConditions = watch("sharingReturnTerm.receiveConditions"); // Get the current values of receiveConditions
    const isAnyChecked = Object.values(receiveConditions || {}).some(Boolean);// Check if any checkbox is checked



    
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

    const onSubmit = async (data: z.infer<typeof SharingFormSchema>) => {
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
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sharingBody),
            })

            if (!response.ok) {
                throw new Error("Failed to submit")
            }

            const result = await response.json()
            setLoading(false)
            onOpenChange(false)
            resetField("sharingMedicine")
            resetField("sharingReturnTerm")
            setValue("selectedHospitals", [])
        } catch (error) {
            console.error("Error submitting form:", error)
            setLoading(false)
        }
    }

    const onError = (errors: FieldErrors<z.infer<typeof SharingFormSchema>>) => {
        console.error("❌ Form validation errors:", errors);
    }

    return (
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1200px]">
                <DialogHeader>
                    <DialogTitle>สร้างการแชร์ยา</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
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
                                <Label className="font-bold">ขนาด</Label>
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
                                <Input type="text" {...register("sharingMedicine.batchNumber")} placeholder="รอการส่งมอบจากตัวแทนจำหน่าย" />
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
                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start text-left font-normal">
                                            {expiryDate
                                                ? expiryDate.toLocaleDateString()
                                                : "เลือกวันที่"}
                                            <Calendar1 className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={expiryDate ? new Date(expiryDate) : undefined}
                                            onSelect={(date) => {
                                                if (date instanceof Date && !isNaN(date.getTime())) {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0); // normalize time

                                                    if (date > today) {
                                                        setValue("sharingMedicine.expiryDate", date, { shouldValidate: true });
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
                            <span className="text-red-500 text-sm">{errors.selectedHospitals.message}</span>
                            )}
                                                         
                            <Label className="mb-2 mt-4">เงื่อนไขการรับคืนยา</Label>
                            <div className="flex flex-col items-start space-y-2">
                                <Label className="font-normal">
                                    <input type="checkbox" {...register("sharingReturnTerm.receiveConditions.exactType")} />
                                    รับคืนเฉพาะรายการนี้
                                </Label>
                                <Label className="font-normal">
                                    <input type="checkbox" {...register("sharingReturnTerm.receiveConditions.subType")} />
                                    รับคืนรายการทดแทน
                                </Label>
                                <Label className="font-normal">
                                    <input type="checkbox" {...register("sharingReturnTerm.receiveConditions.supportType")} />
                                    สามารถสนับสนุนได้
                                </Label>
                                <Label className="font-normal">
                                    <input type="checkbox" {...register("sharingReturnTerm.receiveConditions.otherType")} />
                                    รับคืนรายการอื่นได้
                                </Label>
                                <Label className="font-normal">
                                    <input type="checkbox" {...register("sharingReturnTerm.receiveConditions.noReturn")} />
                                    ไม่รับคืน
                                </Label>
                                    {!isAnyChecked && isSubmitted && (
                                    <p className="text-red-500 text-sm mt-1">
                                        กรุณาเลือกอย่างน้อย 1 เงื่อนไข
                                    </p>
                                    )}
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
    );
}