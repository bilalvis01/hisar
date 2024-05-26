export function format(value: number) {
    return value.toString().padStart(3, "0");
}

export function split(value: string) {
    return value.split("-").map(Number);
}