"use client"
import { formatDate } from "@/lib/utils"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import ImageHoverPreview from "@/components/ui/image-hover-preview"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
const formatThaiDate = (input: string | number | Date | undefined): string => {
    if (!input) return '';
    let date: Date;
    if (input instanceof Date) {
        date = input;
    } else if (typeof input === 'string') {
        date = isNaN(Number(input)) ? new Date(input) : new Date(Number(input));
    } else {
        date = new Date(input);
    }
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date);
}
export default function RequestDetails({ requestData, responseForm }: any) {
    // Image preview state
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

    
    const requestDetails = requestData ? {
        id: requestData.id,
        postingHospitalId: requestData.postingHospitalId,
        postingHospitalNameEN: requestData.postingHospitalNameEN,
        postingHospitalNameTH: requestData.postingHospitalNameTH,
        postingHospitalAddress: requestData.postingHospitalAddress,
        status: requestData.status,
        createdAt: requestData.createdAt,
        updatedAt: requestData.updatedAt,
        urgent: requestData.urgent,
        requestMedicine: {
            name: requestData.requestMedicine.name,
            trademark: requestData.requestMedicine.trademark,
            quantity: requestData.requestMedicine.quantity,
            pricePerUnit: requestData.requestMedicine.pricePerUnit,
            unit: requestData.requestMedicine.unit,
            requestAmount: requestData.requestMedicine.requestAmount,
            manufacturer: requestData.requestMedicine.manufacturer,
            manufactureDate: requestData.requestMedicine.manufactureDate,
            imageRef: requestData.requestMedicine.imageRef,
            description: requestData.requestMedicine.description,
            requestMedicineImage: requestData.requestMedicine.requestMedicineImage,
            packingSize: requestData.requestMedicine.packingSize,
        },
        requestTerm: {
            returnType: requestData.requestTerm.returnType,
            expectedReturnDate: requestData.requestTerm.expectedReturnDate,
            receiveConditions: {
                condition: requestData.requestTerm.receiveConditions?.condition,
            },
            returnConditions: {
                condition: requestData.requestTerm.returnConditions?.condition,
                otherTypeSpecification: requestData.requestTerm.returnConditions?.otherTypeSpecification,
            }
        }
    } : {
        id: "",
        postingHospitalId: "",
        postingHospitalNameEN: "",
        postingHospitalNameTH: "",
        postingHospitalAddress: "",
        status: "",
        createdAt: "",
        updatedAt: "",
        urgent: false,
        requestMedicine: {
            name: "",
            trademark: "",
            quantity: "",
            pricePerUnit: "",
            unit: "",
            batchNumber: "",
            manufacturer: "",
            manufactureDate: "",
            imageRef: "",
            description: "",
            requestMedicineImage: "",
        },
        requestTerm: {
            expectedReturnDate: "",
            receiveConditions: {
                exactType: false,
                subsidiary: false,
                other: false,
                notes: ""
            }
        }
    };
    
    const total = (requestDetails.requestMedicine.pricePerUnit || 0) * (requestDetails.requestMedicine.requestAmount || 0);
    const imgUrl: string | null = requestDetails.requestMedicine.requestMedicineImage || requestDetails.requestMedicine?.imageRef || null;
    const [details, setDetails] = useState([
        { label: "วันที่ขอยืม", value: format(new Date(Number(requestDetails.updatedAt)), 'dd/MM/') + (new Date(Number(requestDetails.updatedAt)).getFullYear() + 543) },
        // { label: "ID ขอยืม", value: requestDetails.id },
        // { label: "Posting Hospital ID", value: requestDetails.postingHospitalId },
        // { label: "Posting Hospital Name (EN)", value: requestDetails.postingHospitalNameEN },
        // { label: "Posting Hospital Address", value: requestDetails.postingHospitalAddress },
        // { label: "Status", value: requestDetails.status },
        // { label: "Updated At", value: formatDate(requestDetails.updatedAt) },
        { label: "โรงพยาบาลที่ขอยืม", value: requestDetails.postingHospitalNameTH },
        { label: "รายการยา", value: requestDetails.requestMedicine.name },
        { label: "รูปแบบ/หน่วย", value: requestDetails.requestMedicine.unit },
        { label: "ขนาด", value: requestDetails.requestMedicine.quantity },
        { label: "ชื่อการค้า", value: requestDetails.requestMedicine.trademark },
        //{ label: "ขนาดบรรจุ", value: requestDetails.requestMedicine.packingSize },
        // { label: "จำนวนที่ขอยืม", value: requestDetails.requestMedicine.requestAmount },
        // { label: "วันที่คาดว่าจะคืน", value: formatDate(requestDetails.requestTerm.expectedReturnDate) },
    ])
    
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {details.map((detail, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <Label className="font-bold">{detail.label}</Label>
                        <Input type="text" value={detail.value} disabled />
                    </div>
                ))}
                <div>
                    <Label className="font-bold">ผู้ผลิต</Label>
                    <Input type="text" value={requestDetails.requestMedicine.manufacturer} disabled />
                </div>

                <div>
                    <Label className="font-bold">จำนวนที่ขอยืม</Label>
                    <Input type="text" value={requestDetails.requestMedicine.requestAmount?.toLocaleString("th-TH")} disabled />
                </div>
                <div>
                    <Label className="font-bold">วันที่คาดว่าจะคืน</Label>
                    <Input type="text" value={format(new Date(Number(requestDetails.requestTerm.expectedReturnDate)), 'dd/MM/') + (new Date(Number(requestDetails.requestTerm.expectedReturnDate)).getFullYear() + 543)} disabled />
                </div>
                <div>
                    <Label className="font-bold">ขนาดบรรจุ</Label>
                     <Input type="text" value={requestDetails.requestMedicine.packingSize} disabled />
                </div>
                <div className="grid grid-cols-3 col-span-2 gap-2 items-center">
                    <div className="col-span-2">
                        <Label className="font-bold">เหตุผลการยืม</Label>
                        <Input type="text" value={requestDetails.requestTerm.returnConditions?.otherTypeSpecification || "ไม่ระบุ"} disabled />
                    </div>
                    <div className="col-span-1 grid ">
                        <Label className="font-bold">ภาพประกอบ</Label>
                        <div className="flex flex-row items-end gap-x-2">
                            {imgUrl &&
                                <Button asChild variant="outline" className="">
                                    <a href={imgUrl} download="file.jpg">
                                        <Download className="" /> ดาวน์โหลด
                                    </a>
                                </Button>
                            }
                            {
                                !imgUrl &&
                                <Input className="text-sm text-gray-500 italic" type="text" value={"ไม่มีภาพประกอบ"} disabled />
                            }
                            {imgUrl &&
                                <ImageHoverPreview previewUrl={imgUrl} />
                            }
                        </div>
                    </div>
                    <div className="grid col-span-3">
                        
                            <Label className="font-bold">ราคาต่อหน่วย</Label>
                            <div className="flex flex-row  gap-2 items-center">
                                <Input type="text" className="max-w-[50%]" value={requestDetails.requestMedicine.pricePerUnit?.toLocaleString("th-TH")} disabled />
                                <div className="font-extralight">
                                    รวม <span className="font-bold text text-gray-950"> {total?.toLocaleString("th-TH")} </span> บาท
                                </div>
                            </div>
                       

                    </div>
                   
                </div>
            </div>
        </div>
    );
}
