import {
    MRT_Cell,
    MRT_Column,
    MRT_Row,
    MRT_RowData,
    MRT_TableInstance,
} from "mantine-react-table";
import { useState } from "react";
import {
    getValue,
    MRT_InlineColumnDef,
} from "../components/inline/MR_InlineTable";

function formatDate(date) {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1
    const day = String(d.getDate()).padStart(2, "0");
    const hours = d.getHours(); // 24시간 형식
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export type MantineTableCellProps<TData extends MRT_RowData> = {
    cell: MRT_Cell<TData>;
    column: MRT_Column<TData>;
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
};

export function useMRT_EditCell<TData extends MRT_RowData>(
    props: MantineTableCellProps<TData>
) {
    const { cell, column, row, table } = props;

    const { getState, setEditingCell, setEditingRow, setCreatingRow } = table;
    const { editingRow, creatingRow } = getState();

    const [value, setValue] = useState(getValue(cell));

    const isCreating = creatingRow?.id === row.id;
    const isEditing = editingRow?.id === row.id;

    const columnDef = column.columnDef as MRT_InlineColumnDef;

    const handleOnChange = (e) => {
        let newValue;
        if (e == null) newValue = "";
        else if (e.target == null) newValue = e;
        else newValue = e.target.value;

        console.log({ newValue });

        const editProps = columnDef.editProps;
        switch (editProps.type) {
            case "checkbox":
                newValue =
                    editProps.data[e.target.checked ? "checked" : "unchecked"];
                break;
            case "date":
                newValue = newValue != "" ? formatDate(newValue) : "";
                break;
            case "modal":
                break;

            default:
                break;
        }
        //@ts-ignore
        row._valuesCache[column.id] = newValue;
        if (isCreating) setCreatingRow(row);
        else if (isEditing) setEditingRow(row);
        setValue(newValue);
    };

    const handleBlur = () => {
        setEditingCell(null);
    };
    return { value, handleOnChange, handleBlur };
}
