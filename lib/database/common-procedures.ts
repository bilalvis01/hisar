import { PrismaClient, Entry } from "@prisma/client";

function countBalance({ 
    ledgerDirection,
    entries,
    entryIndex,
}: {
    ledgerDirection: number;
    entries: Entry[],
    entryIndex: number,
}) {
    return entries.reduce((acc, entry, countingBalanceIndex) => {
        if (countingBalanceIndex > entryIndex || entry.deletedAt) {
            return acc;
        }

        return acc + entry.amount * BigInt(entry.direction) * BigInt(ledgerDirection);
    }, BigInt(0));
}

export async function balancingLedgerProcedure(client: PrismaClient, { id }: { id: number }) {
    const ledger = await client.ledger.findUnique({
        where: {
            id,
            open: true,
            deletedAt: null,
        },
        include: {
            entries: {
                orderBy: {
                    createdAt: "asc",
                },
            },
            account: {
                include: {
                    accountType: true,
                },
            },
        },
    });

    if (!ledger) {
        return;
    };

    const ledgerDirection = ledger.account.accountType.ledgerDirection;

    await Promise.all(ledger.entries.map(async (entry, entryIndex, entries) => {
        if (!entry.deletedAt) {
            const balance = countBalance({ ledgerDirection, entries, entryIndex });

            await client.entry.update({
                where: {
                    id: entry.id,
                },
                data: {
                    balance,
                },
            });
        }
    }));

    const ledgerBalance = countBalance({ 
        ledgerDirection, 
        entries: ledger.entries,
        entryIndex: ledger.entries.length - 1,
    });

    await client.ledger.update({
        where: {
            id: ledger.id,
        },
        data: {
            balance: ledgerBalance,
        },
    });
};