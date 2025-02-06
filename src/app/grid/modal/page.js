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
import 'dayjs/locale/ko';
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
    key: 'lastDate', // 새로운 날짜 컬럼 추가
    header: 'Last Date',
    // Cell: ({ cell }) => {
    //   const [dateValue, setDateValue] = useState(
    //     cell.row.original.lastDate ? moment(cell.row.original.lastDate) : null // original data 사용
    //   );

    //   return (
    //     <DatesProvider settings={{ consistentWeeks: true, locale: 'ko' }}>
    //       <DatePickerInput
    //         rightSection={<IconCalendar size={18} stroke={1.5} />}
    //         rightSectionPointerEvents="none"
    //         valueFormat="YYYY-MM-DD"
    //         placeholder="Date input"
    //         maw={400}
    //         mx="auto"
    //         variant="unstyled"
    //         value={dateValue}
    //         onChange={(date) => {
    //           setDateValue(date);
    //           // CustomTable 컴포넌트의 onUpdate 함수를 호출하여 부모 컴포넌트의 state를 업데이트합니다.
    //           if (cell.row.original) { // original이 있을때만 update 실행
    //             const updatedRow = { ...cell.row.original, lastDate: date ? date.format('YYYY-MM-DD') : null }; // YYYY-MM-DD 형식으로 저장
    //             onUpdate(updatedRow); // lastDate를 포함한 전체 row data를 update
    //           }

    //         }}
    //       />
    //     </DatesProvider>
    //   );
    // },
    inputType: 'date', // inputType을 date로 지정하면 DatePicker가 자동으로 렌더링 됩니다.
    // editVariant: 'date', // editVariant를 date로 지정해야 edit 모드에서도 DatePicker가 나타납니다.
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

