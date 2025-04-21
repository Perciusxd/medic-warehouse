"use client"
import * as React from "react"
import { useState, useEffect } from 'react';

import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoveLeft, MoveRight, Plus, HandCoins, Ban, CalendarCheck2, X, Copy } from 'lucide-react';
import { PopoverClose } from "@radix-ui/react-popover";
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

function LoadingSpinner(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={props.width || "24"}
            height={props.height || "24"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-spin text-gray-500"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}

function OpenModal({ onSuccess }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            postingDate: new Date().toISOString().split('T')[0],
            postingHospital: "",
            medicineName: "",
            quantity: 0,
            unit: "",
            batchNumber: "",
            manufacturer: "",
            manufactureDate: "",
            expiryDate: "",
            currentLocation: "",
            status: "Pending"
        },
    })

    function onSubmit(values) {
        const transformedValues = {
            ...values,
            quantity: values.quantity.toString()
        };

        fetch("/api/createMed", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transformedValues)
        })
            .then((response) => {
                if (response.ok) {
                    setOpen(false);
                    form.reset();
                    onSuccess();
                    toast("Medicine added successfully");
                }
                return response.json();
            })
            .then((data) => {
                console.log(data);
            })
            .catch((error) => {
                console.error('Error:', error);
                toast.error("Failed to add medicine");
            });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="mb-2 cursor-pointer" variant="default"><Plus />Add New</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add New Medicine Borrowing</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new medicine borrowing request.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="postingDate">Posting Date</Label>
                            <Input
                                id="postingDate"
                                type="date"
                                {...form.register("postingDate")}
                            />
                            {form.formState.errors.postingDate && (
                                <p className="text-sm text-red-500">{form.formState.errors.postingDate.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postingHospital">Hospital</Label>
                            <Input
                                id="postingHospital"
                                placeholder="Enter hospital name"
                                {...form.register("postingHospital")}
                            />
                            {form.formState.errors.postingHospital && (
                                <p className="text-sm text-red-500">{form.formState.errors.postingHospital.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="medicineName">Medicine Name</Label>
                        <Input
                            id="medicineName"
                            placeholder="Enter medicine name"
                            {...form.register("medicineName")}
                        />
                        {form.formState.errors.medicineName && (
                            <p className="text-sm text-red-500">{form.formState.errors.medicineName.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="text"
                                placeholder="Enter quantity"
                                {...form.register("quantity", { valueAsNumber: true })}
                            />
                            {form.formState.errors.quantity && (
                                <p className="text-sm text-red-500">{form.formState.errors.quantity.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Input
                                id="unit"
                                placeholder="Enter unit"
                                {...form.register("unit")}
                            />
                            {form.formState.errors.unit && (
                                <p className="text-sm text-red-500">{form.formState.errors.unit.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="batchNumber">Batch Number</Label>
                        <Input
                            id="batchNumber"
                            placeholder="Enter batch number"
                            {...form.register("batchNumber")}
                        />
                        {form.formState.errors.batchNumber && (
                            <p className="text-sm text-red-500">{form.formState.errors.batchNumber.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="manufacturer">Manufacturer</Label>
                        <Input
                            id="manufacturer"
                            placeholder="Enter manufacturer"
                            {...form.register("manufacturer")}
                        />
                        {form.formState.errors.manufacturer && (
                            <p className="text-sm text-red-500">{form.formState.errors.manufacturer.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="manufactureDate">Manufacture Date</Label>
                            <Input
                                id="manufactureDate"
                                type="date"
                                {...form.register("manufactureDate")}
                            />
                            {form.formState.errors.manufactureDate && (
                                <p className="text-sm text-red-500">{form.formState.errors.manufactureDate.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                                id="expiryDate"
                                type="date"
                                {...form.register("expiryDate")}
                            />
                            {form.formState.errors.expiryDate && (
                                <p className="text-sm text-red-500">{form.formState.errors.expiryDate.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currentLocation">Current Location</Label>
                        <Input
                            id="currentLocation"
                            placeholder="Enter current location"
                            {...form.register("currentLocation")}
                        />
                        {form.formState.errors.currentLocation && (
                            <p className="text-sm text-red-500">{form.formState.errors.currentLocation.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Input
                            id="status"
                            placeholder="Enter status"
                            {...form.register("status")}
                        />
                        {form.formState.errors.status && (
                            <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="additionalFile">Additional Details</Label>
                        <Input id="additionalFile" type="file" />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditPopover(props) {
    const currentDate = new Date();
    const [requestQty, setRequestQty] = useState(props.quantity);
    const [loading, setLoading] = useState(false);

    const handleQtyChange = (e) => {
        const value = e.target.value;
        setRequestQty(value);
    }

    const handleSubmit = async (e) => {
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
                console.log("Response not ok:", response);
                toast.error("เกิดข้อผิดพลาดในการขอยืมยา");
            }
            props.fetchData();
        } catch (error) {
            console.error("Error:", error);
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

function DeleteConfirmationDialog({
    medicineName,
    medicineID,
    onConfirm,
    onCancel
}) {
    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete <span className="font-bold">{medicineName}</span>? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button variant="destructive" onClick={onConfirm}>Delete</Button>
            </DialogFooter>
        </DialogContent>
    );
}

export default function BorrowDashboard() {
    const [openPopoverIndex, setOpenPopoverIndex] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = () => {
        setIsLoading(true);
        fetch("api/queryAll")
            .then((response) => response.json())
            .then((data) => {
                setMedicines(data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setIsLoading(false);
            });
    };

    const handleDelete = (id, name) => {
        setSelectedMedicine({ id, name });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedMedicine) {
            const formattedId = selectedMedicine.id.toString();

            fetch(`/api/deleteMed`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    medicineID: formattedId,
                    medicineName: selectedMedicine.name
                })
            })
                .then(response => {
                    if (response.ok) {
                        fetchData();
                        toast("Medicine deleted successfully");
                    } else {
                        console.error('Failed to delete medicine');
                        toast.error("Failed to delete medicine");
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    toast.error("An error occurred while deleting medicine");
                })
                .finally(() => {
                    setDeleteDialogOpen(false);
                    setSelectedMedicine(null);
                });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "";

        try {
            // Try to handle various date formats
            if (isNaN(Number(dateString))) {
                return new Date(dateString).toLocaleDateString();
            } else {
                return new Date(Number(dateString)).toLocaleDateString();
            }
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString;
        }
    };

    return (
        <div>
            <OpenModal onSuccess={fetchData} />
            <div className="bg-white shadow rounded">
                {isLoading ? (
                    <div className="p-8 flex flex-col items-center justify-center">
                        <LoadingSpinner width="48" height="48" />
                        <p className="mt-4 text-gray-500">Loading medicines...</p>
                    </div>
                ) : medicines.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {medicines
                                .filter(data => data.Quantity && Number(data.Quantity) > 0)
                                .map((data, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {formatDate(data.PostingDate || data.ExpiryDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-3">
                                            {data.PostingHospital || data.CurrentLocation}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-3">
                                            {data.MedicineName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-3">
                                            {data.BatchNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {data.Quantity} {data.Unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {formatDate(data.ExpiryDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Popover
                                                open={openPopoverIndex === index}
                                                onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="mr-2 cursor-pointer">
                                                        <HandCoins />ขอยืม
                                                    </Button>
                                                </PopoverTrigger>
                                                <EditPopover
                                                    hospitalName={data.PostingHospital || data.CurrentLocation}
                                                    quantity={data.Quantity}
                                                    medicineID={data.ID}
                                                    fetchData={fetchData}
                                                    toast={toast}
                                                    onClose={() => setOpenPopoverIndex(null)}
                                                />
                                            </Popover>

                                            <Button
                                                variant="destructive"
                                                onClick={() => handleDelete(data.ID, data.MedicineName)}
                                                className="cursor-pointer"
                                            >
                                                <Ban />ลบ
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
                            onClick={fetchData}
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

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DeleteConfirmationDialog
                    medicineName={selectedMedicine?.name || ''}
                    medicineID={selectedMedicine?.id || ''}
                    onConfirm={confirmDelete}
                    onCancel={() => {
                        setDeleteDialogOpen(false);
                        setSelectedMedicine(null);
                    }}
                />
            </Dialog>
        </div>
    );
}