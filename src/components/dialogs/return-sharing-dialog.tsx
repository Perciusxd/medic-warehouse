import { Button } from "@/components/ui/button"
import StatusIndicator from "@/components/ui/status-indicator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Calendar1 } from "lucide-react";
import { LoadingSpinner } from "../ui/loading-spinner";

function SharingMedicineDetails({ sharingMedicine }: any) {
    const { name, trademark, unit, size, manufacturer } = sharingMedicine;
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold">รายละเอียดยาที่ยืมมา</h2>
            <div className="grid grid-cols-2 gap-2 font-light">
                <div className="flex flex-col gap-1">
                    <Label>ชื่อยา</Label>
                    <Input disabled value={name} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ชื่อการค้า</Label>
                    <Input disabled value={trademark} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>รูปแบบ/หน่วย</Label>
                    <Input disabled value={unit} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ขนาด</Label>
                    <Input disabled value={size} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ผู้ผลิต</Label>
                    <Input disabled value={manufacturer} />
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

function ReturnMedicineDetails({ selectedMed }: any) {
    console.log('selectedMed in return medicine details', selectedMed)
    const [loading, setLoading] = useState(false);
    const { id, respondingHospitalNameEN, sharingId, sharingDetails, acceptedOffer } = selectedMed;
    const { postingHospitalId, postingHospitalNameEN, sharingMedicine } = sharingDetails;
    const { responseAmount } = acceptedOffer;
    const { name, trademark, unit, size, manufacturer, batchNumber } = sharingMedicine;
    const returnFormSchema = ReturnFormSchema({ selectedMed });

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateError, setDateError] = useState(""); // for error message

    const {
        register,
        watch,
        handleSubmit,
        setValue,
        getValues,
        resetField,
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

    const onError = (errors: FieldErrors<z.infer<typeof returnFormSchema>>) => {
        console.log(errors);
    };

    const onSubmit = async (data: z.infer<typeof returnFormSchema>) => {
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
        } catch (error) {
            console.log("Error submitting form:", error)
        }
        finally {
            setLoading(false);
        }
    };

    const expiredDate = watch("returnMedicine.expiredDate");
    const watchReturnType = watch("returnType");

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold">รายละเอียดการคืนยา</h2>
            <div className="grid grid-cols-2 gap-2 font-light">
                <div className="flex flex-col gap-1">
                    <Label>ชื่อยา</Label>
                    <Input placeholder="ชื่อยา" {...register("returnMedicine.name")} />
                    {errors.returnMedicine?.name && <span className="text-red-500 text-sm">{errors.returnMedicine.name.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ชื่อการค้า</Label>
                    <Input placeholder="ชื่อการค้า" {...register("returnMedicine.trademark")} />
                    {errors.returnMedicine?.trademark && <span className="text-red-500 text-sm">{errors.returnMedicine.trademark.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                    <Label>รูปแบบ/หน่วย</Label>
                    <Input placeholder="รูปแบบ/หน่วย" {...register("returnMedicine.unit")} />
                    {errors.returnMedicine?.unit && <span className="text-red-500 text-sm">{errors.returnMedicine.unit.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ผู้ผลิต</Label>
                    <Input placeholder="ผู้ผลิต" {...register("returnMedicine.manufacturer")} />
                    {errors.returnMedicine?.manufacturer && <span className="text-red-500 text-sm">{errors.returnMedicine.manufacturer.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                    <Label>จำนวนยา</Label>
                    <Input placeholder="จำนวนยา" {...register("returnMedicine.returnAmount", { valueAsNumber: true })} type="number" />
                    {errors.returnMedicine?.returnAmount && <span className="text-red-500 text-sm">{errors.returnMedicine.returnAmount.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ราคาต่อหน่วย</Label>
                    <Input placeholder="ราคาต่อหน่วย" {...register("returnMedicine.pricePerUnit", { valueAsNumber: true })} type="number" />
                    {errors.returnMedicine?.pricePerUnit && <span className="text-red-500 text-sm">{errors.returnMedicine.pricePerUnit.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ขนาด</Label>
                    <Input placeholder="ขนาด" {...register("returnMedicine.quantity")} />
                    {errors.returnMedicine?.quantity && <span className="text-red-500 text-sm">{errors.returnMedicine.quantity.message}</span>}
                </div>
                <div className="flex flex-col gap-1">
                    <Label>หมายเลขล็อต</Label>
                    <Input placeholder="หมายเลขล็อต" {...register("returnMedicine.batchNumber")} />
                    {errors.returnMedicine?.batchNumber && <span className="text-red-500 text-sm">{errors.returnMedicine.batchNumber.message}</span>}
                </div>
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
                        <PopoverContent className="w-auto p-0 bg-white rounded-md shadow-md">
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
                                            console.log('selected date', dateString)
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
            </div>
            <Button type="submit" disabled={loading}>
                {loading
                    ? <div className="flex flex-row items-center gap-2"><LoadingSpinner /><span className="text-gray-500">สร้าง</span></div>
                    : "ตกลง/พิมพ์เอกสาร"}</Button>
        </form>
    )
}

export default function ReturnSharingDialog({ open, onOpenChange, selectedMed }: any) {
    const { sharingDetails, acceptedOffer } = selectedMed;
    const { sharingMedicine } = sharingDetails;
    // console.log('sharingMedicine', sharingMedicine)
    // console.log('acceptedOffer', acceptedOffer)
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant={"link"} className="flex gap-x-2">รับคืน<StatusIndicator status={status} /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1000px]">
                <DialogHeader>
                    <DialogTitle>คืนยา</DialogTitle>
                    <DialogDescription>คุณต้องการคืนยา {sharingMedicine.name} จาก {acceptedOffer.responseAmount} หน่วย หรือไม่?</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-12">
                    <SharingMedicineDetails sharingMedicine={sharingMedicine} />
                    <ReturnMedicineDetails selectedMed={selectedMed} />
                </div>
            </DialogContent>
        </Dialog>
    )
}