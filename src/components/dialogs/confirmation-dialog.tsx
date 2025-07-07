"use client";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedMed: any;
    title: string;
    description: string;
    confirmButtonText: string;
    successMessage: string;
    errorMessage: string;
    loading: boolean;
    onConfirm: (med: any) => Promise<boolean>;
    getHospitalName?: (med: any) => string;
    getMedicineName?: (med: any) => string;
    getMedicineAmount?: (med: any) => string | number;
}

export default function ConfirmationDialog({
    open,
    onOpenChange,
    selectedMed,
    title,
    description,
    confirmButtonText,
    successMessage,
    errorMessage,
    loading,
    onConfirm,
    getHospitalName = (med) => med?.displayHospitalName || med?.responseDetails?.respondingHospitalNameTH || med?.respondingHospitalNameTH || '',
    getMedicineName = (med) => med?.displayMedicineName || med?.sharingMedicine?.name || '',
    getMedicineAmount = (med) => med?.displayMedicineAmount || med?.offeredMedicine?.responseAmount || med?.acceptedOffer?.responseAmount || '',
}: ConfirmationDialogProps) {
    const handleConfirm = async () => {
        const result = await onConfirm(selectedMed);
        if (result) {
            onOpenChange(false);
            toast.success(successMessage);
        } else {
            toast.error(errorMessage);
        }
    };

    const hospitalName = getHospitalName(selectedMed);
    const medicineName = getMedicineName(selectedMed);
    const medicineAmount = getMedicineAmount(selectedMed);

    return (
        <AlertDialog
            open={open}
            onOpenChange={(isOpen) => {
                if (isOpen) onOpenChange(true);
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description.replace('{hospitalName}', hospitalName)}
                        <div className="flex flex-col gap-2 mt-4">
                            <div className="flex flex-row items-center gap-2">
                                <span>ชื่อยา:</span>
                                <span>{medicineName}</span>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <span>จำนวน:</span>
                                <span>{medicineAmount}</span>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        {loading ? (
                            <Button className="flex flex-row items-center gap-2 text-muted-foreground" disabled>
                                <LoadingSpinner /> {confirmButtonText}
                            </Button>
                        ) : (
                            <Button onClick={handleConfirm}>
                                {confirmButtonText}
                            </Button>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 