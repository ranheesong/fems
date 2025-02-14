"use client";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";
import { useEffect, useMemo, useState } from "react";
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
} from "mantine-react-table";
import {
    ActionIcon,
    Button,
    Checkbox,
    ComboboxData,
    Flex,
    Input,
    Text,
    Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
    IconKeyFilled,
    IconMoodEdit,
    IconMoodPlus,
    IconRefresh,
} from "@tabler/icons-react";
import {
    CheckboxMappingData,
    EditCheckbox,
    EditDatePicker,
    EditModal,
    EditSelect,
    EditText,
} from "./edit/MRT_EditCellInputs";
import { MantineTableCellProps } from "@/app/hooks/useMRT_EditCell";
import { OnChangeFn } from "@tanstack/react-table";

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
    onSave?: (data: []) => void; // 저장 함수
    onDelete?: (data: MRT_RowData) => void; // 삭제 함수

    refetch?: () => void;
}

// 상태 표시 컬럼럼
const MRT_StateColumn = {
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

// 현재 CELL 값 조회회
export const getValue = (cell) => {
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
        Edit: EditText,
    },
    select: {
        Cell: ({ cell, column }: MantineTableCellProps<MRT_RowData>) => {
            const find = column.columnDef.editProps.data.find(
                (data) => data.value == getValue(cell)
            );

            return find ? find["label"] : "";
        },
        Edit: EditSelect,
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
                    onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                />
            );
        },
        Edit: EditCheckbox,
    },
    date: {
        Cell: ({ cell }: MantineTableCellProps<MRT_RowData>) => {
            const value = getValue(cell);
            return value;
        },
        Edit: EditDatePicker,
    },
    modal: {
        Cell: ({ cell }: MantineTableCellProps<MRT_RowData>) => {
            const value = getValue(cell);
            return (
                <Input
                    value={value}
                    readOnly
                    onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                />
            );
        },
        Edit: EditModal,
    },
};

// 행 변경 확인
const hasRowChanged = (row: MRT_Row<MRT_RowData>) => {
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
        .some(
            (columnId) => row.original[columnId] != row._valuesCache[columnId]
        );
    return isChanged;
};

