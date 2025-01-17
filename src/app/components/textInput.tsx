'use client'

import * as React from 'react'
import { useState } from 'react'
import { 
    TextInput, 
    CloseButton, 
    TextInputProps,
    // Tooltip
} from '@mantine/core';

// https://mantine.dev/core/text-input/
// https://mantine.dev/form/use-form/

export default function InputText(props: React.JSX.IntrinsicAttributes & TextInputProps & React.RefAttributes<HTMLInputElement> & { component?: unknown; renderRoot?: (props: Record<string, unknown>) => React.ReactNode; }) {
    const [value, setValue] = useState('');
    const [, setFocused] = useState(false);
    return (
            <TextInput
                wrapperProps={{ style: { width: '200px' } }}
                // variant="filled/unstyle"
                // label="Name"
                // placeholder="Name"
                // size={'xs/sm/md/lg/xl'}
                // radius={'xs/sm/md/lg/xl'}
                {...props}
                // disabled
                // withAsterisk
                value={value}
                onChange={(event) => setValue(event.currentTarget.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                // inputContainer={(children) => (
                //     <Tooltip label="tooltip" position="top-start" opened={focused}>
                //     {children}
                //     </Tooltip>
                // )}
                // classNames={classes}
                rightSectionPointerEvents="all"
                rightSection={
                <CloseButton
                    aria-label="Clear input"
                    onClick={() => setValue('')}
                    style={{ display: value ? undefined : 'none' }}
                />
                }
            />
    )
}