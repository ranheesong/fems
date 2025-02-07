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
import { Checkbox } from '@mantine/core';
import { DatePickerInput, DatesProvider} from '@mantine/dates';
import 'dayjs/locale/ko';
import moment from 'moment';
import { IconCalendar } from '@tabler/icons-react';


const CustomTable = (props) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [data, setData] = useState(props.data || fakeData)

const columns = useMemo(() => {
    // console.log(props)
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
            } else if (col.inputType === 'checkbox') { // 수정
              columnDefinition.editVariant = 'checkbox';
              columnDefinition.accessorFn = (row) => row.checked || false;
              // columnDefinition.mantineEditTextInputProps = inputProps;
              columnDefinition.Cell = ({ cell }) => (
                  <Checkbox
                    checked={cell.getValue()}
                    onChange={(event) => {
                    }}
                  />
              );
              columnDefinition.mantineEditTextInputProps= ({ cell }) => {
                  <Checkbox
                    checked={cell.getValue()}
                    onChange={(event) => {
                  }}
              />
              }
            }
            else if (col.inputType === 'date') {
              columnDefinition.editVariant = 'date'; 
              columnDefinition.Cell = ({ cell }) => { 
                  return cell.getValue()      
              };
              columnDefinition.mantineEditTextInputProps= ({ }) =>  {

                const [value, setValue] = useState()
                return <DatesProvider settings={{ consistentWeeks: true, locale: 'ko' }}>
                            <DatePickerInput
                            rightSection={<IconCalendar size={18} stroke={1.5} />}
                            rightSectionPointerEvents="none"
                                valueFormat="YYYY-MM-DD"
                                placeholder="Date input"
                                maw={400}
                                mx="auto"
                                value={value}
                                onChange={setValue}
                            />
                        </DatesProvider>
              };
              
            } 
            // else if (col.inputType === 'date') { // 수정
            //   columnDefinition.editVariant = 'date';
            //   columnDefinition.Cell = ({ cell }) => {
            //     const [dateValue, setDateValue] = useState(
            //         editedUsers[cell.row.id]?.lastName
            //             ? moment(editedUsers[cell.row.id].lastName)
            //             : cell.row.original.lastName
            //             ? moment(cell.row.original.lastName)
            //             : null
            //     );

            //     return (
            //         <DatesProvider settings={{ consistentWeeks: true, locale: 'ko' }}>
            //             <DatePickerInput
            //             rightSection={<IconCalendar size={18} stroke={1.5} />}
            //             rightSectionPointerEvents="none"
            //                 valueFormat="YYYY-MM-DD"
            //                 placeholder="Date input"
            //                 maw={400}
            //                 mx="auto"
            //                 value={dateValue}
            //                 onChange={(date) => {
            //                     setDateValue(date);
            //                     setEditedUsers({
            //                         ...editedUsers,
            //                         [cell.row.id]: {
            //                             ...cell.row.original,
            //                             lastName: date ? date : null,
            //                         },
            //                     });
            //                 }}
            //             />
            //         </DatesProvider>
            //     );
            //   }
            // } 
            else {
              columnDefinition.mantineEditTextInputProps = inputProps;
            }
        }

        if (col.Cell) { // Cell이 정의된 경우 columnDefinition에 추가
          columnDefinition.Cell = col.Cell;
        }

          return columnDefinition;
        });
    }, [props.columns, validationErrors, data]);

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
    console.log('handleCreateUser',values)
    setValidationErrors({});
    await createUser(values);
    exitCreatingMode();
  };

  //UPDATE action
  const handleSaveUser = async ({ values, table }) => {
    console.log('handleSaveUser',values)
    setValidationErrors({});
    await updateUser(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row) =>
    modals.openConfirmModal({
      title: '삭제 확인',
      children: (
        <Text>
          Id : {row.original.id} 데이터를 삭제 하시겠습니까?
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
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: !props.showEdit && !props.showDelete ? false : true,
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
    onCreatingRowSave: (values) => {
      console.log('Creatingvalues, mode',  values, values.values)
        setValidationErrors({});
        props.onCreate( values.values, table);
        table.setCreatingRow(null);
    },
    onEditingRowCancel: () => setValidationErrors({}),
    // onEditingRowSave: handleSaveUser,
    onEditingRowSave: (values) => {
      console.log('Editingvalues', values.values)
        setValidationErrors({});
        props.onUpdate(values.values, table);
        table.setEditingRow(null);
    },
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
    console.log('😡',internalEditComponents)
    return (
      <Stack>
        <Title order={3}>신규</Title>
        {/* {internalEditComponents.filter(component => component.props.cell.column.columnDef.renderCreate)} */}
        {internalEditComponents.filter(component => component.props.cell.column.columnDef.renderCreate).map(component => {
            if (component.props.cell.column.columnDef.editVariant == "checkbox") {
              // return <Checkbox key={component.key}></Checkbox>
              const columnDef = component.props.cell.column.columnDef;
              const { ...rest } = component;

              const updatedComponent = {
                ...rest,
                props: {
                  ...component.props,
                  cell: {
                    ...component.props.cell,
                    column: {
                      ...component.props.cell.column,
                      columnDef: {
                        ...columnDef,
                        // editVariant: "checkbox"
                      }
                    }
                  }
                },
              }

              return updatedComponent
              ,<div label="Checked"><Checkbox label="Flag" key={component.key}></Checkbox></div>
            } if (component.props.cell.column.columnDef.editVariant == "date") {
              const { ...rest } = component;
              return (
                component, <DatesProvider settings={{ consistentWeeks: true, locale: 'ko' }}>
                    <DatePickerInput
                    rightSection={<IconCalendar size={18} stroke={1.5} />}
                    rightSectionPointerEvents="none"
                    label="Date"
                    valueFormat="YYYY-MM-DD"
                    placeholder="Date input"
                    maw={400}
                    mx="auto"
                    />
                </DatesProvider>
            );
            } else {
              return component
            }
          })}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    )},

    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>수정</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderRowActions: ({ row, table }) => {
      return (
        <Flex gap="md">
          {props.showEdit && ( // showEdit prop이 true일 때만 수정 버튼 표시
            <Tooltip label="Edit">
              <ActionIcon onClick={() => table.setEditingRow(row)}>
                <IconEdit />
              </ActionIcon>
            </Tooltip>
          )}
          {props.showDelete && ( // showDelete prop이 true일 때만 삭제 버튼 표시
            <Tooltip label="Delete">
              <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
                <IconTrash />
              </ActionIcon>
            </Tooltip>
          )}
        </Flex>
      );
    },
    renderTopToolbarCustomActions: ({ table }) => {
      if (props.showCreate) {
        return (
        <Button
          onClick={() => {
            table.setCreatingRow(true); 
            // table.setCreatingRow(
            //   createRow(table, {
            //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
            //   }),
            // );
          }}
        >
          추가
        </Button>
        )
      }
      return null;
    },
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
function useCreateUser(newUserInfo) {
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