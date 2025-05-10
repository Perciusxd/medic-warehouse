import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"

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

export const allHospitalList = [
    {
        id: 1,
        nameTH: 'โรงพยาบาลนาหม่อม',
        nameEN: 'Na Mom Hospital',
        address: '456 Elm St, City B',
    },
    {
        id: 2,
        nameTH: 'โรงพยาบาลสงขลา',
        nameEN: 'Songkhla Hospital',
        address: '123 Main St, City A',
    },
    {
        id: 3,
        nameTH: 'โรงพยาบาลสิงหนคร',
        nameEN: 'Singha Nakhon Hospital',
        address: '789 Oak St, City C',
    },
    {
        id: 4,
        nameEN: "Hospital D",
        nameTH: "โรงพยาบาลดี",
        address: "321 Pine St, Hamletville",
        phone: "555-3456",
        specialties: ["Radiology", "Gastroenterology"],
        rating: 4.2,
    },
    {
        id: 5,
        nameEN: "Hospital E",
        nameTH: "โรงพยาบาลดี",
        address: "654 Maple St, Boroughtown",
        phone: "555-7890",
        specialties: ["Psychiatry", "Endocrinology"],
        rating: 4.7,
    },
];

const FormSchema = z.object({
    mode: z.enum(["auto", "manual", "advanced"]),
    customInput: z.string().optional(),
})

const RequestSchema = z.object({
    urgent: z.enum(["urgent", "soon", "normal"]),
    requestMedicine: z.object({
        name: z.string().min(1, "Name is required"),
        trademark: z.string().min(1, "Trademark is required"),
        description: z.string().optional(),
        requestAmount: z.number().min(1, "Request amount must be greater than 0").max(1000, "Request amount must be less than 1000"),
        quantity: z.string().min(1, "Quantity is required"),
        pricePerUnit: z.number().min(1, "Price per unit must be greater than 0").max(100000, "Price per unit must be less than 100000"),
        unit: z.string().min(1, "Unit is required"),
        manufacturer: z.string().min(1, "Manufacturer is required"),
    }),
    requestTerm: z.object({
        expectedReturnDate: z.coerce.date({ invalid_type_error: "Expected return date must be a valid date" }),
        receiveConditions: z.object({
            condition: z.enum(["exactType", "subType", "other"]),
        })
    }),
    selectedHospitals: z.array(z.number().min(1, "At least one hospital must be selected")),
})

const defaultHospital = {
    id: "hospital-123",
    nameEN: "General Hospital",
    nameTH: "โรงพยาบาลทั่วไป",
    address: "123 Main St, Cityville",
    phone: "555-1234",

}

