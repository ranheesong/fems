import { Grid, TextInput } from '@mantine/core'
import dayjs from 'dayjs'
import { MRT_Column, MRT_RowData } from 'mantine-react-table'
import { useState, useEffect } from 'react'
import { EditForm } from '@/app/components/MRT_EditCellInputs'

const FreeForm = ({ table, row, onChange }) => {
  const createData = table.getAllColumns().reduce((obj, column) => {
    const defaultValue = column.columnDef.defaultValue
    obj[column.id] = typeof defaultValue == 'function' ? defaultValue() : defaultValue || ''
    return obj
  }, {})
  const [formdata, setFormdata] = useState<Record<string, any>>(
    row.id ? row['original'] : createData,
  )

  // values가 변경될 때마다 formdata를 동기화
  useEffect(() => {
    const formdata = row.id ? { ...row['original'], ...row['update'] } : createData
    setFormdata(formdata)
  }, [row]) // values가 변경될 때마다 formdata를 업데이트

  const handleOnChange = (column: MRT_Column<MRT_RowData>) => (e) => {
    let newValue
    if (e == null) newValue = ''
    else if (e.target == null) newValue = e
    else newValue = e.target.value

    console.log({ newValue })

    const editProps = column.columnDef.editProps
    switch (editProps.type) {
      case 'checkbox':
        newValue = editProps.data[e.target.checked ? 'checked' : 'unchecked']
        break
      case 'date':
        newValue = newValue != '' ? dayjs(newValue).format('YYYY-MM-DD HH:mm:ss') : ''
        break
      default:
        break
    }
    // if (row.id != null) {
    //   row['update'][column.id] = newValue
    // }
    onChange({ ...formdata, [column.id]: newValue })
    setFormdata({ ...formdata, [column.id]: newValue })
  }

  const handleBlur = (column: MRT_Column<MRT_RowData>) => () => {}

  return (
    <Grid grow align="flex-end">
      {table
        .getAllColumns()
        .filter(
          (column: MRT_Column<MRT_RowData>) =>
            !column.id.toLocaleLowerCase().startsWith('mrt') && column.columnDef.editProps != null,
        )
        .map((column: MRT_Column<MRT_RowData>) => {
          return (
            <Grid.Col key={column.id} span={column.columnDef.span ? column.columnDef.span : 2}>
              {column.columnDef.enableEditing == false ? (
                <TextInput
                  readOnly
                  label={column.columnDef.header}
                  value={formdata[column.id] || column.columnDef.defaultValue || ''}
                />
              ) : (
                EditForm({
                  column,
                  value: formdata[column.id] || column.columnDef.defaultValue || '',
                  handleOnChange: handleOnChange(column),
                  handleBlur: handleBlur(column),
                })
              )}
            </Grid.Col>
          )
        })}
    </Grid>
  )
}

export default FreeForm
