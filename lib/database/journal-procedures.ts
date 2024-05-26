import { PrismaClient } from "@prisma/client";
import { DEBIT, CREDIT } from "./direction";
import { balanceLedgerProcedure } from "./common-procedures";

export async function createJournalProcedure(
    client: PrismaClient,
    {
        debitAccountId,
        creditAccountId,
        amount,
        description,
    }: { 
        debitAccountId: number, 
        creditAccountId: number, 
        amount: bigint, 
        description: string,
    }
) {
    const journal = await client.journal.create({
        data: {
            description,
        },
    });

    const debitAccount = await client.account.findUnique({
        where: {
            id: debitAccountId,
        },
        include: {
            accountType: true,
        },
    });

    const creditAccount = await client.account.findUnique({
        where: {
            id: creditAccountId,
        },
        include: {
            accountType: true,
        },
    });

    const openDebitLedger = await client.ledger.findFirst({
        where: {
            account: { id: debitAccountId, },
            open: true,
        },
        orderBy: {
            id: "desc",
        },
    });

    const openCreditLedger = await client.ledger.findFirst({
        where: {
            account: { id: creditAccountId, },
            open: true,
        },
        orderBy: {
            id: "desc",
        },
    });

    const debitBalance = openDebitLedger.balance 
        + amount * BigInt(DEBIT) * BigInt(debitAccount.accountType.ledgerDirection);
    const creditBalance = openCreditLedger.balance
        + amount * BigInt(CREDIT) * BigInt(creditAccount.accountType.ledgerDirection);

    const debitEntry = await client.entry.create({
        data: {
            journal: { connect: { id: journal.id } },
            ledger: { connect: { id: openDebitLedger.id } },
            direction: DEBIT,
            amount,
            balance: debitBalance,
        },
    });

    const creditEntry = await client.entry.create({
        data: {
            journal: { connect: { id: journal.id } },
            ledger: { connect: { id: openCreditLedger.id } },
            direction: CREDIT,
            amount,
            balance: creditBalance,
        },
    });

    await client.ledger.update({
        where: {
            id: openDebitLedger.id,
        },
        data: {
            balance: debitBalance,
        },
    });

    await client.ledger.update({
        where: {
            id: openCreditLedger.id,
        },
        data: {
            balance: creditBalance,
        },
    });

    return journal;
}

export async function deleteJournalProcedure(
    client: PrismaClient,
    { id, skipUpdateLedgerBalance = false }: { id: number, skipUpdateLedgerBalance?: boolean }
) {
    const journal = await client.journal.update({
        data: {
            softDeleted: true,
        },
        where: {
            id,
        },
        include: {
            entries: {
                include: {
                    ledger: true,
                },
            },
        },
    });

    await client.entry.updateMany({
        data: {
            softDeleted: true,
        },
        where: {
            journal: { id: journal.id },
        },
    });

    if (!skipUpdateLedgerBalance) {
        await Promise.all(journal.entries.map(async (entry) => {
            if (entry.ledger.open && !entry.ledger.softDeleted) {
                await balanceLedgerProcedure(client, { id: entry.ledger.id });
            }
        }));
    }

    return journal;
}

export async function deleteJournalManyProcedure(
    client: PrismaClient,
    { ids }: { ids: number[] }
) {
    const journals = await Promise.all(ids.map(async (id) => {
        return await deleteJournalProcedure(client, { 
            id, skipUpdateLedgerBalance: true 
        });
    }));

    const ledgerIds = journals.reduce<number[]>((acc, journal) => {
        return journal.entries.reduce((acc, entry) => {
            if (!acc.includes(entry.ledger.id) && entry.ledger.open && !entry.ledger.softDeleted) {
                acc.push(entry.ledger.id);
            }

            return acc
        }, acc);
    }, []);

    await Promise.all(ledgerIds.map(
        async (ledgerId) => await balanceLedgerProcedure(client, { id: ledgerId })
    ));
}