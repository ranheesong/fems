'use client'

import * as React from 'react'
import { useState } from 'react';
import { DatePickerInput, DatesProvider} from '@mantine/dates';
import 'dayjs/locale/ko';
import '@mantine/dates/styles.css';
import { IconCalendar } from '@tabler/icons-react';

export default function DatePicker(props) {
    const [value, setValue] = useState<Date | null>(null);
    return (
        <DatesProvider settings={{ consistentWeeks: true, locale: 'ko'}}>
            <DatePickerInput
                rightSection={<IconCalendar size={18} stroke={1.5} />}
                rightSectionPointerEvents="none"
                clearable
                wrapperProps={{ style: { width: '200px' } }}
                // variant="filled/unstyle"
                // size={'xs/sm/md/lg/xl'}
                // radius={'xs/sm/md/lg/xl'}
                // type="multiple/range"
                // dropdownType="popover/modal"
                // label="Pick date"
                // placeholder="Pick date"
                valueFormat="YYYY-MM-DD"
                value={value}
                onChange={setValue}
                {...(props)} 
                // disabled
                // withAsterisk
                // classNames={classes}
            />
        </DatesProvider>
    );
}