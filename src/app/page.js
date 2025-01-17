import * as React from 'react'
import MyButton from './components/myButton'
import DatePicker from './components/datepickerinputs'
// import DateTimePicker from './components/datetimepicker'
import InputText from './components/textInput'
import InputSelect from './components/selectInput'
import ActionToggle from './components/actionToggle'
import ReactTable from './components/reactTable'
import TestTable from './components/testTable'
import { MantineProvider, 
  Group,
  Box,
  // createTheme, 
  } from '@mantine/core';
import classes from './css/HeaderMenu.module.css';

export default function Page() {
    const handleClick = (message) => {
      console.log(message); // Display alert message
    };
    
    return (
        <MantineProvider defaultColorScheme="dark">
          <Box pb={120}>
            <header className={classes.header}>
              <Group>
                <h2>계측(TAG) 기준 정보 관리</h2>
                <ActionToggle/>
              </Group>
              <Group gap='xs' justify='flex-end' align='flex-end' className={classes.search}>
                <InputText
                  label="input"
                  placeholder="input value"
                />
                <div>
                <InputSelect
                  label="select"
                  placeholder="Pick value"
                />
                </div>
                <DatePicker
                  label="start date"
                  placeholder="Pick start date"
                />
                <DatePicker
                  label="end date"
                  placeholder="Pick end date"
                />
                {/* <DateTimePicker
                  label="datetime"
                  placeholder="Pick date and time"
                /> */}
                <MyButton
                  variant="filled"
                  onClick={ handleClick('조회 Button is clicked!')}
                >조회</MyButton>
              </Group>
          {/* 주석 */}
          </header>
          <Group gap='xs' justify='flex-start' className={classes.basicButton}>
            <MyButton
              color="yellow"
              variant="light"
              size="sm"
              onClick={ console.log('Button is clicked!')}
            >신규</MyButton>
            <MyButton
              color="green"
              variant="light"
              size="sm"
              onClick={ console.log('Button is clicked!')}
            >저장</MyButton>
            <MyButton
              color="red"
              variant="light"
              size="sm"
              onClick={ console.log('Button is clicked!')}
            >삭제</MyButton>
          </Group>
          <Group>
            <ReactTable/>
          </Group>
          <Group>
            <TestTable/>
          </Group>
        </Box>
      </MantineProvider>
  )
}

