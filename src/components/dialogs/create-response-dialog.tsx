"use client"
import * as React from "react"
import { useState, useEffect } from 'react';

import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox"
import { MoveLeft, MoveRight, Plus, HandCoins, Ban, CalendarCheck2, X, Copy } from 'lucide-react';
import { PopoverClose } from "@radix-ui/react-popover";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { toast } from "sonner"

const formSchema = z.object({
    postingDate: z.string(),
    postingHospital: z.string().min(1, "Hospital name is required"),
    medicineName: z.string().min(1, "Medicine name is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unit: z.string().min(1, "Unit is required"),
    batchNumber: z.string().min(1, "Batch number is required"),
    manufacturer: z.string().min(1, "Manufacturer is required"),
    manufactureDate: z.string(),
    expiryDate: z.string(),
    currentLocation: z.string().min(1, "Current location is required"),
    status: z.string().min(1, "Status is required")
})

function LabeledInput({ label, value, id, disabled, onChange, extra = null }) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                defaultValue={value}
                onChange={onChange}
                className="col-span-2 h-8"
                disabled={disabled}
            />
            {extra}
        </div>
    );
}

function PriceField({ label, value, unitPrice }) {
    return (
        <div className="space-y-2">
            <Label htmlFor="price">{label}</Label>
            <div className="flex items-center gap-2">
                <Input
                    id="price"
                    defaultValue={unitPrice}
                    className="h-8 w-1/2"
                    disabled
                />
                <span className="text-sm text-muted-foreground w-1/2">
                    บาท (รวม {value * unitPrice})
                </span>
            </div>
        </div>
    );
}

