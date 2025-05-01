"use client"
import { formatDate } from "@/lib/utils"
import { useState } from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function RequestDetails({ requestData, responseForm }) {
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
            batchNumber: requestData.requestMedicine.batchNumber,
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
        { label: "Request ID", value: requestDetails.id },
        { label: "Posting Hospital ID", value: requestDetails.postingHospitalId },
        { label: "Posting Hospital Name (EN)", value: requestDetails.postingHospitalNameEN },
        { label: "Posting Hospital Name (TH)", value: requestDetails.postingHospitalNameTH },
        { label: "Posting Hospital Address", value: requestDetails.postingHospitalAddress },
        { label: "Status", value: requestDetails.status },
        { label: "Created At", value: formatDate(requestDetails.createdAt) },
        { label: "Updated At", value: formatDate(requestDetails.updatedAt) },
        { label: "Urgent", value: requestDetails.urgent ? "Yes" : "No" }
    ])

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {details.map((detail, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <Label className="font-bold">{detail.label}:</Label>
                        <Input type="text" value={detail.value} disabled />
                    </div>
                ))}
            </div>
            <h3 className="font-bold">Request Medicine Details</h3>
            <div className="grid grid-cols-2 gap-4">
                {Object.entries(requestDetails.requestMedicine).map(([key, value], index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <Label className="font-bold">{key.replace(/([A-Z])/g, ' $1')}: </Label>
                        <Input type="text" value={value} disabled={responseForm} />
                        {/* <strong>{key.replace(/([A-Z])/g, ' $1')}: </strong>{value} */}
                    </div>
                ))}
            </div>
        </div>

    );
}
