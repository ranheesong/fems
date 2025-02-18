'use client'
import * as React from 'react'
// import { useState } from 'react';
import Example from '../../components/freeFormTable'
import { MantineProvider, 
  Group,
  Box,
  // createTheme, 
  } from '@mantine/core';
import { data, usStates } from '../../components/basicdata';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const columnsConfig = [ // 컬럼 설정을 page.js에 정의
  {
    accessorKey: 'keyV',
    header: 'Key',
    size: 200,
    filterVariant: 'autocomplete',
    inputType: 'text',
    // enableEditing: false,
    xs: 4, // Grid.Col span 값 추가
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    size: 200,
    filterVariant: 'text', // 텍스트 필터 사용
    inputType: 'modal',
    data: data,
    column: [
      {
        accessorKey: 'keyV',
        header: 'Key',
        size: 200,
        filterVariant: 'autocomplete',
        inputType: 'text',
        // enableEditing: false,
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 200,
        filterVariant: 'autocomplete',
        inputType: 'text',
        // enableEditing: false,
      },
    ],
    xs: 4,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    enableClickToCopy: true,
    size: 150,
    filterVariant: 'autocomplete',
    inputType: 'select',
    defaultValue: '',
    options: usStates,
    xs: 4, // Grid.Col span 값 추가
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    size: 200,
    filterVariant: 'range-slider',
    prefix : "₩",
    // suffix : "%",
    style: 'currency', //'currency', 'unit, 'percent'
    currency: 'KRW', // currency: 'KRW', unit: 'watt',
    // minimumFractionDigits: 2, // 소수점 최소 2자리
    // maximumFractionDigits: 2, // 소수점 최대 2자리
    inputType: 'range', // number range
    useRangebox: false,
    rangeArr: [50_000, 75_000],
    xs: 4,
  },
  {
    accessorKey: 'jobTitle',
    header: 'Job Title',
    filterVariant: 'multi-select',
    size: 150,
    inputType: 'checkbox',
    xs: 2,
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    filterVariant: 'date-range',
    sortingFn: 'datetime',
    inputType: 'date',
    enableColumnFilterModes: false,
    xs: 6, // Grid.Col span 값 추가
  },
];

export default function Page() {

    const queryClient = new QueryClient();

    const handleCreate = (values) => {
      console.log("Creating:", values);
      // 서버로 address or values 값 전달
    };

    const handleUpdate = (values) => {
      console.log("Updating:", values);
      // 서버로 address or values 값 전달
    };

    const handleDelete = (row) => {
      console.log("Deleting:", row);
      // 서버로 address or values 값 전달, 
      // 서버로 row의 id를 사용하여 삭제 로직 구현
    };
    
    return (
        <MantineProvider defaultColorScheme="dark">
          <Box pb={120}>
            {/* <header className={classes.header}>
              <Group>
                <h2>계측(TAG) 기준 정보 관리</h2>
              </Group>
            </header> */}

          <Group>
          <QueryClientProvider client={queryClient}>
            <Example
              columns={columnsConfig}
              globalFilter={true}
              toggleFilter={true}
              showCreate={true} 
              showEdit={true} 
              showDelete={true}
              showSelect={true}
              // onCreate={handleCreate}
              // onUpdate={handleUpdate}
              // onDelete={handleDelete}
            />
          </QueryClientProvider>
          </Group>
        </Box>
      </MantineProvider>
  )
}

