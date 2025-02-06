"use client";

import '@mantine/core/styles.css';
import 'mantine-react-table/styles.css';
import {
    ColorSchemeScript,
    MantineProvider,
    mantineHtmlProps,
} from "@mantine/core";

import { useState } from "react";
import { Text } from "@mantine/core";
import classes from "./NavbarSegmented.module.css";
import Link from "next/link";
import { AppShell } from "@mantine/core";

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
