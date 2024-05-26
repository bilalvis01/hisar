import { PrismaClient } from "@prisma/client";
import { createAccountCodeProcedure } from "./account-code-procedures";

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

    const account = await client.account.create({
        data: {
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