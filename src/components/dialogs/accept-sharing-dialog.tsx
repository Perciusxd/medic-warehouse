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
    console.log('sharingMed RequestDetails', sharingMed)
    const { createdAt } = sharingMed
    const date = new Date(Number(createdAt)); // convert string to number, then to Date
    const formattedDate = format(date, 'dd/MM/yyyy');
    const sharingDetails = sharingMed.sharingDetails
    const sharingMedicine = sharingMed.offeredMedicine ? sharingMed.sharingMedicine : sharingDetails.sharingMedicine
    const { name, trademark, quantity, unit, manufacturer, expiryDate, batchNumber, sharingAmount } = sharingMedicine
    const sharingReturnTerm = sharingMed.offeredMedicine ? sharingMed.sharingReturnTerm.receiveConditions : sharingMed.sharingDetails.sharingReturnTerm.receiveConditions
    //console.log('sharingReturnTermsชชชชชชชชชชชชชชชชชชช', sharingDetails.sharingMedicine)
    /* const formattedExpiryDate = format(new Date(Number(expiryDate)), 'dd/MM/yyyy'); */
    // const formattedExpiryDate = format(sharingDetails.sharingMedicine.expiryDate, 'dd/MM/yyyy'); //ดึงมาก่อนนะอิงจากที่มี ดึงไว้ใน columns.tsx
    const formattedExpiryDate = isNaN(Number(expiryDate)) ? "ยังไม่ระบุ" : format(new Date(Number(expiryDate)), 'dd/MM/yyyy');
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

function ResponseFormSchema(sharingMedicine: any) {
    const maxAmount = sharingMedicine?.sharingAmount ?? Infinity;
    return z.object({
        responseAmount: z.number().min(1, { message: "จำนวนที่ยืมต้องมีค่ามากกว่า 0" }).max(maxAmount, { message: `จำนวนที่ยืมต้องไม่เกิน ${maxAmount}` }),
        expectedReturnDate: z.string().min(1, { message: "วันที่ยืมต้องเป็นวันที่ในอนาคต" }),
        returnTerm: z.object({
            exactType: z.boolean(),
            otherType: z.boolean(),
            subType: z.boolean(),
            supportType: z.boolean(),
            noReturn: z.boolean(),
        }).refine((data) =>
            Object.values(data).some(value => value === true),
            {
                message: "กรุณาเลือกอย่างน้อย 1 เงื่อนไข",
                path: []
            }

        )
    })
}

