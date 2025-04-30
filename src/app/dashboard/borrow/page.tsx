"use client"
import * as React from "react"
import { useState, useEffect } from 'react';

import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateResponse } from "@/components/dialogs/create-response-dialog"
import { EditPopover } from "@/components/dialogs/edit-dialog"
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox"
import { MoveLeft, MoveRight, Plus, HandCoins, Ban, CalendarCheck2, X, Copy } from 'lucide-react';
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
import { useMedicineRequests } from "@/hooks/useMedicineAPI";
import { RequestAsset } from "@/types/requestMed";

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

// function OpenModal({ onSuccess }) {
//     const [open, setOpen] = useState(false);
//     const form = useForm({
//         resolver: zodResolver(formSchema),
//         defaultValues: {
//             postingDate: new Date().toISOString().split('T')[0],
//             postingHospital: "",
//             medicineName: "",
//             quantity: 0,
//             unit: "",
//             batchNumber: "",
//             manufacturer: "",
//             manufactureDate: "",
//             expiryDate: "",
//             currentLocation: "",
//             status: "Pending"
//         },
//     })

//     function onSubmit(values) {
//         const transformedValues = {
//             ...values,
//             quantity: values.quantity.toString()
//         };

//         fetch("/api/createMed", {
//             method: "POST",
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(transformedValues)
//         })
//             .then((response) => {
//                 if (response.ok) {
//                     setOpen(false);
//                     form.reset();
//                     onSuccess();
//                     toast("Medicine added successfully");
//                 }
//                 return response.json();
//             })
//             .then((data) => {
//                 console.log(data);
//             })
//             .catch((error) => {
//                 console.error('Error:', error);
//                 toast.error("Failed to add medicine");
//             });
//     }

//     return (
//         <Dialog open={open} onOpenChange={setOpen}>
//             <DialogTrigger asChild>
//                 <Button className="mb-2 cursor-pointer" variant="default"><Plus />Add New</Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[600px]">
//                 <DialogHeader>
//                     <DialogTitle>Add New Medicine Borrowing</DialogTitle>
//                     <DialogDescription>
//                         Fill in the details for the new medicine borrowing request.
//                     </DialogDescription>
//                 </DialogHeader>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="postingDate">Posting Date</Label>
//                             <Input
//                                 id="postingDate"
//                                 type="date"
//                                 {...form.register("postingDate")}
//                             />
//                             {form.formState.errors.postingDate && (
//                                 <p className="text-sm text-red-500">{form.formState.errors.postingDate.message}</p>
//                             )}
//                         </div>
//                         <div className="space-y-2">
//                             <Label htmlFor="postingHospital">Hospital</Label>
//                             <Input
//                                 id="postingHospital"
//                                 placeholder="Enter hospital name"
//                                 {...form.register("postingHospital")}
//                             />
//                             {form.formState.errors.postingHospital && (
//                                 <p className="text-sm text-red-500">{form.formState.errors.postingHospital.message}</p>
//                             )}
//                         </div>
//                     </div>

//                     <div className="space-y-2">
//                         <Label htmlFor="medicineName">Medicine Name</Label>
//                         <Input
//                             id="medicineName"
//                             placeholder="Enter medicine name"
//                             {...form.register("medicineName")}
//                         />
//                         {form.formState.errors.medicineName && (
//                             <p className="text-sm text-red-500">{form.formState.errors.medicineName.message}</p>
//                         )}
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="quantity">Quantity</Label>
//                             <Input
//                                 id="quantity"
//                                 type="text"
//                                 placeholder="Enter quantity"
//                                 {...form.register("quantity", { valueAsNumber: true })}
//                             />
//                             {form.formState.errors.quantity && (
//                                 <p className="text-sm text-red-500">{form.formState.errors.quantity.message}</p>
//                             )}
//                         </div>
//                         <div className="space-y-2">
//                             <Label htmlFor="unit">Unit</Label>
//                             <Input
//                                 id="unit"
//                                 placeholder="Enter unit"
//                                 {...form.register("unit")}
//                             />
//                             {form.formState.errors.unit && (
//                                 <p className="text-sm text-red-500">{form.formState.errors.unit.message}</p>
//                             )}
//                         </div>
//                     </div>

//                     <div className="space-y-2">
//                         <Label htmlFor="batchNumber">Batch Number</Label>
//                         <Input
//                             id="batchNumber"
//                             placeholder="Enter batch number"
//                             {...form.register("batchNumber")}
//                         />
//                         {form.formState.errors.batchNumber && (
//                             <p className="text-sm text-red-500">{form.formState.errors.batchNumber.message}</p>
//                         )}
//                     </div>

