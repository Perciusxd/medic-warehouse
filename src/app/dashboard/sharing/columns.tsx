import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Check, X ,SquareX ,SquareCheck,MoreHorizontal,Trash2} from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import StatusIndicator from "@/components/ui/status-indicator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
                    <div className="text-sm font-medium text-gray-600">{formattedDate}</div>
                    <div className="text-xs text-muted-foreground">{timeOnly}</div>
                </div>
            },
            enableGlobalFilter: false
        },
        {
            accessorKey: "sharingDetails.sharingMedicine.name",
            size: 180,
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
        {
            accessorKey: "status",
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">Status (Debug)</div>,
            size: 120,
            cell: ({ row }) => {
                const med = row.original
                const status = med.status
                return (
                    <div className="flex flex-col">
                        <StatusIndicator status={status} />
                        <div className="text-xs text-gray-600 mt-1">{status}</div>
                    </div>
                )
            },
            enableGlobalFilter: false
        },
        {
            accessorKey: "sharingDetails.postingHospitalNameTH",
            size: 180,
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จากโรงพยาบาล</div>,
            cell: ({ row }) => {
                const sharingDetails = row.original.sharingDetails
                console.log("sharingDetails", sharingDetails)
                const postingHospitalNameTH: string = sharingDetails.postingHospitalNameTH
                const postingHospitalNameEN: string = sharingDetails.postingHospitalNameEN
                return (
                    <div className="flex flex-row">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col ml-2">
                            <div className="text-md">{postingHospitalNameEN}</div>
                            
                         
                        </div>

                    </div>
                )
            },
            enableGlobalFilter: true
        },

        {
            accessorKey: "sharingDetails.quantity",
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ขนาด/หน่วย</div>,
            size: 120,
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
            size: 150,
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
                const expiryDate = isNaN(Number(sharingDetails.sharingMedicine.expiryDate)) ? "ยังไม่ระบุ" : format(new Date(Number(sharingDetails.sharingMedicine.expiryDate)), 'dd/MM/yyyy');
                return (
                    <div className="flex flex-col">
                        <div className="text-md">{expiryDate}</div>
                    </div>
                )
            }
        },
        {
            accessorKey: "sharingDetails.sharingReturnTerm.receiveConditions",
            header: () => 
                <div className="font-medium text-muted-foreground text-left cursor-default flex flex-row justify-center">เงื่อนไขการคืน</div>,
            size: 350,
            cell: ({ row }) => {
                const med = row.original.sharingDetails.sharingReturnTerm
                const receiveConditions = med.receiveConditions
              
                const exactType = receiveConditions.exactType
                
                const subType = receiveConditions.subType
               
                const supportType = receiveConditions.supportType
              
                const otherType = receiveConditions.otherType
               
                const noReturn = receiveConditions.noReturn
              
                
                let exactTypeDiv;
                if (exactType === true) {
                    exactTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck/>{exactType}รับคืนเฉพาะรายการนี้</div>;
                }
                else if (exactType === false) {
                    exactTypeDiv = <div className="flex text-red-600 items-center"> <SquareX/>{exactType}รับคืนเฉพาะรายการนี้</div>;
                }

                let subTypeDiv;
                 if (subType === true) {
                    subTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck/>รับคืนรายการอื่นได้</div>;
                }
                else if (subType === false) {
                    subTypeDiv = <div className="flex text-red-600 items-center"> <SquareX/>รับคืนรายการอื่นได้</div>;
                }

                let supportTypeDiv;
                if (supportType === true) {
                    supportTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck/>ขอสนับสนุน</div>;
                }
                else if (supportType === false) {
                    supportTypeDiv = <div className="flex text-red-600 items-center"> <SquareX/>ขอสนับสนุน</div>;
                }

                let otherTypeDiv;
                if (otherType === true) {
                    otherTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck/>รับคืนรายการทดแทน</div>;
                }
                else if (otherType === false) {
                    otherTypeDiv = <div className="flex text-red-600 items-center"> <SquareX/>รับคืนรายการทดแทน</div>;
                }

                let noReturnDiv;   
                if (noReturn === true) {
                    noReturnDiv = <div className="flex text-green-600 items-center"> <SquareCheck/>ไม่ต้องคืน</div>;
                }
                else if (noReturn === false) {
                    noReturnDiv = <div className="flex text-red-600 items-center"> <SquareX/>false</div>;
                }

                if (noReturn === true) {
                    return (
                        <div className="flex flex-row justify-center">
                        {noReturnDiv}
                        </div>
                    )
                    
                }else  {
                    return (
                    <div className="flex flex-col">
                        <div className="flex flex-row items-center gap-2">
                            <div className="basis-1/2 text-center">{exactTypeDiv}</div>
                            <div className="basis-1/2 text-center">{subTypeDiv}</div>
                        </div>
                         <div className="flex flex-row items-center gap-2">
                            <div className="basis-1/2 text-center">{supportTypeDiv}</div>
                            <div className="basis-1/2 text-center">{otherTypeDiv}</div>
                        </div>
                    </div>
                    )
                }

            },
             enableGlobalFilter: false
        },
        {
            id: "actions",
            size: 50,
            // header: () => <div className="font-medium text-muted-foreground text-left cursor-default">Actions</div>,
            cell: ({ row }) => {
                const med = row.original
                const isLoading = loadingRowId === med.id
                return (
                    <div className="flex flex-row justify-center items-center gap-2">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer hover:border-2">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" >
                            <DropdownMenuItem
                                onClick={() => handleApproveClick(med)}
                                 className="cursor-pointer"
                                >
                                
                                    {/* {isLoading
                                        ? <div className="flex flex-row items-center gap-2"><LoadingSpinner /><span className="text-gray-500">ส่งแล้ว</span></div>
                                        : <div className="flex flex-row items-center gap-2"><Check />ส่งแล้ว</div>
                                    } */}
                                    <Check className="text-green-700" />
                                    ยืนยัน
                                    </DropdownMenuItem>
                                {/* <DropdownMenuItem><Pencil />Edit</DropdownMenuItem> */}
                            <DropdownMenuItem className="cursor-pointer" 
                                 onClick={() => handleApproveClick(med)}>
                                    <Trash2 className="text-red-600" />ปฎิเสธ</DropdownMenuItem>
                           
                            <DropdownMenuSeparator />

                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                )
            },
            enableGlobalFilter: false
        }
    ]
}