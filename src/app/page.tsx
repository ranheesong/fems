"use client";

import { useState } from "react";
import {
    Icon2fa,
    IconBellRinging,
    IconDatabaseImport,
    IconFileAnalytics,
    IconFingerprint,
    IconKey,
    IconLicense,
    IconLogout,
    IconMessage2,
    IconMessages,
    IconReceipt2,
    IconReceiptRefund,
    IconSettings,
    IconShoppingCart,
    IconSwitchHorizontal,
    IconUsers,
} from "@tabler/icons-react";
import { SegmentedControl, Text } from "@mantine/core";
import classes from "./NavbarSegmented.module.css";
import Link from "next/link";

const tabs = [
    { link: "grid/modal", label: "modal" },
    { link: "grid/inline", label: "inline" },
];

export default function Page() {
    return;
}