function ResponseDetails({ sharingMed, onOpenChange }: any) {
    console.log('sharingMed', sharingMed)
    console.log('sharingMed.sharingMedicine', sharingMed.sharingDetails.sharingMedicine)
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateError, setDateError] = useState(""); // for error message
    const [loading, setLoading] = useState(false);

    // Check if there's existing acceptedOffer data to pre-populate the form
    const existingOffer = sharingMed.offeredMedicine;
    const existingReturnTerm = sharingMed.returnTerm;
    const isReconfirm = !!existingOffer;
    console.log('existingOffer', existingOffer)
    console.log('existingReturnTerm', existingReturnTerm)

    const ResponseShema = ResponseFormSchema(sharingMed.sharingDetails.sharingMedicine)
    

    const {
        register,
        watch,
        handleSubmit,
        setValue,
        getValues,
        resetField,
        formState: { errors, isSubmitted },
    } = useForm<z.infer<typeof ResponseShema>>({
        resolver: zodResolver(ResponseShema),
        defaultValues: {
            responseAmount: existingOffer?.responseAmount || sharingMed.acceptedOffer?.responseAmount || 0,
            expectedReturnDate: existingOffer?.expectedReturnDate ? existingOffer.expectedReturnDate : sharingMed.acceptedOffer?.expectedReturnDate ? sharingMed.acceptedOffer.expectedReturnDate : undefined,
            returnTerm: {
                exactType: existingReturnTerm?.exactType || false,
                otherType: existingReturnTerm?.otherType || false,
                subType: existingReturnTerm?.subType || false,
                supportType: existingReturnTerm?.supportType || false,
                noReturn: existingReturnTerm?.noReturn || false,
            }
        }
    })
    const expectedReturn = watch("expectedReturnDate");
    const returnTerm = watch("returnTerm"); // Get the current values of receiveConditions
    const isAnyChecked = Object.values(returnTerm || {}).some(Boolean);// Check if any checkbox is checked

    console.log('expectedReturn', expectedReturn)

    const onSubmit = async (data: z.infer<typeof ResponseShema>) => {
        const isResponse = sharingMed.id.startsWith('RESP');
        const updateId = isResponse ? sharingMed.id : sharingMed.responseId;
        const newStatus = existingOffer ? 're-confirm' : sharingMed.acceptedOffer ? 'to-transfer' : 'offered';

        const responseBody = {
            sharingId: updateId,
            acceptOffer: {
                responseAmount: data.responseAmount,
                expectedReturnDate: data.expectedReturnDate,
            },
            returnTerm: data.returnTerm,
            status: newStatus
        }
        console.log('accept offer responseBody', responseBody)

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
            console.log('accpet offer result', result)
            setLoading(false);
            onOpenChange(false);
        } catch (error) {
            console.error("Error in transaction:", error);
            setLoading(false);
        }
    }

    const onError = (errors: FieldErrors<z.infer<typeof ResponseShema>>) => {
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
                            {...register("responseAmount", { valueAsNumber: true })}
                            disabled={sharingMed.status === 're-confirm'}
                             />
                        {errors.responseAmount?.message && <span className="text-red-500 text-sm">{errors.responseAmount.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="font-bold">วันที่คาดว่าจะคืน</Label>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left font-normal" disabled={sharingMed.status === 're-confirm'} >
                                    {expectedReturn
                                        ? format(new Date(Number(expectedReturn)), "dd/MM/yyyy")
                                        : "เลือกวันที่"}
                                    <Calendar1 className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={expectedReturn ? new Date(Number(expectedReturn)) : undefined}
                                    onSelect={(date) => {
                                        if (date instanceof Date && !isNaN(date.getTime())) {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0); // normalize time
                                            const stringDate = date.getTime().toString();
                                            console.log('stringDate', stringDate)

                                            if (date > today) {
                                                setValue("expectedReturnDate", stringDate, { shouldValidate: true, shouldDirty: true });
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
                    
                    <div className="flex flex-col gap-1 mt-4">
                        <Label>แผนการคืน</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-row gap-1">
                                <input type="checkbox" {...register("returnTerm.exactType")} disabled={sharingMed.status === 're-confirm'} />
                                <Label className="font-normal">คืนรายการนี้</Label>
                            </div>
                            <div className="flex flex-row gap-1">
                                <input type="checkbox" {...register("returnTerm.otherType")} disabled={sharingMed.status === 're-confirm'} />
                                <Label className="font-normal">คืนรายการอื่น</Label>
                            </div>
                            <div className="flex flex-row gap-1">
                                <input type="checkbox" {...register("returnTerm.subType")} disabled={sharingMed.status === 're-confirm'} />
                                <Label className="font-normal">คืนยาทดแทน</Label>
                            </div>
                            <div className="flex flex-row gap-1">
                                <input type="checkbox" {...register("returnTerm.supportType")} disabled={sharingMed.status === 're-confirm'} />
                                <Label className="font-normal">ขอสนับสนุน</Label>
                            </div>
                            <div className="flex items-start flex-row gap-1">
                                <input type="checkbox" {...register("returnTerm.noReturn")} disabled={sharingMed.status === 're-confirm'} />
                                <Label className="font-normal">ไม่ต้องคืน</Label>
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
            </div>
            <div className="flex justify-end mt-4">
                <Button className="pd-20px " type="submit" disabled={loading}>
                    {loading
                        ? <div className="flex flex-row items-center gap-2"><LoadingSpinner /><span className="text-gray-500 ">{isReconfirm ? "บันทึก" : "ยืนยัน"}</span></div>
                        : (isReconfirm ? "บันทึกการแก้ไข" : "ยืนยัน")}
                </Button>
            </div>
        </form>
    )
}

export default function AcceptSharingDialog({ sharingMed, openDialog, onOpenChange }: any) {
    // Check if this is a re-confirm scenario
    const isReconfirm = !!sharingMed?.acceptedOffer;
    const dialogTitle = isReconfirm ? "แก้ไขการยอมรับแบ่งปัน" : "เวชภัณฑ์ยาที่ต้องการแบ่งปัน";

    return (
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
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