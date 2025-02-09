import { MRT_RowData } from "mantine-react-table";
import {
    MantineTableCellProps,
    useMRT_EditCell,
} from "@/app/hooks/useMRT_EditCell";
import { Autocomplete, Center, Checkbox, Select } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";

export type CheckboxMappingData = {
    checked: any;
    unchecked: any;
};

export function EditCheckbox(props: MantineTableCellProps<MRT_RowData>) {
    const { value, handleOnChange, handleBlur } = useMRT_EditCell(props);

    const find = Object.entries(props.column.columnDef.editProps.data).find(
        ([k, v]) => v == value
    );
    return (
        <Checkbox
            checked={find ? find[0] == "checked" : false}
            onBlur={handleBlur}
            onChange={handleOnChange}
        />
    );
}

export function EditDatePicker(props: MantineTableCellProps<MRT_RowData>) {
    const { value, handleOnChange, handleBlur } = useMRT_EditCell(props);

    return (
        <DateTimePicker
            value={value ? new Date(value) : new Date()}
            withSeconds
            valueFormat="YYYY-MM-DD H:mm:ss"
            placeholder="날짜 선택"
            onChange={handleOnChange}
            onBlur={handleBlur}
        />
    );
}
