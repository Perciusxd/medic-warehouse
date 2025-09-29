"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    ColumnDef,
    flexRender,
    SortingState,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
    globalFilter?: string
    setGlobalFilter?: (filter: string) => void
    loading?: boolean
}

export function DataTable<TData, TValue>({
    columns,
    data,
    globalFilter,
    setGlobalFilter,
    loading,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            }
        },
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
            globalFilter
        },
        getFilteredRowModel: getFilteredRowModel(),
        defaultColumn: {
            size: 200,
            minSize: 20,
            maxSize: 400,
        }
    })

    const pageIndex = table.getState().pagination.pageIndex
    const pageSize = table.getState().pagination.pageSize
    const totalRows = table.getFilteredRowModel().rows.length

    const startRow = pageIndex * pageSize + 1
    const endRow = Math.min(startRow + pageSize - 1, totalRows)


    return (
        <div>
            <div className="rounded-t-md border">
                <Table>
                    <TableHeader className="bg-muted">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead className="text-center" key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex items-center justify-center">
                                        <LoadingSpinner width="48" height="48" />
                                        <p className="mt-4 text-gray-500">กำลังโหลดข้อมูลยา...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell className="" key={cell.id} style={{ minWidth: cell.column.columnDef.size, maxWidth: cell.column.columnDef.size }}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    ไม่พบข้อมูล
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between space-x-2 py-2">
                <div className="text-sm text-muted-foreground px-2">
                    { totalRows === 0 ? "ไม่พบข้อมูล" : `กำลังแสดงแถวที่ ${startRow} ถึง ${endRow} จากทั้งหมด ${totalRows} แถว` }
                    {/* กำลังแสดงแถวที่ {startRow}–{endRow} จาก {totalRows} แถว */}
                </div>
                <div className="flex items-center space-x-2 mr-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeftIcon />ก่อนหน้า
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        ต่อไป<ChevronRightIcon />
                    </Button>
                </div>
            </div>
        </div>
    )
}
