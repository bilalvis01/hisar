import * as date from "date-fns";

export default {
    format(value: string) {
        return date.format(value, "dd/MM/y HH:mm:ss");
    }
}