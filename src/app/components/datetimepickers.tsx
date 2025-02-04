'use client'

import * as React from 'react'
import { useState } from 'react';
import { DateTimePicker, DateTimePickerProps, DatesProvider } from '@mantine/dates';
import 'dayjs/locale/ko';
import '@mantine/dates/styles.css';

export default function DateTime(props: React.JSX.IntrinsicAttributes & DateTimePickerProps & React.RefAttributes<HTMLButtonElement> & { component?: unknown; renderRoot?: (props: Record<string, unknown>) => React.ReactNode; }) {
    const [value, setValue] = useState<Date | null>(null);
    return (
        <DatesProvider settings={{ consistentWeeks: true, locale: 'ko'}}>
            <DateTimePicker
                clearable
                wrapperProps={{ style: { width: '200px' } }}
                // size={'xs/sm/md/lg/xl'}
                // radius={'xs/sm/md/lg/xl'}
                // type="multiple/range"
                // dropdownType="popover/modal"
                // label="Pick date"
                // placeholder="Pick date"
                valueFormat="YYYY MM DD hh:mm A"
                // withSeconds
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