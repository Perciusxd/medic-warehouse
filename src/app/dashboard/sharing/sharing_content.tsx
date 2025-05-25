import { useEffect, useState } from "react";

import { DataTable } from "../borrow/data-table"
import { columns } from "./columns"

import { useHospital } from "@/context/HospitalContext"
import { useMedicineSharing } from "@/hooks/useMedicineAPI";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import AcceptSharingDialog from "@/components/dialogs/accept-sharing-dialog";

export default function SharingContent() {
    const { loggedInHospital } = useHospital()
    const { medicineSharing, loading, error, fetchMedicineSharing } = useMedicineSharing(loggedInHospital);
    const [loadingRowId, setLoadingRowId] = useState(null);
    const [selectedMed, setSelectedMed] = useState(null);
    const [openAcceptSharingDialog, setOpenAcceptSharingDialog] = useState(false);
    
    const handleApproveClick = (med: any) => {
        setLoadingRowId(med.id);
        setSelectedMed(med);
        setOpenAcceptSharingDialog(true);
        console.log('selected sharing medicine', med)
    }

    return (
        <div className="bg-white shadow rounded">
            {loading ? (
                <div className="p-8 flex flex-col items-center justify-center">
                    <LoadingSpinner width="48" height="48" />
                    <p className="mt-4 text-gray-500">Loading medicines...</p>
                </div>
            ) :
                <div>
                    <DataTable columns={columns(handleApproveClick, loadingRowId)} data={medicineSharing} />
                    { selectedMed && (
                        <AcceptSharingDialog
                            sharingMed={selectedMed}
                            openDialog={openAcceptSharingDialog}
                            onOpenChange={(open: boolean) => {
                                setOpenAcceptSharingDialog(open);
                                if (!open) {
                                    setSelectedMed(null);
                                }
                            }}
                        />
                    )}
                </div>
            }
        </div>
    )
}