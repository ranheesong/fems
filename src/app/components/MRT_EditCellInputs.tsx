import { MRT_RowData, MRT_RowSelectionState } from 'mantine-react-table'
import { MantineTableCellProps, useMRT_EditCell } from '@/app/hooks/useMRT_EditCell'
import {
  ActionIcon,
  Box,
  Checkbox,
  Flex,
  LoadingOverlay,
  Select,
  Text,
  TextInput,
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { IconSearch } from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import { useEffect, useState } from 'react'

import dayjs from 'dayjs'
import MRT_Table from '@/app/components/MRT_Table'
import useQueryCustom from '@/app/hooks/useQueryCustom'
import { UseQueryResult } from '@tanstack/react-query'

export type CheckboxMappingData = {
  checked: any
  unchecked: any
}

// 메인 컴포넌트에서 반복문을 통한 동적 렌더링
const EditFieldMapper = {
  text: EditText,
  select: EditSelect,
  checkbox: EditCheckbox,
  date: EditDatePicker,
  modal: EditModal,
}

export const EditForm = ({ column, value, handleOnChange, handleBlur }) => {
  const EditComponent = EditFieldMapper[column.columnDef.editProps.type]

  return EditComponent ? (
    <EditComponent
      key={column.id}
      label={column.columnDef.header}
      value={value}
      handleOnChange={handleOnChange}
      handleBlur={handleBlur}
      column={column}
    />
  ) : null
}

export const EditCell = (props: MantineTableCellProps<MRT_RowData>) => {
  const { value, handleOnChange, handleBlur } = useMRT_EditCell(props)
  const { column } = props
  const EditComponent = EditFieldMapper[column.columnDef.editProps.type]

  return EditComponent ? (
    <EditComponent
      key={column.id}
      value={value}
      handleOnChange={handleOnChange}
      handleBlur={handleBlur}
      column={column}
    />
  ) : null
}

export function EditText(props) {
  const { column, value, handleOnChange, handleBlur } = props
  return (
    <TextInput
      label={props.label ? props.label : ''}
      value={value ? value : ''}
      onChange={handleOnChange}
      onBlur={handleBlur}
      placeholder={column.columnDef.header}
    />
  )
}

// 커스텀 훅 또는 파라미터가 배열인지 아닌지 체크하는 함수
export const useConditionalQuery = (
  data:
    | []
    | ((params?: {}) => UseQueryResult<unknown, Error> & {
        queryKey?: (string | Record<string, any>)[]
      }),
) => {
  // queryParam이 배열인지 아닌지 확인
  if (Array.isArray(data)) {
    // 배열이면 그대로 반환
    return {
      isFetching: false,
      isLoading: false,
      isSuccess: true,
      data: data,
      refetch: () => data,
      queryKey: '',
    }
  } else {
    // queryParam이 useQuery라면, useQuery를 호출하여 데이터를 가져옴
    const { isFetching, isLoading, isSuccess, data: dataResult, refetch, queryKey } = data()
    return {
      isFetching,
      isLoading,
      isSuccess,
      data: isSuccess ? dataResult.data : dataResult,
      refetch,
      queryKey,
    }
  }
}

export function EditSelect(props) {
  const { column, value, handleOnChange, handleBlur } = props
  const { isFetching, isLoading, isSuccess, data, refetch, queryKey } = useConditionalQuery(
    column.columnDef.editProps.data,
  )

  if (!isSuccess) {
    return (
      <Box pos="relative">
        <LoadingOverlay visible={!isSuccess} loaderProps={{ children: 'Loading...' }} />
        <Select />
      </Box>
    )
  }

  return (
    <Select
      readOnly={!isSuccess}
      label={props.label ? props.label : ''}
      value={value == '' ? null : value}
      data={data}
      onClick={() => {
        refetch()
      }}
      onChange={handleOnChange}
      onBlur={handleBlur}
      placeholder={column.columnDef.header}
      searchable
      clearable
      nothingFoundMessage="일치하는 데이터가 없습니다"
    />
  )
}

export function EditCheckbox(props) {
  const { column, value, handleOnChange, handleBlur } = props

  const find = Object.entries(column.columnDef.editProps.data).find(([, v]) => v == value)
  return (
    <Checkbox
      label={props.label ? props.label : ''}
      checked={find ? find[0] == 'checked' : false}
      onBlur={handleBlur}
      onChange={handleOnChange}
      placeholder={column.columnDef.header}
    />
  )
}

export function EditDatePicker(props) {
  const { column, value, handleOnChange, handleBlur } = props

  return (
    <DateTimePicker
      label={props.label ? props.label : ''}
      value={value ? new Date(value) : undefined}
      clearable
      withSeconds
      valueFormat="YYYY-MM-DD H:mm:ss"
      placeholder={column.columnDef.header}
      onChange={handleOnChange}
      onBlur={handleBlur}
    />
  )
}

export function EditModal(props) {
  const { column, value, handleOnChange, handleBlur } = props
  const { columns, data, targetColumn } = column.columnDef.editProps
  return (
    <>
      <Flex gap={2} align={'flex-end'}>
        <ActionIcon
          mb={4}
          variant="transparent"
          onClick={() => {
            modals.open({
              title: `${column.columnDef.header} 모달`,
              size: '1000px',
              children: (
                <MRT_Table
                  columns={columns}
                  data={data}
                  useSelect={data}
                  enableEditing={false}
                  enableCreate={false}
                  enableEdit={false}
                  enableDelete={false}
                  mantineTableBodyRowProps={({ row, table }) => ({
                    //implement row selection click events manually
                    onDoubleClick: (e) => {
                      handleOnChange(row.original[targetColumn ? targetColumn : column.id])
                      handleBlur(e)
                      modals.closeAll()
                    },
                    style: {
                      cursor: 'pointer',
                    },
                  })}
                  mantineTableContainerProps={{
                    style: { maxHeight: '500px' }, //give the table a max height
                  }}
                />
              ),
            })
          }}
        >
          <IconSearch color="#868e96" />
        </ActionIcon>
        <TextInput label={props.label ? props.label : ''} value={value ? value : ''} readOnly />
      </Flex>
    </>
  )
}
