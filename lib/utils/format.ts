const number = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" });

function currency(value: number | bigint) {
    return number.format(value);
}

export default {
    currency
}