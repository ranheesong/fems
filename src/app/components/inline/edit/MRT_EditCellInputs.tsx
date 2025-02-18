import { MRT_RowData, MRT_RowSelectionState } from "mantine-react-table";
import {
    MantineTableCellProps,
    useMRT_EditCell,
} from "@/app/hooks/useMRT_EditCell";
import {
    ActionIcon,
    Checkbox,
    Flex,
    Select,
    Text,
    TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { IconSearch } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import MRT_InlineTable, { MRT_InlineColumnDef } from "../MRT_InlineTable";
import { useEffect, useState } from "react";

import dayjs from "dayjs";

export type CheckboxMappingData = {
    checked: any;
    unchecked: any;
};

// 메인 컴포넌트에서 반복문을 통한 동적 렌더링
const EditFieldMapper = {
    text: EditText,
    select: EditSelect,
    checkbox: EditCheckbox,
    date: EditDatePicker,
    modal: EditModal,
};

export const EditForm = ({ column, value, handleOnChange, handleBlur }) => {
    const EditComponent = EditFieldMapper[column.columnDef.editProps.type];

    return EditComponent ? (
        <EditComponent
            key={column.id}
            label={column.columnDef.header}
            value={value}
            handleOnChange={handleOnChange}
            handleBlur={handleBlur}
            column={column}
        />
    ) : null;
};

export const EditCell = (props: MantineTableCellProps<MRT_RowData>) => {
    const { value, handleOnChange, handleBlur } = useMRT_EditCell(props);
    const { column } = props;
    const EditComponent = EditFieldMapper[column.columnDef.editProps.type];

    return EditComponent ? (
        <EditComponent
            key={column.id}
            value={value}
            handleOnChange={handleOnChange}
            handleBlur={handleBlur}
            column={column}
        />
    ) : null;
};

export function EditText(props) {
    const { column, value, handleOnChange, handleBlur } = props;
    return (
        <TextInput
            label={props.label ? props.label : ""}
            value={value}
            onChange={handleOnChange}
            onBlur={handleBlur}
            placeholder={column.columnDef.header}
        />
    );
}

export function EditSelect(props) {
    const { column, value, handleOnChange, handleBlur } = props;
    console.log({ value });

    return (
        <Select
            label={props.label ? props.label : ""}
            value={value == "" ? null : value}
            data={column.columnDef.editProps.data}
            onChange={handleOnChange}
            onBlur={handleBlur}
            placeholder={column.columnDef.header}
            searchable
            clearable
            nothingFoundMessage="일치하는 데이터가 없습니다"
        />
    );
}

export function EditCheckbox(props) {
    const { column, value, handleOnChange, handleBlur } = props;

    const find = Object.entries(column.columnDef.editProps.data).find(
        ([, v]) => v == value
    );
    return (
        <Checkbox
            label={props.label ? props.label : ""}
            checked={find ? find[0] == "checked" : false}
            onBlur={handleBlur}
            onChange={handleOnChange}
            placeholder={column.columnDef.header}
        />
    );
}

export function EditDatePicker(props) {
    const { column, value, handleOnChange, handleBlur } = props;

    return (
        <DateTimePicker
            label={props.label ? props.label : ""}
            value={value ? new Date(value) : undefined}
            clearable
            withSeconds
            valueFormat="YYYY-MM-DD H:mm:ss"
            placeholder={column.columnDef.header}
            onChange={handleOnChange}
            onBlur={handleBlur}
        />
    );
}

export function EditModal(props) {
    const { column, value, handleOnChange, handleBlur } = props;

    return (
        <>
            <Flex gap={2} align={"flex-end"}>
                <ActionIcon
                    mb={4}
                    variant="transparent"
                    onClick={() => {
                        modals.open({
                            title: `${column.columnDef.header} 모달`,
                            size: "1000px",
                            children: (
                                <MRT_InlineTable
                                    columns={column.columnDef.editProps.columns}
                                    data={column.columnDef.editProps.data}
                                    enableEditing={false}
                                    editDisplayMode={undefined}
                                    mantineTableBodyRowProps={({
                                        row,
                                        table,
                                    }) => ({
                                        //implement row selection click events manually
                                        onDoubleClick: (e) => {
                                            handleOnChange(
                                                row.original[column.id]
                                            );
                                            handleBlur(e);
                                            modals.closeAll();
                                        },
                                        style: {
                                            cursor: "pointer",
                                        },
                                    })}
                                />
                            ),
                        });
                    }}
                >
                    <IconSearch color="#868e96" />
                </ActionIcon>
                <TextInput
                    label={props.label ? props.label : ""}
                    value={value}
                    readOnly
                />
            </Flex>
        </>
    );
}
