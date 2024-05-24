import { Budget } from "@prisma/client";

export default function createMessageBudgetDelete(budgets: string[], prefix?: string, suffix?: string) {
    const message = budgets.reduce((acc, budget, index, array) => {
        let conjunction;

        if (index === array.length - 1) {
            conjunction = " dan ";
        } else {
            conjunction = ", "
        }

        if (index === 0) return `"${budget}"`;
        if (index === 1) return `${acc}${conjunction}"${budget}"`;
        if (index === 2) return `${acc}${conjunction}yang lainnya`;

        return acc;
    }, "");

    return `${prefix}${message}${suffix}`;
}