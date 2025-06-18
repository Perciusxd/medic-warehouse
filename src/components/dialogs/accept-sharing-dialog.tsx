import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Icons
import { Calendar1 } from "lucide-react"

import { format } from "date-fns"
import { z } from "zod"
import { useForm, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"

function RequestDetails({ sharingMed }: any) {
    const { createdAt } = sharingMed
    const date = new Date(Number(createdAt)); // convert string to number, then to Date
    const formattedDate = format(date, 'dd/MM/yyyy');
    console.log('createdAt', createdAt)
    const sharingDetails = sharingMed.sharingDetails
    const { name, trademark, quantity, unit, manufacturer, expiryDate, batchNumber ,sharingAmount } = sharingDetails.sharingMedicine
    const sharingReturnTerm = sharingDetails.sharingReturnTerm.receiveConditions
    console.log('sharingReturnTermsชชชชชชชชชชชชชชชชชชช', sharingDetails.sharingMedicine)
    /* const formattedExpiryDate = format(new Date(Number(expiryDate)), 'dd/MM/yyyy'); */
    const formattedExpiryDate = format(sharingDetails.sharingMedicine.expiryDate, 'dd/MM/yyyy'); //ดึงมาก่อนนะอิงจากที่มี ดึงไว้ใน columns.tsx
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <Label>วันที่แจ้ง</Label>
                    <Input disabled value={formattedDate} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>โรงพยาบาลที่แจ้ง</Label>
                    <Input disabled value={sharingDetails.postingHospitalNameTH} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ชื่อยา</Label>
                    <Input disabled value={name} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>รูปแบบ/หน่วย</Label>
                    <Input disabled value={unit} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ชื่อการค้า</Label>
                    <Input disabled value={trademark} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>ผู้ผลิต</Label>
                    <Input disabled value={manufacturer} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>จำนวน</Label>
                    <Input disabled value={sharingAmount} />
                </div>
                <div className="grid grid-cols-2 gap-1">
                    <div className="flex flex-col gap-1">
                        <Label>หมายเลขล็อต</Label>
                        <Input disabled value={batchNumber} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>วันหมดอายุ</Label>
                        <Input disabled value={formattedExpiryDate} />
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <Label>เงื่อนไขการคืนยาที่ยอมรับ</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-row gap-1">
                        <input type="checkbox" checked={sharingReturnTerm.exactType} disabled />
                        <Label>รับคืนเฉพาะรายการนี้</Label>
                    </div>
                    <div className="flex flex-row gap-1">
                        <input type="checkbox" checked={sharingReturnTerm.otherType} disabled />
                        <Label>รับคืนรายการอื่นได้</Label>
                    </div>
                    <div className="flex flex-row gap-1">
                        <input type="checkbox" checked={sharingReturnTerm.subType} disabled />
                        <Label>รับคืนรายการทดแทน</Label>
                    </div>
                    <div className="flex flex-row gap-1">
                        <input type="checkbox" checked={sharingReturnTerm.supportType} disabled />
                        <Label>สามารถสนับสนุนได้</Label>
                    </div>
                    <div className="flex flex-row gap-1">
                        <input type="checkbox" checked={sharingReturnTerm.noReturn} disabled />
                        <Label>ไม่รับคืน</Label>
                    </div>
                </div>
                
            </div>
        </div>
    )
}

const ResponseFormSchema = z.object({
    responseAmount: z.number().min(1, { message: "จำนวนที่ยืมต้องมีค่ามากกว่า 0" }),
    expectedReturnDate: z.coerce.date().min(new Date(), { message: "วันที่ยืมต้องเป็นวันที่ในอนาคต" }),
    returnTerm: z.object({
        exactType: z.boolean(),
        otherType: z.boolean(),
        subType: z.boolean(),
        supportType: z.boolean(),
        noReturn: z.boolean(),
    }).refine((data) => 
            Object.values(data).some(value => value === true),
            {
                message: "กรุณาเลือกอย่างน้อย 1 เงื่อนไข" ,
                path: []
            }

        )
})

