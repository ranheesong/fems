'use client'
import * as React from 'react'
// import { useState } from 'react';
import MyButton from '../../components/myButton'
import DatePicker from '../../components/datepickerinputs'
// import DateTimePicker from './components/datetimepicker'
import InputText from '../../components/textInput'
import InputSelect from '../../components/selectInput'
import ActionToggle from '../../components/actionToggle'
// import ReactTable from '../../components/reactTable'
// import TestTable from '../../components/testTable'
import CustomTable from '../../components/modalTable'
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
// import { DatePickerInput, DatesProvider} from '@mantine/dates';
// import 'dayjs/locale/ko';
// import moment from 'moment';
// import { IconCalendar } from '@tabler/icons-react';

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
    header: 'Checked',
    inputType: 'checkbox',
  },
  // {
  //   key: 'date',
  //   header: 'Date',
  //   inputType: 'date',
  // },
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
              <Group gap='xs' justify='flex-end' align='flex-end' className={classes.search}>
                <InputText
                  label="input"
                  placeholder="input value"
                />
                <div>
                <InputSelect
                  label="select"
                  placeholder="Pick value"
                />
                </div>
                <DatePicker
                  label="start date"
                  placeholder="Pick start date"
                />
                <DatePicker
                  label="end date"
                  placeholder="Pick end date"
                />
                {/* <DateTimePicker
                  label="datetime"
                  placeholder="Pick date and time"
                /> */}
                <MyButton
                  variant="filled"
                >조회</MyButton>
              </Group>
          {/* 주석 */}
          </header>
          <Group>
            
          <QueryClientProvider client={queryClient}>
            <ModalsProvider>
              <CustomTable
                columns={columnsConfig}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            </ModalsProvider>
          </QueryClientProvider>
          </Group>

        </Box>
      </MantineProvider>
  )
}

