export default {
    format(value: number) {
        return value.toString().padStart(4, "0");
    }
}