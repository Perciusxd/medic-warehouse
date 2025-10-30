import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
// import { format } from "date-fns"
import { useAuth } from "../providers"
import { RequiredMark, OptionalMark } from "@/components/ui/field-indicator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar1 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { HospitalList } from "@/context/HospitalList"
import { toast } from "sonner"
import { format } from "date-fns"
import * as React from "react"
import { th, tr } from "date-fns/locale" // ใช้ locale ภาษาไทย
import { Calendar as CalendarIcon } from "lucide-react"
const RequestSchema = z.object({
    urgent: z.enum(["urgent", "immediate", "normal"]),
    requestMedicine: z.object({
        name: z.string().min(1, "Name is required"),
        trademark: z.string().min(1, "Trademark is required"),
        description: z.string().optional(),
        requestAmount: z.number().min(1, "Request amount must be greater than 0").max(1000, "Request amount must be less than 1000"),
        quantity: z.string().optional(),
        pricePerUnit: z.number().min(1, "Price per unit must be greater than 0").max(100000, "Price per unit must be less than 100000"),
        unit: z.string().min(1, "Unit is required"),
        manufacturer: z.string().min(1, "Manufacturer is required"),
        packingSize: z.string().optional(),

    }),
    requestTerm: z.object({
        // ทำให้เลือกได้ตามเงื่อนไข (ต้องกรอกเมื่อเป็น normalReturn เท่านั้น)
        expectedReturnDate: z.string().optional(),
        returnType: z.enum(["normalReturn", "supportReturn"]),
        receiveConditions: z.object({
            condition: z.enum(["exactType", "subType"]).optional(),
        }).optional(),
        // อนุญาตให้เป็น null ได้เมื่อเป็น supportReturn
        returnConditions: z.object({
            condition: z.enum(["exactType", "otherType"]).optional(),
            otherTypeSpecification: z.string().optional(),
        }).optional(),
        supportCondition: z.enum(["servicePlan", "budgetPlan", "freePlan"]).optional(),
    }),
    selectedHospitals: z.array(z.number()).min(1, "กรุณาเลือกโรงพยาบาลอย่างน้อย 1 แห่ง"),
})

