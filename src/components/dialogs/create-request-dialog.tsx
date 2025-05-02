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

import RequestDetails from "./request-details"

export const hospitalList = [
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
    {
        id: 6,
        nameEN: "Hospital F",
        nameTH: "โรงพยาบาลดี",
        address: "987 Cedar St, Citytown",
        phone: "555-2345",
        specialties: ["Urology", "Nephrology"],
        rating: 4.3,
    },
    {
        id: 7,
        nameEN: "Hospital G",
        nameTH: "โรงพยาบาลดี",
        address: "159 Birch St, Townyville",
        phone: "555-6789",
        specialties: ["Ophthalmology", "ENT"],
        rating: 4.6,
    },
    {
        id: 8,
        nameEN: "Hospital H",
        nameTH: "โรงพยาบาลดี",
        address: "753 Spruce St, Villagetown",
        phone: "555-0123",
        specialties: ["Anesthesiology", "Pathology"],
        rating: 4.1,
    },
    {
        id: 9,
        nameEN: "Hospital I",
        nameTH: "โรงพยาบาลดี",
        address: "852 Fir St, Hamletburg",
        phone: "555-4567",
        specialties: ["Emergency Medicine", "Family Medicine"],
        rating: 4.4,
    },
    {
        id: 10,
        nameEN: "Hospital J",
        nameTH: "โรงพยาบาลดี",
        address: "951 Willow St, Cityville",
        phone: "555-8901",
        specialties: ["Internal Medicine", "Surgery"],
        rating: 4.9,
    },
    {
        id: 11,
        nameEN: "Hospital K",
        nameTH: "โรงพยาบาลดี",
        address: "159 Oak St, Townsville",
        phone: "555-2345",
        specialties: ["Pediatrics", "Orthopedics"],
        rating: 4.0,
    },
    {
        id: 12,
        nameEN: "Hospital L",
        nameTH: "โรงพยาบาลดี",
        address: "753 Maple St, Villageburg",
        phone: "555-6789",
        specialties: ["Oncology", "Dermatology"],
        rating: 4.8,
    },
    {
        id: 13,
        nameEN: "Hospital M",
        nameTH: "โรงพยาบาลดี",
        address: "951 Pine St, Hamletville",
        phone: "555-0123",
        specialties: ["Radiology", "Gastroenterology"],
        rating: 4.2,
    },
    {
        id: 14,
        nameEN: "Hospital N",
        nameTH: "โรงพยาบาลดี",
        address: "159 Cedar St, Boroughtown",
        phone: "555-4567",
        specialties: ["Psychiatry", "Endocrinology"],
        rating: 4.7,
    },
    {
        id: 15,
        nameEN: "Hospital O",
        nameTH: "โรงพยาบาลดี",
        address: "753 Birch St, Citytown",
        phone: "555-8901",
        specialties: ["Urology", "Nephrology"],
        rating: 4.3,
    }
];

const FormSchema = z.object({
    mode: z.enum(["auto", "manual", "advanced"]),
    customInput: z.string().optional(),
})

const RequestSchema = z.object({
    urgent: z.boolean(),
    requestMedicine: z.object({
        name: z.string().min(1, "Name is required"),
        trademark: z.string().min(1, "Trademark is required"),
        description: z.string().min(1, "Description is required"),
        quantity: z.string().min(1, "Quantity is required"),
        pricePerUnit: z.string().min(1, "Price per unit is required"),
        unit: z.string().min(1, "Unit is required"),
        batchNumber: z.string().min(1, "Batch number is required"),
        manfacturer: z.string().min(1, "Manufacturer is required"),
        manfactureDate: z.string().min(1, "Manufacture date is required"),
    }),
    requestTerm: z.object({
        expectedReturnDate: z.string().min(1, "Expected return date is required"),
        receiveConditions: z.object({
            condition: z.enum(["exactType", "subType", "other"]),
        })
    }),
    selectedHospitals: z.array(z.number().min(1, "At least one hospital must be selected")),
})

const postingHospital = {
    id: "hospital-123",
    nameEN: "General Hospital",
    nameTH: "โรงพยาบาลทั่วไป",
    address: "123 Main St, Cityville",
    phone: "555-1234",

}

export default function CreateRequestDialog({ requestData, openDialog, onOpenChange }) {
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
            urgent: false,
            requestMedicine: {
                name: "",
                trademark: "",
                description: "",
                quantity: "",
                pricePerUnit: "",
                unit: "",
                batchNumber: "",
                manfacturer: "",
                manfactureDate: "",
            },
            requestTerm: {
                expectedReturnDate: "",
                receiveConditions: {
                    condition: "exactType",
                },
            },
            selectedHospitals: [],
        },
    })

    const selectedHospitals = watch("selectedHospitals")
    const urgent = watch("urgent")
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
                <form onSubmit={handleSubmit(onSubmit, (invalidError) => {
                    console.error(invalidError)
                })} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">Name</Label>
                                <Input type="text" {...register("requestMedicine.name")} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">Urgent</Label>
                                <Checkbox checked={urgent} onCheckedChange={(checked) => setValue("urgent", checked === true)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">Trademark</Label>
                                <Input type="text" {...register("requestMedicine.trademark")} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">Description</Label>
                                <Input type="text" {...register("requestMedicine.description")} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">Quantity</Label>
                                <Input type="text" {...register("requestMedicine.quantity")} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">Price per unit</Label>
                                <Input type="text" {...register("requestMedicine.pricePerUnit")} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">Unit</Label>
                                <Input type="text" {...register("requestMedicine.unit")} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">Batch number</Label>
                                <Input type="text" {...register("requestMedicine.batchNumber")} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">Manufacturer</Label>
                                <Input type="text" {...register("requestMedicine.manfacturer")} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">Manufacturer Date</Label>
                                <Input type="text" {...register("requestMedicine.manfactureDate")} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="font-bold">Expected Return Date</Label>
                                <Input type="text" {...register("requestTerm.expectedReturnDate")} />
                            </div>
                            <div className="flex items-center space-x-4">
                                <Label>
                                    <input type="radio" value="exactType" {...register("requestTerm.receiveConditions.condition")} />
                                    ยืมรายการที่ต้องการ
                                </Label>
                                <Label>
                                    <input type="radio" value="subType" {...register("requestTerm.receiveConditions.condition")} />
                                    ยืมรายการทดแทน
                                </Label>
                                <Label>
                                    <input type="radio" value="other" {...register("requestTerm.receiveConditions.condition")} />
                                    อื่นๆ
                                </Label>
                            </div>
                        </div>
                        <div className="">
                            <div className="flex items-center justify-between">
                                <h1>โรงพยาบาลที่ต้องการขอยืม</h1>
                            </div>
                            <span className="text-sm text-gray-500 mb-2">
                                Select the hospitals you want to send the request to.
                            </span>
                            <div className="flex items-center gap-2 my-4">
                                <Checkbox
                                    id="select-all"
                                    className="cursor-pointer"
                                    checked={allSelected}
                                    onCheckedChange={toggleAllHospitals} />
                                <Label htmlFor="select-all">Select All</Label>
                            </div>
                            <ScrollArea className="h-45 w-full rounded-md border">
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
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" className="">
                            {loading
                                ? <div className="flex flex-row items-center gap-2"><LoadingSpinner /><span className="text-gray-500">Create</span></div>
                                : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}