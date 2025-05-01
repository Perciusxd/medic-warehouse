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

const ResponseSchema = z.object({
    offeredMedicine: z.object({
        name: z.string(),
        quantity: z.string(),
        trademark: z.string(),
        pricePerUnit: z.string(),
        unit: z.string(),
        batchNumber: z.string(),
        manufacturer: z.string(),
        // manufactureDate: z.string(),
        // expiryDate: z.date(),
        // imageRef: z.string(),
        returnTerm: z.enum(["exactType", "subType"]),
        // returnConditions: z.object({
        //     exactType: z.boolean(),
        //     subType: z.boolean(),
        //     otherType: z.boolean(),
        //     supportType: z.boolean(),
        // })
    })
})

export default function CreateResponseDialog({ requestData, openDialog, onOpenChange }) {
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
        formState: { errors },
    } = useForm<z.infer<typeof ResponseSchema>>({
        resolver: zodResolver(ResponseSchema),
        defaultValues: {
            offeredMedicine: {
                name: requestData.requestMedicine.name,
                quantity: requestData.requestMedicine.quantity,
                trademark: requestData.requestMedicine.trademark,
                pricePerUnit: requestData.requestMedicine.pricePerUnit,
                unit: requestData.requestMedicine.unit,
                batchNumber: requestData.requestMedicine.batchNumber,
                manufacturer: requestData.requestMedicine.manufacturer,
                // manufactureDate: requestData.requestMedicine.manufactureDate,
                // expiryDate: requestData.requestMedicine.expiryDate,
                // imageRef: requestData.requestMedicine.imageRef,
                returnTerm: "exactType",
                // returnConditions: {
                //     exactType: false,
                //     subType: false,
                //     otherType: false,
                //     supportType: false,
                // }
            }
        }
    })
    const returnTerm = watch("offeredMedicine.returnTerm")
    const offeredMedicineRef = useRef(requestData.requestMedicine.name);
    const [subTypeName, setSubTypeName] = useState(requestData.requestMedicine.name);
    const subTypeFields = useRef({
        name: requestData.requestMedicine.name,
        trademark: requestData.requestMedicine.trademark,
        quantity: requestData.requestMedicine.quantity,
        pricePerUnit: requestData.requestMedicine.pricePerUnit,
        unit: requestData.requestMedicine.unit,
        batchNumber: requestData.requestMedicine.batchNumber,
        manufacturer: requestData.requestMedicine.manufacturer,
        // manufactureDate: requestData.requestMedicine.manufactureDate,
        // expiryDate: requestData.requestMedicine.expiryDate,
    })

    useEffect(() => {
        const currentValues = getValues("offeredMedicine");
        if (returnTerm === "exactType") {
            // save the current values to ref
            subTypeFields.current = {
                name: currentValues.name,
                trademark: currentValues.trademark,
                quantity: currentValues.quantity,
                pricePerUnit: currentValues.pricePerUnit,
                unit: currentValues.unit,
                batchNumber: currentValues.batchNumber,
                manufacturer: currentValues.manufacturer,
                // manufactureDate: currentValues.manufactureDate,
                // expiryDate: currentValues.expiryDate,
            }
            // set the values to the default values
            const r = requestData.requestMedicine;
            setValue("offeredMedicine.name", r.name);
            setValue("offeredMedicine.trademark", r.trademark);
            setValue("offeredMedicine.quantity", r.quantity);
            setValue("offeredMedicine.pricePerUnit", r.pricePerUnit);
            setValue("offeredMedicine.unit", r.unit);
            setValue("offeredMedicine.batchNumber", r.batchNumber);
            setValue("offeredMedicine.manufacturer", r.manufacturer);
            // setValue("offeredMedicine.manufactureDate", r.manufactureDate);
            // setValue("offeredMedicine.expiryDate", r.expiryDate);
        } else if (returnTerm === "subType") {
            const r = subTypeFields.current;
            setValue("offeredMedicine.name", r.name);
            setValue("offeredMedicine.trademark", r.trademark);
            setValue("offeredMedicine.quantity", r.quantity);
            // setValue("offeredMedicine.pricePerUnit", r.pricePerUnit);
            setValue("offeredMedicine.unit", r.unit);
            setValue("offeredMedicine.batchNumber", r.batchNumber);
            setValue("offeredMedicine.manufacturer", r.manufacturer);
            // setValue("offeredMedicine.manufactureDate", r.manufactureDate);
            // setValue("offeredMedicine.expiryDate", r.expiryDate);
        }
    }, [returnTerm, setValue, getValues, requestData]);

    const onSubmit = async (data: z.infer<typeof ResponseSchema>) => {
        console.log("datasdf", data);
        const responseBody = {
            ...data,
            responseId: requestData.requestId, // ! need to change to responseId
        }
        console.log("responseBody", responseBody);
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
                <DialogTitle>เวชภัณฑ์ยาที่ขาดแคลน</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit, (invalidError) => {
                    console.error(invalidError)
                })} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <RequestDetails requestData={requestData} responseForm={true} />
                        <div className="ml-15">
                            <Badge
                                variant={"outline"}
                                className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3 mb-4">
                                {requestData.urgent ?
                                    <ShieldAlert className="text-red-700" /> :
                                    "Normal"
                                }
                                <div className="text-sm">
                                    {requestData.urgent ? "Urgent" : "Normal"}
                                </div>
                            </Badge>
                            <div className="flex items-center space-x-4">
                                <Label>
                                    <input type="radio" value="exactType" {...register("offeredMedicine.returnTerm")} />
                                    ให้ยืมรายการที่ต้องการ
                                </Label>
                                <Label>
                                    <input type="radio" value="subType" {...register("offeredMedicine.returnTerm")} />
                                    ให้ยืมรายการทดแทน
                                </Label>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <Label className="flex flex-col items-start">
                                    Name
                                    <Input
                                        type="text"
                                        {...register("offeredMedicine.name")}
                                        disabled={returnTerm === "exactType"}
                                        className="border p-1"
                                    />
                                </Label>
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
                                <Label className="flex flex-col items-start font-bold">
                                    Quantity
                                    <Input
                                        type="number"
                                        {...register("offeredMedicine.quantity")}
                                        disabled={returnTerm === "exactType"}
                                        className="border p-1 font-light"
                                    />
                                </Label>
                                <Label className="flex flex-col items-start">
                                    Trademark
                                    <Input
                                        type="text"
                                        {...register("offeredMedicine.trademark")}
                                        disabled={returnTerm === "exactType"}
                                        className="border p-1"
                                    />
                                </Label>
                                <Label className="flex flex-col items-start">
                                    Price per unit
                                    <Input
                                        type="text"
                                        {...register("offeredMedicine.pricePerUnit")}
                                        disabled={returnTerm === "exactType"}
                                        className="border p-1"
                                    />
                                </Label>
                                <Label className="flex flex-col items-start">
                                    Unit
                                    <Input
                                        type="text"
                                        {...register("offeredMedicine.unit")}
                                        disabled={returnTerm === "exactType"}
                                        className="border p-1"
                                    />
                                </Label>
                                <Label className="flex flex-col items-start">
                                    Batch number
                                    <Input
                                        type="text"
                                        {...register("offeredMedicine.batchNumber")}
                                        disabled={returnTerm === "exactType"}
                                        className="border p-1"
                                    />
                                </Label>
                                <Label className="flex flex-col items-start">
                                    Manufacturer
                                    <Input
                                        type="text"
                                        {...register("offeredMedicine.manufacturer")}
                                        disabled={returnTerm === "exactType"}
                                        className="border p-1"
                                    />
                                </Label>

                                {/* <div className="flex flex-col items-start gap-4">
                                    <Label>
                                        เงื่อนไขการคืนที่ยอมรับ
                                    </Label>
                                    <div className="items-top flex space-x-2">
                                        <Controller name="offeredMedicine.returnConditions.exactType" control={control} render={({ field }) => (

                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}></Checkbox>
                                        )}/>
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor="terms1"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                รับคืนเฉพาะรายการนี้
                                            </label>
                                            <p className="text-sm text-muted-foreground">
                                            </p>
                                        </div>
                                    </div>
                                    <div className="items-top flex space-x-2">
                                        <Controller name="offeredMedicine.returnConditions.otherType" control={control} render={({ field }) => (

                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}></Checkbox>
                                        )} />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor="terms1"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                รับคืนเฉพาะรายการนี้
                                            </label>
                                            <p className="text-sm text-muted-foreground">
                                            </p>
                                        </div>
                                    </div>
                                    <div className="items-top flex space-x-2">
                                        <Controller name="offeredMedicine.returnConditions.subType" control={control} render={({ field }) => (

                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}></Checkbox>
                                        )} />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor="terms1"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                รับคืนเฉพาะรายการนี้
                                            </label>
                                            <p className="text-sm text-muted-foreground">
                                            </p>
                                        </div>
                                    </div>
                                    <div className="items-top flex space-x-2">
                                        <Controller name="offeredMedicine.returnConditions.supportType" control={control} render={({ field }) => (

                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}></Checkbox>
                                        )} />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor="terms1"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                รับคืนเฉพาะรายการนี้
                                            </label>
                                            <p className="text-sm text-muted-foreground">
                                            </p>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>


                    <DialogFooter>
                        <Button type="submit">
                            {loading ? <LoadingSpinner /> : "Submit"}
                        </Button>
                        <DialogClose>
                            <Button variant={"destructive"} type="submit" >
                                Cancel
                            </Button>
                        </DialogClose>

                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