export function CreateResponse(props) {
    const [selectedTransferOption, setSelectedTransferOption] = useState("transferSpecify");
    const medFields = [
        { id: "postingDate", label: "วันที่ขอยืม", value: new Date(Number(props.requestData.asset.updatedAt)).toLocaleString(), disabled: true },
        { id: "postingHospital", label: "โรงพยาบาลที่ขอยืม", value: props.requestData.asset.postingHospitalNameEN, disabled: true },
        { id: "medicineName", label: "รายการยา", value: props.requestData.asset.requestMedicine.name, disabled: true },
        { id: "unit", label: "รูปแบบ/หน่วย", value: props.requestData.asset.requestMedicine.unit, disabled: true },
        { id: "quantity", label: "ขนาด", value: props.requestData.asset.requestMedicine.quantity, disabled: true },
        { id: "brand", label: "ชื่อการค้า", value: props.requestData.asset.requestMedicine.name, disabled: true },
        { id: "manufacturer", label: "ผู้ผลิต", value: props.requestData.asset.requestMedicine.manufacturer, disabled: true },
    ];

    const getFieldValue = (field) => {
        if (selectedTransferOption !== "transferSpecify") return field.value;

        // Custom values for each field when transferSpecify is selected
        switch (field.id) {
            case "trademark":
                return props.requestData.asset.requestMedicine.name;
            case "manufacturer":
                return props.requestData.asset.requestMedicine.manufacturer;
            // You can add more cases if you want custom overrides for others
            default:
                return field.value;
        }
    };

    const subsidiaryFields = [
        { id: "trademark", label: "ชื่อการค้า", value: "", disabled: false },
        { id: "manufacturer", label: "ผู้ผลิต", value: "", disabled: false },
        { id: "batchNumber", label: "หมายเลขล็อต", value: "", disabled: false },
        { id: "expiryDate", label: "วันหมดอายุ", value: "", disabled: false },
        { id: "transferAmount", label: "จำนวนที่ให้ยืม", value: "", disabled: false },
        { id: "pricePerUnit", label: "ราคาต่อหน่วย", value: "", disabled: false },
    ];

    const [subsidiaryFieldValues, setSubsidiaryFieldValues] = useState({
        trademark: "",
        manufacturer: "",
        batchNumber: "",
        expiryDate: "",
        transferAmount: "",
        pricePerUnit: "",
    });

    const transferConditionFields = [
        { id: "transferSpecify", label: "ให้ยืมรายการที่ต้องการ" },
        { id: "transferSub", label: "ให้ยืมรายการทดแทน" },
        { id: "transferRefuse", label: "ปฏิเสธ" },
    ]

    const returnConditionFields = [
        { id: "_returnCondition", label: "รับคืนเฉพาะรายการนี้", value: "", disabled: false },
        { id: "_returnDate", label: "รับคืนยาทดแทนได้", value: "", disabled: false },
        { id: "_returnLocation", label: "รับคืนยารายการอื่นได้", value: "", disabled: false },
        { id: "_returnLocation", label: "สามารถสนับสนุนได้", value: "", disabled: false },
    ]

    const [open, setOpen] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            postingDate: new Date().toISOString().split('T')[0],
            postingHospital: "",
            medicineName: "",
            quantity: 0,
            unit: "",
            batchNumber: "",
            manufacturer: "",
            manufactureDate: "",
            expiryDate: "",
            currentLocation: "",
            status: "Pending"
        },
    })

    const handleSubsidiaryChange = (id, value) => {
        setSubsidiaryFieldValues((prevFields) => ({
            ...prevFields,
            [id]: value
        }))
    };

    function onSubmit(values) {
        const transformedValues = {
            ...values,
            quantity: values.quantity.toString()
        };

        fetch("/api/createMed", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transformedValues)
        })
            .then((response) => {
                if (response.ok) {
                    setOpen(false);
                    form.reset();
                    props.onSuccess();
                    toast("Medicine added successfully");
                }
                return response.json();
            })
            .then((data) => {
                console.log(data);
            })
            .catch((error) => {
                console.error('Error:', error);
                toast.error("Failed to add medicine");
            });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="mr-2 cursor-pointer" variant="outline"><HandCoins />ให้ยืม</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>เวชภัณฑ์ยาที่ขาดแคลน</DialogTitle>
                    {/* <DialogDescription>
                        Fill in the details for the new medicine borrowing request.
                    </DialogDescription> */}
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {medFields.map((field) => (
                            <LabeledInput key={field.id} id={field.id} label={field.label} value={field.value} disabled={field.disabled} />
                        ))}
                        <PriceField
                            label="ราคาต่อหน่วย"
                            value={props.requestData.asset.requestMedicine.quantity}
                            unitPrice={1000}
                        />
                    </div>

                    <div>
                        <h1 className="font-bol mb-2 mt-8">ยืนยันการให้ยืม</h1>
                        <RadioGroup value={selectedTransferOption} onValueChange={(value) => setSelectedTransferOption(value)} className="my-4">
                            {transferConditionFields.map((field => (
                                <div key={field.id} className="flex items-center space-x-2">
                                    <RadioGroupItem value={field.id} id={field.id} />
                                    <Label htmlFor={field.id}>{field.label}</Label>
                                </div>
                            )))}
                        </RadioGroup>
                        <div className="grid grid-cols-2 gap-4">
                            {/* {subsidiaryFields.map((field) => (
                                <LabeledInput key={field.id} id={field.id} label={field.label} value={getFieldValue(field)} disabled={selectedTransferOption === "transferSpecify"} />
                            ))} */}
                            {subsidiaryFields.map((field) => {
                                if (field.id === "pricePerUnit") {
                                    return (
                                        <div key={field.id}>
                                            <LabeledInput
                                                id={field.id}
                                                label={field.label}
                                                value={field.value}
                                                onChange={(e) => handleSubsidiaryChange(field.id, e.target.value)}
                                                disabled={selectedTransferOption === "transferSpecify"}></LabeledInput>
                                            <PriceField
                                                label="ราคาต่อหน่วย"
                                                value={subsidiaryFieldValues.transferAmount}
                                                unitPrice={subsidiaryFieldValues.pricePerUnit}
                                            />
                                        </div>
                                    )
                                }

                                return (
                                    <LabeledInput
                                        key={field.id}
                                        id={field.id}
                                        label={field.label}
                                        value={getFieldValue(field)}
                                        onChange={(e) => handleSubsidiaryChange(field.id, e.target.value)}
                                        disabled={selectedTransferOption === "transferSpecify"}></LabeledInput>
                                )
                            })}
                        </div>
                        <div className="grid grid-cols-3 items-center mt-8">
                            <span>เงื่อนไขการคืนที่ยอมรับ</span>
                            <div className="col-span-2">
                                <div className="grid grid-cols-2 items-center mt-4">
                                    {returnConditionFields.map((field => (
                                        <div key={field.id}>
                                            <Checkbox id={field.id} />
                                            <label htmlFor={field.id} className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{field.label}</label>
                                        </div>
                                    )))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
