"use client";

import {
    Badge,
    Flex,
    Group,
    NavLink,
    Notification,
    Tree,
    TreeNodeData,
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { MRT_PaginationState } from "mantine-react-table";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import MRT_InlineTable from "./components/inline/MR_InlineTable";
import useQueryCustom from "./hooks/useQueryCustom";
import useMutationCustom from "./hooks/useMutationCustom";
import toast from "react-hot-toast";

// FIXME: 테스트용
const mapToTree = (data: Record<string, any>[]) => {
    // 1. 데이터를 value=code, label=codename으로 매핑
    let mappedData = data.map((item) => ({
        value: item.code,
        label: item.codename,
        refcode1: item.refcode1,
        children: [],
    }));

    // 2. refcode1 데이터가 있는 경우 children 속성 추가
    mappedData.forEach((item) => {
        if (item.refcode1) {
            // refcode1에서 코드를 추출
            const refcode1Key = item.refcode1.match(/\[([A-Z0-9]+)\]/);

            if (refcode1Key) {
                const childCode = refcode1Key[1]; // 추출된 코드
                const child = mappedData.find((i) => i.value === childCode);
                if (child) {
                    item.children.push(child);
                }
            }
        }
    });

    return mappedData;
};

// 임시 트리 컴포넌트트
function TreeCustom({
    data,
    activeCode,
    handleActive,
}: {
    data: TreeNodeData[];
    activeCode: string;
    handleActive: Dispatch<SetStateAction<string>>;
}) {
    return (
        <Tree
            style={{
                width: "20%",
                height: "870px",
                overflow: "scroll",
            }}
            data={data}
            levelOffset={23}
            renderNode={({ node, expanded, hasChildren, elementProps }) => {
                return (
                    <Group gap={"xs"} {...elementProps}>
                        <NavLink
                            active={node.value == activeCode}
                            label={
                                <Flex align={"center"} gap={8}>
                                    {hasChildren && (
                                        <IconChevronDown
                                            size={18}
                                            style={{
                                                transform: expanded
                                                    ? "rotate(0deg)"
                                                    : "rotate(-90deg)",
                                                transition: "all 0.3s",
                                            }}
                                        />
                                    )}
                                    <span>{node.label}</span>
                                    <Badge size="sm" circle>
                                        {node.children?.length}
                                    </Badge>
                                </Flex>
                            }
                            onClick={() => handleActive(node.value)}
                        />
                    </Group>
                );
            }}
        />
    );
}

export default function Home() {
    const [activeCode, setActiveCode] = useState<string>("");
    const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    useEffect(() => {
        console.log(pagination);
    }, [pagination]);

    // 트리 데이터 호출
    const { isFetching: isFetchingTree, data: treeResult } = useQueryCustom(
        "/common/code",
        {
            grpcode: "master",
        },
        { staleTime: 60_000 }
    );

    // URL, PARAM 으로 캐시 KEY 생성
    const fetchURL = "/common/code";
    const params = {
        grpcode: activeCode,
        page_no: pagination.pageIndex + 1,
        row_length: pagination.pageSize,
    };
    const queryKey = [fetchURL, params];

    // 트리 항목 선택 시 호출
    const {
        isFetching: isFetchingCode,
        isLoading: isLoadingCode,
        isSuccess: isSuccessCode,
        data: codeResult,
        refetch,
    } = useQueryCustom(fetchURL, params, {
        enabled: !!activeCode,
        staleTime: 10_000,
    });

    const { mutateAsync: createRow, isPending: isCreatingRow } =
        useMutationCustom("/common/code/info-insert", queryKey, {
            method: "POST",
        });

    const { mutateAsync: updateRow, isPending: isUpdatingRow } =
        useMutationCustom("/common/code/info-update", queryKey, {
            method: "PUT",
        });

    const { mutateAsync: deleteRow, isPending: isDeletingRow } =
        useMutationCustom("/common/code/info-delete", queryKey, {
            method: "DELETE",
        });

    return (
        <Flex align={"flex-start"} gap={16}>
            {isFetchingTree ? (
                <Notification loading title="잠시만 기다려주세요!" mt="md">
                    서버에서 데이터를 불러오고 있습니다
                </Notification>
            ) : (
                <TreeCustom
                    data={mapToTree(treeResult ? treeResult.data.data : [])}
                    activeCode={activeCode}
                    handleActive={setActiveCode}
                />
            )}
            <div style={{ flexGrow: 1 }}>
                <MRT_InlineTable
                    rowCount={
                        isSuccessCode ? codeResult.data.recordsFiltered : 0
                    }
                    manualPagination={true}
                    onPaginationChange={setPagination}
                    state={{
                        isLoading: isLoadingCode,
                        isSaving:
                            isUpdatingRow || isCreatingRow || isDeletingRow,
                        showProgressBars: isFetchingCode,
                        pagination,
                    }}
                    refetch={refetch}
                    columns={[
                        {
                            accessorKey: "Datalake_Seq_No",
                            header: "Datalake_Seq_No",
                            enableEditing: false,
                        },
                        {
                            accessorKey: "code",
                            header: "code",
                            editProps: {
                                type: "text",
                            },
                            primaryKey: true,
                        },
                        {
                            accessorKey: "grpcode",
                            header: "grpcode",
                            editProps: {
                                type: "text",
                            },
                            defaultValue: activeCode,
                            enableEditing: false,
                        },
                        {
                            accessorKey: "codename",
                            header: "codename",
                            editProps: {
                                type: "text",
                            },
                        },
                        {
                            accessorKey: "codename2",
                            header: "codename2",
                            editProps: {
                                type: "text",
                            },
                        },
                        {
                            accessorKey: "refcode1",
                            header: "refcode1",
                            editProps: {
                                type: "select",
                                data: [
                                    { value: "ESG060100", label: "ESG060100" },
                                    { value: "ESG060200", label: "ESG060200" },
                                ],
                            },
                        },
                        {
                            accessorKey: "refcode2",
                            header: "refcode2",
                            editProps: {
                                type: "text",
                            },
                        },
                    ]}
                    data={isSuccessCode ? codeResult.data.data : []}
                    enableCreate
                    enableEdit
                    enableDelete
                    onCreate={(createData) => {
                        createRow(createData)
                            .then((json) => {
                                if (json.type != "success") {
                                    return toast.error(json.message);
                                }
                                if (json.detail != null) {
                                    return toast.error(json.detail);
                                }
                                toast.success(json.message);
                            })
                            .catch((error) => toast.error(error.message));
                    }}
                    onSave={(changeData) => {
                        updateRow(
                            changeData.map((data) => ({
                                new: data.update,
                                old: data.original,
                            }))
                        )
                            .then((json) => {
                                if (json.type != "success") {
                                    return toast.error(json.message);
                                }
                                toast.success(json.message);
                            })
                            .catch((error) =>
                                toast.error(error.message, {
                                    duration: 10 * 1000,
                                })
                            );
                    }}
                    onDelete={(deleteData) => {
                        deleteRow(deleteData).then((json) => {
                            if (json.type != "success") {
                                toast.error(json.message);
                            }
                            toast.success(json.message);
                        });
                    }}
                />
            </div>
        </Flex>
    );
}
