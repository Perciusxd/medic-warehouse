import { useHospital } from "@/context/HospitalContext"

export default function ReturnDashboard() {
    const { loggedInHospital } = useHospital()
    return (
        <div>{loggedInHospital}</div>
    )
}