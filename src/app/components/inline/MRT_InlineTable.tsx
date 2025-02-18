"use client";

import classes from "@/app/css/Tab.module.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    MantineReactTable,
    // createRow,
    type MRT_ColumnDef,
    type MRT_Row,
    MRT_RowData,
    MRT_RowSelectionState,
    type MRT_TableOptions,
    useMantineReactTable,
    createRow,
    MRT_TableInstance,
    MRT_Cell,
} from "mantine-react-table";
import {
    ActionIcon,
    Button,
    Checkbox,
    ComboboxData,
    Flex,
    FloatingIndicator,
    Input,
    Stack,
    Tabs,
    Text,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
    IconEdit,
    IconKeyFilled,
    IconMoodEdit,
    IconMoodPlus,
    IconRefresh,
} from "@tabler/icons-react";
import {
    CheckboxMappingData,
    EditCell,
    EditCheckbox,
    EditDatePicker,
    EditField,
    EditForm,
    EditModal,
    EditSelect,
    EditText,
} from "./edit/MRT_EditCellInputs";
import {
    MantineTableCellProps,
    useMRT_EditCell,
} from "@/app/hooks/useMRT_EditCell";
import { OnChangeFn } from "@tanstack/react-table";
import toast from "react-hot-toast";
import dayjs from "dayjs";

// 기존 MRT_TableOptions에 새로운 속성 추가하기
// 컬럼 속성
export type MRT_InlineColumnDef = MRT_ColumnDef<MRT_RowData> & {
    primaryKey?: boolean; // 기본 키 여부
    defaultValue?: string | (() => string); // 기본 값
    enableCreating?: boolean; // 추가 시 입력 가능 여부
    enableEditing?: boolean; // 수정 시 입력 가능 여부
    editProps?: {
        // 추가/수정 속성
        type: "text" | "select" | "date" | "checkbox" | "modal"; // 셀 타입
        columns?: MRT_InlineColumnDef[];
        data?: ComboboxData | CheckboxMappingData | MRT_RowData | undefined; // select, checkbox 타입의 매핑 데이터
    };
};

interface MRT_InlineTableOptions extends MRT_TableOptions<MRT_RowData> {
    columns: MRT_InlineColumnDef[]; // 컬럼 속성 변경

    enableCreate?: boolean; // 추가 가능 여부
    enableEdit?: boolean; // 수정 가능 여부
    enableDelete?: boolean; // 삭제 가능 여부

    onCreate?: (data: MRT_RowData) => void; // 추가 함수
    onSave?: (data: MRT_RowData[]) => void; // 저장 함수
    onDelete?: (data: MRT_RowData[]) => void; // 삭제 함수

    refetch?: () => void;
}

// 상태 표시 컬럼럼
const MRT_StateColumn: MRT_InlineColumnDef = {
    id: "MRT_State",
    header: "상태",
    enableEditing: false,
    size: 80,
    defaultValue: "추가",
    Cell: (props: MantineTableCellProps<MRT_RowData>) => {
        const stateMessage =
            props.row._valuesCache.MRT_State || props.row.original.MRT_State;
        return (
            <Flex align={"center"}>
                <Tooltip label={stateMessage}>
                    {stateMessage == "추가" ? (
                        <IconMoodPlus color={"#1c7ed6"} />
                    ) : stateMessage == "수정" ? (
                        <IconMoodEdit color={"#f06e27"} />
                    ) : (
                        <Text></Text>
                    )}
                </Tooltip>
            </Flex>
        );
    },
};

// 현재 CELL 값 조회
export const getValue = (cell: MRT_Cell<MRT_RowData>) => {
    let inputValue;
    if (cell.row._valuesCache[cell.column.id] != null) {
        inputValue = cell.row._valuesCache[cell.column.id];
    } else if (cell.getValue() != null) {
        inputValue = cell.getValue();
    } else {
        inputValue = cell.row.original[cell.column.id];
    }
    return inputValue;
};

