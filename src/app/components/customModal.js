'use client'
import * as React from 'react'
import { useState } from 'react';
import { ModalsProvider } from '@mantine/modals';
import { Modal, Button, TextInput, Select, Checkbox,} from '@mantine/core';
import { DatePickerInput, DatesProvider} from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import moment from 'moment';

function MyModal(props) {
    const [opened, setOpened] = useState(false);
    const [formData, setFormData] = useState({});

    const handleInputChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleFormSubmit = () => {
        // form data 처리 로직
        console.log(formData);
        // setOpened(false);
    };

    const renderInput = (column) => {
        switch (column.inputType) {
        case 'text':
            return (
            <TextInput
                label={column.header}
                name={column.key}
                value={formData[column.key]}
                onChange={handleInputChange}
                required={column.required}
                disabled={column.enableEditing === false}
                mt={10} 
            />
            );
        case 'select':
            return (
            <Select
                label={column.header}
                name={column.key}
                value={formData[column.key]}
                onChange={(value) => setFormData({ ...formData, [column.key]: value })}
                data={column.options}
                required={column.required}
                disabled={column.enableEditing === false}
                mt={10} 
            />
            );
        case 'checkbox':
            return (
            <div>
                <label className="m_8fdc1311 mantine-InputWrapper-label mantine-Select-label" style={{ marginTop: '10px' }}>{column.header}</label>
                <Checkbox
                    name={column.key}
                    checked={formData[column.key]}
                    disabled={column.enableEditing === false}
                    onChange={(event) =>
                    setFormData({ ...formData, [event.target.name]: event.target.checked })
                    }
                />
            </div>
            );
        case 'date':
            return (
            <DatesProvider settings={{ consistentWeeks: true, locale: 'ko'}}>
                <DatePickerInput
                    rightSection={<IconCalendar size={18} stroke={1.5} />}
                    rightSectionPointerEvents="none"
                    valueFormat="YYYY-MM-DD"
                    placeholder="Date input"
                    clearable
                    label={column.header}
                    name={column.key}
                    value={formData[column.key]} 
                    onChange={(value) => setFormData({ ...formData, [column.key]: value })}
                    disabled={column.enableEditing === false}
                    mt={10} 
                />
            </DatesProvider>
            );
        default:
            return <TextInput
                        label={column.header}
                        name={column.key}
                        value={formData[column.key]}
                        onChange={handleInputChange}
                        required={column.required}
                        disabled={column.enableEditing === false}
                        mt={10} 
                    />;
        }
    };

    return (
        <div>
            <div>
                <Button onClick={() => setOpened(true)}>c추가</Button>
            </div>
        <ModalsProvider>
            <Modal opened={opened} onClose={() => setOpened(false)} title="My Modal">
                <form 
                    onSubmit={handleFormSubmit}
                >
                {props.columns.map((column) => (
                    <div key={column.key}>
                    {/* {column.renderEdit !== false && renderInput(column)} */}
                    {renderInput(column)}
                    </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" mt={20}>저장</Button>
                    <Button mt={20} ml={5} onClick={console.log(formData)}>데이터확인</Button>
                    <Button variant="outline" mt={20} ml={5} onClick={() => setOpened(false)}>닫기</Button>
                </div>
                </form>
            </Modal>
        </ModalsProvider>
        </div>
    );
}

export default MyModal;