export class Exception extends Error {
    public readonly identifier: string;
    public readonly message: string;
    public readonly trace?: Error;
    public readonly status: number;

    constructor(options: Options) {
        super(options.message);
        this.message = options.message;
        this.identifier = options.identifier ? options.identifier : options.message;
        this.trace = options.trace;
        this.status = options.status ? options.status : 500;
    }
}

interface Options {
    message: string;
    identifier?: string;
    trace?: Error;
    status?: number;
}


