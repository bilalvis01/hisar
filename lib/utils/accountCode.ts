import { 
    Account, 
    AccountCode, 
} from "@prisma/client";

export function format(value: number) {
    return value.toString().padStart(3, "0");
}

export function split(value: string) {
    return value.split("-").map(Number);
}

export function getBudgetCode(account: Account & { accountCode: AccountCode & { parent: AccountCode } }) {
    const parent = account.accountCode.parent.code;
    const subcode = account.accountCode.code;
    return `${parent}-${format(subcode)}`;
}