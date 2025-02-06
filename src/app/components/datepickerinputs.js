'use client';

import * as React from 'react';
import { DatePickerInput, DatesProvider } from '@mantine/dates';
import 'dayjs/locale/ko';
import '@mantine/dates/styles.css';
import { IconCalendar } from '@tabler/icons-react';

export default function DatePicker({
    label, 
    placeholder, 
    value,
    type,
    dropdownType,
    onChange,
    ...rest
}) {
    return (
        <DatesProvider settings={{ consistentWeeks: true, locale: 'ko' }}>
            <DatePickerInput
                rightSection={<IconCalendar size={18} stroke={1.5} />}
                rightSectionPointerEvents="none"
                clearable
                wrapperProps={{ style: { width: '200px' } }}
                // variant="filled/unstyle"
                // size={'xs/sm/md/lg/xl'}
                // radius={'xs/sm/md/lg/xl'}
                type={type}// type="multiple/range"
                dropdownType={dropdownType}// dropdownType="popover/modal"
                label={label} 
                placeholder={placeholder} 
                valueFormat="YYYY-MM-DD"
                value={value} 
                onChange={onChange} 
                {...rest}
            />
        </DatesProvider>
    );
}