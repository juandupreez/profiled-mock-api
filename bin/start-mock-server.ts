import { MockApiServer } from "../src/MockApiServer"

const mockApiServer: MockApiServer = new MockApiServer({
    port: 3002,
    profiles: {
        default: {
            responseFileBasePath: "./resources/default"
        }
    },
})

mockApiServer.start()