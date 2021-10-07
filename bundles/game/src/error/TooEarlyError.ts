export default class TooEarlyError extends Error {

    constructor(message: string) {
        super(message);
    }

}