import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoveLeft, MoveRight, Plus, HandCoins, Ban, CalendarCheck2, X } from 'lucide-react';

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
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Button className="bg-green-800"><CalendarCheck2 />ยืนยัน</Button>
                        <Button variant={"destructive"}><X />ยกเลิก</Button>
                    </div>
                </div>
            </div>
        </PopoverContent>
    );
}

export default function BorrowDashboard() {
    return (
        <div>
            <Button className="mb-2 cursor-pointer" variant="default"><Plus />Add New</Button>
            <div className="bg-white p-4 shadow rounded">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mockData.map((data, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap">{data.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{data.hospitalName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{data.medicineName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{data.medicineSize}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{data.medicineType}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{data.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="mr-2 cursor-pointer">
                                                <HandCoins></HandCoins>
                                            </Button>
                                        </PopoverTrigger>
                                        <EditPopover />
                                    </Popover>
                                    
                                    <Button variant="destructive">
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
        </div>
    )
}