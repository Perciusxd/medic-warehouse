import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";

export default function StatusDashboard() {
    const [medicines, setMedicines] = useState<Array<{ ID: string; Name: string; MedicineName: string; PostingDate: string; PostingHospital: string; Quantity: string; ExpiryDate: string; Unit: string; Temperature?: string; Manufacturer?: string; }>>([]);
    
    useEffect(() => {
            fetch("api/queryAll")
                .then((response) => response.json())
                .then((data) => {
                    // setMedicines only when data.PostingHospital is equal to Hospital A
                    const filteredMedicines = data.filter(medicine => medicine.PostingHospital != "Hospital A");
                    setMedicines(filteredMedicines);
                })
                .catch((error) => console.error("Error fetching data:", error));
        }, []);
    return (
        <div>
            {medicines.length > 0 ? (
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
                        {
                            medicines
                                .filter((data) => Number(data.Quantity) > 0)
                                .map((data, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(Number(data.ExpiryDate)).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{data.PostingHospital}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{data.MedicineName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{data.Quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{data.Unit}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{data.Manufacturer}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {/* <Popover
                                                open={openPopoverIndex === index}
                                                onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="mr-2 cursor-pointer">
                                                        ขอยืม
                                                    </Button>
                                                </PopoverTrigger>
                                                <EditPopover
                                                    hospitalName={data.PostingHospital}
                                                    quantity={data.Quantity}
                                                    medicineID={data.ID}
                                                    fetchData={fetchData}
                                                    toast={toast}
                                                    onClose={(e: any) => {
                                                        setOpenPopoverIndex(null);
                                                    }}
                                                    onConfirm={(e: any) => {
                                                        setOpenPopoverIndex(null);
                                                    }}
                                                />
                                            </Popover> */}

                                            <Button variant="destructive" className="cursor-pointer">
                                                ลบ
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                        }
                    </tbody>
                </table>
            ) : (
                <div>No data</div>
            )}
        </div>
    )
}