export default function EditRequestDialog({ selectedMed, openDialog, onOpenChange }: any) {
    const { user } = useAuth();
    const loggedInHospital = user?.hospitalName;
    const hospitalList = HospitalList;
    const postingHospital = hospitalList.find((hospital) => hospital.nameEN === loggedInHospital);
    const allHospitals = hospitalList.map(hospital => hospital.id)
    const [loading, setLoading] = useState(false)
    const { urgent, requestMedicine, requestTerm, responseDetails } = selectedMed;
    const prevSelectedHospitals = responseDetails.map((item: any) => item.respondingHospitalNameEN);

    const { register, handleSubmit, watch, setValue, getValues, resetField, formState: { errors, isSubmitted, isValid } } = useForm<z.infer<typeof RequestSchema>>({
        resolver: zodResolver(RequestSchema),
        defaultValues: {
            urgent: urgent,
            requestMedicine: {
                name: requestMedicine.name,
                trademark: requestMedicine.trademark,
                description: requestMedicine.description,
                requestAmount: requestMedicine.requestAmount,
                quantity: requestMedicine.quantity,
                unit: requestMedicine.unit,
                manufacturer: requestMedicine.manufacturer,
                pricePerUnit: requestMedicine.pricePerUnit,
                packingSize: requestMedicine.packingSize,
            },
            requestTerm: {
                expectedReturnDate: selectedMed.requestTerm.expectedReturnDate,
                returnType: selectedMed.requestTerm.returnType,
                receiveConditions: {
                    condition: selectedMed.requestTerm.receiveConditions.condition,
                },
                returnConditions: {
                    condition: selectedMed.requestTerm.returnConditions.condition,
                    otherTypeSpecification: selectedMed.requestTerm.returnConditions.otherTypeSpecification ?? "",
                },
                supportCondition: selectedMed.requestTerm.supportCondition ?? undefined,
            },
            selectedHospitals: [],
        }
    })
    const quantity = watch("requestMedicine.requestAmount");
    const pricePerUnit = watch("requestMedicine.pricePerUnit");
    const expectedReturnDate = watch("requestTerm.expectedReturnDate");
    const returnType = watch("requestTerm.returnType")
    const selectedHospitals = watch("selectedHospitals");
    const allSelected = selectedHospitals.length === allHospitals.length
    const packingSize = watch("requestMedicine.packingSize");
    //console.log('expectedReturnDate sss',returnType)
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

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateError, setDateError] = useState("");

    const onSubmit = async (data: z.infer<typeof RequestSchema>) => {
        const filterPendingResponse = responseDetails.filter((item: any) => item.status === 'pending')
        //console.log('filterPendingResponse', filterPendingResponse)
        const filterHospital = hospitalList.filter(hospital => data.selectedHospitals.includes(hospital.id))
        const requestData = {
            id: `REQ-${Date.now()}`,
            postingHospitalId: postingHospital?.id,
            postingHospitalNameEN: postingHospital?.nameEN,
            postingHospitalNameTH: postingHospital?.nameTH,
            postingHospitalAddress: postingHospital?.address,
            status: "pending",
            urgent: data.urgent,
            createAt: Date.now().toString(),
            updatedAt: Date.now().toString(),
            requestMedicine: data.requestMedicine,
            requestTerm: data.requestTerm
        }

        const requestBody = {
            requestData: requestData,
            selectedHospitals: filterHospital
        }
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
            }

            const result = await response.json()
            //console.log('result', result)
            const selectedMedBody = {
                id: selectedMed.id,
                status: 'cancelled'
            }
            await fetch("/api/updateTicketStatus", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(selectedMedBody)
            })

            filterPendingResponse.forEach(async (item: any) => {
                const responseBody = {
                    id: item.id,
                    status: 'cancelled'
                }
                await fetch("/api/updateTicketStatus", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(responseBody)
                })
            })

            setLoading(false)
            onOpenChange(false)
            toast.success("แก้ไขข้อมูลยาเรียบร้อย")
        } catch (error) {
            //console.error("Error submitting form:", error)
            setLoading(false)
            toast.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูลยา")
        }
    }
    const [isOpen, setIsOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    const returnConditions = watch("requestTerm.returnConditions")
    //console.log('dataasdasdasdasd', selectedMed)
    return (
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1200px]">
                <DialogTitle>แจ้งขอยืม</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit, (invalid) => {
                    console.log("invalid:", invalid)
                })} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 flex flex-col gap-2">
                                <Label className="font-bold">รายการยา</Label>
                                <Input type="text" {...register("requestMedicine.name")} placeholder="Chlorpheniramine (CPM)" />
                                {errors.requestMedicine?.name && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.name.message}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">ขนาด</Label>
                                <Input type="text" {...register("requestMedicine.quantity")} placeholder="10 mg/ 1 ml" />
                                {errors.requestMedicine?.quantity && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.quantity.message}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">รูปแบบ/หน่วย</Label>
                                <Input type="text" {...register("requestMedicine.unit")} placeholder="AMP" />
                                {errors.requestMedicine?.unit && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.unit.message}</span>
                                )}
                            </div>
                            <div className="col-span-2 flex flex-col gap-2">
                                <Label className="font-bold">ชื่อการค้า</Label>
                                <Input type="text" {...register("requestMedicine.trademark")} placeholder="Chlorpheno" />
                                {errors.requestMedicine?.trademark && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.trademark.message}</span>
                                )}
                            </div>
                            <div className="col-span-2 flex flex-col gap-2">
                                <Label className="font-bold">ผู้ผลิต</Label>
                                <Input type="text" {...register("requestMedicine.manufacturer")} placeholder="ที.แมน. ฟาร์มาซูติคอล" />
                                {errors.requestMedicine?.manufacturer && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.manufacturer.message}</span>
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

                                    {...register("requestMedicine.requestAmount", { valueAsNumber: true })} className={errors.requestMedicine?.requestAmount ? "border-red-500" : ""}
                                />
                                {errors.requestMedicine?.requestAmount && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.requestAmount.message}</span>
                                )}
                            </div><div className="flex flex-col gap-2">
                                <Label className="font-bold">ภาพประกอบ</Label>
                                <Input type="file" placeholder="Image" />
                            </div>
                            {/* <div className="col-span-2 flex flex-col gap-2">
                                <Label className="font-bold">เหตุผลการยืม</Label>
                                <Input type="text" {...register("requestMedicine.description")} placeholder="รอการส่งมอบจากตัวแทนจำหน่าย" />
                            </div> */}
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
                                    {...register("requestMedicine.pricePerUnit", { valueAsNumber: true })} />
                                {errors.requestMedicine?.pricePerUnit && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.pricePerUnit.message}</span>
                                )}
                            </div>
                            <div className="items-end flex flex-row">
                                <div className="font-extralight">
                                    รวม <span className="font-bold text-gray-950"> {(Number(quantity) || 0) * (Number(pricePerUnit) || 0)} </span> บาท
                                </div>
                            </div>

                            {/* {
                                returnType === "supportReturn" &&(
                                     <div className="flex flex-col gap-2">
                                <Label className="font-bold">วันที่คาดว่าจะคืน</Label>
                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start text-left font-normal">
                                            {expectedReturnDate
                                                ? new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: '2-digit',
                                                }).format(new Date(Number(expectedReturnDate)))
                                                : "เลือกวันที่"}
                                            <Calendar1 className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            captionLayout="dropdown"
                                            selected={expectedReturnDate ? new Date(expectedReturnDate) : undefined}
                                            onSelect={(date) => {
                                                if (date instanceof Date && !isNaN(date.getTime())) {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0); // normalize time
                                                    const dateString = date.getTime().toString()

                                                    if (date > today) {
                                                        setValue("requestTerm.expectedReturnDate", dateString, { shouldValidate: true });
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

                                )
                            } */}

                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">ขนาดบรรจุ</Label>
                                <Input type="text"  {...register("requestMedicine.packingSize")} placeholder="10 mg/ 1 ml" />

                            </div>

                        </div>
                        <div className="ml-10">
                            <div className="mb-4">
                                <Label className="font-bold mb-2">สถานะ</Label>
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
                                <Label>โรงพยาบาลที่ต้องการขอยืม</Label>
                            </div>
                            <span className="text-sm text-gray-500 mb-2">
                                กรุณาเลือกโรงพยาบาลที่ต้องการขอยืม โดยสามารถเลือกได้มากกว่า 1 โรงพยาบาล
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
                                                        checked={isChecked || prevSelectedHospitals.includes(hospital.nameEN)}
                                                        disabled={prevSelectedHospitals.includes(hospital.nameEN)}
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
                                <p className="text-red-500 text-sm">{errors.selectedHospitals.message}</p>
                            )}

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
                                                <Label className="font-bold">วันที่คาดว่าจะคืน</Label>
                                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="justify-start text-left font-normal">
                                                            {expectedReturnDate
                                                                ? new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: '2-digit',
                                                                }).format(new Date(Number(expectedReturnDate)))
                                                                : "เลือกวันที่"}
                                                            <Calendar1 className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            captionLayout="dropdown"
                                                            selected={expectedReturnDate ? new Date(expectedReturnDate) : undefined}
                                                            onSelect={(date) => {
                                                                if (date instanceof Date && !isNaN(date.getTime())) {
                                                                    const today = new Date();
                                                                    today.setHours(0, 0, 0, 0); // normalize time
                                                                    const dateString = date.getTime().toString()

                                                                    if (date > today) {
                                                                        setValue("requestTerm.expectedReturnDate", dateString, { shouldValidate: true });
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
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" className="">
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