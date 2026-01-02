'use client';

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Badge,
  Pagination,
} from '@heroui/react';
import { Search, Filter, ArrowUpDown, Download, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  onExport?: () => void;
  onImport?: () => void;
}

export default function DataTable<T = Record<string, unknown>>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  onExport,
  onImport,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          classNames={{
            base: 'w-64',
            input: 'text-white',
            inputWrapper: 'bg-gray-800 border-gray-700',
          }}
        />
        <div className="flex items-center gap-2">
          <Button
            startContent={<Filter className="w-4 h-4" />}
            variant="flat"
            className="bg-gray-800 text-gray-300"
          >
            Filter
          </Button>
          <Button
            startContent={<ArrowUpDown className="w-4 h-4" />}
            variant="flat"
            className="bg-gray-800 text-gray-300"
          >
            Sort
          </Button>
          {onExport && (
            <Button
              startContent={<Download className="w-4 h-4" />}
              variant="flat"
              className="bg-gray-800 text-gray-300"
              onClick={onExport}
            >
              Export/Import
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-800 overflow-hidden">
        <Table
          aria-label="Data table"
          classNames={{
            wrapper: 'bg-[#1a1a1a]',
            th: 'bg-gray-800 text-gray-300 font-semibold',
            td: 'text-gray-400',
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().flatMap((headerGroup) =>
              headerGroup.headers.map((header) => (
                <TableColumn key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableColumn>
              ))
            )}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            data.length
          )}{' '}
          of {data.length} entries
        </p>
        <Pagination
          total={table.getPageCount()}
          page={table.getState().pagination.pageIndex + 1}
          onChange={(page) => table.setPageIndex(page - 1)}
          classNames={{
            wrapper: 'gap-0',
            item: 'bg-gray-800 text-gray-300',
            cursor: 'bg-purple-500 text-white',
          }}
        />
      </div>
    </div>
  );
}

