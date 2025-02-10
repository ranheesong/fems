"use client";
import MRT_InlineTable from "@/app/components/inline/MR_InlineTable";

import { fakeData, usStates } from "@/app/components/inline/makeData";
import { ActionIcon, Alert, Flex, JsonInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconKey, IconKeyFilled } from "@tabler/icons-react";

export default function Page() {
    return (
        <MRT_InlineTable
            columns={[
                {
                    id: "id",
                    header: "Id",
                    enableEditing: false,
                    size: 80,
                    defaultValue: () => (Math.random() + 1).toString(36),
                },
                {
                    id: "wdate",
                    header: "작성일",
                    editProps: {
                        type: "date",
                    },
                },
                {
                    accessorKey: "firstName",
                    header: "First Name",

                    editProps: {
                        type: "text",
                    },
                    primaryKey: true,
                },
                {
                    accessorKey: "lastName",
                    header: "Last Name",
                    editProps: {
                        type: "modal",
                        columns: [
                            {
                                id: "id",
                                header: "Id",
                                enableEditing: false,
                                size: 80,
                                defaultValue: () =>
                                    (Math.random() + 1).toString(36),
                            },

                            {
                                accessorKey: "firstName",
                                header: "First Name",

                                editProps: {
                                    type: "text",
                                },
                                primaryKey: true,
                            },
                            {
                                accessorKey: "lastName",
                                header: "Last Name",
                                primaryKey: true,
                            },
                            {
                                accessorKey: "email",
                                header: "Email",
                                editProps: {
                                    type: "checkbox",
                                    data: {
                                        checked: "Y",
                                        unchecked: "N",
                                    },
                                },
                            },
                        ],
                        data: fakeData,
                    },
                    primaryKey: true,
                },
                {
                    accessorKey: "email",
                    header: "Email",
                    editProps: {
                        type: "checkbox",
                        data: {
                            checked: "Y",
                            unchecked: "N",
                        },
                    },
                },
                {
                    accessorKey: "state",
                    header: "State",
                    editProps: {
                        type: "select",
                        data: usStates,
                    },
                },
            ]}
            data={fakeData}
            enableCreate
            enableEdit
            enableDelete
            onCreate={(createData) => {
                console.log({ createData });
                modals.open({
                    title: "추가 데이터",
                    closeOnClickOutside: false,
                    closeOnEscape: false,
                    children: (
                        <JsonInput
                            validationError="Invalid JSON"
                            formatOnBlur
                            autosize
                            value={JSON.stringify(createData, null, 4)}
                            minRows={4}
                        />
                    ),
                });
            }}
            onSave={(changeData) => {
                console.log({ changeData });
                modals.open({
                    title: "추가 데이터",
                    closeOnClickOutside: false,
                    closeOnEscape: false,
                    children: (
                        <JsonInput
                            validationError="Invalid JSON"
                            formatOnBlur
                            autosize
                            value={JSON.stringify(changeData, null, 4)}
                            minRows={4}
                        />
                    ),
                });
            }}
            onDelete={(deleteData) => {
                console.log({ deleteData });
                modals.open({
                    title: "추가 데이터",
                    closeOnClickOutside: false,
                    closeOnEscape: false,
                    children: (
                        <JsonInput
                            validationError="Invalid JSON"
                            formatOnBlur
                            autosize
                            value={JSON.stringify(deleteData, null, 4)}
                            minRows={4}
                        />
                    ),
                });
            }}
        />
    );
}
