import classes from '@/app/css/Tab.module.css'

import {
  ComboboxData,
  Flex,
  Tabs,
  Tooltip,
  Text,
  ActionIcon,
  Button,
  Checkbox,
  Stack,
  TextInput,
  Alert,
  Grid,
  Box,
  LoadingOverlay,
  Select,
  SegmentedControl,
} from '@mantine/core'
import {
  createRow,
  MantineReactTable,
  MRT_Cell,
  MRT_Column,
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_Row,
  MRT_RowData,
  MRT_RowSelectionState,
  MRT_TableInstance,
  MRT_TableOptions,
  useMantineReactTable,
} from 'mantine-react-table'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckboxMappingData,
  EditCell,
  EditForm,
  useConditionalQuery,
} from '@/app/components/MRT_EditCellInputs'
import toast from 'react-hot-toast'
import { OnChangeFn, PaginationState } from '@tanstack/react-table'
import { table } from 'console'
import {
  UndefinedInitialDataOptions,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'
import {
  IconMoodPlus,
  IconMoodEdit,
  IconKeyFilled,
  IconEdit,
  IconRefresh,
} from '@tabler/icons-react'
import { MantineTableCellProps } from '../hooks/useMRT_EditCell'
import { modals } from '@mantine/modals'
import dayjs from 'dayjs'
import useQueryCustom from '../hooks/useQueryCustom'
import useMutationCustom from '../hooks/useMutationCustom'
import FreeForm from '@/app/components/FreeForm'

// 기존 MRT_TableOptions에 새로운 속성 추가하기
// 컬럼 속성
export type MRT_ColumnDefExtend = MRT_ColumnDef<MRT_RowData> & {
  primaryKey?: boolean // 기본 키 여부
  defaultValue?: string | (() => string) // 기본 값
  enableCreating?: boolean // 추가 시 입력 가능 여부
  enableEditing?: boolean // 수정 시 입력 가능 여부
  editProps?: {
    // 추가/수정 속성
    type: 'text' | 'select' | 'date' | 'checkbox' | 'modal' // 셀 타입
    columns?: MRT_ColumnDefExtend[]
    data?: (params?: {}) =>
      | (UseQueryResult<unknown, Error> & {
          queryKey?: (string | Record<string, any>)[]
        })
      | ComboboxData
      | CheckboxMappingData
      | MRT_RowData
      | undefined // select, checkbox 타입의 매핑 데이터
    targetColumn?: string
  }
  span?: number // form grid span
}

export interface MRT_TableOptionsExtend
  extends Omit<MRT_TableOptions<MRT_RowData>, 'columns' | 'data'> {
  columns?: MRT_ColumnDefExtend[] // 컬럼 속성 변경
  data?: MRT_RowData[]

  enableCreate?: boolean // 추가 가능 여부
  enableEdit?: boolean // 수정 가능 여부
  enableDelete?: boolean // 삭제 가능 여부

  useSelect: (params?: {}) => UseQueryResult<unknown, Error> & {
    queryKey?: (string | Record<string, any>)[]
  } // 조회 함수
  useCreate: (
    queryKey?: (string | Record<string, any>)[],
  ) => UseMutationResult<any, Error, void, unknown> // 추가 함수
  useUpdate: (
    queryKey?: (string | Record<string, any>)[],
  ) => UseMutationResult<any, Error, void, unknown> // 저장 함수
  useDelete: (
    queryKey?: (string | Record<string, any>)[],
  ) => UseMutationResult<any, Error, void, unknown> // 삭제 함수
}

export interface StateParams {
  paginationState: [PaginationState, React.Dispatch<React.SetStateAction<PaginationState>>]
  rowSelectionState: [
    MRT_RowSelectionState,
    React.Dispatch<React.SetStateAction<MRT_RowSelectionState>>,
  ]
  editedRowsState?: [
    Record<string, MRT_Row<MRT_RowData>>,
    React.Dispatch<React.SetStateAction<Record<string, MRT_Row<MRT_RowData>>>>,
  ]
}

const editDisplayModeList = [
  ['freeform', '폼'],
  ['table', '테이블'],
  ['row', '행'],
]

const initialTableOptions: MRT_TableOptionsExtend = {
  enableCreate: true,
  enableEdit: true,
  enableDelete: true,

  useSelect: () => useQueryCustom('', {}, {}),
  useCreate: () => useMutationCustom('', { method: '' }),
  useUpdate: () => useMutationCustom('', { method: '' }),
  useDelete: () => useMutationCustom('', { method: '' }),
}

const initState = {
  editDisplayMode: 'freeform',
  pagination: { pageIndex: 0, pageSize: 10 },
  rowSelection: {},
  editedRows: {},
  selectedRow: {},
}

// 상태 표시 컬럼럼
const MRT_StateColumn: MRT_ColumnDefExtend = {
  id: 'MRT_State',
  header: '상태',
  enableEditing: false,
  size: 80,
  defaultValue: '추가',
  Cell: (props: MantineTableCellProps<MRT_RowData>) => {
    const stateMessage = props.row._valuesCache.MRT_State || props.row.original.MRT_State
    return (
      <Flex align={'center'}>
        <Tooltip label={stateMessage}>
          {stateMessage == '추가' ? (
            <IconMoodPlus color={'#1c7ed6'} />
          ) : stateMessage == '수정' ? (
            <IconMoodEdit color={'#f06e27'} />
          ) : (
            <Text></Text>
          )}
        </Tooltip>
      </Flex>
    )
  },
}

// 현재 CELL 값 조회
export const getValue = (cell: MRT_Cell<MRT_RowData>) => {
  let inputValue
  if (cell.row._valuesCache[cell.column.id] != null) {
    inputValue = cell.row._valuesCache[cell.column.id]
  } else if (cell.getValue() != null) {
    inputValue = cell.getValue()
  } else {
    inputValue = cell.row.original[cell.column.id]
  }
  return cell.getValue()
}

// 수정 타입별 컴포넌트
const editRenderProps = {
  text: {
    Cell: ({ cell }: MantineTableCellProps<MRT_RowData>) => {
      const value = getValue(cell)
      return value
    },
  },
  select: {
    Cell: ({ cell, column }: MantineTableCellProps<MRT_RowData>) => {
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

      const find = data.find((data) => data.value == getValue(cell))

      return find ? find['label'] : ''
    },
  },
  checkbox: {
    Cell: ({ cell, column }: MantineTableCellProps<MRT_RowData>) => {
      const value = getValue(cell)
      const find = Object.entries(column.columnDef.editProps.data).find(([, v]) => v === value)

      return <Checkbox checked={find ? find[0] == 'checked' : false} readOnly />
    },
  },
  date: {
    Cell: ({ cell }: MantineTableCellProps<MRT_RowData>) => {
      const value = getValue(cell)
      return value
    },
  },
  modal: {
    Cell: ({ cell, table }: MantineTableCellProps<MRT_RowData>) => {
      const value = getValue(cell)
      return value
    },
  },
}

// 행 변경 확인
export const hasRowChanged = (row: MRT_Row<MRT_RowData>) => {
  const isChanged = row
    .getAllCells()
    .filter((cell) => {
      const { column } = cell
      const { columnDef } = column
      // enableEditing이 참
      // editProps의 타입이 있음
      // mrt-row로 시작하지 않음
      // MRT_State 이면 안됨
      return (
        columnDef.enableEditing != false &&
        columnDef.editProps.type != null &&
        !column.id.startsWith('mrt-row') &&
        column.id != 'MRT_State'
      )
    })
    .map((cell) => cell.column.id)
    .filter(
      (columnId) =>
        row._valuesCache[columnId] != null && row.original[columnId] != row._valuesCache[columnId],
    )
  console.log({ row })

  console.log({ isChanged })

  return isChanged.length > 0
}

function MRT_Table(tableOptions: MRT_TableOptionsExtend) {
  const queryClient = useQueryClient()

  tableOptions = { ...initialTableOptions, ...tableOptions }

  const [editDisplayMode, setEditDisplayMode] = useState(initState.editDisplayMode)
  const [pagination, setPagination] = useState<MRT_PaginationState>(initState.pagination)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>(initState.rowSelection)
  const [editedRows, setEditedRows] = useState<Record<string, MRT_Row<MRT_RowData>>>(
    initState.editedRows,
  ) // 테이블 전용

  const { useSelect, useCreate, useUpdate, useDelete }: MRT_TableOptionsExtend = tableOptions
  const {
    isFetching,
    isLoading,
    isSuccess,
    data: dataResult,
    refetch,
    queryKey,
  } = useSelect({
    pagination,
  }) // 조회

  const createResult = useCreate(queryKey) // 생성

  const updateResult = useUpdate(queryKey) // 수정

  const deleteResult = useDelete(queryKey) // 삭제

  // 폼 데이터
  const formdataRef = useRef<MRT_RowData>({})
  // 폼 데이터 변경 시 변경 값 저장
  const changeFormdata = (values: MRT_RowData) => {
    if (formdataRef.current.id != null) {
      formdataRef.current['update'] = values
    } else {
      formdataRef.current['original'] = values
    }
    console.log(formdataRef.current)
  }

  const tableData = tableOptions.data || isSuccess ? dataResult.data.data : []

  const [data, setData] = useState<any[]>([])
  // 테이블 데이터 리로드 시 state 초기화
  useEffect(() => {
    if (!!tableData && tableData.length > 0) {
      setData([...tableData])
      setEditedRows(initState.editedRows)
      table.setCreatingRow(null)
      table.setEditingRow(null)
    }
  }, [tableData, editDisplayMode])

  useEffect(() => {
    console.log(rowSelection)
  }, [rowSelection])

  // 컬럼 속성 추가
  const columns = useMemo<MRT_ColumnDefExtend[]>(() => {
    let tempColumns = tableOptions.columns || (isSuccess ? dataResult.data.columns : [])
    if (editDisplayMode != 'freeform') {
      tempColumns = [MRT_StateColumn, ...tempColumns]
    }
    tempColumns = tempColumns.map((column) => {
      if (column.primaryKey) {
        // 기본키 헤더 추가
        column.Header = (
          <Flex align={'center'} gap={4}>
            <IconKeyFilled color="#e6bc59" size={'1.25rem'} />
            {column.header}
          </Flex>
        )
      }
      if (column.editProps) {
        // 셀 요소 추가가
        column = Object.assign(column, editRenderProps[column.editProps.type])
        // Edit 요소 추가
        column.Edit = (props: MantineTableCellProps<MRT_RowData>) => {
          // row.id 가 'mrt-row-create' => 추가된 행행
          return EditCell(props)
        }
      }

      return column
    })
    return tempColumns
  }, [editDisplayMode])

  const rowCount = useMemo(() => {
    return isSuccess ? dataResult.data.recordsFiltered : 0
  }, [data])

  // pk 리스트 생성
  const primaryKeys = useMemo((): string[] => {
    let primaryKeys = columns
      .filter((column) => column.primaryKey)
      .map((column) => column.id || column.accessorKey)
    primaryKeys = primaryKeys.filter((key) => key != null)

    if (primaryKeys.length === 0) {
      primaryKeys = columns.map((column) => column.id || column.accessorKey)
    }

    return primaryKeys as string[]
  }, [columns])
  // 기본키로 행 조회
  const getRowIdByPrimaryKey = (originalRow: MRT_RowData): string => {
    return primaryKeys.map((primaryKey) => originalRow[primaryKey]).join('-')
  }
  // 고유 id 생성
  const getRowId = (originalRow: MRT_RowData, index: number, parentRow: MRT_Row<MRT_RowData>) =>
    tableOptions.getRowId
      ? tableOptions.getRowId(originalRow, index, parentRow)
      : getRowIdByPrimaryKey(originalRow)
  // 행 추가 버튼 이벤트
  const getCreateRow = (table: MRT_TableInstance<MRT_RowData>): MRT_RowData =>
    table.getAllColumns().reduce((obj, column) => {
      const defaultValue = column.columnDef.defaultValue
      obj[column.id] = typeof defaultValue == 'function' ? defaultValue() : defaultValue || ''
      return obj
    }, {} as MRT_RowData)

  // 입력모드 테이블, 행 - 추가한 행 저장 이벤트
  const onCreatingRowSave: MRT_TableOptions<MRT_RowData>['onCreatingRowSave'] = async (props) => {
    modals.openConfirmModal({
      title: '저장 알림',
      children: <Text>추가한 행을 저장하시겠습니까?</Text>,
      labels: {
        confirm: '저장',
        cancel: '취소',
      },
      confirmProps: { color: 'blue' },
      onConfirm: async () => {
        const data = Object.fromEntries(
          Object.entries({
            ...props.row.original,
            ...props.row._valuesCache,
          }).filter(([k]) => !k.startsWith('mrt-row')),
        )

        createResult.mutate(data, {
          onSuccess: (data, variables) => {
            toast.success(data.msg)
            queryClient.invalidateQueries({ queryKey })

            setRowSelection({
              [getRowIdByPrimaryKey(variables)]: true,
            })
            props.exitCreatingMode()
          },
          onError: (error) => {
            console.error(error.message)
            toast.error(error.message)
          },
        })
      },
    })
  }
  // 입력모드 행 - 저장
  const onEditingRowSave: MRT_TableOptions<MRT_RowData>['onEditingRowSave'] = async ({
    table,
    row,
  }) => {
    if (!hasRowChanged(row)) {
      return toast('변경된 데이터가 없습니다.')
    }

    modals.openConfirmModal({
      title: '저장 알림',
      children: <Text>해당 행을 수정하시겠습니까?</Text>,
      labels: { confirm: '저장', cancel: '취소' },
      confirmProps: { color: 'blue' },
      onConfirm: async () => {
        const updateData = {
          original: row.original,
          update: {
            ...row.original,
            ...row._valuesCache,
          },
        }

        updateResult.mutate(updateData, {
          onSuccess: (data) => {
            toast.success(data.msg)

            setRowSelection({
              [getRowIdByPrimaryKey(row._valuesCache)]: true,
            } as MRT_RowSelectionState)
            queryClient.invalidateQueries({ queryKey })
          },
          onError: (error) => {
            console.error(error.message)
            toast.error(error.message)
          },
        })
      },
    })
  }

  // 입력모드 테이블 - 행 수정 시 표시
  const onEditingRowChange: OnChangeFn<MRT_Row<MRT_RowData> | null> = (row) => {
    console.log('onEditingRowChange')

    if (row == null) return
    if (typeof row == 'function') return row((old) => {})

    if (hasRowChanged(row) && row.original['MRT_State'] != '추가') {
      row._valuesCache['MRT_State'] = '수정'
      setEditedRows((editedRows) => ({
        ...editedRows,
        [row.id]: row,
      }))
    } else {
      row._valuesCache['MRT_State'] = ''
      const { [row.id]: removed, ...remainRows } = editedRows
      setEditedRows(remainRows)
    }
  }

  // 입력모드 테이블 - 저장 버튼 클릭
  const onEditingRowSaveWithTableMode = (table) => {
    modals.openConfirmModal({
      title: '저장 알림',
      children: <Text>{Object.keys(editedRows).length}개의 행을 수정하시겠습니까?</Text>,
      labels: { confirm: '저장', cancel: '취소' },
      confirmProps: { color: 'blue' },
      onConfirm: () => {
        const updateData = Object.values(editedRows).map((row) => ({
          original: row.original,
          update: {
            ...row.original,
            ...row._valuesCache,
          },
        }))

        updateResult.mutate(updateData, {
          onSuccess: (data, variables) => {
            toast.success(data.msg)
            queryClient.invalidateQueries({ queryKey })

            setRowSelection(
              Object.entries(editedRows).reduce((obj, [, row]) => {
                const key = getRowIdByPrimaryKey(row._valuesCache)
                obj[key] = true
                return obj
              }, {} as MRT_RowSelectionState),
            )
          },
          onError: (error) => {
            console.error(error.message)
            toast.error(error.message)
          },
        })
      },
    })
  }

  // 인라인 수정 행 저장 이벤트
  const renderRowActions: MRT_TableOptions<MRT_RowData>['renderRowActions'] = ({ row, table }) => {
    // return;
    return (
      editDisplayMode == 'row' &&
      tableOptions.enableEdit && (
        <Flex gap={'xs'}>
          <Tooltip label="수정">
            <ActionIcon
              onClick={() => {
                if (table.getState().creatingRow || table.getState().editingRow) {
                  return toast('작업 완료 후 진행해주세요', {
                    icon: '⚠️',
                  })
                }

                table.setEditingRow(row)
              }}
            >
              <IconEdit />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="초기화">
            <ActionIcon
              color="#7a84b9"
              onClick={() => {
                modals.openConfirmModal({
                  title: '초기화 알림',
                  children: <Text>행을 초기화하시겠습니까?</Text>,
                  labels: {
                    confirm: '초기화',
                    cancel: '취소',
                  },
                  confirmProps: { color: '#7a84b9' },
                  onConfirm: () => {
                    const columns = table.getAllColumns()
                    columns.forEach(({ id }) => {
                      if (row._valuesCache[id] != null) {
                        row._valuesCache[id] = row.original[id]
                      }
                      if (id == 'MRT_State') {
                        row.original['MRT_State'] = ''
                        row._valuesCache['MRT_State'] = ''
                      }
                    })

                    const { [row.id]: removed, ...remainRows } = editedRows
                    setEditedRows(remainRows)
                  },
                })
              }}
            >
              <IconRefresh />
            </ActionIcon>
          </Tooltip>
        </Flex>
      )
    )
  }

  // 툴바 이벤트
  // 추가, 수정, 삭제, 데이터 최신화화
  const renderTopToolbarCustomActions: MRT_TableOptions<MRT_RowData>['renderTopToolbarCustomActions'] =
    ({ table }) => {
      return (
        <Stack align="stretch">
          <Flex gap={'xs'} align={'center'}>
            {tableOptions.enableCreate && (
              <Button
                onClick={() => {
                  console.log({
                    editRow: table.getState().editingRow,
                  })

                  if (table.getState().editingRow) {
                    return toast('작업 완료 후 진행해주세요', {
                      icon: '⚠️',
                    })
                  }
                  if (editDisplayMode == 'freeform') {
                    // 선택 초기화
                    setRowSelection({})
                    formdataRef.current = {}
                  } else {
                    table.setCreatingRow(createRow(table, getCreateRow(table)))
                  }
                }}
              >
                추가
              </Button>
            )}
            {tableOptions.enableEdit && editDisplayMode != 'row' && (
              <Button
                disabled={editDisplayMode != 'freeform' && Object.keys(editedRows).length == 0}
                onClick={() => {
                  if (editDisplayMode == 'freeform') {
                    const actionName = formdataRef.current.id == null ? '추가' : '수정'
                    console.log(formdataRef.current)
                    modals.openConfirmModal({
                      title: actionName,
                      children: <Text>데이터를 {actionName}하시겠습니까?</Text>,
                      labels: {
                        confirm: actionName,
                        cancel: '취소',
                      },
                      confirmProps: { color: 'red' },
                      onConfirm: () => {
                        if (formdataRef.current.id == null) {
                          createResult.mutate(formdataRef.current.original, {
                            onSuccess: (data) => {
                              toast.success(data.msg)
                              queryClient.invalidateQueries({ queryKey })
                              setRowSelection({
                                [getRowIdByPrimaryKey(formdataRef.current.original)]: true,
                              })
                              formdataRef.current.id = getRowIdByPrimaryKey(
                                formdataRef.current.original,
                              )
                              formdataRef.current.update = {}

                              // pk 리턴 받는 경우 처리
                              if (data.data) {
                                setRowSelection({
                                  [getRowIdByPrimaryKey(data.data)]: true,
                                })
                              }
                            },
                            onError: (error) => {
                              console.error(error.message)
                              toast.error(error.message)
                            },
                          })
                        } else {
                          updateResult.mutate(
                            {
                              original: formdataRef.current.original,
                              update: {
                                ...formdataRef.current.original,
                                ...formdataRef.current.update,
                              },
                            },
                            {
                              onSuccess: (data, variables, context) => {
                                toast.success(data.msg)
                                queryClient.invalidateQueries({ queryKey })

                                // table.getAllColumns().forEach(({ id }) => {
                                //   formdataRef.current.original[id] = formdataRef.current.update[id]
                                // })
                                formdataRef.current.id = getRowIdByPrimaryKey(variables['update'])
                                formdataRef.current = {
                                  ...formdataRef.current,
                                  original: variables['update'],
                                  update: {},
                                }
                                console.log()
                                setRowSelection({
                                  [getRowIdByPrimaryKey(formdataRef.current.original)]: true,
                                })
                                // setSelectedRow({ ...selectedRow })
                              },
                              onError: (error) => {
                                console.error(error.message)
                                toast.error(error.message)
                              },
                            },
                          )
                        }
                      },
                    })
                  } else {
                    onEditingRowSaveWithTableMode(table)
                  }
                }}
              >
                저장
              </Button>
            )}
            {tableOptions.enableDelete && (
              <Button
                color="red"
                disabled={Object.keys(rowSelection).length === 0}
                onClick={() => {
                  // 추가 혹은 수정중인 행 체크
                  if (editDisplayMode != 'table') {
                    console.log(table.getState().creatingRow)
                    console.log(table.getState().editingRow)

                    if (table.getState().creatingRow || table.getState().editingRow) {
                      return toast('작업 완료 후 진행해주세요', {
                        icon: '⚠️',
                      })
                    }
                  }

                  modals.openConfirmModal({
                    title: '삭제 알림',
                    children: (
                      <Text>
                        선택된 {Object.keys(rowSelection).length}
                        개의 데이터를 정말 삭제하시겠습니까?
                      </Text>
                    ),
                    labels: {
                      confirm: '삭제',
                      cancel: '취소',
                    },
                    confirmProps: { color: 'red' },
                    onConfirm: () => {
                      let deleteData: Record<string, any> | Record<string, any>[] = table
                        .getRowModel()
                        .rows.filter((row) => rowSelection[row.id])
                        .map((row) =>
                          primaryKeys.reduce(
                            (obj, primaryKey) => {
                              obj[primaryKey] = row.original[primaryKey]
                              return obj
                            },
                            {} as Record<string, any>,
                          ),
                        )
                      if (editDisplayMode == 'freeform') {
                        deleteData = deleteData[0]
                      }

                      deleteResult.mutate(deleteData, {
                        onSuccess: (data, variables, context) => {
                          toast.success(data.msg)
                          queryClient.invalidateQueries({ queryKey })

                          setRowSelection({})
                          formdataRef.current = {}
                        },
                        onError: (error) => {
                          console.error(error.message)
                          toast.error(error.message)
                        },
                      })
                    },
                  })
                }}
              >
                삭제
              </Button>
            )}
            <Tooltip label="데이터 최신화">
              <ActionIcon
                size={'lg'}
                onClick={() => {
                  // table.getRowModel().rows.forEach((row) => {
                  //   const columns = table.getAllColumns()
                  //   columns.forEach(({ id }) => {
                  //     if (row._valuesCache[id] != null) {
                  //       row._valuesCache[id] = row.original[id]
                  //     }
                  //     if (id == 'MRT_State') {
                  //       row.original['MRT_State'] = ''
                  //       row._valuesCache['MRT_State'] = ''
                  //     }
                  //   })

                  //   table.setEditingRow(row)
                  //   const { [row.id]: removed, ...remainRows } = editedRows
                  //   setEditedRows(remainRows)
                  // })
                  queryClient.invalidateQueries({ queryKey })
                  refetch()
                }}
              >
                <IconRefresh />
              </ActionIcon>
            </Tooltip>
          </Flex>
          {editDisplayMode == 'freeform' && table.options.enableEditing && (
            <FreeForm table={table} row={formdataRef.current} onChange={changeFormdata} />
          )}
        </Stack>
      )
    }

  const MRT_TableOptions: MRT_TableOptions<MRT_RowData> = {
    ...tableOptions,
    columns: columns, // 컬럼
    data: data, // 데이터
    rowCount: Infinity,

    manualPagination: true,
    paginationDisplayMode: 'pages',
    onPaginationChange: setPagination,

    enableStickyHeader: true,
    enablePinning: true,

    createDisplayMode: 'row',
    editDisplayMode: editDisplayMode,

    enableEditing:
      tableOptions.enableEditing && (tableOptions.enableCreate || tableOptions.enableEdit), // 버튼 옵션에 수정이 있는
    enableRowSelection: tableOptions.enableDelete, // 삭제 플래그 있을 경우

    onRowSelectionChange: setRowSelection, // 행 체크 시 이벤트
    enableBatchRowSelection: true, // 쉬프트 누르고 배치 선택

    selectAllMode: 'page',

    state: {
      ...tableOptions.state,
      isLoading: isLoading,
      isSaving: createResult.isPending || updateResult.isPending || deleteResult.isPending,
      showAlertBanner: true,
      showProgressBars: isFetching,
      pagination,
      rowSelection,
    },

    getRowId: getRowId, // 기본키로 row id 생성 함수

    onCreatingRowSave: onCreatingRowSave,

    renderRowActions: renderRowActions,
    renderTopToolbarCustomActions: renderTopToolbarCustomActions,
  }

  if (editDisplayMode == 'freeform') {
    MRT_TableOptions.enableRowSelection = false
    MRT_TableOptions.mantineTableBodyRowProps = ({ row }) => ({
      //implement row selection click events manually
      onClick: () => {
        setRowSelection(
          rowSelection[row.id]
            ? {}
            : {
                [row.id]: true,
              },
        )
        formdataRef.current = {
          id: row.id,
          original: { ...row.original },
          update: {},
        }
        // setSelectedRow(rowSelection[row.id] ? {} : row)
      },
      selected: rowSelection[row.id],
      style: {
        cursor: 'pointer',
      },
    })
  } else if (editDisplayMode == 'table') {
    MRT_TableOptions.onEditingRowChange = onEditingRowChange
    MRT_TableOptions.state.columnPinning = {
      left: ['mrt-row-select', 'MRT_State'],
    }
    MRT_TableOptions.mantineTableBodyRowProps = undefined
  } else if (editDisplayMode == 'row') {
    MRT_TableOptions.onEditingRowSave = onEditingRowSave
    // tableOptions.onEditingRowCancel = ({ row, table }) => {
    //     console.log("onEditingRowCancel");
    //     console.log(row);
    // };
    MRT_TableOptions.state.columnPinning = {
      left: ['mrt-row-select', 'MRT_State'],
    }
    MRT_TableOptions.mantineTableBodyRowProps = undefined
  }

  if (tableOptions.mantineTableBodyRowProps) {
    MRT_TableOptions.mantineTableBodyRowProps = tableOptions.mantineTableBodyRowProps
  }

  const [table, setTable] = useState(
    useMantineReactTable(MRT_TableOptions as MRT_TableOptions<MRT_RowData>),
  )

  // if (createResult.isError) {
  //   return <Alert>{createResult.error.message}</Alert>
  // }

  return (
    <>
      {MRT_TableOptions.enableEditing ? (
        <>
          <SegmentedControl
            value={editDisplayMode}
            onChange={(value) => {
              setEditDisplayMode(value)
              queryClient.invalidateQueries({ queryKey })
              refetch()
            }}
            data={editDisplayModeList.map(([value, label]) => ({ value, label }))}
            // transitionDuration={500}
            transitionTimingFunction="linear"
          />
          {/* <Tabs
          value={editDisplayMode}
          onChange={(value) => {
            // if (
            //   table.getState().creatingRow ||
            //   table.getState().editingRow ||
            //   Object.keys(editedRows).length > 0
            // ) {
            //   return toast('작업 완료 후 진행해주세요', {
            //     icon: '⚠️',
            //   })
            // }
            refetch()
            setEditedRows(initState.editedRows)
            setPagination(initState.pagination)
            setRowSelection(initState.rowSelection)
            setEditDisplayMode(value || '')
          }}
        >
          <Tabs.List className={classes.list}>
            {editDisplayModeList.map(([key, label]) => (
              <Tabs.Tab key={key} value={key}>
                {label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <MantineReactTable table={table} />
        </Tabs> */}
          <MantineReactTable table={table} />
        </>
      ) : (
        <MantineReactTable table={table} />
      )}
    </>
  )
}

export default MRT_Table
