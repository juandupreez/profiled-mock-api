import { MockApiServer } from "../src/MockApiServer"
import { GlobalLogger, LogLevel } from "../src/util/Logger"

GlobalLogger.getInstance().logLevel = LogLevel.ALL

const mockApiServer: MockApiServer = new MockApiServer({
    port: 3002,
    initialActiveProfile: 'default',
    profiles: {
        default: {
            responseFileBasePath: "./resources/default"
        }
    },
})

mockApiServer.start()