"use client"
import { Button } from "@/components/ui/button"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Info } from "lucide-react"
import { format } from "date-fns"
import ReturnDetails from "@/components/ui/return-details"

interface ReturnSummaryHoverProps {
    requestMedicine?: any;
    offeredMedicine?: any;
    acceptedOffer?: any;
    returnMedicine?: any;
}

export default function ReturnSummaryHover({ requestMedicine, offeredMedicine, acceptedOffer, returnMedicine }: ReturnSummaryHoverProps) {
    const name = requestMedicine?.name ?? "-";
    const trademark = requestMedicine?.trademark ?? "-";
    const quantity = requestMedicine?.quantity ?? "-";
    const unit = requestMedicine?.unit ?? "-";
    const manufacturer = requestMedicine?.manufacturer ?? "-";

    const offeredAmount: number = Number(
        (offeredMedicine?.offerAmount ?? acceptedOffer?.responseAmount ?? 0)
    );
    const offeredUnitPrice: number = Number(
        (offeredMedicine?.pricePerUnit ?? acceptedOffer?.pricePerUnit ?? requestMedicine?.pricePerUnit ?? 0)
    );
    const originalTotalPrice: number = (isNaN(offeredAmount) || isNaN(offeredUnitPrice)) ? 0 : (offeredAmount * offeredUnitPrice);

    const list = Array.isArray(returnMedicine) ? returnMedicine : (returnMedicine ? [returnMedicine] : []);
    const returnedPriceTotal: number = list.reduce((sum: number, item: any) => {
        try {
            const nested = item && item.returnMedicine ? item.returnMedicine : item;
            const rAmt = Number(nested?.returnAmount ?? 0);
            const rPrice = Number(nested?.pricePerUnit ?? 0);
            const lineTotal = (isNaN(rAmt) || isNaN(rPrice)) ? 0 : (rAmt * rPrice);
            return sum + lineTotal;
        } catch {
            return sum;
        }
    }, 0);
    const percent: number = originalTotalPrice > 0 ? Math.max(0, Math.min(100, (returnedPriceTotal / originalTotalPrice) * 100)) : 0;

    return (
        <HoverCard>
            <HoverCardTrigger>
                <Button variant={"link"} className="p-0 h-auto flex items-center"><Info className="cursor-pointer" /></Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-90">
                <div className="text-sm">
                    <div className="font-semibold mb-2">รายละเอียดยา</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
                        <div className="text-xs text-muted-foreground">รายการยา</div>
                        <div className="text-xs font-medium">{name}</div>
                        <div className="text-xs text-muted-foreground">ชื่อการค้า</div>
                        <div className="text-xs font-medium">{trademark}</div>
                        <div className="text-xs text-muted-foreground">ขนาด/หน่วย</div>
                        <div className="text-xs font-medium">{quantity} {unit}</div>
                        <div className="text-xs text-muted-foreground">ผู้ผลิต</div>
                        <div className="text-xs font-medium">{manufacturer}</div>
                        <div className="text-xs text-muted-foreground">ราคาต่อหน่วย</div>
                        <div className="text-xs font-medium">{Number(offeredUnitPrice).toLocaleString()}</div>
                    </div>

                    <div className="font-semibold mb-1">สรุปการยืม</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
                        <div className="text-xs text-muted-foreground">จำนวนที่ยืม</div>
                        <div className="text-xs font-medium">{Number(offeredAmount).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">ราคาต่อหน่วย</div>
                        <div className="text-xs font-medium">{Number(offeredUnitPrice).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">ราคารวมที่ต้องคืน</div>
                        <div className="text-xs font-medium">{originalTotalPrice.toFixed(2)} บาท</div>
                    </div>

                    <ReturnDetails
                        returnMedicine={returnMedicine}
                        offeredAmount={offeredAmount}
                        offeredUnitPrice={offeredUnitPrice}
                    />
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}



