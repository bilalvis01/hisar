export class RecordNotFoundError extends Error {
    constructor(message, options?) {
        super(message, options);
    }
}

export class DatabaseError extends Error {
    constructor(message, options?) {
        super(message, options);
    }
}