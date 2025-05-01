import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Calendar1Icon } from "lucide-react"

const ResponseSchema = z.object({
    status: z.string(),
    updatedAt: z.string(),
    offerMedicine: z.object({
        name: z.string(),
        trademark: z.string(),
        quantity: z.number(),
        pricePerUnit: z.number(),
        unit: z.string(),
        batchNumber: z.string(),
        manufacturer: z.string(),
        manufactureDate: z.string(),
        expiryDate: z.date(),
        imageRef: z.string(),
        returnTerm: z.enum(["exactType", "subType"])
    })
})

export default function CreateResponseDialog({ requestData, openDialog, onOpenChange }) {
    const [open, setOpen] = useState(false)
    const {
        register,
        watch,
        handleSubmit,
        setValue,
        getValues,
        resetField,
        formState: { errors },
    } = useForm<z.infer<typeof ResponseSchema>>({
        resolver: zodResolver(ResponseSchema),
        defaultValues: {
            status: "", // Added missing default value for status field
            updatedAt: Date.now().toString(),
            offerMedicine: {
                name: requestData.requestMedicine.name,
                quantity: requestData.requestMedicine.quantity,
                trademark: requestData.requestMedicine.trademark,
                pricePerUnit: requestData.requestMedicine.pricePerUnit,
                unit: requestData.requestMedicine.unit,
                batchNumber: requestData.requestMedicine.batchNumber,
                manufacturer: requestData.requestMedicine.manufacturer,
                manufactureDate: requestData.requestMedicine.manufactureDate,
                expiryDate: requestData.requestMedicine.expiryDate,
                imageRef: requestData.requestMedicine.imageRef,
                returnTerm: "exactType"
            }
        }
    })
    const returnTerm = watch("offerMedicine.returnTerm")
    const offerMedicineRef = useRef(requestData.requestMedicine.name);
    const [subTypeName, setSubTypeName] = useState(requestData.requestMedicine.name);

    // useEffect(() => {
    //     if (returnTerm === "exactType") {
    //         setValue("offerMedicine.name", offerMedicineRef.current);
    //     } else if (returnTerm === "subType") {
    //         if (getValues("offerMedicine.name") === offerMedicineRef.current) {
    //             resetField("offerMedicine.name");
    //         }
    //     }
    // }, [returnTerm, setValue, getValues, resetField]);

    useEffect(() => {
        const currentName = getValues("offerMedicine.name");
        if (returnTerm === "exactType") {
            if (currentName !== offerMedicineRef.current) {
                setSubTypeName(currentName);
            }
            setValue("offerMedicine.name", offerMedicineRef.current);
        } else if (returnTerm === "subType") {
            if (currentName === offerMedicineRef.current) {
                setValue("offerMedicine.name", subTypeName);
            }
        }
    }, [returnTerm, setValue, getValues, subTypeName]);

    const onSubmit = async (data: z.infer<typeof ResponseSchema>) => {
        console.log("datasdf", data);
        try {
            const response = await fetch("/api/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error("Failed to submit")
            }

            const result = await response.json()
            console.log("Success:", result)
            alert("Form submitted successfully!")
        } catch (error) {
            console.error("Error submitting form:", error)
            alert("Submission failed.")
        }
    }

    return (
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex items-center space-x-5">
                        <Label>
                            <input type="radio" value="exactType" {...register("offerMedicine.returnTerm")} />
                            Exact Type
                        </Label>
                        <Label>
                            <input type="radio" value="subType" {...register("offerMedicine.returnTerm")} />
                            Subsidiary Type
                        </Label>
                    </div>

                    <div>
                        <Label>
                            Name:
                            <Input
                                type="text"
                                {...register("offerMedicine.name")}
                                disabled={returnTerm === "exactType"}
                                className="ml-2 border p-1"
                            />
                        </Label>
                        <Label>
                            Date of expiry
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className="w-[180px] justify-start text-left font-normal">
                                        {getValues("offerMedicine.expiryDate") ? format(new Date(getValues("offerMedicine.expiryDate")), "PPP") : (<span>Pick a date</span>)}
                                        <Calendar1Icon className="ml-auto h-4 w-4 opacity-50"></Calendar1Icon>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={getValues("offerMedicine.expiryDate") ? new Date(getValues("offerMedicine.expiryDate")) : undefined}
                                        onSelect={(date) => {
                                            console.log(date);
                                            if (date) {
                                                setValue("offerMedicine.expiryDate", date.toString());
                                                setOpen(false);
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button type="submit">
                            Submit
                        </Button>

                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
