'use client'
import * as React from 'react'
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import MyButton from './components/myButton'
import DatePicker from './components/datepickerinputs'
// import DateTimePicker from './components/datetimepicker'
import InputText from './components/textInput'
import InputSelect from './components/selectInput'
import ActionToggle from './components/actionToggle'
// import ReactTable from './components/reactTable'
// import TestTable from './components/testTable'
import { Modal } from '@mantine/core';;
import Example from './components/testTable2'
import { MantineProvider, 
  Group,
  Box,
  // createTheme, 
  } from '@mantine/core';
import classes from './css/HeaderMenu.module.css';
// import CustomModal from './components/modal'; // 모달 컴포넌트 import

export default function Page() {
    const handleClick = (message) => {
      console.log(message); // Display alert message
    };

    const [opened, { open, close }] = useDisclosure(false);
    const [modalData, setModalData] = useState({
      title: '',
      message: '',
    });
    const [inputValue1, setInputValue1] = useState('');
    const [inputValue2, setInputValue2] = useState('');

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
            <Example />
          </Group>

          <Group justify='flex-start' gap='xs' className={classes.basicButton}>
          <Modal
            opened={opened}
            onClose={close}
            withCloseButton={false} // 닫기버튼
            // size = "auto" // zs, sm, md, lg, xl, 55rem, 70%, 100%
            onExitTransitionEnd={() => { 
              setModalData({ title: '', message: '' }); 
              setInputValue1(''); 
              setInputValue2(''); }}
            title={modalData.title}
            // fullScreen
            // overlayProps={{
            //   backgroundOpacity: 0.55,
            //   blur: 3,
            // }} //뒷단 블러처리
            centered
          >
            {modalData.message}
            <InputText 
              label="First input" 
              placeholder="First input"
              value={inputValue1} 
              onChange={(event) => setInputValue1(event.target.value)}  
            />
            <InputText
              data-autofocus
              label="Input with initial focus"
              placeholder="It has data-autofocus attribute"
              mt="md"
              value={inputValue2} 
              onChange={(event) => setInputValue2(event.target.value)} 
            />
            <Group justify='flex-end'>
            <MyButton variant="light" onClick={() => close()}>닫기</MyButton>
            </Group>
          </Modal>
          <MyButton variant="light" onClick={() => {open(); setModalData({ title: 'test Modal', message: 'test message' });}}>모달 테스트</MyButton>
          </Group>
          <Group>
            {/* <TestTable/> */}
          </Group>
        </Box>
      </MantineProvider>
  )
}

