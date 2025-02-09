"use client";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useEffect, useMemo, useRef, useState } from "react";
import {
    MantineReactTable,
    // createRow,
    type MRT_ColumnDef,
    type MRT_Row,
    MRT_RowData,
    MRT_RowSelectionState,
    type MRT_TableOptions,
    useMantineReactTable,
    MRT_EditCellTextInput,
} from "mantine-react-table";
import {
    ActionIcon,
    Autocomplete,
    Button,
    Center,
    Checkbox,
    ComboboxData,
    Flex,
    Select,
    Text,
    Tooltip,
} from "@mantine/core";
import { ModalsProvider, modals } from "@mantine/modals";
import {
    IconEdit,
    IconRefresh,
    IconSearch,
    IconTrash,
    IconView360,
} from "@tabler/icons-react";
import {
    QueryClient,
    QueryClientProvider,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    CheckboxMappingData,
    EditCheckbox,
    EditDatePicker,
} from "./edit/MRT_EditCellInputs";
import { v4 as uuidv4 } from "uuid";
import { getCoreRowModel } from "@tanstack/react-table";
import DateTimePicker from "react-datetime-picker";
// 기존 MRT_TableOptions에 새로운 속성 추가하기

export type InlineColumnDef = MRT_ColumnDef<MRT_RowData> & {
    primaryKey?: boolean;
    defaultValue?: string;
    editProps?: {
        type: "text" | "select" | "date" | "checkbox" | "modal";
        data?: ComboboxData | CheckboxMappingData | undefined;
    };
};

interface MRT_InlineTableOptions extends MRT_TableOptions<MRT_RowData> {
    // 새로운 속성 추가
    // 컬럼
    columns: InlineColumnDef[];
    // 버튼
    enableCreate?: boolean;
    enableEdit?: boolean;
    enableDelete?: boolean;

    // 추가 함수
    onCreate?: (data: {}) => void;
    // 저장 함수
    onSave?: (data: []) => void;
    // 삭제 함수
    onDelete?: (data: {}) => void;
}

const getEditComponent = (editProps: {
    type: "text" | "select" | "date" | "checkbox" | "modal";
    data?: ComboboxData | CheckboxMappingData | undefined;
}) => {
    switch (editProps.type) {
        case "text":
            return {
                mantineEditTextInputProps: {
                    type: "text",
                    required: true,
                },
            };
        case "select":
            return {
                Cell: ({ column, row }) =>
                    editProps.data.find(
                        (data) =>
                            data.value == row._valuesCache[column.id] ||
                            row.original[column.id]
                    )["label"],
                editVariant: "select",
                mantineEditSelectProps: {
                    data: editProps.data,
                },
            };
        case "checkbox":
            return {
                Cell: ({ column, row }) => {
                    const value =
                        row._valuesCache[column.id] || row.original[column.id];
                    const find = Object.entries(editProps.data).find(
                        ([k, v]) => v === value
                    );

                    return (
                        <Checkbox
                            disabled
                            checked={find ? find[0] == "checked" : false}
                        />
                    );
                },
                Edit: EditCheckbox,
            };
        case "date":
            return {
                Cell: ({ column, row }) => {
                    const value =
                        row._valuesCache[column.id] || row.original[column.id];
                    return value;
                },
                Edit: EditDatePicker,
            };
        case "modal":
            return {
                Cell: ({ column, row }) => {
                    const value =
                        row._valuesCache[column.id] || row.original[column.id];
                    return value;
                },
                Edit: ({ column, row }) => {
                    const value =
                        row._valuesCache[column.id] || row.original[column.id];
                    return (
                        <>
                            <Flex gap={8} align={"center"}>
                                <Text>{value}</Text>
                                <ActionIcon color="cyan" onClick={() => {}}>
                                    <IconSearch />
                                </ActionIcon>
                            </Flex>
                        </>
                    );
                },
            };
            break;

        default:
            break;
    }
};

