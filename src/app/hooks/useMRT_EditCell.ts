import { MRT_Cell, MRT_Column, MRT_Row, MRT_RowData, MRT_TableInstance } from 'mantine-react-table'
import { useEffect, useState } from 'react'
import { getValue, MRT_ColumnDefExtend } from '@/app/components/MRT_Table'
import dayjs from 'dayjs'

export type MantineTableCellProps<TData extends MRT_RowData> = {
  cell: MRT_Cell<TData>
  column: MRT_Column<TData>
  row: MRT_Row<TData>
  table: MRT_TableInstance<TData>
}

export function useMRT_EditCell<TData extends MRT_RowData>(props: MantineTableCellProps<TData>) {
  const { cell, column, row, table } = props

  const { getState, setEditingCell, setEditingRow, setCreatingRow } = table
  const { editingRow, creatingRow } = getState()

  const cellValue = getValue(cell)
  const [value, setValue] = useState(cellValue)

  // 테이블 데이터 최신화할 경우 state 값 초기화
  useEffect(() => {
    setValue(cellValue)
  }, [cell, cellValue])

  const isCreating = creatingRow?.id === row.id
  const isEditing = editingRow?.id === row.id

  const columnDef = column.columnDef as MRT_ColumnDefExtend

  const handleOnChange = (e) => {
    let newValue
    if (e == null) newValue = ''
    else if (e.target == null) newValue = e
    else newValue = e.target.value

    console.log({ newValue })

    const editProps = columnDef.editProps
    switch (editProps.type) {
      case 'checkbox':
        newValue = editProps.data[e.target.checked ? 'checked' : 'unchecked']
        break
      case 'date':
        newValue = newValue != '' ? dayjs(newValue).format('YYYY-MM-DD HH:mm:ss') : ''
        break
      case 'modal':
        break

      default:
        break
    }
    setValue(newValue)

    //@ts-ignore
    row._valuesCache[column.id] = newValue
    if (editProps.type != 'text') setEditingRow(row)
  }

  const handleBlur = (e) => {
    if (table.options.editDisplayMode == 'table') {
      setEditingRow(row)
      console.log({ row })
    }
  }
  return { value, handleOnChange, handleBlur }
}
