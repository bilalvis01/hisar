export default function createMessageDeleteMany(values: string[], prefix?: string, suffix?: string) {
    const message = values.reduce((acc, value, index, array) => {
        let conjunction;

        if (index >= 2) {
            conjunction = " dan ";
        } else {
            conjunction = ", "
        }

        if (index === 0) return `"${value}"`;
        if (index === 1) return `${acc}${conjunction}"${value}"`;
        if (index === 2) return `${acc}${conjunction}${array.length - 2} lainnya`;

        return acc;
    }, "");

    return `${prefix}${message}${suffix}`;
}