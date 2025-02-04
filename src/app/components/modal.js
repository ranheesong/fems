'use client'
import * as React from 'react'
import { Modal } from '@mantine/core';

const CustomModal = ({
    opened,
    onClose,
    title,
    children,
    size,
    centered,
    withCloseButton,
    onExitTransitionEnd,
    overlayProps,
    // ... props
    }) => {
        return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            size={size}
            centered={centered}
            withCloseButton={withCloseButton}
            onExitTransitionEnd={onExitTransitionEnd}
            overlayProps={overlayProps}
        >
            {children}
        </Modal>
        );
};

export default CustomModal;