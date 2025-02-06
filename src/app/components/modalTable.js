import { useMemo, useState } from 'react';
import {
  MRT_EditActionButtons,
  MantineReactTable,
  // createRow,
  useMantineReactTable,
} from 'mantine-react-table';
import {
  ActionIcon,
  Button,
  Flex,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { fakeData } from './makeData';


const CustomTable = (props) => {
  const [validationErrors, setValidationErrors] = useState({});

  console.log(props)

//   const columns = useMemo(
//     () => [
//       {
//         accessorKey: 'id',
//         header: 'Id',
//         enableEditing: false,
//         size: 80,
//       },
//       {
//         accessorKey: 'firstName',
//         header: 'First Name',
//         mantineEditTextInputProps: {
//           type: 'email',
//           required: true,
//           error: validationErrors?.firstName,
//           //remove any previous validation errors when user focuses on the input
//           onFocus: () =>
//             setValidationErrors({
//               ...validationErrors,
//               firstName: undefined,
//             }),
//           //optionally add validation checking for onBlur or onChange
//         },
//         renderCreate: true,
//         renderEdit: true
//       },
//       {
//         accessorKey: 'lastName',
//         header: 'Last Name',
//         mantineEditTextInputProps: {
//           type: 'email',
//           required: true,
//           error: validationErrors?.lastName,
//           //remove any previous validation errors when user focuses on the input
//           onFocus: () =>
//             setValidationErrors({
//               ...validationErrors,
//               lastName: undefined,
//             }),
//         },
//         renderCreate: true,
//         renderEdit: false      
//     },
//       {
//         accessorKey: 'email',
//         header: 'Email',
//         mantineEditTextInputProps: {
//           type: 'email',
//           required: true,
//           error: validationErrors?.email,
//           //remove any previous validation errors when user focuses on the input
//           onFocus: () =>
//             setValidationErrors({
//               ...validationErrors,
//               email: undefined,
//             }),
//         },
//         renderCreate: false,
//         renderEdit: true
//       },
//       {
//         accessorKey: 'state',
//         header: 'State',
//         editVariant: 'select',
//         mantineEditSelectProps: {
//           data: usStates,
//           error: validationErrors?.state,
//         },
//         renderCreate: true,
//         renderEdit: true
//       },
//     ],
//     [validationErrors],
//   );

const columns = useMemo(() => {
    console.log(props)
    return props.columns.map((col) => {
        const columnDefinition = {
            accessorKey: col.key,
            header: col.header,
            enableEditing: col.enableEditing !== undefined ? col.enableEditing : true,
            size: col.size !== undefined ? col.size : 60,
            required: col.required !== undefined ? col.required : false,
            renderCreate: col.renderCreate !== undefined ? col.renderCreate : true,
            renderEdit: col.renderEdit !== undefined ? col.renderEdit : true,
        };

        if (col.inputType) {
            const inputProps = {
            type: col.inputType,
            error: validationErrors?.[col.key],
            onFocus: () =>
                setValidationErrors({
                ...validationErrors,
                [col.key]: undefined,
                }),
            };

            if (col.inputType === 'select') {
              columnDefinition.editVariant = 'select';
              columnDefinition.mantineEditSelectProps = {
                  data: col.options,
                  error: validationErrors?.[col.key],
              };
            } else if (col.inputType === 'date') { // date input type 처리
              columnDefinition.editVariant = 'date'; // editVariant를 date로 설정
              columnDefinition.mantineEditDatePickerProps = { // DatePicker에 필요한 props
                valueFormat: "YYYY-MM-DD",
                // onChange: (date) => {
                //   // 날짜 변경 처리 로직 (필요에 따라 구현)
                // }
              };
            } else {
              columnDefinition.mantineEditTextInputProps = inputProps;
            }
        }

        if (col.Cell) { // Cell이 정의된 경우 columnDefinition에 추가
          columnDefinition.Cell = col.Cell;
        }

          return columnDefinition;
        });
    }, [props.columns, validationErrors]);

  //call CREATE hook
  const { mutateAsync: createUser, isLoading: isCreatingUser } =
    useCreateUser();
  //call READ hook
  const {
    data: fetchedUsers = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetUsers();
  //call UPDATE hook
  const { mutateAsync: updateUser, isLoading: isUpdatingUser } =
    useUpdateUser();
  //call DELETE hook
  const { mutateAsync: deleteUser, isLoading: isDeletingUser } =
    useDeleteUser();

  //CREATE action
  const handleCreateUser = async ({ values, exitCreatingMode }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createUser(values);
    exitCreatingMode();
  };

  //UPDATE action
  const handleSaveUser = async ({ values, table }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateUser(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row) =>
    modals.openConfirmModal({
      title: '삭제하시겠습니까?',
      children: (
        <Text>
          Are you sure you want to delete {row.original.firstName}{' '}
          {row.original.lastName}? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: '삭제', cancel: '취소' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteUser(row.original.id),
    // onConfirm: () => props.onDelete(row), // 예시
    });

  const table = useMantineReactTable({
    columns,
    // columns: props.columns, // 예시
    data: fetchedUsers,
    createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
    editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.id,
    mantineToolbarAlertBannerProps: isLoadingUsersError
      ? {
          color: 'red',
          children: 'Error loading data',
        }
      : undefined,
    mantineTableContainerProps: {
      sx: {
        minHeight: '500px',
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    // onCreatingRowSave: handleCreateUser,
    // onCreatingRowSave: props.onCreate, // 예시
    onCreatingRowSave: (values, mode) => {
        const newValidationErrors = validateUser(values);
        if (Object.values(newValidationErrors).some((error) => error)) {
            setValidationErrors(newValidationErrors);
            return;
        }
        setValidationErrors({});
        props.onCreate(values, mode);
        mode.exitCreatingMode()
    },
    onEditingRowCancel: () => setValidationErrors({}),
    // onEditingRowSave: handleSaveUser,
    onEditingRowSave: (values, table) => {
        const newValidationErrors = validateUser(values);
        if (Object.values(newValidationErrors).some((error) => error)) {
            setValidationErrors(newValidationErrors);
            return;
        }
        setValidationErrors({});
        props.onUpdate(values, table);
        table.setEditingRow(null);
    },
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
    console.log('😡',internalEditComponents)
    return (
      <Stack>
        <Title order={3}>Create New User</Title>
        {internalEditComponents.filter(component => component.props.cell.column.columnDef.renderCreate)}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    )},
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Edit User</Title>
        {internalEditComponents.filter(component => component.props.cell.column.columnDef.renderEdit)}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderRowActions: ({ row, table }) => (
      <Flex gap="md">
        <Tooltip label="Edit">
          <ActionIcon onClick={() => table.setEditingRow(row)}>
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
            <IconTrash />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        onClick={() => {
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        신규
      </Button>
    ),
    state: {
      isLoading: isLoadingUsers,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
    },
  });

  return <MantineReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newUserInfo) => {
      queryClient.setQueryData(['users'], (prevUsers) => [
        ...prevUsers,
        {
          ...newUserInfo,
          id: (Math.random() + 1).toString(36).substring(7),
        },
      ]);
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

//READ hook (get users from api)
function useGetUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      //send api request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve(fakeData);
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put user in api)
function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newUserInfo) => {
      queryClient.setQueryData(['users'], (prevUsers) =>
        prevUsers?.map((prevUser) =>
          prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
        ),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

//DELETE hook (delete user in api)
function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (userId) => {
      queryClient.setQueryData(['users'], (prevUsers) =>
        prevUsers?.filter((user) => user.id !== userId),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

//export default ExampleWithProviders;
export default CustomTable; 

const validateRequired = (value) => !!value.length;
function validateUser(user) {
  return {
    firstName: !validateRequired(user.firstName)
      ? 'First Name is Required'
      : '',
    lastName: !validateRequired(user.lastName) ? 'Last Name is Required' : '',
    email: !validateRequired(user.firstName) ? 'Incorrect Email Format' : '',
  };
}