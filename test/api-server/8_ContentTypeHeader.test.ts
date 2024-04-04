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

describe('MockApiServer: Content Type Header', () => {

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

    it('should return JSON with Content-Type Header as "application/json"',
        async () => {

            givenFileHasContents(mockFileRepository, 'resources/default/',  'ping.json', JSON.stringify({message: 'pong'}))
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources\\default'))).thenResolve(['ping.json'])

            const response: AxiosResponse = await axios.get(hostUrl + '/ping')

            expect(response.status).toBe(200)
            expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8")

        }
    )

    it('should return XML with Content-Type Header as "application/xml"',
        async () => {

            givenFileHasContents(mockFileRepository, 'resources/default/',  'ping.xml', '<?xml version="1.0" ?><pong>Pong</pong>')
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources\\default'))).thenResolve(['ping.xml'])

            const response: AxiosResponse = await axios.get(hostUrl + '/ping')

            expect(response.status).toBe(200)
            expect(response.headers["content-type"]).toEqual("application/xml; charset=utf-8")

        }
    )

})
