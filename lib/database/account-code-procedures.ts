import { PrismaClient } from "@prisma/client";

export async function createAccountCodeProcedure(
    client: PrismaClient, 
    { code, createChildIncrement = false }: { code: number, createChildIncrement?: boolean }
) {
    if (createChildIncrement) {
        let rootAccountCode = await client.accountCode.findUnique({
            where: {
                code_virtualParentId: { code, virtualParentId: 0 },
            }
        });
    
        if (!rootAccountCode) {
            rootAccountCode = await client.accountCode.create({
                data: {
                    code,
                }
            });
        }

        const lastChildAccountCode = await client.accountCode.findFirst({
            where: { parent: { id: rootAccountCode.id } },
            orderBy: {
                code: "desc",
            },
        });

        return await client.accountCode.create({
            data: {
                parent: { connect: { id: rootAccountCode.id } },
                virtualParentId: rootAccountCode.id,
                code: lastChildAccountCode ? lastChildAccountCode.code + 1 : 1,
            },
        });
    }

    return await client.accountCode.create({
        data: {
            code,
        },
    });
}