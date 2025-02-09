"use client";
import MRT_InlineTable from "@/app/components/inline/InlineTable";

import { fakeData, usStates } from "@/app/components/inline/makeData";
import { Alert } from "@mantine/core";

export default function Page() {
    return (
        <MRT_InlineTable
            columns={[
                {
                    id: "id",
                    header: "Id",
                    enableEditing: false,
                    size: 80,
                    defaultValue: (Math.random() + 1).toString(36),
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
                    },
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
            // enableDelete
            onCreate={(createData) => {
                console.log({ createData });
                alert(JSON.stringify(createData));
            }}
            onSave={(changeData) => {
                console.log({ changeData });
                alert(JSON.stringify(changeData));
            }}
            onDelete={(deleteData) => {
                console.log({ deleteData });
                alert(JSON.stringify(deleteData));
            }}
        />
    );
}
