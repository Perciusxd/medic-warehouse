import { Button } from "@/components/ui/button"
import StatusIndicator from "@/components/ui/status-indicator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Calendar1, Pill, Package, Building2, Factory, Hash, DollarSign, RotateCcw, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { useAuth } from "@/components/providers";

function SharingMedicineDetails({ sharingMedicine }: any) {
    const { name, trademark, unit, quantity, manufacturer } = sharingMedicine;
    
    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Package className="h-5 w-5" />
                    รายละเอียดยาที่ยืมมา
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    {/* Medicine Name */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Pill className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                            <Label className="text-sm font-medium text-blue-800 mb-1 block">ชื่อยา</Label>
                            <div className="font-semibold text-blue-900">{name || 'ไม่ระบุ'}</div>
                        </div>
                    </div>

                    {/* Trademark */}
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <div className="flex-1">
                            <Label className="text-sm font-medium text-purple-800 mb-1 block">ชื่อการค้า</Label>
                            <div className="font-semibold text-purple-900">{trademark || 'ไม่ระบุ'}</div>
                        </div>
                    </div>

                    {/* Unit and Size */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                            <Package className="h-4 w-4 text-green-600" />
                            <div className="flex-1">
                                <Label className="text-xs font-medium text-green-800 mb-1 block">รูปแบบ/หน่วย</Label>
                                <div className="text-sm font-semibold text-green-900">{unit || 'ไม่ระบุ'}</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                            <Hash className="h-4 w-4 text-orange-600" />
                            <div className="flex-1">
                                <Label className="text-xs font-medium text-orange-800 mb-1 block">ขนาด</Label>
                                <div className="text-sm font-semibold text-orange-900">{quantity || 'ไม่ระบุ'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Manufacturer */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Factory className="h-5 w-5 text-gray-600" />
                        <div className="flex-1">
                            <Label className="text-sm font-medium text-gray-800 mb-1 block">ผู้ผลิต</Label>
                            <div className="font-semibold text-gray-900">{manufacturer || 'ไม่ระบุ'}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
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

function ReturnMedicineDetails({ selectedMed, onOpenChange }: any) {
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
            onOpenChange(false);
        } catch (error) {
            console.log("Error submitting form:", error)
        }
        finally {
            setLoading(false);
        }
    };

    const expiredDate = watch("returnMedicine.expiredDate");
    const watchReturnType = watch("returnType");
    const watchReturnAmount = watch("returnMedicine.returnAmount");
    const watchPricePerUnit = watch("returnMedicine.pricePerUnit");
    const totalPrice = (watchReturnAmount || 0) * (watchPricePerUnit || 0);

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700">
                    <RotateCcw className="h-5 w-5" />
                    รายละเอียดการคืนยา
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
                    {/* Medicine Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Pill className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-800">ข้อมูลยาที่คืน</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <Pill className="h-3 w-3" />
                                    ชื่อยา
                                </Label>
                                <Input 
                                    placeholder="ชื่อยา" 
                                    {...register("returnMedicine.name")} 
                                    className={errors.returnMedicine?.name ? "border-red-300 focus:border-red-500" : ""}
                                />
                                {errors.returnMedicine?.name && (
                                    <div className="flex items-center gap-1 text-red-500 text-sm">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.returnMedicine.name.message}
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    ชื่อการค้า
                                </Label>
                                <Input 
                                    placeholder="ชื่อการค้า" 
                                    {...register("returnMedicine.trademark")} 
                                    className={errors.returnMedicine?.trademark ? "border-red-300 focus:border-red-500" : ""}
                                />
                                {errors.returnMedicine?.trademark && (
                                    <div className="flex items-center gap-1 text-red-500 text-sm">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.returnMedicine.trademark.message}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    รูปแบบ/หน่วย
                                </Label>
                                <Input 
                                    placeholder="รูปแบบ/หน่วย" 
                                    {...register("returnMedicine.unit")} 
                                    className={errors.returnMedicine?.unit ? "border-red-300 focus:border-red-500" : ""}
                                />
                                {errors.returnMedicine?.unit && (
                                    <div className="flex items-center gap-1 text-red-500 text-sm">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.returnMedicine.unit.message}
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <Factory className="h-3 w-3" />
                                    ผู้ผลิต
                                </Label>
                                <Input 
                                    placeholder="ผู้ผลิต" 
                                    {...register("returnMedicine.manufacturer")} 
                                    className={errors.returnMedicine?.manufacturer ? "border-red-300 focus:border-red-500" : ""}
                                />
                                {errors.returnMedicine?.manufacturer && (
                                    <div className="flex items-center gap-1 text-red-500 text-sm">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.returnMedicine.manufacturer.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Quantity and Pricing Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="h-4 w-4 text-purple-600" />
                            <span className="font-semibold text-purple-800">จำนวนและราคา</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    จำนวนยา
                                </Label>
                                <Input 
                                    placeholder="จำนวนยา" 
                                    {...register("returnMedicine.returnAmount", { valueAsNumber: true })} 
                                    type="number"
                                    className={errors.returnMedicine?.returnAmount ? "border-red-300 focus:border-red-500" : ""}
                                />
                                {errors.returnMedicine?.returnAmount && (
                                    <div className="flex items-center gap-1 text-red-500 text-sm">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.returnMedicine.returnAmount.message}
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    ราคาต่อหน่วย
                                </Label>
                                <Input 
                                    placeholder="ราคาต่อหน่วย" 
                                    {...register("returnMedicine.pricePerUnit", { valueAsNumber: true })} 
                                    type="number"
                                    className={errors.returnMedicine?.pricePerUnit ? "border-red-300 focus:border-red-500" : ""}
                                />
                                {errors.returnMedicine?.pricePerUnit && (
                                    <div className="flex items-center gap-1 text-red-500 text-sm">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.returnMedicine.pricePerUnit.message}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">ขนาด</Label>
                                <Input 
                                    placeholder="ขนาด" 
                                    {...register("returnMedicine.quantity")} 
                                    className={errors.returnMedicine?.quantity ? "border-red-300 focus:border-red-500" : ""}
                                />
                                {errors.returnMedicine?.quantity && (
                                    <div className="flex items-center gap-1 text-red-500 text-sm">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.returnMedicine.quantity.message}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Total Price Display */}
                        {totalPrice > 0 && (
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-purple-800">ราคารวม:</span>
                                    <Badge variant="default" className="bg-purple-600 text-white text-base px-3 py-1">
                                        {totalPrice.toLocaleString()} บาท
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Batch and Date Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Hash className="h-4 w-4 text-orange-600" />
                            <span className="font-semibold text-orange-800">ข้อมูลล็อตและวันที่</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    หมายเลขล็อต
                                </Label>
                                <Input 
                                    placeholder="หมายเลขล็อต" 
                                    {...register("returnMedicine.batchNumber")} 
                                    className={errors.returnMedicine?.batchNumber ? "border-red-300 focus:border-red-500" : ""}
                                />
                                {errors.returnMedicine?.batchNumber && (
                                    <div className="flex items-center gap-1 text-red-500 text-sm">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.returnMedicine.batchNumber.message}
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <Calendar1 className="h-3 w-3" />
                                    วันที่คาดว่าจะคืน
                                </Label>
                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
                                    <PopoverTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            className={`justify-start text-left font-normal w-full ${
                                                errors.returnMedicine?.expiredDate ? "border-red-300 focus:border-red-500" : ""
                                            }`}
                                        >
                                            {expiredDate
                                                ? format(new Date(Number(expiredDate)), "dd/MM/yyyy")
                                                : "เลือกวันที่"}
                                            <Calendar1 className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent 
                                        className="w-auto p-0 bg-white rounded-md shadow-lg border" 
                                        style={{ zIndex: 9999 }}
                                        align="start"
                                        side="top"
                                        sideOffset={5}
                                    >
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
                                            <div className="flex items-center gap-1 text-red-500 text-sm px-4 py-2 border-t">
                                                <AlertCircle className="h-3 w-3" />
                                                {dateError}
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>
                                {errors.returnMedicine?.expiredDate && (
                                    <div className="flex items-center gap-1 text-red-500 text-sm">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.returnMedicine.expiredDate.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 min-h-[44px]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <LoadingSpinner className="h-4 w-4" />
                                    <span>กำลังสร้างเอกสาร...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>ตกลง/พิมพ์เอกสาร</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default function ReturnSharingDialog({ open, onOpenChange, selectedMed }: any) {
    console.log('return sharing dialog', selectedMed)
    const { user } = useAuth();
    console.log('user', user)
    const { sharingDetails, acceptedOffer } = selectedMed;
    const { sharingMedicine } = sharingDetails;
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant={"link"} className="flex gap-x-2">
                    <RotateCcw className="h-4 w-4" />
                    รับคืน
                    <StatusIndicator status={status} />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                        <RotateCcw className="h-5 w-5 text-green-600" />
                        คืนยา
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <Package className="h-5 w-5 text-blue-600" />
                            <span>
                                คุณต้องการคืนยา <strong>{sharingMedicine.name}</strong> จาก <strong>{acceptedOffer.responseAmount}</strong> หน่วย หรือไม่?
                            </span>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid lg:grid-cols-2 gap-6 mt-6">
                    <SharingMedicineDetails sharingMedicine={sharingMedicine} />
                    <ReturnMedicineDetails selectedMed={selectedMed} onOpenChange={onOpenChange} />
                </div>
            </DialogContent>
        </Dialog>
    )
}