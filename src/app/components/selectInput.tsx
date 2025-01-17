'use client'

import * as React from 'react'
import { useState } from 'react';
import {
    Select, 
    SelectProps,
    // ComboboxItem, 
    // OptionsFilter 
} from '@mantine/core';

// https://mantine.dev/core/select//

// const optionsFilter: OptionsFilter = ({ options, search }) => {
//     const splittedSearch = search.toLowerCase().trim().split(' ');
//     return (options as ComboboxItem[]).filter((option) => {
//       const words = option.label.toLowerCase().trim().split(' ');
//       return splittedSearch.every((searchWord) => words.some((word) => word.includes(searchWord)));
//     });
// };

// const largeData = Array(100_000)
//   .fill(0)
//   .map((_, index) => `Option ${index}`);

export default function InputSelect(props: React.JSX.IntrinsicAttributes & SelectProps & React.RefAttributes<HTMLInputElement> & {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component?: any; renderRoot?: (props: Record<string, any>) => React.
            // defaultValue="React"
            ReactNode;
    }) {
    const [value, setValue] = useState<string | null>('');
    // const [searchValue, setSearchValue] = useState('');
    return (
            <Select
                // checkIconPosition="right/left"
                mt="md"
                wrapperProps={{ style: { width: '200px'} }} 
                // variant="filled/unstyle"
                // size={'xs/sm/md/lg/xl'}
                // radius={'xs/sm/md/lg/xl'}
                // label="select"
                // placeholder="select"
                // data={['React', 'Angular', 'Vue', 'Svelte']}
                data={[
                    { value: 'react', label: 'React' },
                    { value: 'ng', label: 'Angular' },
                ]}
                // data={[
                //     { group: 'Frontend', items: ['React', 'Angular'] },
                //     { group: 'Backend', items: ['Express', 'Django'] },
                // ]}
                // data={[
                //     { group: 'Frontend', items: [{ value: 'react', label: 'React' }, { value: 'ng', label: 'Angular' }] },
                //     { group: 'Backend', items: [{ value: 'express', label: 'Express' }, { value: 'django', label: 'Django' }] },
                // ]}
                // description="Description below the input"
                // defaultValue="React"
                value={value} 
                onChange={setValue}
                {...props}
                clearable
                allowDeselect
                searchable
                // searchValue={searchValue}
                // onSearchChange={setSearchValue}
                // data={largeData}
                // limit={5}
                // maxDropdownHeight={200} //scroll
                nothingFoundMessage="Nothing found..."
                // filter={optionsFilter}
                // classNames={classes}
            />
    )
}