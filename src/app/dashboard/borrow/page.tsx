import { Button } from "@/components/ui/button"
import { MoveLeft, MoveRight, Plus } from 'lucide-react';

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

export default function BorrowDashboard() {
    return (
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
                                <button className="px-4 py-2 mx-2 bg-blue-500 text-white rounded hover:bg-blue-400">Borrow</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className="flex justify-between items-center mt-4">
                    <Button>
                        <MoveLeft />Previous
                    </Button>
                    <span className="text-gray-700">Page 1 of 10</span>
                    <Button>
                        Next<MoveRight />
                    </Button>
                </div>
            </div>
    )
}