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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Hospital, Pill, Package, AlertTriangle, CheckCircle2, X } from "lucide-react";
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

    console.log('confirmation dialog', selectedMed)

    const hospitalName = getHospitalName(selectedMed);
    const medicineName = getMedicineName(selectedMed);
    const medicineAmount = getMedicineAmount(selectedMed);

    // Determine dialog theme based on action type
    const isDestructive = confirmButtonText.includes('ลบ') || confirmButtonText.includes('ยกเลิก') || confirmButtonText.includes('ปฏิเสธ');
    const isSuccess = confirmButtonText.includes('ยืนยัน') || confirmButtonText.includes('อนุมัติ') || confirmButtonText.includes('ยอมรับ');

    const getThemeColors = () => {
        if (isDestructive) {
            return {
                headerBg: 'bg-red-50',
                headerText: 'text-red-800',
                icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
                confirmBg: 'bg-red-600 hover:bg-red-700',
                cardBg: 'bg-gradient-to-r from-red-50 to-orange-50',
                borderColor: 'border-red-200'
            };
        } else if (isSuccess) {
            return {
                headerBg: 'bg-green-50',
                headerText: 'text-green-800',
                icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
                confirmBg: 'bg-green-600 hover:bg-green-700',
                cardBg: 'bg-gradient-to-r from-green-50 to-emerald-50',
                borderColor: 'border-green-200'
            };
        } else {
            return {
                headerBg: 'bg-blue-50',
                headerText: 'text-blue-800',
                icon: <Package className="h-6 w-6 text-blue-600" />,
                confirmBg: 'bg-blue-600 hover:bg-blue-700',
                cardBg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
                borderColor: 'border-blue-200'
            };
        }
    };

    const theme = getThemeColors();

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

                        {/* Enhanced Information Card */}
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

                        {/* Warning message for destructive actions */}
                        {isDestructive && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="text-sm text-red-700 font-medium">
                                    การดำเนินการนี้ไม่สามารถยกเลิกได้
                                </span>
                            </div>
                        )}
                    </div>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-3 pt-6 border-t border-gray-200">
                    <AlertDialogCancel 
                        onClick={() => onOpenChange(false)}
                        className="min-w-[100px] flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        ยกเลิก
                    </AlertDialogCancel>
                    
                    <AlertDialogAction asChild>
                        {loading ? (
                            <Button 
                                className={`min-w-[140px] flex items-center gap-2 ${theme.confirmBg}`} 
                                disabled
                            >
                                <LoadingSpinner className="h-4 w-4" />
                                กำลังดำเนินการ...
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleConfirm}
                                className={`min-w-[140px] flex items-center gap-2 ${theme.confirmBg}`}
                            >
                                {isSuccess && <CheckCircle2 className="h-4 w-4" />}
                                {isDestructive && <AlertTriangle className="h-4 w-4" />}
                                {!isSuccess && !isDestructive && <Package className="h-4 w-4" />}
                                {confirmButtonText}
                            </Button>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 