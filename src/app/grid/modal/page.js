'use client'
import * as React from 'react'
// import { useState } from 'react';
// import DateTimePicker from './components/datetimepicker'
import ActionToggle from '../../components/actionToggle'
// import ReactTable from '../../components/reactTable'
import basicTable from '../../components/mantaineTable'
import CustomTable from '../../components/modalTable'
import CustomModal from '../../components/customModal'
import { MantineProvider, 
  Group,
  Box,
  // createTheme, 
  } from '@mantine/core';
import classes from '../../css/HeaderMenu.module.css';
// import CustomModal from './components/modal'; // 모달 컴포넌트 import
import { usStates } from '../../components/makeData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModalsProvider } from '@mantine/modals';


const columnsConfig = [
  {
    key: 'id',
    header: 'Id',
    enableEditing: false,
  },
  {
    key: 'firstName',
    header: 'First Name',
    inputType: 'text', // or 'email', 'number', etc.
    required: true,
  },
  {
    key: 'lastName',
    header: 'Last Name',
    inputType: 'text',
    required: true,
    renderEdit: false,
  },
  {
    key: 'email',
    header: 'Email',
    inputType: 'email',
    renderCreate: false,
  },
  {
    key: 'state',
    header: 'State',
    inputType: 'select',
    options: usStates, // Select options
  },
  {
    key: 'checked',
    header: 'Flag',
    header: 'Flag',
    inputType: 'checkbox',
  },
  {
    key: 'date',
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
            <basicTable></basicTable>
          </Group>
          <Group>
          <QueryClientProvider client={queryClient}>
            <ModalsProvider>
              {/* <CustomModal
                columns={columnsConfig}
              ></CustomModal> */}
              <CustomTable
                columns={columnsConfig}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                showCreate={true} 
                showEdit={true} 
                showDelete={true}
              />
            </ModalsProvider>
          </QueryClientProvider>
          </Group>

        </Box>
      </MantineProvider>
  )
}

