import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { format, sub } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

import { Calendar1Icon, ShieldAlert } from "lucide-react"

import RequestDetails from "./request-details"

export default function CreateResponseDialog({ requestData, responseId, dialogTitle, status, openDialog, onOpenChange }: any) {
    const { requestTerm } = requestData;
    const ResponseSchema = z.object({
        offeredMedicine: z.object({
            offerAmount: z.number().min(1, "กรุณากรอกมากว่า 0").max(requestData.requestMedicine.requestAmount, `กรุณากรอกน้อยกว่า ${requestData.requestMedicine.requestAmount}`),
            trademark: z.string(),
            pricePerUnit: z.number().min(1, "Price per unit must be greater than 0").max(100000, "Price per unit must be less than 100000"),
            manufacturer: z.string(),
            // manufactureDate: z.string(),
            // expiryDate: z.date(),
            // imageRef: z.string(),
            returnTerm: z.enum(["exactType", "subType"]),
            returnConditions: z.object({
                exactType: z.boolean(),
                subType: z.boolean(),
                otherType: z.boolean(),
                supportType: z.boolean(),
            })
        })
    })
    
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const {
        register,
        watch,
        handleSubmit,
        setValue,
        getValues,
        resetField,
        control,
        formState: { errors,isSubmitted },
    } = useForm<z.infer<typeof ResponseSchema>>({
        resolver: zodResolver(ResponseSchema),
        defaultValues: {
            offeredMedicine: {
                offerAmount: requestData.requestMedicine.requestAmount,
                trademark: requestData.requestMedicine.trademark,
                pricePerUnit: requestData.requestMedicine.pricePerUnit,
                manufacturer: requestData.requestMedicine.manufacturer,
                // manufactureDate: requestData.requestMedicine.manufactureDate,
                // expiryDate: requestData.requestMedicine.expiryDate,
                // imageRef: requestData.requestMedicine.imageRef,
                returnTerm: "exactType",
                returnConditions: {
                    exactType: true,
                    subType: false,
                    otherType: false,
                    supportType: false,
                }
            }
        }
    })
    const returnTerm = watch("offeredMedicine.returnTerm")
    const offeredAmount = watch("offeredMedicine.offerAmount")
    const offeredPrice = watch("offeredMedicine.pricePerUnit")
    const returnConditions = watch("offeredMedicine.returnConditions")
    const offeredMedicineRef = useRef(requestData.requestMedicine.name);
    const [subTypeName, setSubTypeName] = useState(requestData.requestMedicine.name);
    const subTypeFields = useRef({
        trademark: requestData.requestMedicine.trademark,
        offerAmount: requestData.requestMedicine.offerAmount,
        pricePerUnit: requestData.requestMedicine.pricePerUnit,
        manufacturer: requestData.requestMedicine.manufacturer,
        // manufactureDate: requestData.requestMedicine.manufactureDate,
        // expiryDate: requestData.requestMedicine.expiryDate,
    })

   
    const isAnyChecked = Object.values(returnConditions || {}).some(Boolean);// Check if any checkbox is checked

    useEffect(() => {
        const currentValues = getValues("offeredMedicine");
        if (returnTerm === "exactType") {
            // save the current values to ref
            subTypeFields.current = {
                trademark: currentValues.trademark,
                offerAmount: currentValues.offerAmount,
                pricePerUnit: currentValues.pricePerUnit,
                manufacturer: currentValues.manufacturer,
                // manufactureDate: currentValues.manufactureDate,
                // expiryDate: currentValues.expiryDate,
            }
            // set the values to the default values
            const r = requestData.requestMedicine;
            setValue("offeredMedicine.trademark", r.trademark);
            setValue("offeredMedicine.offerAmount", r.requestAmount);
            setValue("offeredMedicine.pricePerUnit", r.pricePerUnit);
            setValue("offeredMedicine.manufacturer", r.manufacturer);
            // setValue("offeredMedicine.manufactureDate", r.manufactureDate);
            // setValue("offeredMedicine.expiryDate", r.expiryDate);
        } else if (returnTerm === "subType") {
            const r = subTypeFields.current;
            setValue("offeredMedicine.trademark", r.trademark);
            setValue("offeredMedicine.offerAmount", r.offerAmount);
            setValue("offeredMedicine.pricePerUnit", r.pricePerUnit);
            setValue("offeredMedicine.manufacturer", r.manufacturer);
            // setValue("offeredMedicine.manufactureDate", r.manufactureDate);
            // setValue("offeredMedicine.expiryDate", r.expiryDate);
        }
    }, [returnTerm, setValue, getValues, requestData]);

    const onSubmit = async (data: z.infer<typeof ResponseSchema>) => {
        const responseBody = {
            ...data,
            offeredMedicine: {
                ...data.offeredMedicine,
                name: requestData.requestMedicine.name,
                quantity: requestData.requestMedicine.quantity,
                unit: requestData.requestMedicine.unit,
            },
            responseId: responseId,
            status: status
        }

        try {
            setLoading(true)
            const response = await fetch("/api/updateRequest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(responseBody),
            })

            if (!response.ok) {
                throw new Error("Failed to submit")
            }

            const result = await response.json()
            console.log("Success:", result)
            setLoading(false)
            onOpenChange(false)
        } catch (error) {
            console.error("Error submitting form:", error)
            setLoading(false)
        }
    }

    return (
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1200px]">
                <DialogTitle>{dialogTitle}</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit, (invalidError) => {
                    console.error(invalidError)
                })} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <RequestDetails requestData={requestData} responseForm={true} />
                        <div className="ml-15">
                            <div className="flex items-center space-x-2 mb-2">
                                <Badge
                                    variant={"destructive"}
                                    className="flex gap-1 px-1.5 [&_svg]:size-3 mb-4">
                                    {requestData.urgent ?
                                        <ShieldAlert /> :
                                        "Normal"
                                    }
                                    <div className="text-sm">
                                        {requestData.urgent ? "ด่วนที่สุด" : "Normal"}
                                    </div>
                                </Badge>
                                <Badge
                                    variant={"outline"}
                                    className="flex gap-1 px-1.5 [&_svg]:size-3 mb-4">
                                    <div className="text-sm text-gray-600">
                                        {requestData.requestTerm.receiveConditions.condition === "exactType" ? "ยืมรายการที่ต้องการ" : "ยืมรายการทดแทนได้"}
                                    </div>
                                </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <Label>
                                    <input type="radio" value="exactType" {...register("offeredMedicine.returnTerm")} disabled={requestTerm.receiveConditions.condition === "exactType"} />
                                    ให้ยืมรายการที่ต้องการ
                                </Label>
                                <Label>
                                    <input type="radio" value="subType" {...register("offeredMedicine.returnTerm")} disabled={requestTerm.receiveConditions.condition === "exactType"} />
                                    ให้ยืมรายการทดแทนได้
                                </Label>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <Label className="flex flex-col items-start">
                                    ชื่อการค้า
                                    <Input
                                        type="text"
                                        {...register("offeredMedicine.trademark")}
                                        disabled={returnTerm === "exactType"}
                                        className="border p-1"
                                    />
                                </Label>
                                <Label className="flex flex-col items-start">
                                    ผู้ผลิต
                                    <Input
                                        type="text"
                                        {...register("offeredMedicine.manufacturer")}
                                        disabled={returnTerm === "exactType"}
                                        className="border p-1"
                                    />
                                </Label>
                                <Label className="flex flex-col items-start font-bold">
                                    จำนวนที่ให้ยืม
                                    <Input
                                        inputMode="numeric"
                                        placeholder="10" 
                                        onKeyDown={(e) => {
                                            const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight"];
                                            if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                            e.preventDefault();
                                            }
                                        }}
                                        {...register("offeredMedicine.offerAmount", { valueAsNumber: true })}
                                        disabled={returnTerm === "exactType"}
                                        className="border p-1 font-light"
                                    />
                                    {errors.offeredMedicine?.offerAmount && (
                                        <span className="text-red-500 text-xs -mt-1">{errors.offeredMedicine.offerAmount.message}</span>
                                    )}
                                </Label>
                                <Label className="flex flex-col items-start">
                                    ราคาต่อหน่วย
                                    <Input
                                        inputMode="numeric"
                                        placeholder="10" 
                                        onKeyDown={(e) => {
                                            const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight"];
                                            if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                            e.preventDefault();
                                            }
                                        }}
                                        {...register("offeredMedicine.pricePerUnit", { valueAsNumber: true })}
                                        disabled={returnTerm === "exactType"}
                                        className="border p-1"
                                    />
                                </Label>

                                <div>
                                    รวม <span className="font-bold text-gray-950"> {(Number(offeredAmount) || 0) * (Number(offeredPrice) || 0)} </span> บาท
                                </div>
                                
                            </div>
                                <Label className="mt-4 mb-2">เงื่อนไขการคืนที่ยอมรับ</Label>
                                <div className="grid grid-cols-2 items-start space-x-4 gap-2">
                                    <Label className="font-normal">
                                        <input type="checkbox" {...register("offeredMedicine.returnConditions.exactType")} />
                                        รับคืนเฉพาะรายการนี้
                                    </Label>
                                    <Label className="font-normal">
                                    <input type="checkbox" {...register("offeredMedicine.returnConditions.subType")} />
                                        รับคืนยาทดแทนได้
                                    </Label>
                                    <Label className="font-normal">
                                    <input type="checkbox" {...register("offeredMedicine.returnConditions.otherType")} />
                                        รับคืนยารายการอื่นได้
                                    </Label>
                                    <Label className="font-normal">
                                    <input type="checkbox" {...register("offeredMedicine.returnConditions.supportType")} />
                                        สามารถสนับสนุนได้
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
                        <Button type="submit">
                            {loading ? <div className="flex flex-row items-center gap-2 text-muted-foreground"><LoadingSpinner /> ยืมยันการให้ยืม</div>  : "ยืมยันการให้ยืม"}
                        </Button>

                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
