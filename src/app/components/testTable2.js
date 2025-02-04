'use client'
import * as React from 'react'
import { useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { nanoid } from 'nanoid';
import { TextInput, Button, Group, Select, Pagination } from '@mantine/core';

const initialData = [
    {   id: nanoid(),
        name: 'Athena Weissnat',
        company: 'Little - Rippin',
        email: 'Elouise.Prohaska@yahoo.com',
    },
    {   id: nanoid(),
        name: 'Deangelo Runolfsson',
        company: 'Greenfelder - Krajcik',
        email: 'Kadin_Trantow87@yahoo.com',
    },
    {   id: nanoid(),
        name: 'Danny Carter',
        company: 'Kohler and Sons',
        email: 'Marina3@hotmail.com',
    },
    {   id: nanoid(),
        name: 'Trace Tremblay PhD',
        company: 'Crona, Aufderhar and Senger',
        email: 'Antonina.Pouros@yahoo.com',
    },
    {   id: nanoid(),
        name: 'Derek Dibbert',
        company: 'Gottlieb LLC',
        email: 'Abagail29@hotmail.com',
    },
    {   id: nanoid(),
        name: 'Viola Bernhard',
        company: 'Funk, Rohan and Kreiger',
        email: 'Jamie23@hotmail.com',
    },
    {   id: nanoid(),
        name: 'Austin Jacobi',
        company: 'Botsford - Corwin',
        email: 'Genesis42@yahoo.com',
    },
    {   id: nanoid(),
        name: 'Hershel Mosciski',
        company: 'Okuneva, Farrell and Kilback',
        email: 'Idella.Stehr28@yahoo.com',
    },
    {   id: nanoid(),
        name: 'Mylene Ebert',
        company: 'Kirlin and Sons',
        email: 'Hildegard17@hotmail.com',
    },
    {   id: nanoid(),
        name: 'Lou Trantow',
        company: 'Parisian - Lemke',
        email: 'Hillard.Barrows1@hotmail.com',
    },
    {   id: nanoid(),
        name: 'Dariana Weimann',
        company: 'Schowalter - Donnelly',
        email: 'Colleen80@gmail.com',
    },
    {   id: nanoid(),
        name: 'Dr. Christy Herman',
        company: 'VonRueden - Labadie',
        email: 'Lilyan98@gmail.com',
    },
    {   id: nanoid(),
        name: 'Katelin Schuster',
        company: 'Jacobson - Smitham',
        email: 'Erich_Brekke76@gmail.com',
    },
    {   id: nanoid(),
        name: 'Melyna Macejkovic',
        company: 'Schuster LLC',
        email: 'Kylee4@yahoo.com',
    },
    {   id: nanoid(),
        name: 'Pinkie Rice',
        company: 'Wolf, Trantow and Zulauf',
        email: 'Fiona.Kutch@hotmail.com',
    },
    {   id: nanoid(),
        name: 'Brain Kreiger',
        company: 'Lueilwitz Group',
        email: 'Rico98@hotmail.com',
    },
    {   id: nanoid(),
        name: 'Myrtice McGlynn',
        company: 'Feest, Beahan and Johnston',
        email: 'Julius_Tremblay29@hotmail.com',
    },
    {   id: nanoid(),
        name: 'Chester Carter PhD',
        company: 'Gaylord - Labadie',
        email: 'Jensen_McKenzie@hotmail.com',
    },
    {   id: nanoid(),
        name: 'Mrs. Ericka Bahringer',
        company: 'Conn and Sons',
        email: 'Lisandro56@hotmail.com',
    },
    {   id: nanoid(),
        name: 'Korbin Buckridge Sr.',
        company: 'Mraz, Rolfson and Predovic',
        email: 'Leatha9@yahoo.com',
    },
    {   id: nanoid(),
        name: 'Dr. Daisy Becker',
        company: 'Carter - Mueller',
        email: 'Keaton_Sanford27@gmail.com',
    },
    {   id: nanoid(),
        name: 'Derrick Buckridge Sr.',
        company: "O'Reilly LLC",
        email: 'Kay83@yahoo.com',
    },
    {   id: nanoid(),
        name: 'Ernie Hickle',
        company: "Terry, O'Reilly and Farrell",
        email: 'Americo.Leffler89@gmail.com',
    },
    {   id: nanoid(),
        name: 'Jewell Littel',
        company: "O'Connell Group",
        email: 'Hester.Hettinger9@hotmail.com',
    },
    {   id: nanoid(),
        name: 'Cyrus Howell',
        company: 'Windler, Yost and Fadel',
        email: 'Rick0@gmail.com',
    },
    {   id: nanoid(),
        name: 'Dr. Orie Jast',
        company: 'Hilll - Pacocha',
        email: 'Anna56@hotmail.com',
    },
    {   id: nanoid(),
        name: 'Luisa Murphy',
        company: 'Turner and Sons',
        email: 'Christine32@yahoo.com',
    },
    {   id: nanoid(),
        name: 'Lea Witting',
        company: 'Hodkiewicz Inc',
        email: 'Ford_Kovacek4@yahoo.com',
    },
    {   id: nanoid(),
        name: 'Kelli Runolfsson',
        company: "Feest - O'Hara",
        email: 'Dimitri87@yahoo.com',
    },
    {   id: nanoid(),
        name: 'Brook Gaylord',
        company: 'Conn, Huel and Nader',
        email: 'Immanuel77@gmail.com',
    },
];



const TestTable2 = () => {
    const [data, setData] = useState(initialData);
    const [editedRow, setEditedRow] = useState({});
    const [searchText, setSearchText] = useState('');
    const [searchColumn, setSearchColumn] = useState('');
    const [editingRowId, setEditingRowId] = useState(null);
    const [addingNewRow, setAddingNewRow] = useState(false);
    const [newRowData, setNewRowData] = useState({ name: '', email: '', company: '' });
    const [activePage, setActivePage] = useState(1);
    const rowsPerPage = 5;

    const startIndex = (activePage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const columns = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: info => editingRowId === info.row.original.id ? (
                <TextInput
                    value={editedRow.name}
                    onChange={(event) => handleChange(event, 'name')}
                />
            ) : info.getValue(),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: info => editingRowId === info.row.original.id ? (
                <TextInput
                    value={editedRow.email}
                    onChange={(event) => handleChange(event, 'email')}
                />
            ) : info.getValue(),
        },
        {
            accessorKey: 'company',
            header: 'Company',
            cell: info => editingRowId === info.row.original.id ? (
                <TextInput
                    value={editedRow.company}
                    onChange={(event) => handleChange(event, 'company')}
                />
            ) : info.getValue(),
        },
        {
            id: 'actions', // Important: Give the action column an ID
            header: 'Actions',
            Cell: ({ row }) => (
                <Group>
                    {editingRowId === row.original.id ? (
                        <>
                            <Button size="xs" color="yellow" variant="light" onClick={() => handleSave(row.original.id)}>저장</Button>
                            <Button size="xs" color="green" variant="light" onClick={handleCancel}>취소</Button>
                        </>
                    ) : (
                        <>
                            <Button size="xs" variant="light" onClick={() => handleEditClick(row.original.id)}>편집</Button>
                            <Button size="xs" color="red" variant="light" onClick={() => handleDelete(row.original.id)}>삭제</Button>
                        </>
                    )}
                </Group>
            ),
        },
    ];


    const filteredData = data.filter((row) => {
        if (!searchText) return true;

        const searchTextLower = searchText.toLowerCase();
        return (
            row.name.toLowerCase().includes(searchTextLower) ||
            row.company.toLowerCase().includes(searchTextLower) ||
            row.email.toLowerCase().includes(searchTextLower)
        );
    });

    const paginatedData = filteredData.slice(startIndex, endIndex);

    const table = useReactTable({
        data: paginatedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const handleEditClick = (id) => {
        setEditingRowId(id);
        setEditedRow(data.find(row => row.id === id));
    };

    const handleSave = (id) => {
        const newData = data.map(row =>
            row.id === id ? { ...row, ...editedRow } : row
        );
        setData(newData);
        setEditingRowId(null);
        setEditedRow(null);
    }

    const handleCancel = () => {
        setEditingRowId(null);
        setEditedRow(null);
    };

    const handleChange = (event, field) => {
        if (addingNewRow) {
            setNewRowData({ ...newRowData, [field]: event.target.value });
        } else {
            setEditedRow({ ...editedRow, [field]: event.target.value });
        }
    };

    const handleDelete = (id) => {
        const confirmation = window.confirm('삭제하시겠습니까?');
        if (confirmation) {
            const newData = data.filter(row => row.id !== id);
            setData(newData);
        }
    };

    const handleAddRow = () => {
        setAddingNewRow(true);
        setNewRowData({ name: '', email: '', company: '' });
    };

    const handleCancelNew = () => {
        setAddingNewRow(false);
        setNewRowData({ name: '', email: '', company: '' });
    };

    const handleSaveNew = () => {
        const newRow = { id: nanoid(), ...newRowData };
        setData([newRow, ...data]);
        setAddingNewRow(false);
        setNewRowData({ name: '', email: '', company: '' });
    };

    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
    };

    const handleSearchColumnChange = (value) => {
        setSearchColumn(value);
    };

    const newRow = (
        <tr key="new-row">
            {columns.map((col) => (
                <td key={col.accessorKey || col.id}>
                    {addingNewRow && col.accessorKey && (
                        <TextInput
                            value={newRowData[col.accessorKey]}
                            onChange={(event) => handleChange(event, col.accessorKey)}
                        />
                    )}
                    {addingNewRow && col.id === 'actions' && (
                        <Group>
                            <Button size="xs" color="yellow" variant="light" onClick={handleSaveNew}>
                                저장
                            </Button>
                            <Button size="xs" color="green" variant="light" onClick={handleCancelNew}>
                                취소
                            </Button>
                        </Group>
                    )}
                </td>
            ))}
        </tr>
    );

    return (
        <div>
            <Group style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Select
                    placeholder="Search by..."
                    value={searchColumn}
                    onChange={handleSearchColumnChange}
                    data={columns.filter(c => c.accessorKey).map((col) => ({ value: col.accessorKey, label: col.header }))}
                />
                <TextInput placeholder="Search..." value={searchText} onChange={handleSearchChange} />
                <Button size="sm" onClick={handleAddRow}>신규</Button>
            </Group>
            <table>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {addingNewRow && newRow}
                    {table.getRowModel().rows.map(row => {
                        return (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <Pagination
                total={Math.ceil(filteredData.length / rowsPerPage)}
                page={activePage}
                onChange={setActivePage}
                mt="xl"
                style={{ display: 'flex', justifyContent: 'center' }}
            />
        </div>
    );
};

export default TestTable2;