// 수정 타입별 컴포넌트
const editRenderProps = {
    text: {
        Cell: ({ cell }: MantineTableCellProps<MRT_RowData>) => {
            const value = getValue(cell);
            return value;
        },
    },
    select: {
        Cell: ({ cell, column }: MantineTableCellProps<MRT_RowData>) => {
            const find = column.columnDef.editProps.data.find(
                (data) => data.value == getValue(cell)
            );

            return find ? find["label"] : "";
        },
    },
    checkbox: {
        Cell: ({ cell, column }: MantineTableCellProps<MRT_RowData>) => {
            const value = getValue(cell);
            const find = Object.entries(column.columnDef.editProps.data).find(
                ([, v]) => v === value
            );

            return (
                <Checkbox
                    checked={find ? find[0] == "checked" : false}
                    readOnly
                />
            );
        },
    },
    date: {
        Cell: ({ cell }: MantineTableCellProps<MRT_RowData>) => {
            const value = getValue(cell);
            return value;
        },
    },
    modal: {
        Cell: ({ cell }: MantineTableCellProps<MRT_RowData>) => {
            const value = getValue(cell);
            return <TextInput value={value} readOnly />;
        },
    },
};

// 행 변경 확인
export const hasRowChanged = (row: MRT_Row<MRT_RowData>) => {
    const isChanged = row
        .getAllCells()
        .filter((cell) => {
            const { column } = cell;
            const { columnDef } = column;
            // enableEditing이 참
            // editProps의 타입이 있음
            // mrt-row로 시작하지 않음
            // MRT_State 이면 안됨
            return (
                columnDef.enableEditing != false &&
                columnDef.editProps.type != null &&
                !column.id.startsWith("mrt-row") &&
                column.id != "MRT_State"
            );
        })
        .map((cell) => cell.column.id)
        .filter(
            (columnId) =>
                row._valuesCache[columnId] != null &&
                row.original[columnId] != row._valuesCache[columnId]
        );
    console.log({ row });

    console.log({ isChanged });

    return isChanged.length > 0;
};

const editDisplayModeList = [
    ["freeform", "폼"],
    ["table", "테이블"],
    ["row", "행"],
];

const FreeForm = ({ table, row, onChange }) => {
    console.log({ row });

    const [formdata, setFormdata] = useState(row["original"] || {});

    // values가 변경될 때마다 formdata를 동기화
    useEffect(() => {
        setFormdata(row["original"] || {});
    }, [row]); // values가 변경될 때마다 formdata를 업데이트

    const handleOnChange = (column) => (e) => {
        let newValue;
        if (e == null) newValue = "";
        else if (e.target == null) newValue = e;
        else newValue = e.target.value;

        console.log({ newValue });

        const editProps = column.columnDef.editProps;
        switch (editProps.type) {
            case "checkbox":
                newValue =
                    editProps.data[e.target.checked ? "checked" : "unchecked"];
                break;
            case "date":
                newValue =
                    newValue != ""
                        ? dayjs(newValue).format("YYYY-MM-DD HH:mm:ss")
                        : "";
                break;
            default:
                break;
        }
        onChange({ ...formdata, [column.id]: newValue });
        setFormdata((prev) => ({ ...prev, [column.id]: newValue }));
    };

    const handleBlur = (column) => (e) => {};

    return table
        .getAllColumns()
        .filter(
            (column) =>
                !column.id.toLocaleLowerCase().startsWith("mrt") &&
                column.columnDef.editProps != null
        )
        .map((column) => {
            console.log(column);
            console.log(formdata);
            console.log(row);
            return EditForm({
                column,
                value: formdata[column.id] || "",
                handleOnChange: handleOnChange(column),
                handleBlur: handleBlur(column),
            });
        });
};

