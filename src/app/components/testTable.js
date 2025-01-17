'use client'
import * as React from 'react'
import { useState } from 'react';
import { ScrollArea, Table, TextInput, Button, Group, Select } from '@mantine/core';
import { nanoid } from 'nanoid'; // For generating unique IDs

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



const TestTable = () => {
    const [data, setData] = useState(initialData);
    const [editedRow, setEditedRow] = useState({}); // Store edited row data
    const [searchText, setSearchText] = useState('');
    const [searchColumn, setSearchColumn] = useState('');
    const [editingRowId, setEditingRowId] = useState(null);
    const [addingNewRow, setAddingNewRow] = useState(false);

    const handleEditClick = (id) => {
        setEditingRowId(id);
    };
    
    const handleSave = (index) => {
        const newData = [...data];
        newData[index] = { ...editedRow }; // Update data with edited values
        setData(newData);
        setEditingRowId(null);
    };

    const handleCancel = () => {
        setEditingRowId(null);
    };

    const handleChange = (event, id, field) => {
        if (id === 'new') {
            setData([...data, { id: nanoid(), ...editedRow }]); 
        } else {
            // Update existing row
            const newData = data.map((row) => {
                if (row.id === id) {
                return { ...row, [field]: event.target.value };
                }
                return row;
            });
            setData(newData);
        }
        setAddingNewRow(false); 
        setEditedRow({}); // Clear editedRow state
    };

    const handleDelete = (index) => {
        const confirmation = window.confirm('삭제하시겠습니까?');
            if (confirmation) {
                const newData = [...data];
                newData.splice(index, 1); // Remove row from data
                setData(newData);
            }
    };

    const handleAddRow = () => {
        setAddingNewRow(true);
        setEditedRow({});
    };
    
    const handleCancelNew = () => {
        setAddingNewRow(false); // Set adding new row state to false
    };
    
    const handleSaveNew = () => {
        const newData = [...data, { id: nanoid(), ...editedRow }]; // Add new row with data from editedRow
        setData(newData);
        setAddingNewRow(false);
        setEditedRow({}); // Clear editedRow state
    };

    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
    };

    const handleSearchColumnChange = (value) => {
        setSearchColumn(value);
    };

    const filteredData = data.filter((row) => {
        if (!searchText) return true;
    
        const searchTextLower = searchText.toLowerCase();
        return (
            row.name.toLowerCase().includes(searchTextLower) ||
            row.company.toLowerCase().includes(searchTextLower) ||
            row.email.toLowerCase().includes(searchTextLower)
        );
    });
    
    const columns = [
        { value: 'name', title: 'Name', width: 200 },
        { value: 'email', title: 'Email', width: 300 },
        { value: 'company', title: 'Company', width: 200 },
        {
            value: 'actions',
            title: 'Actions',
            width: 100,
            render: (row, index) => (
                <Group>
                {editingRowId !== index && ( // Only show edit button if not editing
                    <Button size="xs" onClick={() => handleEditClick(index)}>
                        편집
                    </Button>
                )}
                {editingRowId === index && ( // Only show save/cancel buttons when editing
                    <>
                        <Button size="xs" color="yellow" onClick={() => handleSave(index)}>
                        저장
                        </Button>
                        <Button size="xs" color="green" onClick={handleCancel}>
                        취소
                        </Button>
                    </>
                )}
                {editingRowId !== index && ( // Show delete button only if not editing
                    <Button size="xs" color="red" onClick={() => handleDelete(index)}>
                        삭제
                    </Button>
                )}
                </Group>
            ),
        },
    ];

    const rows = filteredData.map((row, index) => (
        <Table.Tr key={row.id}>
            {columns.map((col) => (
                <Table.Td key={col.value}>
                {editingRowId === row.id ? (
                    <TextInput
                    value={row[col.value]}
                    onChange={(event) => handleChange(event, row.id, col.value)}
                    />
                ) : (
                    <div>{row[col.value]}</div>
                )}
                </Table.Td>
            ))}
            <Table.Td>
                {editingRowId !== row.id ? (
                <Group>
                    <Button size="xs" onClick={() => handleEditClick(row.id)}>편집</Button>
                    <Button size="xs" color="red" onClick={() => handleDelete(index)}>
                        삭제
                    </Button>
                </Group>
                ) : (
                <Group>
                    <Button size="xs" color="yellow" onClick={() => handleSave(row.id)}>저장</Button>
                    <Button size="xs" color="green" onClick={handleCancel}>취소</Button>
                </Group>
                )}
            </Table.Td>
        </Table.Tr>
    ));

    const newRow = (
        <Table.Tr key={nanoid()}>
            {columns.map((col) => (
                <Table.Td key={col.value}>
                {addingNewRow && (
                    <TextInput
                    value={editedRow[col.value] || ''} // Use editedRow prop for initial value
                    onChange={(event) => handleChange(event, 'new', col.value)}
                    />
                )}
                </Table.Td>
            ))}
            <Table.Td>
                {addingNewRow && (
                <Group>
                    <Button size="xs" color="yellow" onClick={handleSaveNew}>
                    저장
                    </Button>
                    <Button size="xs" color="green" onClick={handleCancelNew}>
                    취소
                    </Button>
                </Group>
                )}
            </Table.Td>
        </Table.Tr>
    );

    return (
        <div>
            <Group>
                <Select
                    placeholder="Search by..."
                    value={searchColumn}
                    onChange={handleSearchColumnChange}
                    data={columns.map((col) => ({ value: col.value, label: col.title }))}
                />
                <TextInput placeholder="Search..." value={searchText} onChange={handleSearchChange} />
            </Group>
            <ScrollArea h={300}>
            <Table>
                <Table.Thead>
                <Table.Tr>
                    {columns.map((col) => (
                    <Table.Th key={col.id}>{col.title}</Table.Th>
                    ))}
                </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}{addingNewRow && newRow}</Table.Tbody>
            </Table>
            </ScrollArea>
            <Button size='sm' color='purple' onClick={handleAddRow}>신규</Button>
        </div>
    );
};

export default TestTable;