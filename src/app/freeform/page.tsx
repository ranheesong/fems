"use client";

import {
    Flex,
    Grid,
    GridColProps,
    GridProps,
    Input,
    TextInput,
} from "@mantine/core";
import {
    MantineReactTable,
    MRT_ColumnDef,
    MRT_RowData,
    useMantineReactTable,
} from "mantine-react-table";
import React from "react";

// User 타입 정의
interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other";
    isActive: boolean;
    registrationDate: string;
}

// 데이터 생성 함수
const generateUserData = (index: number): User => ({
    id: index + 1,
    firstName: `FirstName${index + 1}`,
    lastName: `LastName${index + 1}`,
    email: `user${index + 1}@example.com`,
    phone: `+1-800-555-${1000 + index}`,
    address: `Address ${index + 1}, City, Country`,
    dateOfBirth: `1990-01-${String((index % 30) + 1).padStart(2, "0")}`,
    gender: index % 2 === 0 ? "male" : "female",
    isActive: index % 2 === 0,
    registrationDate: `2022-12-${String((index % 28) + 1).padStart(2, "0")}`,
});

// 20명의 사용자 데이터 생성
const users: User[] = Array.from({ length: 20 }, (_, index) =>
    generateUserData(index)
);

console.log(users);

type FreeForm = {
    gridProps?: Pick<
        GridProps,
        "gutter" | "grow" | "columns" | "type" | "breakpoints"
    >;
    gridColProps?: Pick<GridColProps, "span" | "order" | "offset">;
};

const columns = [
    { size: 480, header: "ID", accessorKey: "id", gridColProps: { span: 5 } },
    {
        gridColProps: { span: 2, order: "1" },
        size: 280,
        header: "First Name",
        accessorKey: "firstName",
    },
    {
        gridColProps: { span: 2 },
        size: 280,
        header: "Last Name",
        accessorKey: "lastName",
    },
    {
        gridColProps: { span: 2, order: "3" },
        size: 280,
        header: "Email",
        accessorKey: "email",
    },
    {
        gridColProps: { span: 2, order: "4" },
        size: 280,
        header: "Phone",
        accessorKey: "phone",
    },
    {
        gridColProps: { span: 2, order: "5" },
        size: 280,
        header: "Address",
        accessorKey: "address",
    },
    {
        gridColProps: { span: 2, order: "6" },
        size: 280,
        header: "Date of Birth",
        accessorKey: "dateOfBirth",
    },
    {
        gridColProps: { span: 2, order: "7" },
        size: 280,
        header: "Gender",
        accessorKey: "gender",
    },
    {
        gridColProps: { span: 2, order: "8" },
        size: 480,
        header: "Active",
        accessorKey: "isActive",
        Edit,
    },
    {
        span: 2,
        size: 480,
        header: "Registration Date",
        accessorKey: "registrationDate",
    },
] as (MRT_ColumnDef<MRT_RowData> & FreeForm)[];
function Page() {
    const table = useMantineReactTable({
        columns: columns,
        data: users,
        initialState: {
            density: "xs",
        },
    });

    return (
        <div>
            <Grid gutter={"xs"} columns={10}>
                {columns.map((column) => (
                    <Grid.Col key={column.header} {...column.gridColProps}>
                        <TextInput
                            label={column.header}
                            size="xs"
                            style={
                                column.gridColProps?.span == null
                                    ? { width: `${column.size}px` }
                                    : undefined
                            }
                            placeholder={column.header}
                        />
                    </Grid.Col>
                ))}
            </Grid>
            <Flex wrap={"wrap"} justify={"space-between"}>
                {columns.map((column) => (
                    <TextInput
                        label={column.header}
                        key={column.header}
                        size="xs"
                        style={{ width: `${column.size}px` }}
                        placeholder={column.header}
                    />
                ))}
            </Flex>
            <MantineReactTable table={table} />
        </div>
    );
}

export default Page;
