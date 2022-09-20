export abstract class FilteredLogger {

    logLevel: LogLevel

    abstract logFn (...data: any[]): void
    abstract errorFn (...data: any[]): void

    trace (...data: any[]): void {
        if ([
            LogLevel.ALL,
            LogLevel.TRACE
        ].includes(this.logLevel)) {
            this.logFn(data)
        }
    }

    debug (...data: any[]): void {
        if ([
            LogLevel.ALL,
            LogLevel.TRACE,
            LogLevel.DEBUG
        ].includes(this.logLevel)) {
            this.logFn(data)
        }
    }

    info (...data: any[]): void {
        if ([
            LogLevel.ALL,
            LogLevel.TRACE,
            LogLevel.DEBUG,
            LogLevel.INFO
        ].includes(this.logLevel)) {
            this.logFn(data)
        }
    }

    warn (...data: any[]): void {
        if ([
            LogLevel.ALL,
            LogLevel.TRACE,
            LogLevel.DEBUG,
            LogLevel.INFO,
            LogLevel.WARN
        ].includes(this.logLevel)) {
            this.logFn(data)
        }
    }

    error (...data: any[]): void {
        if ([
            LogLevel.ALL,
            LogLevel.TRACE,
            LogLevel.DEBUG,
            LogLevel.INFO,
            LogLevel.WARN,
            LogLevel.ERROR
        ].includes(this.logLevel)) {
            this.errorFn(data)
        }
    }

    fatal (...data: any[]): void {
        if ([
            LogLevel.ALL,
            LogLevel.TRACE,
            LogLevel.DEBUG,
            LogLevel.INFO,
            LogLevel.WARN,
            LogLevel.ERROR,
            LogLevel.FATAL
        ].includes(this.logLevel)) {
            this.errorFn(data)
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
    logFn (...data: any[]): void {
        console.log(data)
    }
    errorFn (...data: any[]): void {
        console.error(data)
    }
}

export class GlobalLogger {
    private static instance: FilteredLogger

    private constructor() {}

    static getInstance(): FilteredLogger {
        if (this.instance === undefined) {
            this.instance = new ConsoleFilteredLogger()
        }
        return this.instance
    }
}