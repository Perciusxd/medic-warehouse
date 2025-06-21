"use client"
import { formatDate } from "@/lib/utils"
import { useState } from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function RequestDetails({ requestData, responseForm }: any) {
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
            imageRef: requestData.requestMedicine.imageRef
        },
        requestTerm: {
            expectedReturnDate: requestData.requestTerm.expectedReturnDate,
            receiveConditions: {
                exactType: requestData.requestTerm.receiveConditions.exactType,
                subsidiary: requestData.requestTerm.receiveConditions.subsidiary,
                other: requestData.requestTerm.receiveConditions.other,
                notes: requestData.requestTerm.receiveConditions.notes
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
            imageRef: ""
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


    const [details, setDetails] = useState([
        { label: "วันที่ขอยืม", value: formatDate(requestDetails.updatedAt) },
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
        // { label: "ผู้ผลิต", value: requestDetails.requestMedicine.manufacturer },
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
                    <Label className="font-bold">ราคาต่อหน่วย</Label>
                    <div className="flex flex-row gap-2 items-center">
                    <Input type="text" className="w-14" value={requestDetails.requestMedicine.pricePerUnit} disabled />
                        <div className="font-extralight">
                            รวม <span className="font-bold text-gray-950"> {(Number(requestDetails.requestMedicine.pricePerUnit) || 0) * (Number(requestDetails.requestMedicine.requestAmount) || 0)} </span> บาท
                        </div>
                    </div>
                </div>
                <div>
                    <Label className="font-bold">จำนวนที่ขอยืม</Label>
                    <Input type="text" value={requestDetails.requestMedicine.requestAmount} disabled />
                </div>
                <div>
                    <Label className="font-bold">วันที่คาดว่าจะคืน</Label>
                    <Input type="text" value={formatDate(requestDetails.requestTerm.expectedReturnDate)} disabled />
                </div>
            </div>
        </div>

    );
}
