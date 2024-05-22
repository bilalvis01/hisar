import { Budget } from "../graphql/graphql";

export default function createMessageBudgetDelete(budgets: Budget[], prefix?: string, suffix?: string) {
    const message = budgets.reduce((acc, budget, index, array) => {
        let conjunction;

        if (index === array.length - 1) {
            conjunction = " dan ";
        } else {
            conjunction = ", "
        }

        if (index === 0) return `"${budget.name}"`;
        if (index === 1) return `${acc}${conjunction}"${budget.name}"`;
        if (index === 2) return `${acc}${conjunction}yang lainnya`;

        return acc;
    }, "");

    return `${prefix}${message}${suffix}`;
}