import { PrismaClient, Journal } from "@prisma/client";
import { DEBIT, CREDIT } from "./direction";
import { balancingLedgerProcedure } from "./common-procedures";
import { skip } from "node:test";

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

export async function updateJournalAmountProcedure(
    client: PrismaClient,
    {
        id,
        amount,
    }: {
        id: number;
        amount: bigint;
    }
) {
    const journal = await client.journal.findUnique({
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

    let updatedEntries;

    if (
        journal.entries.every(
            (entry) => entry.ledger.open && !entry.ledger.deletedAt
        )
    ) {
        updatedEntries = await Promise.all(journal.entries.map(async (entry) => {
            const updatedEntry = await client.entry.update({
                data: {
                    amount,
                },
                where: {
                    id: entry.id,
                },
            });

            await balancingLedgerProcedure(client, { id: entry.ledger.id });

            return updatedEntry;
        }));
    }

    if (updatedEntries) {
        return await client.journal.update({
            data: {
                updatedAt: updatedEntries[0].updatedAt,
            },
            where: {
                id: journal.id,
            },
        });
    }
}

export async function deleteJournalProcedure(
    client: PrismaClient,
    { id, delegateBalancingLedgers = false }: { id: number, delegateBalancingLedgers?: boolean }
): Promise<{ journal: Journal, ledgerIds?: number[] }> {
    const journal = await client.journal.update({
        data: {
            deletedAt: new Date(),
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
            deletedAt: new Date(),
        },
        where: {
            journal: { id: journal.id },
        },
    });

    const ledgerIds = journal.entries.reduce((acc, entry) => {
        if (entry.ledger.open && !entry.ledger.deletedAt) {
            acc.push(entry.ledger.id);
        }

        return acc;
    }, []);

    if (!delegateBalancingLedgers) {
        await Promise.all(ledgerIds.map(async (ledgerId) => {
            await balancingLedgerProcedure(client, { id: ledgerId });
        }));

        return { journal };
    }

    return { journal, ledgerIds };
}

export async function deleteJournalManyProcedure(
    client: PrismaClient,
    { ids, delegateBalancingLedger = false }: { ids: number[], delegateBalancingLedger?: boolean }
): Promise<{ journals: Journal[]; ledgerIds: number[] }> {
    const deleteResults = await Promise.all(ids.map(async (id) => {
        return await deleteJournalProcedure(client, { 
            id, delegateBalancingLedgers: true 
        });
    }));

    const ledgerIds = deleteResults.reduce((acc, { ledgerIds }) => {
        return ledgerIds.reduce((acc, id) => {
            if (!acc.includes(id)) {
                acc.push(id);
            }

            return acc
        }, acc);
    }, []);

    const journals = deleteResults.map(({ journal }) => journal);

    if (!delegateBalancingLedger) {
        await Promise.all(ledgerIds.map(
            async (ledgerId) => await balancingLedgerProcedure(client, { id: ledgerId })
        ));   

        return { journals, ledgerIds: [] };
    }

    return { journals, ledgerIds };
}