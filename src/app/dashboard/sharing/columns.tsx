import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import type { SharingTicketRow } from "@/types/tableRows"
import { ArrowUpDown, Check, X, SquareX, SquareCheck, MoreHorizontal, Trash2, SquareMinus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import StatusIndicator from "@/components/ui/status-indicator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const columns = (
    handleApproveClick: (med: SharingTicketRow) => void,
    handleCancleClick: (med: SharingTicketRow) => void,
    loadingRowId: string | null = null
): ColumnDef<SharingTicketRow>[] => {
    return [
        {
            accessorKey: "sharingDetails.sharingMedicine.name",
            size: 200,
            header: ({ column }) => {
                return (
                    <div className="flex items-center text-muted-foreground">
                        รายการยา/ชื่อการค้า
                        {/* <Button
                            className="font-medium text-muted-foreground text-left cursor-pointer"
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >

                            <ArrowUpDown className="h-4 w-4" />
                        </Button> */}
                    </div>
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
            accessorKey: "sharingDetails.quantity",
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ขนาด/หน่วย</div>,
            size: 120,
            cell: ({ row }) => {
                const med = row.original
                console.log("medddd", med)
                const sharingDetails = med.sharingDetails
                return (
                    <div className="flex flex-col ">
                        <span className="font-medium">{sharingDetails.sharingMedicine.quantity}</span>
                        <span className="text-xs text-muted-foreground">{sharingDetails.sharingMedicine.unit}</span>
                        {/* <Button className="cursor-default" variant="link" onClick={() => alert("Edit quantity")}>
                        <Pencil className="h-4 w-4" />
                    </Button> */}
                    </div>
                )
            },
            enableSorting: true,
        },

        {
            accessorKey: "createAt",
            header: ({ column }) => <div className="font-medium text-muted-foreground text-left cursor-default items-center flex">
                วันที่แจ้ง
                <Button
                    className="font-medium text-muted-foreground text-left cursor-pointer"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >

                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </div>,
            size: 80,
            cell: ({ row }) => {
                const med = row.original
                const sharingDetails = med.sharingDetails
                const createdAt = sharingDetails.createdAt
                const date = Number(createdAt);
                const dateObj = new Date(date);
                const formattedDate = format(new Date(Number(date)), 'dd/MM/') + (new Date(Number(date)).getFullYear() + 543) // Format to dd/MM/yyyy in Thai Buddhist calendar
                const timeOnly = format(date, 'HH:mm:ss'); // format to time only
                return <div>
                    <div className="text-sm font-medium">{formattedDate}</div>
                    <div className="text-xs text-muted-foreground">{timeOnly}</div>
                </div>
            },
            enableGlobalFilter: false
        },
        {
            accessorKey: "sharingDetails.postingHospitalNameTH",
            size: 180,
            header: ({ column }) =>
                <div className="font-medium text-muted-foreground text-left cursor-default items-center flex">
                    แจ้งโดย

                    <Button
                        className="font-medium text-muted-foreground text-left cursor-pointer"
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >

                        <ArrowUpDown className="h-4 w-4" />
                    </Button>
                </div>,
            cell: ({ row }) => {
                const sharingDetails = row.original.sharingDetails
                const postingHospitalNameTH: string = sharingDetails.postingHospitalNameTH
                const postingHospitalNameEN: string = sharingDetails.postingHospitalNameEN
                const sharingReturnTerm = row.original.sharingDetails.sharingReturnTerm
                const returnType = sharingReturnTerm.returnType
                return (
                    <div className="flex flex-row">
                        <div className="flex flex-col">
                            <div className="text-md">{postingHospitalNameTH}</div>
                            <Badge variant="secondary" className="text-[10px] mt-1">
                                {
                                    returnType === "supportReturn" ? "สนับสนุน" :
                                        returnType === "normalReturn" ? "แบ่งปัน" :
                                            returnType === "all" ? "ทั้งสนับสนุนและแบ่งปันได้" :
                                                ""
                                }
                            </Badge>
                        </div>
                        <div>

                        </div>

                    </div>
                )
            },
            enableGlobalFilter: true
        },
        {
            accessorKey: "sharingDetails.amount",
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">จำนวน</div>,
            size: 120,
            cell: ({ row }) => {
                const med = row.original.sharingDetails
                const sharingAmount = med.sharingMedicine.sharingAmount
                const pricePerUnit = med.sharingMedicine.pricePerUnit
                const totalPrice = sharingAmount * pricePerUnit
                return (
                    <div className="flex flex-col ">
                        <div className="text-md">{sharingAmount}</div>
                        <div className="text-xs text-muted-foreground">รวม {totalPrice} บาท</div>
                    </div>
                )
            },
            enableGlobalFilter: false
        },
        {
            accessorKey: "sharingDetails.sharingMedicine.manufacturer",
            header: () => <div className="font-medium text-muted-foreground text-left cursor-default">ผู้ผลิต/ล็อต</div>,
            size: 120,
            cell: ({ row }) => {
                const med = row.original
                const sharingDetails = med.sharingDetails
                const manufacturer = sharingDetails.sharingMedicine.manufacturer
                const batchNumber = sharingDetails.sharingMedicine.batchNumber
                return (
                    <div className="flex flex-col">
                        <div className="text-md">{manufacturer}</div>
                        <div className="text-xs text-muted-foreground">{batchNumber}</div>
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
                console.log("sharingDetailsssss", sharingDetails)
                const expiryDate = format(new Date(Number(sharingDetails.sharingMedicine.expiryDate)), 'dd/MM/') + (new Date(Number(sharingDetails.sharingMedicine.expiryDate)).getFullYear() + 543) // Format to dd/MM/yyyy in Thai Buddhist calendar

                return (
                    <div className="flex flex-col">
                        <div className="text-md">{expiryDate}</div>
                    </div>
                )
            }
        },
        // {
        //     accessorKey: "sharingDetails.sharingReturnTerm.receiveConditions",
        //     header: () =>
        //         <div className="font-medium text-muted-foreground text-left cursor-default flex flex-row justify-center">เงื่อนไขการรับคืน</div>,
        //     size: 350,
        //     cell: ({ row }) => {
        //         const med = row.original.sharingDetails.sharingReturnTerm
        //         const receiveConditions = med.receiveConditions

        //         const exactType = receiveConditions.exactType

        //         const subType = receiveConditions.subType

        //         const supportType = receiveConditions.supportType

        //         const otherType = receiveConditions.otherType

        //         const noReturn = receiveConditions.noReturn


        //         let exactTypeDiv;
        //         if (exactType === true) {
        //             exactTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck />ยาจากผู้ผลิตรายนี้</div>;
        //         }
        //         else if (exactType === false) {
        //             exactTypeDiv = <div className="flex text-red-600 items-center"> <SquareX />ยาจากผู้ผลิตรายนี้</div>;
        //         }

        //         let subTypeDiv;
        //         if (subType === true) {
        //             subTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck />รับคืนรายการอื่นได้</div>;
        //         }
        //         else if (subType === false) {
        //             subTypeDiv = <div className="flex text-red-600 items-center"> <SquareX />รับคืนรายการอื่นได้</div>;
        //         }

        //         let supportTypeDiv;
        //         if (supportType === true) {
        //             supportTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck />ขอสนับสนุน</div>;
        //         }
        //         else if (supportType === false) {
        //             supportTypeDiv = <div className="flex text-red-600 items-center"> <SquareX />ขอสนับสนุน</div>;
        //         }

        //         let otherTypeDiv;
        //         if (otherType === true) {
        //             otherTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck />รับคืนรายการทดแทน</div>;
        //         }
        //         else if (otherType === false) {
        //             otherTypeDiv = <div className="flex text-red-600 items-center"> <SquareX />รับคืนรายการทดแทน</div>;
        //         }

        //         let noReturnDiv;
        //         if (noReturn === true) {
        //             noReturnDiv = <div className="flex text-green-600 items-center"> <SquareCheck />ไม่ต้องคืน</div>;
        //         }
        //         else if (noReturn === false) {
        //             noReturnDiv = <div className="flex text-red-600 items-center"> <SquareX />false</div>;
        //         }

        //         if (noReturn === true) {
        //             return (
        //                 <div className="flex flex-row justify-center ">
        //                     {noReturnDiv}
        //                 </div>
        //             )

        //         } else {
        //             return (
        //                 <div className="flex flex-col">
        //                     <div className="flex flex-row items-center">
        //                         <div className="basis-1/2 text-left">{exactTypeDiv}</div>
        //                         <div className="basis-1/2 text-left">{subTypeDiv}</div>
        //                     </div>
        //                     <div className="flex flex-row items-center">
        //                         <div className="basis-1/2 text-left">{supportTypeDiv}</div>
        //                         <div className="basis-1/2 text-left">{otherTypeDiv}</div>
        //                     </div>
        //                     <div className="flex flex-row items-center">
        //                         <div className="basis-1/2 text-left"><div className="flex items-center"><SquareCheck /> mockไว้ </div> </div>
        //                         <div className="basis-1/2 text-left"> <div className="flex items-center"> <SquareCheck /> mockไว้ </div></div>
        //                     </div>
        //                 </div>
        //             )
        //         }

        //     },
        //     enableGlobalFilter: false
        // },
        {
            accessorKey: "sharingDetails.sharingMedicine.sharingReturnTerm",
            size: 250,
            header: () =>
                <div className="font-medium text-muted-foreground text-left cursor-default flex  flex-col">
                    <div className="text-center" >เงื่อนไขการรับคืน</div>
                    <div className="flex gap-2">
                        <div>

                            <div className="w-[120px]">
                                ยาจากผู้ผลิตรายนี้
                            </div>

                            <div className="w-[120px]">
                                ยาจากผู้ผลิตรายอื่น
                            </div>


                        </div>

                        <div>
                            <div className="w-[180px]">
                                หักงบประมาณ Service plan
                            </div>

                            <div className="w-[180px]">
                                หักงบประมาณบำรุงโรงพยาบาล
                            </div>

                        </div>
                        <div className="w-[50px]">
                            ให้เปล่า
                        </div>

                    </div>
                </div>,
            cell: ({ row }) => {
                const med = row.original
                const sharingReturnTerm = row.original.sharingDetails.sharingReturnTerm
                console.log("sharingReturnTerm", sharingReturnTerm)
                const exactTypeCondition = sharingReturnTerm.returnConditions.exactTypeCondition
                const otherTypeCondition = sharingReturnTerm.returnConditions.otherTypeCondition 
                const otherTypeSpecification = sharingReturnTerm.returnConditions.exactTypeCondition ? sharingReturnTerm.returnConditions.exactTypeCondition : ""
                const budgetPlan = sharingReturnTerm.supportCondition.budgetPlan
                const servicePlan = sharingReturnTerm.supportCondition.servicePlan
                const freePlan = sharingReturnTerm.supportCondition.freePlan
                const returnType = sharingReturnTerm.returnType
                console.log("exactTypeCondition", exactTypeCondition)
                return (

                    <div className="flex gap-2">
                        <div>

                            <div className="w-[120px] flex justify-center">
                                {exactTypeCondition ? (
                                    <div className="flex text-green-600 items-center">
                                        <SquareCheck />
                                    </div>
                                ) : (
                                    <div className="flex text-red-600 items-center">
                                        <SquareX />
                                    </div>
                                )}
                            </div>

                            <div className="w-[120px] flex justify-center">
                                {otherTypeCondition ? <div className="flex text-green-600 items-center"> <SquareCheck />
                                    {/* {otherTypeSpecification} */}
                                </div> : <div className="flex text-red-600 items-center"> <SquareX /></div>}
                            </div>
                        </div>

                        <div>
                            <div className="w-[180px] flex justify-center">
                                {servicePlan ? <div className="flex text-green-600 items-center"> <SquareCheck />
                                    {/* {servicePlan} */}
                                </div> : <div className="flex text-red-600 items-center"> <SquareX />  </div>}
                            </div>

                            <div className="w-[180px] flex justify-center">
                                {budgetPlan ? <div className="flex text-green-600 items-center"> <SquareCheck />
                                    {/* : {budgetPlan} */}
                                </div> : <div className="flex text-red-600 items-center"> <SquareX /></div>}
                            </div>

                        </div>
                        <div className="w-[50px] flex justify-center">
                            {freePlan ? <div className="flex text-green-600 items-center"> <SquareCheck />
                                {/* : {freePlan}  */}
                            </div> : <div className="flex text-red-600 items-center"> <SquareX /></div>}
                        </div>

                    </div>
                    // <div className="font-medium text-muted-foreground text-left cursor-default flex  flex-col">

                    //         {/* <Badge variant="none_outline" className="text-xs text-gray-600 flex flex-col justify-start "> */ }
                    // {/* <Badge variant="secondary" className="text-[12px] mb-1">
                    //                 {
                    //                     returnType === "supportReturn" ? "สนับสนุน" :
                    //                         returnType === "normalReturn" ? "แบ่งปัน" :
                    //                             returnType === "all" ? "ทั้งสนับสนุนและแบ่งปันได้" :
                    //                                 ""
                    //                 }
                    //             </Badge> */}

                    // {/* 
                    //             {returnType === "supportReturn" && supportCondition && (
                    //                 <Badge variant="secondary" className="text-[10px] text-gray-600">
                    //                     {supportCondition === "servicePlan" ? "ตามแผนบริการ" : supportCondition === "budgetPlan" ? "ตามงบประมาณ" : "ให้ฟรี"}
                    //                 </Badge>
                    //             )}
                    //             {returnType === "normalReturn" && conditionLabel && (
                    //                 <Badge variant="secondary" className="text-[10px] text-gray-600">{conditionLabel}</Badge>
                    //             )} */}
                    // {/* </Badge> */ }
                    // </div>

                )
            },
        },
        {
            id: "actions",
            size: 50,
            // header: () => <div className="font-medium text-muted-foreground text-left cursor-default">Actions</div>,
            cell: ({ row }) => {
                const med = row.original
                const isLoading = loadingRowId === med.id
                return (
                    <div className="flex flex-row justify-center items-center">
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
                                        ? <div className="flex flex-row items-center"><LoadingSpinner /><span className="text-gray-500">ส่งแล้ว</span></div>
                                        : <div className="flex flex-row items-center"><Check />ส่งแล้ว</div>
                                    } */}
                                    <Check className="text-green-700" />
                                    ยืนยัน
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem><Pencil />Edit</DropdownMenuItem> */}
                                <DropdownMenuItem className="cursor-pointer"
                                    onClick={() => handleCancleClick(med)}>
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