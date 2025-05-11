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

function getConfirmationSchema(requestData) {
    return z.object({
        responseId: z.string(),
        offeredMedicine: z.object({
            offerAmount: z.number()
                .min(1, "กรุณากรอกมากว่า 0")
                .max(requestData.requestMedicine.requestAmount, `กรุณากรอกน้อยกว่า ${requestData.requestMedicine.requestAmount}`),
            trademark: z.string(),
            pricePerUnit: z.number()
                .min(1, "Price per unit must be greater than 0")
                .max(100000, "Price per unit must be less than 100000"),
            manufacturer: z.string(),
            returnTerm: z.enum(["exactType", "subType"]),
            returnConditions: z.object({
                exactType: z.boolean(),
                subType: z.boolean(),
                otherType: z.boolean(),
                supportType: z.boolean(),
            }),
        }),
    });
}

export default function ConfirmResponseDialog({ data, dialogTitle, status, openDialog, onOpenChange }) {
    console.log('data', data);
    const [loading, setLoading] = useState(false)
    const requestData = data.requestDetails
    const ConfirmSchema = getConfirmationSchema(requestData)
    console.log(ConfirmSchema);
    const {
        register,
        getValues,
        watch,
        handleSubmit
    } = useForm<z.infer<typeof ConfirmSchema>>({
        resolver: zodResolver(ConfirmSchema),
        defaultValues: {
            responseId: data.responseId,
            offeredMedicine: {
                offerAmount: data.offeredMedicine.offerAmount,
                trademark: data.offeredMedicine.trademark,
                pricePerUnit: data.offeredMedicine.pricePerUnit,
                manufacturer: data.offeredMedicine.manufacturer,
                returnTerm: data.offeredMedicine.returnTerm,
                returnConditions: {
                    exactType: data.offeredMedicine.returnConditions.exactType,
                    subType: data.offeredMedicine.returnConditions.subType,
                    otherType: data.offeredMedicine.returnConditions.otherType,
                    supportType: data.offeredMedicine.returnConditions.supportType,
                },
            },
        }
    })

    const onSubmit = async (data) => {
        const responseBody = {
            ...data,
            status: status,
        }
        console.log("Response Body:", responseBody)
        setLoading(true)
        try {
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <RequestDetails requestData={data.requestDetails} responseForm={true} />
                        <div className="ml-15">
                            <div className="flex items-center space-x-2 mb-2">
                                {/* <Badge
                                    variant={"destructive"}
                                    className="flex gap-1 px-1.5 [&_svg]:size-3 mb-4">
                                    {requestData.urgent ?
                                        <ShieldAlert /> :
                                        "Normal"
                                    }
                                    <div className="text-sm">
                                        {requestData.urgent ? "ด่วนที่สุด" : "Normal"}
                                    </div>
                                </Badge> */}
                                <Badge
                                    variant={"outline"}
                                    className="flex gap-1 px-1.5 [&_svg]:size-3 mb-4">
                                    {/* {requestData.urgent ?
                                        <ShieldAlert className="text-red-700" /> :
                                        "Normal"
                                    } */}
                                    <div className="text-sm text-gray-600">
                                        {data.offeredMedicine.returnTerm === "exactType" ? "ยืมรายการที่ต้องการ" : "ยืมรายการทดแทนได้"}
                                    </div>
                                </Badge>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Label>
                                    <input type="radio" checked={data.offeredMedicine.returnTerm === "exactType" ? true : false} disabled={true ? status !== "offered" : false} />
                                    ให้ยืมรายการที่ต้องการ
                                </Label>
                                <Label>
                                    <input type="radio" checked={data.offeredMedicine.returnTerm === "exactType" ? false : true} disabled={true ? status !== "offered" : false} />
                                    ให้ยืมรายการทดแทน
                                </Label>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                {/* <Label className="flex flex-col items-start">
                                    Date of expiry
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className="w-full justify-start text-left font-normal"
                                                disabled={returnTerm === "exactType"}>
                                                {getValues("offeredMedicine.expiryDate") ? format(new Date(getValues("offeredMedicine.expiryDate")), "PPP") : (<span>Pick a date</span>)}
                                                <Calendar1Icon className="ml-auto h-4 w-4 opacity-50"></Calendar1Icon>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={getValues("offeredMedicine.expiryDate") ? new Date(getValues("offeredMedicine.expiryDate")) : undefined}
                                                onSelect={(date) => {
                                                    console.log(date);
                                                    if (date) {
                                                        setValue("offeredMedicine.expiryDate", date.toString());
                                                        setOpen(false);
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </Label> */}
                                <Label className="flex flex-col items-start">
                                    ชื่อการค้า
                                    <Input
                                        type="text"
                                        {...register("offeredMedicine.trademark")}
                                        disabled={true ? status !== "offered" : false}
                                        className="border p-1"
                                    />
                                </Label>
                                <Label className="flex flex-col items-start">
                                    ผู้ผลิต
                                    <Input
                                        type="text"
                                        {...register("offeredMedicine.manufacturer")}
                                        disabled={true ? status !== "offered" : false}
                                        className="border p-1"
                                    />
                                </Label>
                                <Label className="flex flex-col items-start font-bold">
                                    จำนวนที่ให้ยืม
                                    <Input
                                        type="number"
                                        {...register("offeredMedicine.offerAmount", {
                                            valueAsNumber: true,
                                        })}
                                        disabled={true ? status !== "offered" : false}
                                        className="border p-1 font-light"
                                    />
                                </Label>
                                <Label className="flex flex-col items-start">
                                    ราคาต่อหน่วย
                                    <Input
                                        type="number"
                                        {...register("offeredMedicine.pricePerUnit", {
                                            valueAsNumber: true,
                                        })}
                                        disabled={true ? status !== "offered" : false}
                                        className="border p-1"
                                    />
                                </Label>

                                <div>
                                    รวม <span className="font-bold text-gray-950"> {(Number(data.offeredMedicine.offerAmount) || 0) * (Number(data.offeredMedicine.pricePerUnit) || 0)} </span> บาท
                                </div>

                            </div>
                            <Label className="mt-4 mb-2">เงื่อนไขการคืนที่ยอมรับ</Label>
                            <div className="grid grid-cols-2 items-start space-x-4 gap-2">
                                <Label className="font-normal">
                                    <Checkbox checked={getValues("offeredMedicine.returnConditions.exactType")} disabled={true ? status !== "offered" : false} />
                                    รับคืนเฉพาะรายการนี้
                                </Label>
                                <Label className="font-normal">
                                    <Checkbox checked={getValues("offeredMedicine.returnConditions.subType")} disabled={true ? status !== "offered" : false} />
                                    รับคืนยาทดแทนได้
                                </Label>
                                <Label className="font-normal">
                                    <Checkbox checked={getValues("offeredMedicine.returnConditions.otherType")} disabled={true ? status !== "offered" : false} />
                                    รับคืนยารายการอื่นได้
                                </Label>
                                <Label className="font-normal">
                                    <Checkbox checked={getValues("offeredMedicine.returnConditions.supportType")} disabled={true ? status !== "offered" : false} />
                                    สามารถสนับสนุนได้
                                </Label>
                            </div>
                        </div>
                    </div>


                    <DialogFooter>
                        <Button type="submit">
                            {loading ? <div className="flex flex-row items-center gap-2 text-muted-foreground"><LoadingSpinner /> ยืมยันการให้ยืม</div> : "ยืมยันการให้ยืม"}
                        </Button>
                        {/* <DialogClose>
                            <Button variant={"destructive"} type="submit" >
                                Cancel
                            </Button>
                        </DialogClose> */}

                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
