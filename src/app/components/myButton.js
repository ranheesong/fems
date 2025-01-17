'use client'

import * as React from 'react'
// import { useState } from 'react'
import {
    Button, 
    // createTheme, 
    // Tooltip,
} from '@mantine/core';

export default function MyButton(props) {
    return (
        <>
        {/* <Tooltip label="tooltips"> */}
            <Button
                type="button"
                // color="red" 
                // variant="filled/outline/light" 
                // size="sm"
                // fullWidth
                // classNames={classes}
                {...props}
            >
            {props.children}
            </Button>
        {/* </Tooltip> */}
        </>
    )
}
