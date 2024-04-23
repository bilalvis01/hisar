import React from "react";
import TabBase, { TabBaseProps } from "./TabBase";

interface TabPrimaryProps extends TabBaseProps {}

export default function TabPrimary({ variant, ...props }: TabPrimaryProps) {
    return <TabBase variant="secondary" {...props} />;
}