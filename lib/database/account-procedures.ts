import { PrismaClient } from "@prisma/client";
import { createAccountCodeProcedure } from "./account-code-procedures";
import * as accountCodeString from "../utils/accountCode";

export async function createAccountProcedure(
    client: PrismaClient, 
    {
        name,
        accountCode: accountCode_,
        accountType,
    }: {
        name: string,
        accountCode: { code: number, createChildIncrement?: boolean },
        accountType: string,
    }
) {
    const accountCode = await createAccountCodeProcedure(client, accountCode_);

    let parentAccountCode;
    
    if (accountCode.parentId) {
        parentAccountCode = await client.accountCode.findUnique({
            where: {
                id: accountCode.parentId,
            },
        });
    }

    const code = parentAccountCode 
        ? `${parentAccountCode.code}-${accountCodeString.format(accountCode.code)}`
        : `${accountCode.code}`;

    const account = await client.account.create({
        data: {
            code,
            name,
            accountCode: { connect: { id: accountCode.id } },
            accountType: { connect: { name: accountType } },
        },
    });

    await client.ledger.create({
        data: {
            balance: BigInt(0),
            account: { connect: { id: account.id, } },
        },
    });

    return account;
}