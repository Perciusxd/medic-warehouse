"use client";
import React from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Hospital, Pill, Package, XCircle, X } from "lucide-react";
import { toast } from "sonner";

interface CancelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedMed: any;
    title: string;
    cancelID: string;
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

export default function CancelDialog({
    open,
    onOpenChange,
    selectedMed,
    title,
    cancelID,
    description,
    confirmButtonText,
    successMessage,
    errorMessage,
    loading,
    onConfirm,
    getHospitalName = (med) => med?.displayHospitalName || med?.responseDetail?.respondingHospitalNameTH || med?.respondingHospitalNameTH || '',
    getMedicineName = (med) => med?.displayMedicineName || med?.sharingMedicine?.name || med?.offeredMedicine?.name || med?.returnMedicine?.returnMedicine?.name || '',
    getMedicineAmount = (med) => med?.displayMedicineAmount || med?.offeredMedicine?.responseAmount || med?.offeredMedicine?.offerAmount || med?.acceptedOffer?.responseAmount || '',
}: CancelDialogProps) {
    //console.log('selectedMed cancel dialog', selectedMed)
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const handleConfirm = async () => {
        setIsSubmitting(true);
        const cancelBody = {
            id: cancelID || selectedMed.id,
            status: 'cancelled',
            updatedAt: Date.now().toString()
        }
        //console.log('cancelBody', cancelBody)
        try {
            const response = await fetch("/api/updateTicketStatus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cancelBody),
            })
            if (!response.ok) throw new Error("Failed to cancel")
            await response.json()
            onOpenChange(false);
            toast.success(successMessage);
        } catch (error) {
            //console.log("Error canceling:", error)
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const hospitalName = getHospitalName(selectedMed);
    const medicineName = getMedicineName(selectedMed);
    const medicineAmount = getMedicineAmount(selectedMed);

    // Force a cancel/destructive theme to emphasize cancellation
    const theme = {
        headerBg: 'bg-red-50',
        headerText: 'text-red-800',
        icon: <XCircle className="h-6 w-6 text-red-600" />,
        confirmBg: 'bg-red-600 hover:bg-red-700',
        cardBg: 'bg-gradient-to-r from-red-50 to-orange-50',
        borderColor: 'border-red-200',
        cancelBtn: 'border-red-200 text-red-700 hover:bg-red-50'
    } as const;

    return (
        <AlertDialog
            open={open}
            onOpenChange={(isOpen) => {
                if (isOpen) onOpenChange(true);
            }}
        >
            <AlertDialogContent className="max-w-[500px]">
                <AlertDialogHeader className="space-y-4">
                    <div className={`${theme.headerBg} -m-6 mb-0 p-6 rounded-t-lg border-b ${theme.borderColor}`}>
                        <AlertDialogTitle className={`flex items-center gap-3 text-xl font-semibold ${theme.headerText}`}>
                            {theme.icon}
                            {title}
                        </AlertDialogTitle>
                    </div>

                    <div className="pt-4">
                        <AlertDialogDescription className="text-base text-gray-700 mb-4">
                            {description.replace('{hospitalName}', hospitalName)}
                        </AlertDialogDescription>

                        {/* Information Card */}
                        <Card className={`border-2 ${theme.borderColor} shadow-sm`}>
                            <CardContent className={`${theme.cardBg} p-4 space-y-4`}>
                                {/* Hospital Information */}
                                {hospitalName && (
                                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                                        <Hospital className="h-5 w-5 text-blue-600" />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-600">โรงพยาบาล:</span>
                                            <div className="font-semibold text-gray-900">{hospitalName}</div>
                                        </div>
                                    </div>
                                )}

                                <Separator className="bg-white/50" />

                                {/* Medicine Information */}
                                <div className="space-y-3">
                                    {medicineName && (
                                        <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                                            <Pill className="h-5 w-5 text-purple-600" />
                                            <div className="flex-1">
                                                <span className="text-sm font-medium text-gray-600">ชื่อยา:</span>
                                                <div className="font-semibold text-gray-900">{medicineName}</div>
                                            </div>
                                        </div>
                                    )}

                                    {medicineAmount && (
                                        <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                                            <Package className="h-5 w-5 text-green-600" />
                                            <div className="flex-1">
                                                <span className="text-sm font-medium text-gray-600">จำนวน:</span>
                                                <Badge variant="secondary" className="ml-2 bg-white/80 text-gray-900 font-semibold">
                                                    {medicineAmount}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Emphasized warning for cancellation */}
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-700 font-medium">
                                การดำเนินการนี้จะยกเลิกรายการที่เลือก และไม่สามารถย้อนกลับได้
                            </span>
                        </div>
                    </div>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-3 pt-6 border-t border-gray-200">
                    <AlertDialogCancel
                        onClick={() => onOpenChange(false)}
                        className={`min-w-[100px] flex items-center gap-2 ${theme.cancelBtn}`}
                        disabled={loading || isSubmitting}
                    >
                        <X className="h-4 w-4" />
                        กลับ
                    </AlertDialogCancel>

                    <AlertDialogAction asChild>
                        {loading || isSubmitting ? (
                            <Button
                                className={`min-w-[160px] flex items-center gap-2 ${theme.confirmBg}`}
                                disabled
                            >
                                <LoadingSpinner className="h-4 w-4" />
                                กำลังยกเลิก...
                            </Button>
                        ) : (
                            <Button
                                onClick={handleConfirm}
                                className={`min-w-[160px] flex items-center gap-2 ${theme.confirmBg}`}
                            >
                                <XCircle className="h-4 w-4" />
                                {confirmButtonText}
                            </Button>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}