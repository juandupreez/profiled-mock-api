export abstract class FilteredLogger {

    logLevel: LogLevel

    abstract logFn (message?: any, ...optionalParams: any[]): void
    abstract errorFn (message?: any, ...optionalParams: any[]): void

    trace (message?: any, ...optionalParams: any[]): void {
        if ([
            LogLevel.ALL,
            LogLevel.TRACE
        ].includes(this.logLevel)) {
            this.logFn(message, ...optionalParams)
        }
    }

    debug (message?: any, ...optionalParams: any[]): void {
        if ([
            LogLevel.ALL,
            LogLevel.TRACE,
            LogLevel.DEBUG
        ].includes(this.logLevel)) {
            this.logFn(message, ...optionalParams)
        }
    }

    info (message?: any, ...optionalParams: any[]): void {
        if ([
            LogLevel.ALL,
            LogLevel.TRACE,
            LogLevel.DEBUG,
            LogLevel.INFO
        ].includes(this.logLevel)) {
            this.logFn(message, ...optionalParams)
        }
    }

    warn (message?: any, ...optionalParams: any[]): void {
        if ([
            LogLevel.ALL,
            LogLevel.TRACE,
            LogLevel.DEBUG,
            LogLevel.INFO,
            LogLevel.WARN
        ].includes(this.logLevel)) {
            this.logFn(message, ...optionalParams)
        }
    }

    error (message?: any, ...optionalParams: any[]): void {
        if ([
            LogLevel.ALL,
            LogLevel.TRACE,
            LogLevel.DEBUG,
            LogLevel.INFO,
            LogLevel.WARN,
            LogLevel.ERROR
        ].includes(this.logLevel)) {
            this.errorFn(message, ...optionalParams)
        }
    }

    fatal (message?: any, ...optionalParams: any[]): void {
        if ([
            LogLevel.ALL,
            LogLevel.TRACE,
            LogLevel.DEBUG,
            LogLevel.INFO,
            LogLevel.WARN,
            LogLevel.ERROR,
            LogLevel.FATAL
        ].includes(this.logLevel)) {
            this.errorFn(message, ...optionalParams)
        }
    }
}

export enum LogLevel {
    ALL = 'ALL',
    TRACE = 'TRACE',
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL',
    OFF = 'OFF',
}

export class ConsoleFilteredLogger extends FilteredLogger {
    logFn (message?: any, ...optionalParams: any[]): void {
        console.log(message, ...optionalParams)
    }
    errorFn (message?: any, ...optionalParams: any[]): void {
        console.error(message, ...optionalParams)
    }
}

export class GlobalLogger {
    private static instance: FilteredLogger

    private constructor () { }

    static getInstance (): FilteredLogger {
        if (this.instance === undefined) {
            this.instance = new ConsoleFilteredLogger()
        }
        return this.instance
    }
}