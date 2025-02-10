'use client'

import * as React from 'react'
import { useState } from 'react';
import {
    MantineReactTable,
    // createRow,
    useMantineReactTable,
    } from 'mantine-react-table';
import { data } from `./makeData`;

const basicTable  = (props) => {

    const columns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
            {
                accessorKey: 'firstName',
                header: 'First Name',
            },
            {
                accessorKey: 'lastName',
                header: 'Last Name',
            },
            {
                accessorKey: 'age',
                header: 'Age',
            },
            {
                accessorKey: 'address',
                header: 'Address',
            },
            {
                accessorKey: 'city',
                header: 'City',
            },
            {
                accessorKey: 'state',
                header: 'State',
            },
        ],
        [],
    );


    const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

    const table = useMantineReactTable({
    columns,
    data,
    getRowId: (row) => row.userId,
    mantineTableBodyRowProps: ({ row }) => ({
        //implement row selection click events manually
        onClick: () =>
        setRowSelection((prev) => ({
            ...prev,
            [row.id]: !prev[row.id],
        })),
        selected: rowSelection[row.id],
        sx: {
        cursor: 'pointer',
        },
    }),
    state: { rowSelection },
    });

    return <MantineReactTable table={table} />;
}

export default basicTable; 