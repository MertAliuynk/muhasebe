"use client"

import { useMemo, useState } from "react"
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTableFacetedFilter } from "./components/faceted-filter"
import { DataTablePagination } from "./components/pagination"
import { DataTableViewOptions } from "./components/view-option"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  noResultsMessage?: string
  onAddNewRow?: () => void
  pagination?: boolean
  viewOption?: boolean
  paginationPageSize?: boolean
  searchKey?: string
  selectOption?: (props: { selectedRows: TData[] }) => React.ReactNode
  className?: string
  isPassiveRow?: (row: TData) => boolean
  filterFields?: {
    id: string
    label: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
      count?: number
    }[]
  }[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination = false,
  viewOption = false,
  paginationPageSize = true,
  searchKey,
  className,
  selectOption,
  isPassiveRow,
  filterFields,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const { filterableColumns } = useMemo(() => {
    return {
      filterableColumns: filterFields?.filter((field) => field.options) ?? [],
    }
  }, [filterFields])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    ...(pagination && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
  })

  return (
    <div className={cn("bg-transparent", className)}>
      {(searchKey ?? viewOption) && (
        <div className="flex items-center justify-between pb-5">
          <div className="flex items-end gap-2">
            {searchKey && (
              <Input
                placeholder="Ara..."
                autoComplete="off"
                value={
                  (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="h-8 w-40 lg:w-64"
              />
            )}
            {filterableColumns.length > 0 &&
              filterableColumns.map(
                (column) =>
                  table.getColumn(column.id ? String(column.id) : "") && (
                    <DataTableFacetedFilter
                      key={String(column.id)}
                      column={table.getColumn(
                        column.id ? String(column.id) : ""
                      )}
                      title={column.label}
                      options={column.options ?? []}
                    />
                  )
              )}
          </div>
          <div className="flex gap-2">
            {selectOption?.({
              selectedRows: table
                .getSelectedRowModel()
                .rows.map((row) => row.original),
            })}
            {viewOption && (
              <div className="mb-2">
                <DataTableViewOptions table={table} />
              </div>
            )}
          </div>
        </div>
      )}
      <Table className="text-sm">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const isPassive = isPassiveRow
                ? isPassiveRow(row.original)
                : false
              const rowStyle = isPassive ? "text-gray-400 bg-gray-200/40" : ""

              return (
                <TableRow
                  key={row.id}
                  className={rowStyle}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Veri Bulunamadı
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pagination && (
        <DataTablePagination
          table={table}
          paginationPageSize={paginationPageSize}
        />
      )}
    </div>
  )
}
