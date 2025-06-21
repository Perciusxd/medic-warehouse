import { useState, useEffect } from "react"
import { useHospital } from "@/context/HospitalContext";
import { FieldErrors, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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

// Icons
import { Calendar1 } from "lucide-react"

// Utils
import { format } from "date-fns"
import { z } from "zod"
import { toast } from "sonner"

interface ReturnDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedMed: any;
}

function OfferDetails({ selectedMed }: any) {
    const { name, trademark, offerAmount, pricePerUnit, unit, returnConditions, manufacturer } = selectedMed.offeredMedicine;
    const { requestAmount } = selectedMed.requestDetails;
    const { expectedReturnDate } = selectedMed.requestTerm;
    console.log('expectedReturnDate', expectedReturnDate)
    const { postingHospitalNameTH } = selectedMed;
    const totalPrice = offerAmount * pricePerUnit;

    const date = new Date(Number(expectedReturnDate)); // convert string to number, then to Date
    const isValid = !isNaN(date.getTime());
    const formattedDate = isValid ? format(date, 'dd/MM/yyyy'): "-"; // format to date only
    console.log(expectedReturnDate);
    
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold">รายละเอียดการตอบรับ</h2>
            <div className="grid grid-cols-2 gap-2 font-light">
                <div className="flex flex-col gap-1">
                    <Label>วันที่คืน</Label>
                    <Input disabled value={formattedDate} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>โรงพยาบาลที่ให้ยืม</Label>
                    <Input disabled value={postingHospitalNameTH} />
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
                    <Input disabled value={"ต้องแก้ข้อมูลตอน accecpt offer"} />
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
                <div className="grid grid-cols-2 gap-1">
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

const ReturnFormSchema = z.object({
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
        expiredDate: z.coerce.string({ invalid_type_error: "กรุณาระบุวันที่คืนยา"}),
    }),
})

