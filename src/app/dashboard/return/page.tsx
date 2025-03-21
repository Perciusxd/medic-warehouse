const mockData = [
    {
        date: '2023-11-01',
        hospitalName: 'Central Hospital',
        medicineName: 'Metformin',
        medicineSize: '850mg',
        medicineType: 'Tablet',
        quantity: 80
    },
    {
        date: '2023-11-02',
        hospitalName: 'North Hospital',
        medicineName: 'Lisinopril',
        medicineSize: '10mg',
        medicineType: 'Tablet',
        quantity: 150
    },
    {
        date: '2023-11-03',
        hospitalName: 'East Hospital',
        medicineName: 'Atorvastatin',
        medicineSize: '20mg',
        medicineType: 'Tablet',
        quantity: 200
    },
    {
        date: '2023-11-04',
        hospitalName: 'West Hospital',
        medicineName: 'Omeprazole',
        medicineSize: '40mg',
        medicineType: 'Capsule',
        quantity: 250
    },
    {
        date: '2023-11-05',
        hospitalName: 'South Hospital',
        medicineName: 'Simvastatin',
        medicineSize: '20mg',
        medicineType: 'Tablet',
        quantity: 100
    }
];

export default function ReturnDashboard() {
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
                                <button className="px-4 py-2 mx-2 bg-blue-500 text-white rounded hover:bg-blue-400">Return</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className="flex justify-between items-center mt-4">
                    <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Previous</button>
                    <span className="text-gray-700">Page 1 of 10</span>
                    <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Next</button>
                </div>
            </div>
    )
}