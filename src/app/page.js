import * as React from 'react'
import ActionToggle from './components/actionToggle'
// import TestTable2 from './components/testTable2'
import { MantineProvider, 
  Group,
  Box,
  // createTheme, 
  } from '@mantine/core';
import classes from './css/HeaderMenu.module.css';

export default function Page() {
    
    return (
        <MantineProvider defaultColorScheme="dark">
          <Box pb={120}>
            <header className={classes.header}>
              <Group>
                <h2>FEM.S</h2>
              </Group>
          {/* 주석 */}
          </header>
        </Box>
      </MantineProvider>
  )
}