function ResponseDetails({ sharingMed, onOpenChange }: any) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateError, setDateError] = useState(""); // for error message
    const [loading, setLoading] = useState(false);
    const {
        register,
        watch,
        handleSubmit,
        setValue,
        getValues,
        resetField,
        formState: { errors ,isSubmitted},
    } = useForm<z.infer<typeof ResponseFormSchema>>({
        resolver: zodResolver(ResponseFormSchema),
        defaultValues: {
            responseAmount: 0,
            expectedReturnDate: undefined,
            returnTerm: {
                exactType: false,
                otherType: false,
                subType: false,
                supportType: false,
                noReturn: false,
            }
        }
    })
    const expectedReturn = watch("expectedReturnDate");
    const returnTerm = watch("returnTerm"); // Get the current values of receiveConditions
    const isAnyChecked = Object.values(returnTerm || {}).some(Boolean);// Check if any checkbox is checked
    



    const onSubmit = async (data: z.infer<typeof ResponseFormSchema>) => {
        const acceptOfferData = {
            acceptOffer: {
                responseAmount: data.responseAmount,
                expectedReturnDate: data.expectedReturnDate,
            },
            returnTerm: data.returnTerm
        }
        const responseBody = {
            responseId: sharingMed.id,
            acceptOffer: acceptOfferData,
        }
        try {
            setLoading(true);
            const response = await fetch("/api/updateSharing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(responseBody),
            })
            const result = await response.json();
            console.log('result', result)
            setLoading(false);
            onOpenChange(false);
        } catch (error) {
            console.error("Error in transaction:", error);
            setLoading(false);
        }
    }
    
    const onError = (errors: FieldErrors<z.infer<typeof ResponseFormSchema>>) => {
        console.error("❌ Form validation errors:", errors);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)}>
            <div className="flex flex-col gap-4">
                <Label>ยืนยันการยืม</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                        <Label>จำนวนที่ยืม</Label>
                        <Input 
                             inputMode="numeric"
                                    placeholder="10" 
                                    onKeyDown={(e) => {
                                        const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight"];
                                        if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                        e.preventDefault();
                                        }
                                    }}
                        {...register("responseAmount", { valueAsNumber: true })} />
                        {errors.responseAmount?.message && <span className="text-red-500 text-sm">{errors.responseAmount.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="font-bold">วันที่คาดว่าจะคืน</Label>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left font-normal">
                                    {expectedReturn
                                        ? format(expectedReturn, "dd/MM/yyyy")
                                        : "เลือกวันที่"}
                                    <Calendar1 className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={expectedReturn}
                                    onSelect={(date) => {
                                        if (date instanceof Date && !isNaN(date.getTime())) {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0); // normalize time

                                            if (date > today) {
                                                setValue("expectedReturnDate", date, { shouldValidate: true, shouldDirty: true });
                                                setDateError(""); // clear error
                                                setIsCalendarOpen(false); // close popover
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
                                    <div className="text-red-500 text-sm px-4 py-2">{dateError}</div>
                                )}
                            </PopoverContent>
                        </Popover>
                        {errors.expectedReturnDate?.message && <span className="text-red-500 text-sm">{errors.expectedReturnDate.message}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-row gap-1">
                            <input type="checkbox"  {...register("returnTerm.exactType")} />
                            <Label>รับคืนเฉพาะรายการนี้</Label>
                        </div>
                        <div className="flex flex-row gap-1">
                            <input type="checkbox" {...register("returnTerm.otherType")} />
                            <Label>รับคืนรายการอื่นได้</Label>
                        </div>
                        <div className="flex flex-row gap-1">
                            <input type="checkbox" {...register("returnTerm.subType")} />
                            <Label>รับคืนรายการทดแทน</Label>
                        </div>
                        <div className="flex flex-row gap-1">
                            <input type="checkbox" {...register("returnTerm.supportType")} />
                            <Label>สามารถสนับสนุนได้</Label>
                        </div>
                        <div className="flex flex-row gap-1">
                            <input type="checkbox" {...register("returnTerm.noReturn")} />
                            <Label>ไม่รับคืน</Label>
                        </div>
                        <br></br>
                        <div className="flex flex-col col-span-2">
                            {!isAnyChecked && isSubmitted && (
                                <p className="text-red-500 text-sm mt-1">
                                    กรุณาเลือกอย่างน้อย 1 เงื่อนไข
                                </p>
                            )}
                        </div>                       
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-4">
                <Button className="pd-20px " type="submit" disabled={loading}>
                    {loading
                        ? <div className="flex flex-row items-center gap-2"><LoadingSpinner /><span className="text-gray-500 ">ยืนยัน</span></div>
                        : "ยืนยัน"}
                </Button>
            </div>
        </form>
    )
}

export default function AcceptSharingDialog({ sharingMed, openDialog, onOpenChange }: any) {
    return (
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>เวชภัณฑ์ยาที่ต้องการแบ่งปัน</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col mt-2 gap-4">
                    <RequestDetails sharingMed={sharingMed} />
                    <Separator />
                    <ResponseDetails sharingMed={sharingMed} onOpenChange={onOpenChange} />
                </div>
            </DialogContent>
        </Dialog>
    )
}