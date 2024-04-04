import axios from "axios"
import { AxiosResponse } from "axios"
import { MockApiServer } from "../../src/MockApiServer"
import { MockServerConfig } from "../../src/model/MockServerConfig"
import { FileRepository } from "../../src/repository/FileRepository"
import { mock, instance, when, reset } from 'ts-mockito'
import path from 'path'
import { givenFileHasContents } from "../testutil/test-utils"
import { IdProvider } from "../testutil/IdProvider"
import { FilteredLogger, GlobalLogger, LogLevel } from "../../src/util/Logger"

global.console = require('console')
GlobalLogger.getInstance().logLevel = LogLevel.ALL

describe('MockApiServer: Requests With Params', () => {

    const mockFileRepository: FileRepository = mock(FileRepository)

    // const port: number = IdProvider.getInstance().getNextPortNumber()
    const port: number = 3001
    const hostUrl: string = 'http://localhost:' + port
    const mockServerConfig: MockServerConfig = {
        port: port,
        initialActiveProfile: 'default',
        profiles: {
            default: {
                responseFileBasePath: "./resources/default"
            }
        },
        fileRepository: instance(mockFileRepository)
    }
    const mockApiServer: MockApiServer = new MockApiServer(mockServerConfig)

    beforeAll(() => {
        mockApiServer.start()
    })

    beforeEach(() => {
        reset(mockFileRepository)
    })

    afterAll(() => {
        mockApiServer.stop()
    })

    it('should get default name even if there are URI params in requst',
        async () => {

            givenFileHasContents(mockFileRepository, 'resources/default/',  'ping.json', JSON.stringify({message: 'pong'}))
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources\\default'))).thenResolve(['ping.json'])

            const response: AxiosResponse = await axios.get(hostUrl + '/ping?startDate=2024-04-01&endDate=2024-04-04')

            expect(response.status).toBe(200)
            expect(response.data).toEqual({message: "pong"})
        }
    )

})