const InlineTable = (inlineTableOptions: MRT_InlineTableOptions) => {
    let mrt_rowDataRef = useRef([...inlineTableOptions.data]);

    // pk 리스트 생성
    const primaryKeys = useMemo(() => {
        let primaryKeys = inlineTableOptions.columns
            .filter((column) => column.primaryKey)
            .map((column) => column.id || column.accessorKey);
        if (primaryKeys.length == 0) {
            mrt_rowDataRef.current = mrt_rowDataRef.current.map(
                (data, index) => ({
                    ...data,
                    MTR_RowId: index,
                })
            );
            primaryKeys = ["MTR_RowId"];
        }
        primaryKeys = primaryKeys.filter((key) => key != null);
        return primaryKeys;
    }, []);

    const [data, setData] = useState<MRT_RowData[]>([]);
    const [changedRows, setChangedRows] = useState<MRT_RowData[]>([]);
    const [saveButtonDisabled, setSaveButtonDisabled] = useState<boolean>(true);
    const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

    useEffect(() => {
        if (changedRows.length == 0) {
            document.querySelectorAll("tbody tr").forEach((tr) => {
                tr.style.backgroundColor = "";
            });
        }
    }, [changedRows]);
    const columns = useMemo<InlineColumnDef[]>(
        () =>
            inlineTableOptions.columns.map((column) => {
                if (column.editProps) {
                    return {
                        ...column,
                        ...getEditComponent(column.editProps),
                    };
                } else return column;
            }),
        []
    );

    //CREATE action
    const handleCreate: MRT_TableOptions<MRT_RowData>["onCreatingRowSave"] =
        async (props) => {
            const columns = props.table
                .getAllColumns()
                .filter((column) => !column.id.startsWith("mrt-row"));
            const data = {
                ...Object.fromEntries(
                    columns.map((column) => [
                        column.id,
                        column.columnDef.defaultValue || "",
                    ])
                ),
                ...props.values,
            };
            inlineTableOptions.onCreate(data);
            props.exitCreatingMode();
        };

    //UPDATE action
    const saveChangeRows = ({ table }) => {
        const changedRows = [];

        table.getRowModel().rows.forEach((row, index) => {
            const obj = {};
            let changeFlag = false;
            for (const column of Object.keys(row.original)) {
                const originalValue = row.original[column];
                const changedValue = row._valuesCache[column];

                obj[column] = originalValue;
                if (
                    originalValue != changedValue &&
                    changedValue != undefined
                ) {
                    obj[column] = changedValue;
                    changeFlag = true;
                }
            }
            document.querySelectorAll("tbody tr").forEach((tr) => {
                if (tr.dataset.index == index) {
                    tr.style.backgroundColor = "";
                }
            });
            if (changeFlag) {
                changedRows.push(obj);
                document.querySelectorAll("tbody tr").forEach((tr) => {
                    if (tr.dataset.index == index) {
                        tr.style.backgroundColor = "rgb(205, 171, 176)";
                    }
                });
            }
        });

        setChangedRows(changedRows);
        setSaveButtonDisabled(changedRows.length == 0);

        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = () =>
        modals.openConfirmModal({
            title: "삭제 알림",
            children: (
                <Text>
                    선택된 {Object.keys(rowSelection).length}개의 데이터를 정말
                    삭제하시겠습니까?
                </Text>
            ),
            labels: { confirm: "삭제", cancel: "취소" },
            confirmProps: { color: "red" },
            onConfirm: () => {
                inlineTableOptions.onDelete(rowSelection);
                setRowSelection({}); // 체크 해제
            },
        });

    const getRowId = (row) => () => {
        return inlineTableOptions.getRowId
            ? inlineTableOptions.getRowId
            : (row) =>
                  primaryKeys.map((primaryKey) => row[primaryKey]).join("-");
    };

    const table = useMantineReactTable({
        columns: columns,
        data: mrt_rowDataRef.current,
        createDisplayMode: "row", // 고정
        editDisplayMode: "row", // 고정
        enableEditing:
            inlineTableOptions.enableCreate || inlineTableOptions.enableEdit, // 버튼 옵션에 수정이 있는
        enableRowSelection: inlineTableOptions.enableDelete, // 삭제 플래그 있을 경우
        onRowSelectionChange: setRowSelection, // 행 체크 시 이벤트
        selectAllMode: "page",
        state: { rowSelection },
        getRowId: (row) => getRowId(row),
        onCreatingRowSave: handleCreate,
        onEditingRowSave: saveChangeRows,
        renderRowActions: ({ row, table }) => {
            return (
                inlineTableOptions.enableEdit && (
                    <Flex gap={"xs"}>
                        <Tooltip label="수정">
                            <ActionIcon
                                onClick={() => table.setEditingRow(row)}
                            >
                                <IconEdit />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="초기화">
                            <ActionIcon
                                color="green"
                                onClick={() => {
                                    modals.openConfirmModal({
                                        title: "초기화 알림",
                                        children: (
                                            <Text>
                                                행을 초기화하시겠습니까?
                                            </Text>
                                        ),
                                        labels: {
                                            confirm: "초기화",
                                            cancel: "취소",
                                        },
                                        confirmProps: { color: "green" },
                                        onConfirm: () => {
                                            const columns = table
                                                .getAllColumns()
                                                .filter(
                                                    (column) =>
                                                        !column.id.startsWith(
                                                            "mrt-row"
                                                        )
                                                );

                                            for (const column of columns) {
                                                row._valuesCache[column.id] =
                                                    column.columnDef
                                                        .enableEditing === false
                                                        ? undefined
                                                        : row.original[
                                                              column.id
                                                          ];
                                            }
                                            saveChangeRows({ table });
                                        },
                                    });
                                }}
                            >
                                <IconRefresh />
                            </ActionIcon>
                        </Tooltip>
                    </Flex>
                )
            );
        },
        renderTopToolbarCustomActions: ({ table }) => {
            return (
                <Flex gap={"xs"}>
                    {inlineTableOptions.enableCreate && (
                        <Button
                            onClick={() => {
                                const row = { ...table.getRowModel().rows[0] };

                                table.setCreatingRow(row);
                            }}
                        >
                            추가
                        </Button>
                    )}
                    {inlineTableOptions.enableEdit && (
                        <Button
                            disabled={saveButtonDisabled}
                            onClick={() => {
                                modals.openConfirmModal({
                                    title: "저장 알림",
                                    children: (
                                        <Text>
                                            수정된 {changedRows.length}개의 행을
                                            저장하시겠습니까?
                                        </Text>
                                    ),
                                    labels: { confirm: "저장", cancel: "취소" },
                                    confirmProps: { color: "blue" },
                                    onConfirm: () => {
                                        inlineTableOptions.onSave(changedRows);

                                        const rows = table.getRowModel().rows;
                                        const length = rows.length;
                                        for (
                                            let index = 0;
                                            index < length;
                                            index++
                                        ) {
                                            const row = rows[index];
                                            for (const column of Object.keys(
                                                row.original
                                            )) {
                                                console.log({
                                                    o: row.original[column],
                                                    c: row._valuesCache[column],
                                                });
                                                if (
                                                    row._valuesCache[column] !=
                                                    null
                                                ) {
                                                    row.original[column] =
                                                        row._valuesCache[
                                                            column
                                                        ];
                                                }
                                            }
                                        }
                                        // table
                                        //     .getRowModel()
                                        //     .rows.forEach((row, index) => {
                                        //         for (const column of Object.keys(
                                        //             row.original
                                        //         )) {
                                        //             row.original[column] =
                                        //                 row._valuesCache[
                                        //                     column
                                        //                 ];
                                        //         }
                                        //     });
                                        setChangedRows([]);
                                    },
                                });
                            }}
                        >
                            저장
                        </Button>
                    )}
                    {inlineTableOptions.enableDelete && (
                        <Button
                            color="red"
                            disabled={Object.keys(rowSelection).length === 0}
                            onClick={() => {
                                modals.openConfirmModal({
                                    title: "삭제 알림",
                                    children: (
                                        <Text>
                                            선택된{" "}
                                            {Object.keys(rowSelection).length}
                                            개의 데이터를 정말 삭제하시겠습니까?
                                        </Text>
                                    ),
                                    labels: { confirm: "삭제", cancel: "취소" },
                                    confirmProps: { color: "red" },
                                    onConfirm: () => {
                                        const rows = table.getRowModel.rows;
                                        inlineTableOptions.onDelete(
                                            rowSelection
                                        );
                                        setRowSelection({}); // 체크 해제
                                    },
                                });
                            }}
                        >
                            삭제
                        </Button>
                    )}
                </Flex>
            );
        },
    });

    return <MantineReactTable table={table} />;
};

const queryClient = new QueryClient();

const MRT_InlineTable = (props: MRT_InlineTableOptions) => (
    //Put this with your other react-query providers near root of your app
    <QueryClientProvider client={queryClient}>
        <ModalsProvider>
            <InlineTable {...props} />
        </ModalsProvider>
    </QueryClientProvider>
);

export default MRT_InlineTable;

// const defaultProps: MRT_InlineTableOptions = {
//     enableCreate: false,
//     enableEdit: false,
//     enableDelete: false,
// };

// MRT_InlineTable.defaultProps = defaultProps;
