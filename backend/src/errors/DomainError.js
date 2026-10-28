export class DomainError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = 'DomainError';
        this.statusCode = statusCode;
    }
}