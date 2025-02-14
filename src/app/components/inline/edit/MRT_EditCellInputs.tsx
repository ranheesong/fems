import {
    MantineReactTable,
    MRT_RowData,
    MRT_RowSelectionState,
    useMantineReactTable,
} from "mantine-react-table";
import {
    MantineTableCellProps,
    useMRT_EditCell,
} from "@/app/hooks/useMRT_EditCell";
import {
    ActionIcon,
    Alert,
    Autocomplete,
    Center,
    Checkbox,
    Flex,
    Input,
    MultiSelect,
    Select,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { IconSearch } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import MRT_InlineTable from "../MR_InlineTable";
import { useEffect, useMemo, useState } from "react";

export type CheckboxMappingData = {
    checked: any;
    unchecked: any;
};

export function EditText(props: MantineTableCellProps<MRT_RowData>) {
    const { value, handleOnChange, handleBlur } = useMRT_EditCell(props);
    return (
        <Input
            value={value}
            onChange={handleOnChange}
            onBlur={handleBlur}
            placeholder={props.column.columnDef.header}
        />
    );
}

export function EditSelect(props: MantineTableCellProps<MRT_RowData>) {
    const { value, handleOnChange, handleBlur } = useMRT_EditCell(props);
    return (
        <Select
            value={value}
            data={props.column.columnDef.editProps.data}
            onChange={handleOnChange}
            onBlur={handleBlur}
            placeholder={props.column.columnDef.header}
            searchable
            clearable
            nothingFoundMessage="일치하는 데이터가 없습니다"
        />
    );
}

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
            placeholder={props.column.columnDef.header}
        />
    );
}

export function EditDatePicker(props: MantineTableCellProps<MRT_RowData>) {
    const { value, handleOnChange, handleBlur } = useMRT_EditCell(props);

    return (
        <DateTimePicker
            value={value ? new Date(value) : ""}
            clearable
            withSeconds
            valueFormat="YYYY-MM-DD H:mm:ss"
            placeholder={props.column.columnDef.header}
            onChange={handleOnChange}
            onBlur={handleBlur}
        />
    );
}

export function EditModal(props: MantineTableCellProps<MRT_RowData>) {
    const { value, handleOnChange } = useMRT_EditCell(props);
    const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
    useEffect(() => {
        console.log(rowSelection);
    }, [rowSelection]);

    return (
        <>
            <Flex gap={8} align={"center"}>
                <ActionIcon
                    variant="transparent"
                    onClick={() => {
                        modals.open({
                            title: `${props.column.columnDef.header} 모달`,
                            size: "1000px",
                            children: (
                                <MRT_InlineTable
                                    columns={
                                        props.column.columnDef.editProps.columns
                                    }
                                    data={props.column.columnDef.editProps.data}
                                    mantineTableBodyRowProps={({ row }) => ({
                                        //implement row selection click events manually
                                        onClick: () =>
                                            setRowSelection({
                                                [row.id]: true,
                                            }),
                                        onDoubleClick: (e) => {
                                            handleOnChange(
                                                row.original[props.column.id]
                                            );
                                            modals.closeAll();
                                        },
                                        selected: rowSelection[row.id],
                                        style: {
                                            cursor: "pointer",
                                        },
                                    })}
                                    state={rowSelection}
                                    onRowSelectionChange={setRowSelection}
                                />
                            ),
                        });
                    }}
                >
                    <IconSearch color="#868e96" />
                </ActionIcon>
                <Input
                    value={value}
                    readOnly
                    onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                />
            </Flex>
        </>
    );
}
