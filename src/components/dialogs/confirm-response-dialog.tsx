import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { formatDate } from "@/lib/utils"
// import { format, formatDate, sub } from "date-fns"
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
import PdfPreview from "@/components/ui/preview_pdf"
import { Separator } from "@/components/ui/separator"

import { Calendar1Icon, ShieldAlert } from "lucide-react"

import RequestDetails from "./request-details"

function RequestDetailPanel({ requestData }) {
    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">รายละเอียดการขอยืม</h2>
            <div className="grid grid-rows-2 gap-1 font-light">
                <div>วันที่ {formatDate(requestData.updatedAt)}</div>
                <div>{requestData.postingHospitalNameTH}</div>
                <div>ขอยืมยา {requestData.requestMedicine.name}</div>
                <div>จำนวน {requestData.requestMedicine.requestAmount} {requestData.requestMedicine.quantity} เป็นเงิน {requestData.requestMedicine.pricePerUnit * requestData.requestMedicine.requestAmount} บาท</div>
                <div>คาดว่าจะส่งคืนวันที่ {formatDate(requestData.requestTerm.expectedReturnDate)}</div>
            </div>
        </div>
    )
}

function ResponseDetailPanel({ responseData }) {
    const offeredMedicine = responseData.offeredMedicine
    const totalPrice = offeredMedicine.pricePerUnit * offeredMedicine.offerAmount
    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">รายละเอียดการตอบรับ</h2>
            <div className="grid grid-rows-2 gap-1 font-light">
                <div>วันที่ {formatDate(responseData.updatedAt)}</div>
                <div>{responseData.respondingHospitalNameTH}</div>
                <div>ให้ยืมยา {offeredMedicine.name}({offeredMedicine.manufacturer}) เป็นจำนวน {offeredMedicine.offerAmount}/{offeredMedicine.unit} เป็นเงิน {totalPrice}</div>
                <div>โดยเงื่อนไขการส่งคืน</div>
                {offeredMedicine.returnTerm === "exactType" ? (
                    <div>ส่งคืนตามประเภท</div>
                ) : (
                    <div>ส่งคืนตามประเภทย่อย</div>
                )}
            </div>
        </div>
    )
}

function getConfirmationSchema(requestData) {
    return z.object({
        responseId: z.string(),
        offeredMedicine: z.object({
            name: z.string(),
            unit: z.string(),
            // quantity: z.string(),
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
    const pdfRef = useRef(null)
    const [loading, setLoading] = useState(false)
    const requestData = data.requestDetails
    const ConfirmSchema = getConfirmationSchema(requestData)
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
                name: data.offeredMedicine.name,
                unit: data.offeredMedicine.unit,
                // quantity: data.offeredMedicine.quantity,
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

    const handleSaveRef = () => {
        if (pdfRef.current?.savePdf) {
            pdfRef.current.savePdf()
        }
    }

    const onSubmit = async (data) => {
        const responseBody = {
            ...data,
            status: status,
        }
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
            setLoading(false)
            onOpenChange(false)
        } catch (error) {
            console.error("Error submitting form:", error)
            setLoading(false)
        }
    }

    return (
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[80vw]">
                <DialogTitle>{dialogTitle}</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex flex-row gap-4">
                        <div className="basis-[60%]">
                            {/* <RequestDetails requestData={requestData} /> */}
                            <RequestDetailPanel requestData={requestData} />
                            <Separator className="my-4" />
                            <ResponseDetailPanel responseData={data} />
                        </div>
                        <div className="basis-[40%] overflow-auto border rounded-md shadow-sm">
                            <PdfPreview data={data} ref={pdfRef} />

                        </div>
                    </div>



                    <DialogFooter>
                        <Button type="submit">
                            {loading ? <div className="flex flex-row items-center gap-2 text-muted-foreground"><LoadingSpinner /> ยืมยันการให้ยืม</div> : "ยืมยันการให้ยืม"}
                        </Button>
                        <Button variant={"outline"} onClick={handleSaveRef}>Save PDF</Button>

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