const MRT_InlineTable = (inlineTableOptions: MRT_InlineTableOptions) => {
    const [editedRows, setEditedRows] = useState<
        Record<string, MRT_Row<MRT_RowData>>[]
    >([]);
    const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

    useEffect(() => {
        // console.log(editedRows);
    }, [editedRows]);

    useEffect(() => {
        // console.log(rowSelection);
    }, [rowSelection]);

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
                }

                return column;
            }
        );
    }, [inlineTableOptions.columns]);

    // pk 리스트 생성
    const primaryKeys = useMemo(() => {
        let primaryKeys = columns
            .filter((column) => column.primaryKey)
            .map((column) => column.id || column.accessorKey);
        primaryKeys = primaryKeys.filter((key) => key != null);
        return primaryKeys;
    }, [columns]);

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
                        }).filter(([k, v]) => !k.startsWith("mrt-row"))
                    );
                    props.table.options.onCreate &&
                        props.table.options.onCreate(data);
                    props.exitCreatingMode();
                    setRowSelection({
                        [getRowId(props.row._valuesCache)]: true,
                    });
                    setEditedRows({});
                },
            });
        };

    // 행 수정 시 표시
    const onEditingRowChange: OnChangeFn<MRT_Row<MRT_RowData>> = (
        row: MRT_Row<MRT_RowData>
    ) => {
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

    // 고유 id 생성
    const getRowId = (row) =>
        inlineTableOptions.getRowId
            ? inlineTableOptions.getRowId(row)
            : primaryKeys.map((primaryKey) => row[primaryKey]).join("-");

    // 행 추가 버튼 이벤트
    const getCreateRow = (table) =>
        table.getAllColumns().reduce((obj, column) => {
            const defaultValue = column.columnDef.defaultValue;
            obj[column.id] =
                typeof defaultValue == "function"
                    ? defaultValue()
                    : defaultValue || "";
            return obj;
        }, {});

    // 인라인 수정 행 저장 이벤트
    // const renderRowActions: MRT_TableOptions<MRT_RowData>["renderRowActions"] =
    //     ({ row, table }) => {
    //         return (
    //             inlineTableOptions.enableEdit && (
    //                 <Flex gap={"xs"}>
    //                     <Tooltip label="수정">
    //                         <ActionIcon
    //                             onClick={() => {
    //                                 if (table.getState().creatingRow) {
    //                                     return modals.open({
    //                                         title: "수정 알림",
    //                                         children: (
    //                                             <Text>
    //                                                 추가 작업 완료 후
    //                                                 진행해주세요
    //                                             </Text>
    //                                         ),
    //                                     });
    //                                 }

    //                                 table.setEditingRow(row);
    //                             }}
    //                         >
    //                             <IconEdit />
    //                         </ActionIcon>
    //                     </Tooltip>
    //                     <Tooltip label="초기화">
    //                         <ActionIcon
    //                             color="#7a84b9"
    //                             onClick={() => {
    //                                 modals.openConfirmModal({
    //                                     title: "초기화 알림",
    //                                     children: (
    //                                         <Text>
    //                                             행을 초기화하시겠습니까?
    //                                         </Text>
    //                                     ),
    //                                     labels: {
    //                                         confirm: "초기화",
    //                                         cancel: "취소",
    //                                     },
    //                                     confirmProps: { color: "#7a84b9" },
    //                                     onConfirm: () => {
    //                                         const columns =
    //                                             table.getAllColumns();
    //                                         columns.forEach(({ id }) => {
    //                                             if (
    //                                                 row._valuesCache[id] != null
    //                                             ) {
    //                                                 row._valuesCache[id] =
    //                                                     row.original[id];
    //                                             }
    //                                             if (id == "MRT_State") {
    //                                                 row.original["MRT_State"] =
    //                                                     "";
    //                                                 row._valuesCache[
    //                                                     "MRT_State"
    //                                                 ] = "";
    //                                             }
    //                                         });
    //                                         console.log(row);

    //                                         setEditedRows(
    //                                             changedRowIds.filter(
    //                                                 (changedRowId) =>
    //                                                     changedRowId != row.id
    //                                             )
    //                                         );
    //                                     },
    //                                 });
    //                             }}
    //                         >
    //                             <IconRefresh />
    //                         </ActionIcon>
    //                     </Tooltip>
    //                 </Flex>
    //             )
    //         );
    //     };

    // 툴바 이벤트
    // 추가, 수정, 삭제, 데이터 최신화화
    const renderTopToolbarCustomActions: MRT_TableOptions<MRT_RowData>["renderTopToolbarCustomActions"] =
        ({ table }) => {
            return (
                <Flex gap={"xs"} align={"center"}>
                    {inlineTableOptions.enableCreate && (
                        <Button
                            onClick={() => {
                                if (table.getState().editingRow) {
                                    return modals.open({
                                        title: "추가 알림",
                                        children: (
                                            <Text>
                                                수정 작업 완료 후 진행해주세요
                                            </Text>
                                        ),
                                    });
                                }
                                table.setCreatingRow(
                                    createRow(table, getCreateRow(table))
                                );
                            }}
                        >
                            추가
                        </Button>
                    )}
                    {inlineTableOptions.enableEdit && (
                        <Button
                            disabled={Object.keys(editedRows).length == 0}
                            onClick={() => {
                                // 추가 혹은 수정중인 행 체크크
                                if (table.getState().creatingRow) {
                                    return modals.open({
                                        title: "추가 알림",
                                        children: (
                                            <Text>
                                                추가 작업 완료 후 진행해주세요
                                            </Text>
                                        ),
                                    });
                                }
                                if (table.getState().editingRow) {
                                    return modals.open({
                                        title: "수정 알림",
                                        children: (
                                            <Text>
                                                수정 작업 완료 후 진행해주세요
                                            </Text>
                                        ),
                                    });
                                }

                                modals.openConfirmModal({
                                    title: "저장 알림",
                                    children: (
                                        <Text>
                                            수정된{" "}
                                            {Object.keys(editedRows).length}개의
                                            행을 저장하시겠습니까?
                                        </Text>
                                    ),
                                    labels: { confirm: "저장", cancel: "취소" },
                                    confirmProps: { color: "blue" },
                                    onConfirm: () => {
                                        inlineTableOptions.onSave &&
                                            inlineTableOptions.onSave(
                                                Object.values(editedRows).map(
                                                    (row) => ({
                                                        original: row.original,
                                                        update: {
                                                            ...row.original,
                                                            ...row._valuesCache,
                                                        },
                                                    })
                                                )
                                            );
                                        const rowSelection = {};
                                        Object.values(editedRows).forEach(
                                            (data) => {
                                                rowSelection[
                                                    getRowId(data._valuesCache)
                                                ] = true;
                                            }
                                        );
                                        setRowSelection(rowSelection);
                                        setEditedRows({});
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
                                // 추가 혹은 수정중인 행 체크크
                                if (table.getState().creatingRow) {
                                    return modals.open({
                                        title: "추가 알림",
                                        children: (
                                            <Text>
                                                추가 작업 완료 후 진행해주세요
                                            </Text>
                                        ),
                                    });
                                }
                                if (table.getState().editingRow) {
                                    return modals.open({
                                        title: "수정 알림",
                                        children: (
                                            <Text>
                                                수정 작업 완료 후 진행해주세요
                                            </Text>
                                        ),
                                    });
                                }

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
                                        inlineTableOptions.onDelete &&
                                            inlineTableOptions.onDelete(
                                                table
                                                    .getRowModel()
                                                    .rows.filter((row) =>
                                                        Object.keys(
                                                            rowSelection
                                                        ).includes(row.id)
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
                                                            {}
                                                        )
                                                    )
                                            );
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
                                onClick={() => inlineTableOptions.refetch()}
                            >
                                <IconRefresh />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Flex>
            );
        };

    const table = useMantineReactTable({
        ...inlineTableOptions,

        columns: columns, // 컬럼
        data: inlineTableOptions.data, // 데이터

        createDisplayMode: "row",
        editDisplayMode: "table",

        enableEditing:
            inlineTableOptions.enableCreate || inlineTableOptions.enableEdit, // 버튼 옵션에 수정이 있는
        enableRowSelection: inlineTableOptions.enableDelete, // 삭제 플래그 있을 경우

        onRowSelectionChange: setRowSelection, // 행 체크 시 이벤트
        enableBatchRowSelection: true, // 쉬프트 누르고 배치 선택

        selectAllMode: "page",

        state: { ...inlineTableOptions.state, rowSelection },

        getRowId: getRowId, // 기본키로 row id 생성 함수

        onCreatingRowSave: onCreatingRowSave,

        onEditingRowChange: onEditingRowChange,

        // renderRowActions: renderRowActions,
        renderTopToolbarCustomActions: renderTopToolbarCustomActions,
    });

    return <MantineReactTable table={table} />;
};

export default MRT_InlineTable;
