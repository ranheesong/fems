'use client'
import * as React from 'react'
// import { useState } from 'react';
// import DateTimePicker from './components/datetimepicker'
import ActionToggle from '../../components/actionToggle'
// import ReactTable from '../../components/reactTable'
import BasicTable from '../../components/mantaineTable'
import CustomTable from '../../components/modalTable'
import CustomModal from '../../components/customModal'
import { MantineProvider, 
  Group,
  Box,
  // createTheme, 
  } from '@mantine/core';
import classes from '../../css/HeaderMenu.module.css';
// import CustomModal from './components/modal'; // 모달 컴포넌트 import
import { usStates, fakeData } from '../../components/makeData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModalsProvider } from '@mantine/modals';


const columnsConfig = [
  {
    accessorKey: 'id',
    header: 'Id',
    enableEditing: false,
  },
  {
    accessorKey: 'firstName',
    header: 'First Name',
    inputType: 'text', // or 'email', 'number', etc.
    required: true,
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    inputType: 'text',
    required: true,
    renderEdit: false,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    inputType: 'email',
    renderCreate: false,
  },
  {
    accessorKey: 'state',
    header: 'State',
    inputType: 'select',
    options: usStates, // Select options
  },
  {
    accessorKey: 'checked',
    header: 'Checked',
    inputType: 'checkbox',
  },
  {
    accessorKey: 'date',
    header: 'Date',
    inputType: 'date',
  },
];

export default function Page() {

    const queryClient = new QueryClient();

    const handleCreate = (values) => {
      console.log("Creating:", values);
      // 서버로 values 전송 로직 구현
    };

    const handleUpdate = (values) => {
      console.log("Updating:", values);
      // 서버로 values 전송 로직 구현
    };

    const handleDelete = (row) => {
      console.log("Deleting:", row);
      // 서버로 row의 id를 사용하여 삭제 로직 구현
    };
    
    return (
        <MantineProvider defaultColorScheme="dark">
          <Box pb={120}>
            <header className={classes.header}>
              <Group>
                <h2>계측(TAG) 기준 정보 관리</h2>
                <ActionToggle/>
              </Group>
          </header>
          
          <Group>
            <QueryClientProvider client={queryClient}>
              <BasicTable
                columns={columnsConfig}
                data={fakeData}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                showCreate={true} 
                showEdit={true} 
                showDelete={true}
              ></BasicTable>
            </QueryClientProvider>
          </Group>

        </Box>
      </MantineProvider>
  )
}

