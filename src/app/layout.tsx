"use client";

import Head from "next/head";
import type { Metadata } from "next";
// import "./globals.css";
import "@mantine/core/styles.css";
import {
    ColorSchemeScript,
    MantineProvider,
    mantineHtmlProps,
} from "@mantine/core";

import { useState } from "react";
import { Text } from "@mantine/core";
import classes from "./NavbarSegmented.module.css";
import Link from "next/link";
import { AppShell, Burger } from "@mantine/core";
// export const metadata: Metadata = {
//     title: "Create Next App",
//     description: "Generated by create next app",
// };

const tabs = [
    { link: "/grid/modal", label: "modal" },
    { link: "/grid/inline", label: "inline" },
];
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [active, setActive] = useState("");
    return (
        <html lang="en" {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <MantineProvider>
                    <AppShell
                        navbar={{
                            width: 300,
                            breakpoint: "sm",
                        }}
                        padding="md"
                    >
                        <AppShell.Header></AppShell.Header>

                        <AppShell.Navbar p="md">
                            <nav className={classes.navbar}>
                                <div>
                                    <Text
                                        fw={500}
                                        size="sm"
                                        className={classes.title}
                                        c="dimmed"
                                        mb="xs"
                                    >
                                        메뉴
                                    </Text>
                                </div>

                                <div className={classes.navbarMain}>
                                    {tabs.map((item) => (
                                        <Link
                                            className={classes.link}
                                            data-active={
                                                item.label === active ||
                                                undefined
                                            }
                                            href={item.link}
                                            key={item.label}
                                            onClick={(event) => {
                                                setActive(item.label);
                                            }}
                                        >
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </nav>
                        </AppShell.Navbar>

                        <AppShell.Main>{children}</AppShell.Main>
                    </AppShell>
                </MantineProvider>
            </body>
        </html>
    );
}
