import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Check, X } from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import StatusIndicator from "@/components/ui/status-indicator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export const columns = (
    handleApproveClick: (med: any) => void,
    loadingRowId: string | null = null
): ColumnDef<any>[] => {
    return [
        {
            accessorKey: "createAt",
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ประกาศเมื่อ</div>,
            size: 100,
            cell: ({ row }) => {
                const med = row.original
                const sharingDetails = med.sharingDetails
                const createdAt = sharingDetails.createdAt
                const date = Number(createdAt); // convert string to number, then to Date
                const formattedDate = format(date, 'dd/MM/yyyy'); // format to date only
                const timeOnly = format(date, 'HH:mm:ss'); // format to time only
                return <div>
                    <div className="text-sm font-medium text-gray-600">{createdAt}</div>
                    <div className="text-xs text-muted-foreground">{timeOnly}</div>
                </div>
            },
            enableGlobalFilter: false
        },
        {
            accessorKey: "sharingDetails.sharingMedicine.name",
            header: ({ column }) => {
                return (
                    <Button
                        className="font-medium text-muted-foreground text-left cursor-pointer"
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const med = row.original
                const sharingDetails = med.sharingDetails
                const name = sharingDetails.sharingMedicine.name
                const trademark = sharingDetails.sharingMedicine.trademark
                return (
                    <div className="flex flex-col">
                        <div className="text-md">{name}</div>
                        <div className="text-xs text-gray-600">{trademark}</div>
                    </div>
                )
            },
            enableGlobalFilter: true
        },
        // {
        //     accessorKey: "status",
        //     header: () => <div className="font-medium text-muted-foreground text-left cursor-default">Status</div>,
        //     enableGlobalFilter: false
        // },
        {
            accessorKey: "sharingDetails.postingHospitalNameTH",
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จากโรงพยาบาล</div>,
            cell: ({ row }) => {
                const sharingDetails = row.original.sharingDetails
                const postingHospitalNameTH: string = sharingDetails.postingHospitalNameTH
                const postingHospitalNameEN: string = sharingDetails.postingHospitalNameEN
                return (
                    <div className="flex flex-row">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col ml-2">
                            <div className="text-md">{postingHospitalNameTH}</div>
                            <div className="text-xs text-gray-600">คุณ xxx xxx</div>
                            <div className="text-xs text-gray-600">ติดต่อ 080xxxxx</div>
                        </div>

                    </div>
                )
            },
            enableGlobalFilter: true
        },

        {
            accessorKey: "sharingDetails.quantity",
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ปริมาณ</div>,
            size: 100,
            cell: ({ row }) => {
                const med = row.original
                const sharingDetails = med.sharingDetails
                return (
                    <div className="flex flex-col space-x-2">
                        <span>{sharingDetails.quantity} {sharingDetails.sharingMedicine.unit}</span>
                        <span className="text-xs text-gray-600">{sharingDetails.sharingMedicine.quantity}</span>

                        {/* <Button className="cursor-default" variant="link" onClick={() => alert("Edit quantity")}>
                        <Pencil className="h-4 w-4" />
                    </Button> */}
                    </div>
                )
            },
            enableSorting: true,
        },
        {
            accessorKey: "sharingDetails.sharingMedicine.manufacturer",
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ผู้ผลิต</div>,
            size: 100,
            cell: ({ row }) => {
                const med = row.original
                const sharingDetails = med.sharingDetails
                const manufacturer = sharingDetails.sharingMedicine.manufacturer
                return (
                    <div className="flex flex-col">
                        <div className="text-md">{manufacturer}</div>
                    </div>
                )
            }
        },
        {
            accessorKey: "sharingDetails.sharingMedicine.expiryDate",
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">วันหมดอายุ</div>,
            size: 100,
            cell: ({ row }) => {
                const med = row.original
                const sharingDetails = med.sharingDetails
                const expiryDate = sharingDetails.sharingMedicine.expiryDate
                return (
                    <div className="flex flex-col">
                        <div className="text-md">{expiryDate}</div>
                    </div>
                )
            }
        },
        {
            id: "actions",
            size: 100,
            // header: () => <div className="font-medium text-muted-foreground text-left cursor-default">Actions</div>,
            cell: ({ row }) => {
                const med = row.original
                const isLoading = loadingRowId === med.id
                return (
                    <div className="space-x-2">
                        <Button
                            variant={'outline'}
                            onClick={() => handleApproveClick(med)}
                        >
                            {/* {isLoading
                                ? <div className="flex flex-row items-center gap-2"><LoadingSpinner /><span className="text-gray-500">ส่งแล้ว</span></div>
                                : <div className="flex flex-row items-center gap-2"><Check />ส่งแล้ว</div>
                            } */}
                            <div className="flex flex-row items-center gap-2"><Check />เลือก</div>
                        </Button>
                        <Button
                            variant={'destructive'}
                        // onClick={() => handleApproveClick(med)}
                        ><X /></Button>
                    </div>
                )
            },
            enableGlobalFilter: false
        }
    ]
}