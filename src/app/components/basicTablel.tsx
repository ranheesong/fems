import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; 
import 'mantine-react-table/styles.css';
import { useMemo, useState, useRef, useEffect } from 'react';
import {
  MantineReactTable,
  useMantineReactTable,
//   type MRT_RowSelectionState,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
  MRT_RowSelectionState,
} from 'mantine-react-table';
import { Box, Button, Checkbox, Flex, Container, Grid, NumberInput, TextInput, Select, Text, Modal} from '@mantine/core';
import { data, usStates } from './basicdata';
import { DatePickerInput, DatesProvider } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { ModalsProvider, modals } from "@mantine/modals";
import { nanoid } from 'nanoid';

const Input = ({ column, value, onChange }) =>  {
    const handleChange = (event) => {
        onChange(column.accessorKey, event.currentTarget.value);
    };

    const handleNumberInputChange = (value) => {
        onChange(column.accessorKey, value);
    }

    const handleDateChange = (event) => {
        const dateValue = event ? event.toISOString().split('T')[0] : null;
        onChange(column.accessorKey, dateValue);
    };

    const handleSelectChange = (event) => {
        onChange(column.accessorKey, event);
    }

    const handleCheckboxChange = (event) => {
        const checkedValue = event.currentTarget.checked;
        onChange(column.accessorKey, checkedValue);
    };

    const displayValue = value !== undefined ? value : '';

    switch (column.inputType) {
    case 'range':
        return (
            <Grid.Col span={{ base: 12, xs: column.xs }}>
            <NumberInput
                label={column.header}
                name={column.accessorKey}
                required={column.required}
                disabled={column.enableEditing === false}
                prefix={column.prefix  === undefined ? '' : column.prefix}
                suffix={column.suffix  === undefined ? '' : column.suffix}
                thousandSeparator=","
                hideControls
                placeholder='input Number value'
                value={displayValue} 
                onChange={handleNumberInputChange}
            />
            </Grid.Col>
        );
    case 'select':
        return (
            <Grid.Col span={{ base: 12, xs: column.xs }}>
            <Select
                label={column.header}
                name={column.accessorKey}
                data={column.options}
                required={column.required}
                disabled={column.enableEditing === false}
                placeholder="select value"
                value={displayValue} 
                onChange={handleSelectChange}
            />
            </Grid.Col>
        );
    case 'checkbox':
        return (
            <Grid.Col span={{ base: 12, xs: column.xs }}>
            <div>
                <label className="m_8fdc1311 mantine-InputWrapper-label mantine-Select-label" style={{ marginTop: '10px' }}>{column.header}</label>
                <Checkbox
                    name={column.accessorKey}
                    checked={displayValue === 'T' || displayValue === 'Y' || displayValue === true}
                    disabled={column.enableEditing === false}
                    onChange={handleCheckboxChange}
                />
            </div>
            </Grid.Col>
        );
    case 'date':
        return (
            <Grid.Col span={{ base: 12, xs: column.xs }}>
            <DatesProvider settings={{ consistentWeeks: true, locale: 'ko'}}>
                <DatePickerInput
                    rightSection={<IconCalendar size={18} stroke={1.5} />}
                    rightSectionPointerEvents="none"
                    valueFormat="YYYY-MM-DD"
                    clearable
                    label={column.header}
                    name={column.accessorKey}
                    disabled={column.enableEditing === false}
                    placeholder="input Date"
                    value={displayValue ? new Date(displayValue) : null} 
                    onChange={handleDateChange} 
                />
            </DatesProvider>
            </Grid.Col>
        );
    default:
        return <Grid.Col span={{ base: 12, xs: column.xs }}>
                <TextInput
                    label={column.header}
                    name={column.accessorKey}
                    required={column.required}
                    disabled={column.enableEditing === false}
                    placeholder={column.enableEditing === false? 'autocomplete' : 'input Text value'}
                    value={displayValue}
                    onChange={handleChange} 
                />
                </Grid.Col>;
    }
};

