import { useEffect, useMemo, useState } from 'react';
import { 
  MantineReactTable, 
  useMantineReactTable, 
  type MRT_RowSelectionState, 
  type ColumnDef, 
  type MRT_Cell 
} from 'mantine-react-table';
import { Checkbox } from '@mantine/core'; 


const BasicTable = (props) => {
  const {columns, data} = props
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const table = useMantineReactTable({
    columns,
    data,
    getRowId: (row) => row.userId,
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: () =>
        setRowSelection({
          [row.id]: true,
      }),
      selected: rowSelection[row.id],
      style: {
        cursor: 'pointer',
      },
    }),
    state: { rowSelection },
  });

  // return <MantineReactTable table={table} />;
  return (
    <MantineReactTable 
        table={table} 
        renderCell={({ cell }) => {
            if (cell.column.accessorKey === 'checked') {
                return (
                    <Checkbox 
                        checked={cell.getValue()} 
                        onChange={() => { 
                            // Update the data in the table (example)
                            const updatedData = data.map((row) => {
                                if (row.id === cell.row.id) {
                                    return { 
                                        ...row, 
                                        checked: !row.checked 
                                    };
                                }
                                return row;
                            });
                            // Assuming you have a way to update the data source 
                            // (e.g., using a state variable or a function)
                            // setData(updatedData); 
                        }} 
                    />
                );
            }
            return cell.renderCell(); 
        }}
    /> 
);

};

export default BasicTable;