function ReturnDetails({ selectedMed }: any) {
    console.log('selectedMed', selectedMed)
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
        formState: { errors },
    } = useForm<z.infer<typeof ReturnFormSchema>>({
        resolver: zodResolver(ReturnFormSchema),
        defaultValues: {
            returnType: "exactType",
            returnMedicine: {
                name: "",
                trademark: "",
                description: "",
                returnAmount: 1,
                quantity: "",
                pricePerUnit: 1,
                batchNumber: "",
                expiredDate: undefined,
            }
        }
    })

    const expiredDate = watch("returnMedicine.expiredDate");
    const watchReturnType = watch("returnType");

    // set name and manufacturer to requestMedicine if returnType is exactType
    useEffect(() => {
        if (watchReturnType === "exactType") {
            setValue("returnMedicine.name", name);
            setValue("returnMedicine.manufacturer", manufacturer);
            setValue("returnMedicine.trademark", trademark);
        }
    }, [watchReturnType, name, manufacturer, trademark, setValue])

    const onError = (errors: FieldErrors<z.infer<typeof ReturnFormSchema>>) => {
        console.error("❌ Form validation errors:", errors);
        toast.success("กรุณาระบุข้อมูลให้ครบถ้วน")
    };

    const onSubmit = async (data: z.infer<typeof ReturnFormSchema>) => {
        const returnData = {
            id: `RET-${Date.now()}`,
            requestId: requestId,
            responseId: responseId,
            fromHospitalId: loggedInHospital,
            toHospitalId: postingHospitalNameEN,
            createAt: Date.now().toString(),
            updatedAt: Date.now().toString(),
            returnMedicine: data.returnMedicine,
            returnType: data.returnType,
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
            console.log("Success:", result)
            setLoading(false);
        } catch (error) {
            console.log("Error submitting form:", error)
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-6 ml-12">
            <h2 className="text-lg font-semibold">รายการคืน</h2>
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-4 gap-2">
                    <div className="flex flex-row gap-2">
                        <input type="radio" value="exactType" {...register("returnType")} disabled={returnConditions.exactType} />
                        <Label>คืนรายการที่ยืม</Label>
                    </div>
                    <div className="flex flex-row gap-2">
                        <input type="radio" value="subType" {...register("returnType")} disabled={returnConditions.exactType} />
                        <Label>คืนรายการทดแทน</Label>
                    </div>
                    <div className="flex flex-row gap-2">
                        <input type="radio" value="otherType" {...register("returnType")} disabled={returnConditions.exactType} />
                        <Label>คืนรายการอื่น</Label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 font-light">
                    <div className="flex flex-col gap-1">
                        <Label>รายการยา</Label>
                        <Input placeholder="รายการยา" {...register("returnMedicine.name")} disabled={watchReturnType === "exactType"} />
                        {errors.returnMedicine?.name && <span className="text-red-500 text-sm">{errors.returnMedicine.name.message}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <Label>ขนาด</Label>
                            <Input placeholder="1mg" {...register("returnMedicine.quantity")} />
                            {errors.returnMedicine?.quantity && <span className="text-red-500 text-sm">{errors.returnMedicine.quantity.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label>รูปแบบ/หน่วย</Label>
                            <Input placeholder="Tablet" {...register("returnMedicine.unit")} />
                            {errors.returnMedicine?.unit && <span className="text-red-500 text-sm">{errors.returnMedicine.unit.message}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>ชื่อการค้า</Label>
                        <Input placeholder="ชื่อการค้า" {...register("returnMedicine.trademark")} disabled={watchReturnType === "exactType"} />
                        {errors.returnMedicine?.trademark && <span className="text-red-500 text-sm">{errors.returnMedicine.trademark.message}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <Label>ผู้ผลิต</Label>
                            <Input placeholder="ผู้ผลิต" {...register("returnMedicine.manufacturer")} disabled={watchReturnType === "exactType"} />
                            {errors.returnMedicine?.manufacturer && <span className="text-red-500 text-sm">{errors.returnMedicine.manufacturer.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label>หมายเลขล็อต</Label>
                            <Input placeholder="B234" {...register("returnMedicine.batchNumber")} />
                            {errors.returnMedicine?.batchNumber && <span className="text-red-500 text-sm">{errors.returnMedicine.batchNumber.message}</span>}
                        </div>
                    </div>
                    
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                        <Label className="font-bold">วันที่คาดว่าจะคืน</Label>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left font-normal">
                                    {expiredDate
                                        ? format(new Date(Number(expiredDate)), "dd/MM/yyyy")
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
                                            today.setHours(0, 0, 0, 0); // normalize time
                                            const dateString = date.getTime().toString()

                                            if (date > today) {
                                                setValue("returnMedicine.expiredDate", dateString, { shouldValidate: true, shouldDirty: true });
                                                setDateError(""); // clear error
                                                setIsCalendarOpen(false); // close popover
                                            } else {
                                                setDateError("กรุณาเลือกวันที่ในอนาคต");
                                                // console.log('setDateError')
                                            }
                                        } else {
                                            setDateError("Invalid date selected.");
                                            // console.log('setDateError')
                                        }
                                    }}
                                    initialFocus
                                />
                                {dateError && (
                                    <div className="text-red-500 text-sm px-4 py-2">{dateError}</div>
                                )}
                            </PopoverContent>
                        </Popover>
                        {errors.returnMedicine?.expiredDate && <span className="text-red-500 text-sm">{errors.returnMedicine.expiredDate.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>จำนวนที่ให้คืน</Label>
                        <Input placeholder="500" type="number" {...register("returnMedicine.returnAmount", { valueAsNumber: true })} />
                        {errors.returnMedicine?.returnAmount && <span className="text-red-500 text-sm">{errors.returnMedicine.returnAmount.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>ราคาต่อหน่วย</Label>
                        <Input placeholder="20" type="number" {...register("returnMedicine.pricePerUnit", { valueAsNumber: true })} />
                        {errors.returnMedicine?.pricePerUnit && <span className="text-red-500 text-sm">{errors.returnMedicine.pricePerUnit.message}</span>}
                    </div>
                </div>

                <div className="grid grid-cols gap-1">
                    <div className="flex flex-row gap-1">
                        <input type="checkbox" />
                        <Label>ขอสนับสนุน</Label>
                    </div>
                    <Input className="col-span-2" type="text" placeholder="เหตุผลที่ขอสนับสนุน" />
                </div>
                <Button type="submit">
                    {loading
                        ? <div className="flex flex-row items-center gap-2"><LoadingSpinner /><span className="text-gray-500">สร้าง</span></div>
                        : "ตกลง/พิมพ์เอกสาร"}</Button>
            </div>
        </form>
    )
}

export default function ReturnDialog({ open, onOpenChange, selectedMed }: ReturnDialogProps) {
    console.log('selectedMed', selectedMed)
    const handleClose = () => {
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1600px]">
                <DialogHeader>
                    <DialogTitle>ส่งคืน</DialogTitle>
                </DialogHeader>
                {/* <div className="flex flex-row gap-2"> */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Offer Details */}
                    <OfferDetails selectedMed={selectedMed} />
                    {/* Request Details */}
                    <ReturnDetails selectedMed={selectedMed} />
                </div>
            </DialogContent>
        </Dialog>
    )
}