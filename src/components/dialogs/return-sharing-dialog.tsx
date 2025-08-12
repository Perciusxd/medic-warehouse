import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Calendar1, RotateCcw, Package } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function SharingMedicineDetails({ sharingMedicine }: any) {
    const { name, trademark, unit, quantity, manufacturer } = sharingMedicine;

    return (
        <div className="flex flex-col gap-4 border p-4 rounded-lg">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
                <Package className="h-5 w-5" />
                รายละเอียดรายการยืม
            </h2>
            <div className="grid grid-cols-2 gap-2 font-light">
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
        </div>
    )
}

function ReturnFormSchema({ selectedMed }: any) {
    const { sharingDetails, acceptedOffer } = selectedMed;
    const { sharingMedicine } = sharingDetails;
    const { responseAmount } = acceptedOffer;
    const { name, trademark, unit, size, manufacturer } = sharingMedicine;

    return z.object({
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
            expiredDate: z.coerce.string({ invalid_type_error: "กรุณาระบุวันที่คืนยา" }),
        }),
    })
}

function ReturnMedicineDetails({ selectedMed, onOpenChange, loading, setLoading }: any) {
    const { id, respondingHospitalNameEN, sharingId, sharingDetails } = selectedMed;
    const { postingHospitalNameEN } = sharingDetails;
    const returnFormSchema = ReturnFormSchema({ selectedMed });

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateError, setDateError] = useState("");

    const {
        register,
        watch,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<z.infer<typeof returnFormSchema>>({
        resolver: zodResolver(returnFormSchema),
        defaultValues: {
            returnType: "exactType",
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
                expiredDate: undefined,
            }
        }
    })

    const onError = () => { /* silent, UI shows field errors */ };

    const onSubmit = async (data: z.infer<typeof returnFormSchema>) => {
        setLoading(true);
        const returnData = {
            id: `RET-${Date.now()}`,
            sharingId: sharingId,
            responseId: id,
            fromHospitalId: respondingHospitalNameEN,
            toHospitalId: postingHospitalNameEN,
            createAt: Date.now().toString(),
            updatedAt: Date.now().toString(),
            returnMedicine: data.returnMedicine,
            returnType: data.returnType,
        }
        const returnBody = {
            returnData: returnData,
            selectedHospital: respondingHospitalNameEN,
            responseId: id,
        }
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
            console.log("Error submitting form:", error)
        } finally {
            setLoading(false);
        }
    };

    const expiredDate = watch("returnMedicine.expiredDate");
    const watchReturnType = watch("returnType");

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col col-span-2 gap-6 border p-4 rounded-lg">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                <RotateCcw className="h-5 w-5" />
                รายการคืน
            </h2>
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-4 gap-2">
                    <div className="flex flex-row gap-2">
                        <input type="radio" value="exactType" {...register("returnType")} />
                        <Label>คืนรายการที่ยืม</Label>
                    </div>
                    <div className="flex flex-row gap-2">
                        <input type="radio" value="subType" {...register("returnType")} />
                        <Label>คืนรายการทดแทน</Label>
                    </div>
                    <div className="flex flex-row gap-2">
                        <input type="radio" value="otherType" {...register("returnType")} />
                        <Label>คืนรายการอื่น</Label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 font-light">
                    <div className="flex flex-col gap-1">
                        <Label>รายการยา</Label>
                        <Input placeholder="รายการยา" {...register("returnMedicine.name")} />
                        {errors.returnMedicine?.name && <span className="text-red-500 text-xs">{errors.returnMedicine.name.message}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <Label>ขนาด</Label>
                            <Input placeholder="1mg" {...register("returnMedicine.quantity")} />
                            {errors.returnMedicine?.quantity && <span className="text-red-500 text-xs">{errors.returnMedicine.quantity.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label>รูปแบบ/หน่วย</Label>
                            <Input placeholder="Tablet" {...register("returnMedicine.unit")} />
                            {errors.returnMedicine?.unit && <span className="text-red-500 text-xs">{errors.returnMedicine.unit.message}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>ชื่อการค้า</Label>
                        <Input placeholder="ชื่อการค้า" {...register("returnMedicine.trademark")} />
                        {errors.returnMedicine?.trademark && <span className="text-red-500 text-xs">{errors.returnMedicine.trademark.message}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <Label>ผู้ผลิต</Label>
                            <Input placeholder="ผู้ผลิต" {...register("returnMedicine.manufacturer")} />
                            {errors.returnMedicine?.manufacturer && <span className="text-red-500 text-xs">{errors.returnMedicine.manufacturer.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label>หมายเลขล็อต</Label>
                            <Input placeholder="B234" {...register("returnMedicine.batchNumber")} />
                            {errors.returnMedicine?.batchNumber && <span className="text-red-500 text-xs">{errors.returnMedicine.batchNumber.message}</span>}
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
                                            today.setHours(0, 0, 0, 0);
                                            const dateString = date.getTime().toString()

                                            if (date > today) {
                                                setValue("returnMedicine.expiredDate", dateString, { shouldValidate: true, shouldDirty: true });
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
                        {errors.returnMedicine?.expiredDate && <span className="text-red-500 text-xs">{errors.returnMedicine.expiredDate.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>จำนวนที่ให้คืน</Label>
                        <Input placeholder="500" type="number" {...register("returnMedicine.returnAmount", { valueAsNumber: true })} />
                        {errors.returnMedicine?.returnAmount && <span className="text-red-500 text-xs">{errors.returnMedicine.returnAmount.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>ราคาต่อหน่วย</Label>
                        <Input placeholder="20" type="number" {...register("returnMedicine.pricePerUnit", { valueAsNumber: true })} />
                        {errors.returnMedicine?.pricePerUnit && <span className="text-red-500 text-xs">{errors.returnMedicine.pricePerUnit.message}</span>}
                    </div>
                </div>

            </div>

            <div className="flex flex-row gap-2 items-center justify-center">
                <Button type="submit" disabled={loading}>
                    {loading
                        ? <div className="flex flex-row items-center gap-2"><LoadingSpinner className="h-4 w-4" /><span className="text-gray-500">สร้าง</span></div>
                        : "ตกลง"}
                </Button>
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
            </div>
        </form>
    )
}

export default function ReturnSharingDialog({ open, onOpenChange, selectedMed }: any) {
    const { sharingDetails } = selectedMed;
    const { sharingMedicine } = sharingDetails;
    const [loading, setLoading] = useState(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1300px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <RotateCcw className="h-5 w-5 text-green-600" />
                        <span>ส่งคืน</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-2">
                    <SharingMedicineDetails sharingMedicine={sharingMedicine} />
                    <ReturnMedicineDetails selectedMed={selectedMed} onOpenChange={onOpenChange} loading={loading} setLoading={setLoading} />
                </div>
            </DialogContent>
        </Dialog>
    )
}