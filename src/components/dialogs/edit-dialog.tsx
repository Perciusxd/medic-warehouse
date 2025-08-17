import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { LoadingSpinner } from '../ui/loading-spinner';
import { Button } from "@/components/ui/button"
import { MoveLeft, MoveRight, Plus, HandCoins, Ban, CalendarCheck2, X, Copy } from 'lucide-react';

export function EditPopover(props: any) {
    const currentDate = new Date();
    const [requestQty, setRequestQty] = useState(props.quantity);
    const [loading, setLoading] = useState(false);

    const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRequestQty(value);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("/api/borrowMed", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    medicineID: props.medicineID,
                    borrowHospital: props.hospitalName,
                    borrowQty: requestQty,
                }),
            });

            if (response.ok) {
                toast("ยืนยันการขอยืมยาเรียบร้อยแล้ว");
                if (props.onClose) {
                    props.onClose(e);
                }
            } else {
                //console.log("Response not ok:", response);
                toast.error("เกิดข้อผิดพลาดในการขอยืมยา");
            }
            props.fetchData();
        } catch (error) {
            //console.error("Error:", error);
            toast.error("เกิดข้อผิดพลาดในการขอยืมยา");
        } finally {
            setLoading(false);
        }
    }

    return (
        <PopoverContent className="w-100">
            <div className="grid gap-4">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">รายละเอียดการยืม</h4>
                    <p className="text-sm text-muted-foreground">
                        ตรวจสอบและแก้ไขข้อมูลการยืม
                    </p>
                </div>
                <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="font-light">วันที่ยืม</Label>
                        <Input
                            id="width"
                            defaultValue={new Date(Number(currentDate)).toLocaleString()}
                            className="col-span-2 h-8"
                            disabled
                        />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="font-light">โรงพยาบาลที่ขอยืม</Label>
                        <Input
                            id="maxWidth"
                            defaultValue={props.hospitalName}
                            className="col-span-2 h-8"
                            disabled
                        />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="font-light">รายละเอียดเพิ่มเติม</Label>
                        <Input
                            id="maxWidth"
                            defaultValue="ผู้ผลิต xxx หรือ yyy เท่านั้น"
                            className="col-span-2 h-8"
                        />
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <div>
                            <Label className="font-light">จำนวนที่ยืมได้</Label>
                            <Input
                                id="maxWidth"
                                defaultValue={props.quantity}
                                className="col-span-2 h-8"
                                disabled
                            />
                        </div>
                        <div>
                            <Label className="font-light">จำนวนที่ขอยืม</Label>
                            <Input
                                id="maxWidth"
                                defaultValue={props.quantity}
                                value={requestQty}
                                onChange={handleQtyChange}
                                className="col-span-2 h-8"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4 mt-4">
                        {loading ? (
                            <LoadingSpinner width="24" height="24" />
                        ) : (
                            <Button className="bg-green-800 col-start-2" onClick={handleSubmit}>
                                <CalendarCheck2 />ยืนยัน
                            </Button>
                        )}
                        <Button variant="destructive" onClick={props.onClose}>
                            <X />ยกเลิก
                        </Button>
                    </div>
                </div>
            </div>
        </PopoverContent>
    );
}