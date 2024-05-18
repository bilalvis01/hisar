import * as date from "date-fns";

export default {
    format(value: Date) {
        return date.format(value, "d-M-y H:m:s");
    }
}