//                     <div className="space-y-2">
//                         <Label htmlFor="manufacturer">Manufacturer</Label>
//                         <Input
//                             id="manufacturer"
//                             placeholder="Enter manufacturer"
//                             {...form.register("manufacturer")}
//                         />
//                         {form.formState.errors.manufacturer && (
//                             <p className="text-sm text-red-500">{form.formState.errors.manufacturer.message}</p>
//                         )}
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="manufactureDate">Manufacture Date</Label>
//                             <Input
//                                 id="manufactureDate"
//                                 type="date"
//                                 {...form.register("manufactureDate")}
//                             />
//                             {form.formState.errors.manufactureDate && (
//                                 <p className="text-sm text-red-500">{form.formState.errors.manufactureDate.message}</p>
//                             )}
//                         </div>
//                         <div className="space-y-2">
//                             <Label htmlFor="expiryDate">Expiry Date</Label>
//                             <Input
//                                 id="expiryDate"
//                                 type="date"
//                                 {...form.register("expiryDate")}
//                             />
//                             {form.formState.errors.expiryDate && (
//                                 <p className="text-sm text-red-500">{form.formState.errors.expiryDate.message}</p>
//                             )}
//                         </div>
//                     </div>

//                     <div className="space-y-2">
//                         <Label htmlFor="currentLocation">Current Location</Label>
//                         <Input
//                             id="currentLocation"
//                             placeholder="Enter current location"
//                             {...form.register("currentLocation")}
//                         />
//                         {form.formState.errors.currentLocation && (
//                             <p className="text-sm text-red-500">{form.formState.errors.currentLocation.message}</p>
//                         )}
//                     </div>

//                     <div className="space-y-2">
//                         <Label htmlFor="status">Status</Label>
//                         <Input
//                             id="status"
//                             placeholder="Enter status"
//                             {...form.register("status")}
//                         />
//                         {form.formState.errors.status && (
//                             <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
//                         )}
//                     </div>

//                     <div className="space-y-2">
//                         <Label htmlFor="additionalFile">Additional Details</Label>
//                         <Input id="additionalFile" type="file" />
//                     </div>

//                     <DialogFooter>
//                         <Button type="submit">Save</Button>
//                     </DialogFooter>
//                 </form>
//             </DialogContent>
//         </Dialog>
//     );
// }

export default function BorrowDashboard(loggedInHospital: string) {
    const { medicineRequests, loading, error, fetchMedicineRequests } = useMedicineRequests(loggedInHospital.loggedInHospital);
    const [openPopoverIndex, setOpenPopoverIndex] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    // const [isLoading, setIsLoading] = useState(true);

    return (
        <div>
            {/* <OpenModal onSuccess={fetchData} /> */}
            <div className="bg-white shadow rounded">
                {loading ? (
                    <div className="p-8 flex flex-col items-center justify-center">
                        <LoadingSpinner width="48" height="48" />
                        <p className="mt-4 text-gray-500">Loading medicines...</p>
                    </div>
                ) : medicineRequests.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รูปแบบ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {medicineRequests
                                // .filter(data => data.requestId && data.requestId.startsWith("REQ-") && data.postingHospitalNameEN === loggedInHospital)
                                .map((data: RequestAsset, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {data.updatedAt}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-3">
                                            {data.postingHospitalNameEN}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-3">
                                            {data.requestMedicine?.trademark}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {data.requestMedicine?.unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {data.requestMedicine?.trademark}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-3">
                                            {data.requestMedicine?.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-3">
                                            {data.urgent ? (
                                                <span className="text-red-500 font-bold">ด่วนที่สุด</span>
                                            ) : (<span className="text-green-500 font-bold">ธรรมดา</span>)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {/* <Popover
                                                open={openPopoverIndex === index}
                                                onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="mr-2 cursor-pointer">
                                                        <HandCoins />ให้ยืม
                                                    </Button>
                                                </PopoverTrigger>
                                                <EditPopover
                                                    hospitalName={data.asset.postingHospitalNameEN}
                                                    quantity={data.asset.requestMedicine.quantity}
                                                    medicineID={data.ID}
                                                    fetchData={fetchData}
                                                    toast={toast}
                                                    onClose={() => setOpenPopoverIndex(null)}
                                                />
                                            </Popover> */}
                                            {/* <CreateResponse requestData={data} onSuccess={fetchData} /> */}

                                            <Button
                                                variant="destructive"
                                                onClick={() => handleDelete(data.id, data.requestMedicine?.name)}
                                                className="cursor-pointer"
                                            >
                                                <Ban />ปฏิเสธ
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">No medicines found</p>
                        <Button
                            className="mt-4"
                            // onClick={fetchData}
                        >
                            Refresh
                        </Button>
                    </div>
                )}

                <div className="flex justify-between items-center p-4">
                    <Button variant="outline" className="cursor-pointer">
                        <MoveLeft />Previous
                    </Button>
                    <span className="text-gray-700">Page 1 of 10</span>
                    <Button variant="outline" className="cursor-pointer">
                        Next<MoveRight />
                    </Button>
                </div>
            </div>

            {/* <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DeleteConfirmationDialog
                    medicineName={selectedMedicine?.name || ''}
                    medicineID={selectedMedicine?.id || ''}
                    onConfirm={confirmDelete}
                    onCancel={() => {
                        setDeleteDialogOpen(false);
                        setSelectedMedicine(null);
                    }}
                />
            </Dialog> */}
        </div>
    );
}