export default function CreateRequestDialog({ requestData, loggedInHospital, openDialog, onOpenChange }) {
    console.log("loggedInHospital", loggedInHospital);
    const postingHospital = allHospitalList.find((hospital) => hospital.nameEN === loggedInHospital);
    const hospitalList = allHospitalList.filter(hospital => hospital.nameEN !== loggedInHospital)
    console.log("postingHospital", postingHospital);
    const [loading, setLoading] = useState(false)
    const {
        register,
        watch,
        handleSubmit,
        setValue,
        getValues,
        resetField,
        formState: { errors },
    } = useForm<z.infer<typeof RequestSchema>>({
        resolver: zodResolver(RequestSchema),
        defaultValues: {
            urgent: "soon",
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
                expectedReturnDate: undefined,
                receiveConditions: {
                    condition: "exactType",
                },
            },
            selectedHospitals: [],
        },
    })

    const selectedHospitals = watch("selectedHospitals")
    const urgent = watch("urgent")
    const expectedReturnDate = watch("requestTerm.expectedReturnDate");
    const quantity = watch("requestMedicine.requestAmount");
    const pricePerUnit = watch("requestMedicine.pricePerUnit");

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateError, setDateError] = useState(""); // for error message
    const allHospitals = hospitalList.map(hospital => hospital.id)
    const allSelected = selectedHospitals.length === allHospitals.length

    const toggleAllHospitals = () => {
        if (allSelected) {
            setValue("selectedHospitals", [])
        }
        else {
            setValue("selectedHospitals", allHospitals)
        }
    }

    const toggleHospitalSelection = (hospitalId: number) => {
        const current = getValues("selectedHospitals") || []
        const updated = current.includes(hospitalId)
            ? current.filter((id) => id !== hospitalId)
            : [...current, hospitalId]
        setValue("selectedHospitals", updated)
        console.log(updated);
    }

    const onSubmit = async (data: z.infer<typeof RequestSchema>) => {
        const filterHospital = hospitalList.filter(hospital => data.selectedHospitals.includes(hospital.id))
        const requestData = {
            id: `REQ-${Date.now()}`,
            postingHospitalId: postingHospital.id,
            postingHospitalNameEN: postingHospital.nameEN,
            postingHospitalNameTH: postingHospital.nameTH,
            postingHospitalAddress: postingHospital.address,
            status: "pending",
            urgent: data.urgent,
            createAt: Date.now().toString(),
            updatedAt: Date.now().toString(),
            requestMedicine: data.requestMedicine,
            requestTerm: data.requestTerm
        }
        console.log('requestData', requestData);
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
            console.log("Success:", result)
            setLoading(false)
            onOpenChange(false)
            // resetForm()
            resetField("requestMedicine")
            resetField("requestTerm")
            setValue("urgent", false)
            setValue("selectedHospitals", [])
        } catch (error) {
            console.error("Error submitting form:", error)
            setLoading(false)
        }
    }

    return (
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1200px]">
                <DialogTitle>Create request</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                <Input type="number" placeholder="10" {...register("requestMedicine.requestAmount", { valueAsNumber: true })} className={errors.requestMedicine?.requestAmount ? "border-red-500" : ""} />
                                {errors.requestMedicine?.requestAmount && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.requestAmount.message}</span>
                                )}
                            </div><div className="flex flex-col gap-2">
                                <Label className="font-bold">ภาพประกอบ</Label>
                                <Input type="file" placeholder="Image" />
                            </div>
                            <div className="col-span-2 flex flex-col gap-2">
                                <Label className="font-bold">เหตุผลการยืม</Label>
                                <Input type="text" {...register("requestMedicine.description")} placeholder="รอการส่งมอบจากตัวแทนจำหน่าย" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">ราคาต่อหน่วย</Label>
                                <Input type="number" {...register("requestMedicine.pricePerUnit", { valueAsNumber: true })} />
                                {errors.requestMedicine?.pricePerUnit && (
                                    <span className="text-red-500 text-xs -mt-1">{errors.requestMedicine.pricePerUnit.message}</span>
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
                                            {expectedReturnDate
                                                ? expectedReturnDate.toLocaleDateString()
                                                : "เลือกวันที่"}
                                            <Calendar1 className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={expectedReturnDate}
                                            onSelect={(date) => {
                                                if (date instanceof Date && !isNaN(date.getTime())) {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0); // normalize time

                                                    if (date > today) {
                                                        setValue("requestTerm.expectedReturnDate", date, { shouldValidate: true });
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
                            <div className="mb-4">
                                <Label className="font-bold mb-2">สถานะ</Label>
                                <div className="flex flex-row gap-2 ">
                                    <div className="flex items-center gap-2">
                                        <input type="radio" value="urgent" {...register("urgent")} />
                                        <Label className="font-normal">ด่วนที่สุด</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="radio" value="soon" {...register("urgent")} />
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

                            <Label className="mb-2 mt-4">เงื่อนไขการรับยา</Label>
                            <div className="flex flex-col items-start space-y-2">
                                <Label className="font-normal">
                                    <input type="radio" value="exactType" {...register("requestTerm.receiveConditions.condition")} />
                                    ยืมรายการที่ต้องการ
                                </Label>
                                <Label className="font-normal">
                                    <input type="radio" value="subType" {...register("requestTerm.receiveConditions.condition")} />
                                    ยืมรายการทดแทน
                                </Label>
                                <Label className="font-normal">
                                    <input type="radio" value="other" {...register("requestTerm.receiveConditions.condition")} />
                                    อื่นๆ
                                </Label>
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