const MRT_InlineTable = (inlineTableOptions: MRT_InlineTableOptions) => {
    const [editDisplayMode, setEditDisplayMode] = useState<string | null>(
        "table"
    );
    const [editedRows, setEditedRows] = useState<
        Record<string, MRT_Row<MRT_RowData>>
    >({});
    const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
    const [selectedRow, setSelectedRow] = useState({});

    useEffect(() => {
        // console.log(editedRows);
    }, [editedRows]);

    useEffect(() => {
        console.log(rowSelection);
    }, [rowSelection]);

    useEffect(() => {
        formdataRef.current = selectedRow;
    }, [selectedRow]);

    useEffect(() => {
        mrt_table.setCreatingRow(null);
        mrt_table.setEditingRow(null);
        setEditedRows({});
        setRowSelection({});
        console.log("데이터 최신화");
    }, [inlineTableOptions.data]);

    const formdataRef = useRef({});
    const traceFormdata = (values) => {
        formdataRef.current["update"] = values;
    };

    // 컬럼 속성 추가
    const columns = useMemo<MRT_InlineColumnDef[]>(() => {
        return [MRT_StateColumn, ...inlineTableOptions.columns].map(
            (column) => {
                if (column.primaryKey) {
                    // 기본키 헤더 추가
                    column.Header = (
                        <Flex align={"center"} gap={4}>
                            <IconKeyFilled color="#e6bc59" size={"1.25rem"} />
                            {column.header}
                        </Flex>
                    );
                }
                if (column.editProps) {
                    // 셀 요소 추가가
                    column = Object.assign(
                        column,
                        editRenderProps[column.editProps.type]
                    );
                    // Edit 요소 추가
                    column.Edit = (
                        props: MantineTableCellProps<MRT_RowData>
                    ) => {
                        // row.id 가 'mrt-row-create' => 추가된 행행
                        return EditCell(props);
                    };
                }

                return column;
            }
        );
    }, [inlineTableOptions.columns]);

    // pk 리스트 생성
    const primaryKeys = useMemo((): string[] => {
        let primaryKeys = columns
            .filter((column) => column.primaryKey)
            .map((column) => column.id || column.accessorKey);
        primaryKeys = primaryKeys.filter((key) => key != null);

        if (primaryKeys.length === 0) {
            primaryKeys = columns.map(
                (column) => column.id || column.accessorKey
            );
        }

        return primaryKeys as string[];
    }, [columns]);

    // 고유 id 생성
    const getRowId = (
        originalRow: MRT_RowData,
        index: number,
        parentRow: MRT_Row<MRT_RowData>
    ) =>
        inlineTableOptions.getRowId
            ? inlineTableOptions.getRowId(originalRow, index, parentRow)
            : getRowIdByPrimaryKey(originalRow);

    // 행 추가 버튼 이벤트
    const getCreateRow = (table: MRT_TableInstance<MRT_RowData>): MRT_RowData =>
        table.getAllColumns().reduce((obj, column) => {
            const defaultValue = column.columnDef.defaultValue;
            obj[column.id] =
                typeof defaultValue == "function"
                    ? defaultValue()
                    : defaultValue || "";
            return obj;
        }, {} as MRT_RowData);

    // 추가한 행 저장 이벤트
    const onCreatingRowSave: MRT_TableOptions<MRT_RowData>["onCreatingRowSave"] =
        async (props) => {
            modals.openConfirmModal({
                title: "저장 알림",
                children: <Text>추가한 행을 저장하시겠습니까?</Text>,
                labels: {
                    confirm: "저장",
                    cancel: "취소",
                },
                confirmProps: { color: "blue" },
                onConfirm: () => {
                    const data = Object.fromEntries(
                        Object.entries({
                            ...props.row.original,
                            ...props.row._valuesCache,
                        }).filter(([k]) => !k.startsWith("mrt-row"))
                    );
                    if (inlineTableOptions.onCreate) {
                        inlineTableOptions.onCreate(data);
                    }

                    setRowSelection({
                        [getRowIdByPrimaryKey(props.row._valuesCache)]: true,
                    });
                    setEditedRows({});
                    Object.keys(props.row._valuesCache).forEach((key) => {
                        props.row._valuesCache[key] = "";
                    });
                    props.exitCreatingMode();
                },
            });
        };

    const onEditingRowSaveWithTableMode = (table) => {
        modals.openConfirmModal({
            title: "저장 알림",
            children: (
                <Text>
                    {Object.keys(editedRows).length}개의 행을 수정하시겠습니까?
                </Text>
            ),
            labels: { confirm: "저장", cancel: "취소" },
            confirmProps: { color: "blue" },
            onConfirm: () => {
                if (inlineTableOptions.onSave) {
                    inlineTableOptions.onSave(
                        Object.values(editedRows).map((row) => ({
                            original: row.original,
                            update: {
                                ...row.original,
                                ...row._valuesCache,
                            },
                        }))
                    );
                }

                setRowSelection(
                    Object.entries(editedRows).reduce((obj, [, row]) => {
                        const key = getRowIdByPrimaryKey(row._valuesCache);
                        obj[key] = true;
                        return obj;
                    }, {} as MRT_RowSelectionState)
                );
                Object.values(editedRows).forEach((row) => {
                    row._valuesCache["MRT_State"] = "";
                });
                setEditedRows({});
                table.setEditingRow(null); //exit editing mode
            },
        });
    };
    const onEditingRowSaveWithRowMode = (row) => {
        if (!hasRowChanged(row)) {
            return toast("변경된 데이터가 없습니다.");
        }

        modals.openConfirmModal({
            title: "저장 알림",
            children: <Text>해당 행을 수정하시겠습니까?</Text>,
            labels: { confirm: "저장", cancel: "취소" },
            confirmProps: { color: "blue" },
            onConfirm: () => {
                if (inlineTableOptions.onSave) {
                    inlineTableOptions.onSave([
                        {
                            original: row.original,
                            update: {
                                ...row.original,
                                ...row._valuesCache,
                            },
                        },
                    ]);
                }
                const RowSelection = {
                    [getRowIdByPrimaryKey(row._valuesCache)]: true,
                };
                console.log({ RowSelection });
                setRowSelection({
                    [getRowIdByPrimaryKey(row._valuesCache)]: true,
                } as MRT_RowSelectionState);
                table.setEditingRow(null); //exit editing mode
            },
        });
    };

    // 행 수정 시 표시
    const onEditingRowChange: OnChangeFn<MRT_Row<MRT_RowData> | null> = (
        row
    ) => {
        console.log("onEditingRowChange");

        if (row == null) return;
        if (typeof row == "function") return row((old) => {});

        if (hasRowChanged(row) && row.original["MRT_State"] != "추가") {
            row._valuesCache["MRT_State"] = "수정";
            setEditedRows((editedRows) => ({
                ...editedRows,
                [row.id]: row,
            }));
        } else {
            row._valuesCache["MRT_State"] = "";
            const { [row.id]: removed, ...remainRows } = editedRows;
            setEditedRows(remainRows);
        }
    };

    const onEditingRowSave = ({ table, row }) => {
        console.log("onEditingRowSave");

        onEditingRowSaveWithRowMode(row);
    };

    const getRowIdByPrimaryKey = (originalRow: MRT_RowData): string => {
        return primaryKeys
            .map((primaryKey) => originalRow[primaryKey])
            .join("-");
    };

    // 인라인 수정 행 저장 이벤트
    const renderRowActions: MRT_TableOptions<MRT_RowData>["renderRowActions"] =
        ({ row, table }) => {
            // return;
            return (
                editDisplayMode == "row" &&
                inlineTableOptions.enableEdit && (
                    <Flex gap={"xs"}>
                        <Tooltip label="수정">
                            <ActionIcon
                                onClick={() => {
                                    if (
                                        table.getState().creatingRow ||
                                        table.getState().editingRow
                                    ) {
                                        return toast(
                                            "작업 완료 후 진행해주세요",
                                            {
                                                icon: "⚠️",
                                            }
                                        );
                                    }

                                    table.setEditingRow(row);
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
                                        confirmProps: { color: "#7a84b9" },
                                        onConfirm: () => {
                                            const columns =
                                                table.getAllColumns();
                                            columns.forEach(({ id }) => {
                                                if (
                                                    row._valuesCache[id] != null
                                                ) {
                                                    row._valuesCache[id] =
                                                        row.original[id];
                                                }
                                                if (id == "MRT_State") {
                                                    row.original["MRT_State"] =
                                                        "";
                                                    row._valuesCache[
                                                        "MRT_State"
                                                    ] = "";
                                                }
                                            });

                                            const {
                                                [row.id]: removed,
                                                ...remainRows
                                            } = editedRows;
                                            setEditedRows(remainRows);
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
        };

    // 툴바 이벤트
    // 추가, 수정, 삭제, 데이터 최신화화
    const renderTopToolbarCustomActions: MRT_TableOptions<MRT_RowData>["renderTopToolbarCustomActions"] =
        ({ table }) => {
            return (
                <Stack>
                    <Flex gap={"xs"} align={"center"}>
                        {inlineTableOptions.enableCreate && (
                            <Button
                                onClick={() => {
                                    console.log({
                                        editRow: table.getState().editingRow,
                                    });

                                    if (table.getState().editingRow) {
                                        return toast(
                                            "작업 완료 후 진행해주세요",
                                            {
                                                icon: "⚠️",
                                            }
                                        );
                                    }
                                    if (editDisplayMode == "freeform") {
                                        // 선택 초기화
                                        setRowSelection({});
                                        setSelectedRow({});
                                    } else {
                                        table.setCreatingRow(
                                            createRow(
                                                table,
                                                getCreateRow(table)
                                            )
                                        );
                                    }
                                }}
                            >
                                추가
                            </Button>
                        )}
                        {inlineTableOptions.enableEdit &&
                            editDisplayMode != "row" && (
                                <Button
                                    disabled={
                                        editDisplayMode != "freeform" &&
                                        Object.keys(editedRows).length == 0
                                    }
                                    onClick={() => {
                                        if (editDisplayMode == "freeform") {
                                            // row id가 'mrt-row-create
                                            console.log(formdataRef.current);

                                            if (
                                                formdataRef.current.id == null
                                            ) {
                                                if (
                                                    inlineTableOptions.onCreate
                                                ) {
                                                    inlineTableOptions.onCreate(
                                                        formdataRef.current
                                                    );
                                                }
                                            } else {
                                                if (inlineTableOptions.onSave) {
                                                    inlineTableOptions.onSave([
                                                        {
                                                            original:
                                                                formdataRef
                                                                    .current
                                                                    .original,
                                                            update: formdataRef
                                                                .current.update,
                                                        },
                                                    ]);
                                                }
                                            }
                                        } else {
                                            onEditingRowSaveWithTableMode(
                                                table
                                            );
                                        }
                                    }}
                                >
                                    저장
                                </Button>
                            )}
                        {inlineTableOptions.enableDelete && (
                            <Button
                                color="red"
                                disabled={
                                    Object.keys(rowSelection).length === 0
                                }
                                onClick={() => {
                                    // 추가 혹은 수정중인 행 체크
                                    if (editDisplayMode != "table") {
                                        console.log(
                                            table.getState().creatingRow
                                        );
                                        console.log(
                                            table.getState().editingRow
                                        );

                                        if (
                                            table.getState().creatingRow ||
                                            table.getState().editingRow
                                        ) {
                                            return toast(
                                                "작업 완료 후 진행해주세요",
                                                {
                                                    icon: "⚠️",
                                                }
                                            );
                                        }
                                    }

                                    modals.openConfirmModal({
                                        title: "삭제 알림",
                                        children: (
                                            <Text>
                                                선택된{" "}
                                                {
                                                    Object.keys(rowSelection)
                                                        .length
                                                }
                                                개의 데이터를 정말
                                                삭제하시겠습니까?
                                            </Text>
                                        ),
                                        labels: {
                                            confirm: "삭제",
                                            cancel: "취소",
                                        },
                                        confirmProps: { color: "red" },
                                        onConfirm: () => {
                                            if (inlineTableOptions.onDelete) {
                                                inlineTableOptions.onDelete(
                                                    table
                                                        .getRowModel()
                                                        .rows.filter(
                                                            (row) =>
                                                                rowSelection[
                                                                    row.id
                                                                ]
                                                        )
                                                        .map((row) =>
                                                            primaryKeys.reduce(
                                                                (
                                                                    obj,
                                                                    primaryKey
                                                                ) => {
                                                                    obj[
                                                                        primaryKey
                                                                    ] =
                                                                        row.original[
                                                                            primaryKey
                                                                        ];
                                                                    return obj;
                                                                },
                                                                {} as Record<
                                                                    string,
                                                                    any
                                                                >
                                                            )
                                                        )
                                                );
                                            }

                                            setRowSelection({}); // 체크 해제
                                        },
                                    });
                                }}
                            >
                                삭제
                            </Button>
                        )}
                        {inlineTableOptions.refetch && (
                            <Tooltip label="데이터 최신화">
                                <ActionIcon
                                    size={"lg"}
                                    onClick={() => {
                                        table
                                            .getRowModel()
                                            .rows.forEach((row) => {
                                                const columns =
                                                    table.getAllColumns();
                                                columns.forEach(({ id }) => {
                                                    if (
                                                        row._valuesCache[id] !=
                                                        null
                                                    ) {
                                                        row._valuesCache[id] =
                                                            row.original[id];
                                                    }
                                                    if (id == "MRT_State") {
                                                        row.original[
                                                            "MRT_State"
                                                        ] = "";
                                                        row._valuesCache[
                                                            "MRT_State"
                                                        ] = "";
                                                    }
                                                });

                                                table.setEditingRow(row);
                                                const {
                                                    [row.id]: removed,
                                                    ...remainRows
                                                } = editedRows;
                                                setEditedRows(remainRows);
                                            });

                                        inlineTableOptions.refetch();
                                    }}
                                >
                                    <IconRefresh />
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </Flex>
                    {editDisplayMode == "freeform" && (
                        // FreeForm({ columns: inlineTableOptions.columns })
                        <Flex wrap={"wrap"} align={"center"} gap={16}>
                            <FreeForm
                                table={table}
                                row={selectedRow}
                                onChange={traceFormdata}
                            />
                            {/* {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        !column.id
                                            .toLocaleLowerCase()
                                            .startsWith("mrt") &&
                                        column.columnDef.editProps != null
                                )
                                .map((column) => {
                                    return EditForm({
                                        column,
                                        value: formdata[column.id],
                                        handleOnChange: handleOnChange(column),
                                        handleBlur: handleBlur(column),
                                    });
                                })} */}
                        </Flex>
                    )}
                </Stack>
            );
        };

    const tableOptions: MRT_TableOptions<MRT_RowData> = {
        columns: columns, // 컬럼
        data: inlineTableOptions.data, // 데이터

        enablePinning: true,

        createDisplayMode: "row",
        editDisplayMode: editDisplayMode,

        enableEditing:
            inlineTableOptions.enableCreate || inlineTableOptions.enableEdit, // 버튼 옵션에 수정이 있는
        enableRowSelection: inlineTableOptions.enableDelete, // 삭제 플래그 있을 경우

        onRowSelectionChange: setRowSelection, // 행 체크 시 이벤트
        enableBatchRowSelection: true, // 쉬프트 누르고 배치 선택

        selectAllMode: "page",

        state: {
            ...inlineTableOptions.state,
            rowSelection,
        },

        getRowId: getRowId, // 기본키로 row id 생성 함수

        onCreatingRowSave: onCreatingRowSave,

        renderRowActions: renderRowActions,
        renderTopToolbarCustomActions: renderTopToolbarCustomActions,
    };
    if (editDisplayMode == "freeform") {
        tableOptions.enableRowSelection = false;
        tableOptions.mantineTableBodyRowProps = ({ row }) => ({
            //implement row selection click events manually
            onClick: () => {
                setRowSelection((prev) => ({
                    [row.id]: !prev[row.id],
                }));
                setSelectedRow(rowSelection[row.id] ? {} : row);
            },
            selected: rowSelection[row.id],
            style: {
                cursor: "pointer",
            },
        });
    } else if (editDisplayMode == "table") {
        tableOptions.onEditingRowChange = onEditingRowChange;
        tableOptions.state.columnPinning = {
            left: ["mrt-row-select"],
        };
        // tableOptions.mantineTableBodyRowProps = undefined;
    } else if (editDisplayMode == "row") {
        tableOptions.onEditingRowSave = onEditingRowSave;
        // tableOptions.onEditingRowCancel = ({ row, table }) => {
        //     console.log("onEditingRowCancel");
        //     console.log(row);
        // };
        tableOptions.state.columnPinning = {
            left: ["mrt-row-select"],
        };
        // tableOptions.mantineTableBodyRowProps = undefined;
    }

    const table = useMantineReactTable({
        ...inlineTableOptions,
        ...tableOptions,
    });

    const [mrt_table, setMrt_table] = useState(table);

    // const FreeForm = useMemo(() => {
    //     return table
    //     .getAllColumns()
    //     .filter(
    //         (column) =>
    //             !column.id.toLocaleLowerCase().startsWith("mrt") &&
    //             column.columnDef.editProps != null
    //     )
    //     .map((column) => {
    //         return EditForm({
    //             column,
    //             value: formdata[column.id],
    //             handleOnChange: handleOnChange(column),
    //             handleBlur: handleBlur(column),
    //         });
    //     });
    //   }, [table, formdata]);

    return tableOptions.enableEditing ? (
        <Tabs
            value={editDisplayMode}
            onChange={(value) => {
                if (
                    table.getState().creatingRow ||
                    table.getState().editingRow ||
                    Object.keys(editedRows).length > 0
                ) {
                    return toast("작업 완료 후 진행해주세요", {
                        icon: "⚠️",
                    });
                }
                setEditDisplayMode(value);
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
        </Tabs>
    ) : (
        <MantineReactTable table={table} />
    );
};

export default MRT_InlineTable;
