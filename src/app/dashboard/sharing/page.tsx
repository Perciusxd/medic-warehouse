import { useMedicineSharing } from "@/hooks/useMedicineAPI";
import SharingContent from "./sharing_content"
import { useHospital } from "@/context/HospitalContext";

export default function SharingDashboard() {
    
    return (
        <SharingContent />
    )
}