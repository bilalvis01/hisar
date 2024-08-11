import React from "react";
import style from "./budget-transaction-detail.module.scss";
import BudgetTransactionDetailCard from "../../../../components/budget-transaction-detail-card/BudgetTransactionDetailCard";

export default function Page() {
    return (
        <>
            <div className={style.container}>
                <BudgetTransactionDetailCard disableBudgetSelectionWhenUpdate={true} />
            </div>
        </>
    );
}