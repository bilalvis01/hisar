export default {
    format(value: number) {
        return value.toString().padStart(3, "0");
    }
}