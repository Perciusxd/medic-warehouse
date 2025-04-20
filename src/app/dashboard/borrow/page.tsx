"use client"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoveLeft, MoveRight, Plus, HandCoins, Ban, CalendarCheck2, X, Copy } from 'lucide-react';
import { use, useEffect, useState } from "react";
import { PopoverClose } from "@radix-ui/react-popover";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogHeader, DialogFooter, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, useForm } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";

const mockData = [
    {
        date: '2023-10-01',
        hospitalName: 'City Hospital',
        medicineName: 'Aspirin',
        medicineSize: '500mg',
        medicineType: 'Tablet',
        quantity: 100
    },
    {
        date: '2023-10-02',
        hospitalName: 'County Hospital',
        medicineName: 'Ibuprofen',
        medicineSize: '200mg',
        medicineType: 'Capsule',
        quantity: 200
    },
    {
        date: '2023-10-03',
        hospitalName: 'General Hospital',
        medicineName: 'Paracetamol',
        medicineSize: '650mg',
        medicineType: 'Tablet',
        quantity: 150
    },
    {
        date: '2023-10-04',
        hospitalName: 'Community Hospital',
        medicineName: 'Amoxicillin',
        medicineSize: '250mg',
        medicineType: 'Capsule',
        quantity: 300
    },
    {
        date: '2023-10-05',
        hospitalName: 'Regional Hospital',
        medicineName: 'Ciprofloxacin',
        medicineSize: '500mg',
        medicineType: 'Tablet',
        quantity: 120
    }
];

    // postingDate: date,
    // postingHospital: string,
    // medicineName: string,
    // quantity: number,
    // unit: number,
    // batchNumber: string,
    // manufacturer: string,
    // manufactureDate: date,
    // expiryDate: date,
    // currentLocation: string,
    // status: string

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

function OpenModal({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
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
    
    function onSubmit(values: z.infer<typeof formSchema>) {
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
            }
            return response.json();
        })
        .then((data) => {
            console.log(data)
        })
        .catch((error) => {
            console.error('Error:', error);
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

                    <DialogFooter>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditPopover() {
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
                            defaultValue="2023-10-01"
                            className="col-span-2 h-8"
                            disabled
                        />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="font-light">โรงพยาบาลที่ขอยืม</Label>
                        <Input
                            id="maxWidth"
                            defaultValue="Songkhla Hospital"
                            className="c</div>ol-span-2 h-8"
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
                                defaultValue="100"
                                className="col-span-2 h-8"
                                disabled
                            />
                        </div>
                        <div>
                            <Label className="font-light">จำนวนที่ขอยืม</Label>
                            <Input
                                id="maxWidth"
                                defaultValue="80"
                                className="col-span-2 h-8"
                            />
                        </div>
                    </div>
                    <PopoverClose>
                        <div className="grid grid-cols-4 items-center gap-4">
                                <Button className="bg-green-800 cursor-pointer"><CalendarCheck2 />ยืนยัน</Button>
                                <Button variant={"destructive"} className="cursor-pointer"><X />ยกเลิก</Button>
                        </div>
                    </PopoverClose>

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
}: { 
    medicineName: string; 
    medicineID: string;
    onConfirm: () => void; 
    onCancel: () => void;
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
    const [queryAll, setQueryAll] = useState<Array<{ BatchNumber: string;
        CurrentLocation: string;
        ExpiryDate: string;
        ID: string;
        ManufactureDate: string;
        Manufacturer: string;
        MedicineName: string;
        Price: number;
        Temperature: string;
    }>>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState<{ id: string; name: string } | null>(null);

    const fetchData = () => {
        fetch("api/queryAll")
            .then((response) => response.json())
            .then((data) => {setQueryAll(data)})
            .catch((error) => console.error("Error fetching data:", error));
    };

    const handleDelete = (id: string, name: string) => {
        setSelectedMedicine({ id, name });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedMedicine) {
            // Ensure ID is a string and properly formatted
            const formattedId = selectedMedicine.id.toString();
            
            fetch(`/api/deleteMed`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    medicineID: formattedId,
                    medicineName: selectedMedicine.name // Include medicine name for logging
                })
            })
            .then(response => {
                if (response.ok) {
                    fetchData();
                } else {
                    console.error('Failed to delete medicine');
                }
            })
            .catch(error => {
                console.error('Error:', error);
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

    return (
        <div>
            <OpenModal onSuccess={fetchData} />
            <div className="bg-white p-4 shadow rounded">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BatchNumber</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CurrentLocation</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ExpiryDate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ManufactureDate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {queryAll.map((data, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">{new Date(Date.now()).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-3">{data.BatchNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-3">{data.CurrentLocation}</td>
                                <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">{data.ExpiryDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-3">{data.MedicineName}</td>
                                <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-3">{data.ManufactureDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-3">{data.Manufacturer}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="mr-2 cursor-pointer">
                                                <HandCoins></HandCoins>
                                            </Button>
                                        </PopoverTrigger>
                                        <EditPopover />
                                    </Popover>
                                    
                                    <Button variant="destructive" onClick={() => handleDelete(data.ID, data.MedicineName)}>
                                        <Ban></Ban>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-between items-center mt-4">
                    <Button variant={"outline"} className="cursor-pointer">
                        <MoveLeft />Previous
                    </Button>
                    <span className="text-gray-700">Page 1 of 10</span>
                    <Button variant={"outline"} className="cursor-pointer">
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
    )
}