const Example = (props) => {
    const initialGlobalFilter = props.globalFilter === undefined ? true : props.globalFilter;
    const initialToggleFilter = props.toggleFilter === undefined ? true : props.toggleFilter;
    const initialShowAddBtn = props.showCreate === undefined ? true : props.showCreate;
    const initialShowModBtn = props.showEdit === undefined ? true : props.showEdit;
    const initialShowDelBtn = props.showDelete === undefined ? true : props.showDelete;
    const showSelect = props.showSelect === undefined ? true : props.showSelect;
    const [showGlobalFilter, setShowGlobalFilter] = useState(initialGlobalFilter);
    const [showToggleFilter, setShowToggleFilter] = useState(initialToggleFilter);
    const [showAddBtn, setShowAddBtn] = useState(initialShowAddBtn);
    const [showModBtn, setShowModBtn] = useState(initialShowModBtn);
    const [showDelBtn, setShowDelBtn] = useState(initialShowDelBtn);

    const formRef = useRef({});
    const [showFormDataModal, setShowFormDataModal] = useState(false); // 모달 표시 상태
    const [modalFormData, setModalFormData] = useState({});

    const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
    const [inputValues, setInputValues] = useState({});

    const handleInputChange = (key, value) => { // useCallback 제거
        formRef.current[key] = value; // formRef 업데이트
        setInputValues({
            ...inputValues,
            [key]: value,
        });
    };

    const generateColumns = () => {  // 함수로 분리
        return props.columns.map((config) => {
            const column = {
                accessorKey: config.accessorKey,
                header: config.header,
                size: config.size,
                filterVariant: config.filterVariant,
                enableEditing: config.enableEditing !== undefined ? config.enableEditing : true,
                required: config.required !== undefined ? config.required : false,
                enableClickToCopy: config.enableClickToCopy !== undefined ? config.enableClickToCopy : false,
                ...config,
            };

            if (config.inputType === 'range') {
                column.mantineFilterRangeSliderProps = {
                    color: 'indigo',
                    label: (value) => {
                        const options = {
                            minimumFractionDigits: config.minimumFractionDigits !== undefined ? config.minimumFractionDigits : 0,
                            maximumFractionDigits: config.maximumFractionDigits !== undefined ? config.maximumFractionDigits : 0,
                            };
                            
                        if (config.style) {
                            options.style = config.style;
                        }
                        if (config.currency) {
                            options.currency = config.currency;
                        }
                        if (config.unit) {
                            options.unit = config.unit;
                        }
                
                        return value?.toLocaleString?.('ko-KR', options);
                    },
                };
                column.Cell = ({ cell }) => {
                    const cellValue = cell.getValue<number>();
                    const options = {
                        minimumFractionDigits: config.minimumFractionDigits !== undefined ? config.minimumFractionDigits : 0,
                        maximumFractionDigits: config.maximumFractionDigits !== undefined ? config.maximumFractionDigits : 0,
                    };
                    
                    if (config.style) {
                        options.style = config.style;
                    }
                    if (config.currency) {
                        options.currency = config.currency;
                    }
                    if (config.unit) {
                        options.unit = config.unit;
                    }

                    if (config.useRangebox) {
                        return (
                            <Box
                            style={(theme) => ({
                                backgroundColor:
                                cellValue < 50_000
                                    ? theme.colors.red[7]
                                    : cellValue >= 50_000 && cellValue < 75_000
                                    ? theme.colors.yellow[7]
                                    : theme.colors.green[7],
                                borderRadius: '4px',
                                color: '#fff',
                                maxWidth: '9ch',
                                padding: '4px',
                            })}
                            >
                            {cellValue?.toLocaleString?.('ko-KR', options)}
                            </Box>
                        );
                    } else { 
                        return <>{cellValue?.toLocaleString?.('ko-KR', options)}</>;
                    }
                };
                
            } else if (config.inputType === 'checkbox') {
                column.Cell = ({ renderedCellValue }) => {
                    const isChecked = renderedCellValue == 'Y' || renderedCellValue === 'T' || renderedCellValue === true;
                    return (
                    <Checkbox
                        checked={isChecked}
                        readOnly
                    />
                    );
                };
            } else if (config.inputType === 'date') {
                column.accessorFn = (row) => {
                    const accessorKey = config.accessorKey
                    const sDay = new Date(row[accessorKey]);
                    sDay.setHours(0, 0, 0, 0);
                    return sDay;
                };
                column.Cell = ({ cell }) => cell.getValue<Date>()?.toLocaleDateString();
                column.Header = ({ column }) => <em>{column.columnDef.header}</em>;
            } else if (config.inputType === 'select') {
              // 필요한 설정 추가 (예: options)
            } else {
                // 다른 inputType에 대한 처리 추가
            }

            return column;
        });
    };

    const columns = generateColumns();

const table = useMantineReactTable({
    columns,
    data,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableFacetedValues: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableMultiRowSelection: false,
    enableRowActions: false,
    enableRowSelection: false,
    initialState: {
        showColumnFilters: false,
        showGlobalFilter: true,
        columnPinning: {
            left: ['mrt-row-expand', 'mrt-row-select'],
        },
    },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    mantinePaginationProps: {
        radius: 'md',
        size: 'md',
    },
    mantineSearchTextInputProps: {
        placeholder: 'Search Employees',
    },
    getRowId: (row) => row.firstName,
    mantineTableBodyRowProps: ({ row }) => ({
        // onClick: row.getToggleSelectedHandler(),
        onClick: () => {
            setRowSelection({
                [row.id]: !rowSelection[row.id],
            });
            formRef.current = row.original;
            setInputValues(row.original);
        },
        selected: rowSelection[row.id],
        sx: { cursor: 'pointer' },
    }),
    state: {
        rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    renderTopToolbar: ({ table }) => {
        const handleCreate = async (props) => {
            const formData = Object.keys(formRef.current).reduce((acc, key) => {
                acc[key] = formRef.current[key];
                return acc;
            }, {});

            setModalFormData(formData); // 모달에 표시할 formData 설정

            modals.openConfirmModal({
                title: <Text fw={700}>저장 알림</Text>,
                children: <Text fw={500} c="dimmed" ta="center">해당 데이터를 저장하시겠습니까?</Text>,
                labels: {
                    confirm: "저장",
                    cancel: "취소",
                },
                confirmProps: { color: "blue" },
                onConfirm: () => {
                    console.log(formData)
                    setShowFormDataModal(true);
                    setInputValues({}); //초기화
                    formRef.current = {}; // formRef 초기화 (선택적)
                    // try {
                    //     const response = await fetch('/address', { 
                    //         method: 'POST',
                    //         headers: {
                    //             'Content-Type': 'application/json',
                    //         },
                    //         body: JSON.stringify(formData),
                    //     });
            
                    //     if (!response.ok) {
                    //         const errorData = await response.json(); // Try to parse error response
                    //         throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
                    //     }
            
                    //     const result = await response.json();
                    //     console.log('저장 완료', result);
                    //     setFormData({});
                    //     alert('저장 완료');
                    // } catch (error) {
                    //     console.error('Error sending data:', error); 
                    //     alert('저장 실패');
                    // }
                },
                onCancel: () => {
                    setShowFormDataModal(false); // 모달 닫기
                },
            });
        };

        const handleUpdate = () => {
            table.getSelectedRowModel().flatRows.map((row) => {
                const formData = Object.keys(formRef.current).reduce((acc, key) => {
                    acc[key] = formRef.current[key];
                    return acc;
                }, {});

                setModalFormData(formData); // 모달에 표시할 formData 설정

                modals.openConfirmModal({
                    title: <Text fw={700}>수정 알림</Text>,
                    children: <Text fw={500} c="dimmed" ta="center">해당 {row.getValue('firstName')} 데이터를 수정하시겠습니까?</Text>,
                    labels: {
                        confirm: "수정",
                        cancel: "취소",
                    },
                    confirmProps: { color: "yellow" },
                    onConfirm: () => {
                        setShowFormDataModal(true);
                        // console.log(table.getSelectedRowModel().flatRows[0].original)
                        setInputValues({}); //초기화
                        formRef.current = {}; // formRef 초기화 (선택적)       
                    },
                    onCancel: () => {
                        setShowFormDataModal(false); // 모달 닫기
                    },
                });
            });
        };

        const handleDelete = () => {
            table.getSelectedRowModel().flatRows.map((row) => {
                modals.openConfirmModal({
                    title: <Text fw={700}>삭제 알림</Text>,
                    children: <>
                    <Text fw={600} c="dimmed" ta="center">* 삭제주의 *</Text>
                    <Text fw={500} c="dimmed" ta="center">기준 정보 삭제 시 데이터가 누락 될 수 있으니,</Text>
                    <Text fw={500} c="dimmed" ta="center">사용여부 = N 처리를 권장합니다. </Text>
                    <Text fw={500} c="dimmed" ta="center">해당 {row.getValue('firstName')} 데이터를 삭제하시겠습니까?</Text></>,
                    labels: {
                        confirm: "삭제",
                        cancel: "취소",
                    },
                    confirmProps: { color: "red" },
                    onConfirm: () => {
                        alert('activating ' + row.getValue('firstName'));
                        setInputValues({}); //초기화
                        formRef.current = {}; // formRef 초기화 (선택적)   
                    },
                });
            });
        };

        return (
            <>
                <Flex p="md" justify="space-between">
                    <Flex gap="xs">
                        {showGlobalFilter && (
                            <MRT_GlobalFilterTextInput table={table} />
                        )}
                        {showToggleFilter && (
                            <MRT_ToggleFiltersButton table={table} />
                        )}
                        
                    </Flex>
                    <Flex style={{ gap: '8px' }}>
                        {showAddBtn && (
                            <Button
                                type="submit"
                                variant="light"
                                onClick={handleCreate}
                            >
                            저장
                            </Button>
                        )}
                        {showModBtn && (
                            <Button
                            color="yellow"
                            disabled={!table.getIsSomeRowsSelected()}
                            variant="light"
                            onClick={handleUpdate}
                            >
                            수정
                            </Button>
                        )}
                        {showDelBtn && (
                            <Button
                            color="red"
                            disabled={!table.getIsSomeRowsSelected()}
                            variant="light"
                            onClick={handleDelete}
                            >
                            삭제
                            </Button>
                        )}
                    </Flex>
                </Flex>
                <Container my="md">
                    <Grid p="md" style={{backgroundColor: 'rgb(244,244,244,0.1)', borderRadius: '10px'}}>
                        {props.columns.map((column) => (
                            <Input 
                                column={column} 
                                key={column.accessorKey}
                                value={inputValues[column.accessorKey]}
                                onChange={handleInputChange}/> // Input 컴포넌트 사용
                        ))}
                    </Grid>
                </Container>
                <Modal
                    opened={showFormDataModal}
                    onClose={() => setShowFormDataModal(false)}
                    title={<Text fw={700}>Form Data</Text>}
                    size="xl" // 필요에 따라 크기 조절
                >
                    <pre>{JSON.stringify(modalFormData, null, 2)}</pre> 
                </Modal>
            </>
            );
        },
});

return <MantineReactTable table={table} />;
};

export default Example;