"use client"
import { format } from "date-fns"

interface ReturnDetailsProps {
    returnMedicine?: any;
    offeredAmount?: number;
    offeredUnitPrice?: number;
}

export default function ReturnDetails({ returnMedicine, offeredAmount = 0, offeredUnitPrice = 0 }: ReturnDetailsProps) {
    const originalTotalPrice = (Number(offeredAmount) || 0) * (Number(offeredUnitPrice) || 0);

    const list = Array.isArray(returnMedicine)
        ? returnMedicine
        : (returnMedicine ? [returnMedicine] : []);

    const normalized = list.map((item: any) => (item && item.returnMedicine ? item.returnMedicine : item));

    const returnedPriceTotal: number = normalized.reduce((sum: number, item: any) => {
        const amt = Number(item?.returnAmount ?? 0);
        const unitPrice = Number(item?.pricePerUnit ?? 0);
        if (isNaN(amt) || isNaN(unitPrice)) return sum;
        return sum + amt * unitPrice;
    }, 0);

    const percent = originalTotalPrice > 0
        ? Math.max(0, Math.min(100, (returnedPriceTotal / originalTotalPrice) * 100))
        : 0;

    return (
        <div className="flex flex-col gap-2">
            <div className="font-semibold">สรุปการคืน</div>

            {normalized.length === 0 && (
                <div className="text-xs text-muted-foreground">ยังไม่มีการคืน</div>
            )}

            {normalized.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
                    <div className="text-muted-foreground">จำนวนครั้งที่คืน</div>
                    <div className="font-medium">{normalized.length}</div>
                    <div className="text-muted-foreground">ราคารวมที่คืนแล้ว</div>
                    <div className="font-medium">{returnedPriceTotal.toFixed(2)} บาท</div>
                    <div className="text-muted-foreground">เปอร์เซ็นต์ (ราคา)</div>
                    <div className="font-medium">{percent.toFixed(0)}%</div>
                    <div className="text-muted-foreground">ราคารวมที่ต้องคืน</div>
                    <div className="font-medium">{originalTotalPrice.toFixed(2)} บาท</div>
                </div>
            )}

            {normalized.length > 0 && (
                <div className="space-y-1">
                    {normalized.map((item: any, idx: number) => {
                        const amt = Number(item?.returnAmount ?? 0);
                        const unitPrice = Number(item?.pricePerUnit ?? 0);
                        const total = (isNaN(amt) || isNaN(unitPrice)) ? 0 : amt * unitPrice;
                        const dateStr = item?.returnDate ? (() => {
                            const d = new Date(Number(item.returnDate));
                            return isNaN(d.getTime()) ? undefined : `${format(d, 'dd/MM')}/${d.getFullYear() + 543}`;
                        })() : undefined;
                        return (
                            <div key={idx} className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">ครั้งที่ {idx + 1}:</span>
                                <span> {Number(amt).toLocaleString()} x {Number(unitPrice).toLocaleString()} = </span>
                                <span className="text-foreground font-medium">{total.toFixed(2)} บาท</span>
                                {dateStr && <span> • {dateStr}</span>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

 