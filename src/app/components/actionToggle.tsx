'use client'
import * as React from 'react'
import cx from 'clsx';
import { ActionIcon, Group, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import classes from '../css/ActionToggle.module.scss';
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, 
        //faMoon 
} from '@fortawesome/free-solid-svg-icons'

export default function ActionToggle() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

    return (
        <Group justify="center">
        <ActionIcon
            onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
            variant="default"
            size="xl"
            aria-label="Toggle color scheme"
        >
            <FontAwesomeIcon icon={faSun} className={cx(classes.icon, classes.light)}/>
            {/*  <FontAwesomeIcon icon={faMoon} className={cx(classes.icon, classes.dark)}/>*/}
        </ActionIcon>
        </Group>
    );
}