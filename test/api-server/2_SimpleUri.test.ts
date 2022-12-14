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
const logger: FilteredLogger = GlobalLogger.getInstance()
logger.logLevel = LogLevel.OFF

describe.each([
    ['JSON', '.json', JSON.stringify({ testBaseResponse: 'passed', mock: 'file-contents' }), { testBaseResponse: 'passed', mock: 'file-contents' }],
    ['XML', '.xml', "<?xml version='1.0' encoding='UTF-8'?>\n<someTag>someValue</someTag>", "<?xml version='1.0' encoding='UTF-8'?>\n<someTag>someValue</someTag>"]
])('MockApiServer: Simple URI', (typeDescription: string, fileExtension: string, fileContents: string, expectedResponse: any) => {

    const mockFileRepository: FileRepository = mock(FileRepository)

    // const port: number = IdProvider.getInstance().getNextPortNumber()
    const port: number = 3002
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

    describe('file format METHOD.STATUS.json', () => {

        it.each([
            ['GET', async () => await axios.get(hostUrl + '/one/two')],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {})],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {})],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {})],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two')],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two')],
        ])('[' + typeDescription + '] 200 MEHTOD /one/two: should return file contents as mock response 200 when calling METHOD /one/two', async (method: string, axiosCall: () => Promise<any>) => {
            givenFileHasContents(mockFileRepository, 'resources/default/one/two', method + '.200' + fileExtension, fileContents)
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one'))).thenResolve([])
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one/two'))).thenResolve([method + '.200' + fileExtension])

            const response: AxiosResponse = await axiosCall()

            expect(response.status).toBe(200)
            expect(response.data).toEqual(expectedResponse)
        })

        it.each([
            ['GET', async () => await axios.get(hostUrl + '/one/two')],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {})],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {})],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {})],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two')],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two')],
        ])('[' + typeDescription + '] 404 METHOD /one/two: should return 404 when no METHOD.STATUS.json file exists at given path', async (method: string, axiosCall: () => Promise<any>) => {
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one'))).thenResolve([])
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one/two'))).thenResolve([])

            try {
                const response: AxiosResponse = await axiosCall()
                fail('expected call to throw an error')
            } catch (e) {
                expect(e.response.status).toBe(404)
                expect(e.response.data).toEqual({
                    message: "No possible responses found in directory: \"resources\\default\\one\\two\" for method: " + method,
                })
            }
        })

        it.each([
            ['GET', async () => await axios.get(hostUrl + '/one/two')],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {})],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {})],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {})],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two')],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two')],
        ])('[' + typeDescription + '] 500 METHOD /one/two: should return 500 when reading throws strange error', async (method: string, axiosCall: () => Promise<any>) => {
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one'))).thenResolve([])
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one/two'))).thenResolve([method + '.200' + fileExtension])
            when(mockFileRepository.readFileContents(path.join('resources/default/one/two', method + '.200' + fileExtension)))
                .thenReject(new Error("some generic error"))

            try {
                const response: AxiosResponse = await axiosCall()
                fail('expected call to throw an error')
            } catch (e) {
                logger.fatal(e)

                expect(e.response.status).toBe(500)
                expect(e.response.data).toEqual({
                    message: "some generic error",
                })
            }
        })

        it.each([
            ['GET', async () => await axios.get(hostUrl + '/one/two'), 200],
            ['GET', async () => await axios.get(hostUrl + '/one/two'), 201],
            ['GET', async () => await axios.get(hostUrl + '/one/two'), 202],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {}), 200],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {}), 201],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {}), 202],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {}), 200],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {}), 201],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {}), 202],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {}), 200],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {}), 201],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {}), 202],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two'), 200],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two'), 201],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two'), 202],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two'), 200],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two'), 201],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two'), 202],
        ])('[' + typeDescription + '] STATUS MEHTOD /one/two: should return file contents as mock response with configured STATUS when calling METHOD /one/two',
            async (method: string, axiosCall: () => Promise<any>, status: number) => {
                when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one'))).thenResolve([])
                when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one/two'))).thenResolve([method + '.' + status + fileExtension])
                givenFileHasContents(mockFileRepository, 'resources/default/one/two', method + '.' + status + fileExtension, fileContents)

                const response: AxiosResponse = await axiosCall()

                expect(response.status).toBe(status)
                expect(response.data).toEqual(expectedResponse)
            }
        )

        it.each([
            ['GET', async () => await axios.get(hostUrl + '/one/two'), 400],
            ['GET', async () => await axios.get(hostUrl + '/one/two'), 301],
            ['GET', async () => await axios.get(hostUrl + '/one/two'), 502],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {}), 400],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {}), 301],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {}), 502],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {}), 400],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {}), 301],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {}), 502],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {}), 400],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {}), 301],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {}), 502],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two'), 400],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two'), 301],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two'), 502],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two'), 400],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two'), 301],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two'), 502],
        ])('[' + typeDescription + '] STATUS MEHTOD /one/two: should return file contents as mock response with configured STATUS when calling METHOD /one/two',
            async (method: string, axiosCall: () => Promise<any>, status: number) => {
                when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one'))).thenResolve([])
                when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one/two'))).thenResolve([method + '.' + status + fileExtension])
                givenFileHasContents(mockFileRepository, 'resources/default/one/two', method + '.' + status + fileExtension, fileContents)

                try {
                    const response: AxiosResponse = await axiosCall()
                    fail('expected call to throw an error')
                } catch (e) {
                    expect(e.response.status).toBe(status)
                    expect(e.response.data).toEqual(expectedResponse)
                }
            }
        )

        it.each([
            ['GET', async () => await axios.get(hostUrl + '/one/two')],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {})],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {})],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {})],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two')],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two')],
        ])('[' + typeDescription + '] 200 MEHTOD /: should return first file contents as mock response 200 there are two ore more possible results', async (method: string, axiosCall: () => Promise<any>) => {
            givenFileHasContents(mockFileRepository, 'resources/default/one/two', method + '.200' + fileExtension, fileContents)
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one'))).thenResolve([])
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one/two'))).thenResolve([method + '.200' + fileExtension, method + '.500.json'])

            const response: AxiosResponse = await axiosCall()

            expect(response.status).toBe(200)
            expect(response.data).toEqual(expectedResponse)
        })

    })

    describe('MockApiServer: Simple URI with file format endpoint.METHOD.STATUS.json', () => {

        it.each([
            ['GET', async () => await axios.get(hostUrl + '/one/two')],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {})],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {})],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {})],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two')],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two')],
        ])('[' + typeDescription + '] 200 MEHTOD /one/two: should return file contents as mock response 200 when file is "/one/two.METHOD.200.json"', async (method: string, axiosCall: () => Promise<any>) => {
            givenFileHasContents(mockFileRepository, 'resources/default/one/', 'two.' + method + '.200' + fileExtension, fileContents)
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one'))).thenResolve(['two.' + method + '.200' + fileExtension])
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one/two'))).thenResolve([])

            const response: AxiosResponse = await axiosCall()

            expect(response.status).toBe(200)
            expect(response.data).toEqual(expectedResponse)
        })

        it.each([
            ['GET', async () => await axios.get(hostUrl + '/one/two'), 200],
            ['GET', async () => await axios.get(hostUrl + '/one/two'), 201],
            ['GET', async () => await axios.get(hostUrl + '/one/two'), 202],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {}), 200],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {}), 201],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {}), 202],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {}), 200],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {}), 201],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {}), 202],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {}), 200],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {}), 201],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {}), 202],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two'), 200],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two'), 201],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two'), 202],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two'), 200],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two'), 201],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two'), 202],
        ])('[' + typeDescription + '] STATUS MEHTOD /one/two: should return file contents as mock response with configured STATUS when file is "/one/two.METHOD.STATUS.json',
            async (method: string, axiosCall: () => Promise<any>, status: number) => {
                when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one'))).thenResolve(['two.' + method + '.' + status + fileExtension])
                when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one/two'))).thenResolve([])
                givenFileHasContents(mockFileRepository, 'resources/default/one', 'two.' + method + '.' + status + fileExtension, fileContents)

                const response: AxiosResponse = await axiosCall()

                expect(response.status).toBe(status)
                expect(response.data).toEqual(expectedResponse)
            }
        )

        it.each([
            ['GET', async () => await axios.get(hostUrl + '/one/two'), 400],
            ['GET', async () => await axios.get(hostUrl + '/one/two'), 301],
            ['GET', async () => await axios.get(hostUrl + '/one/two'), 502],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {}), 400],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {}), 301],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {}), 502],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {}), 400],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {}), 301],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {}), 502],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {}), 400],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {}), 301],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {}), 502],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two'), 400],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two'), 301],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two'), 502],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two'), 400],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two'), 301],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two'), 502],
        ])('[' + typeDescription + '] STATUS MEHTOD /one/two: should return file contents as mock response with configured STATUS when file is "/one/two.METHOD.STATUS.json',
            async (method: string, axiosCall: () => Promise<any>, status: number) => {
                when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one'))).thenResolve(['two.' + method + '.' + status + fileExtension])
                when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one/two'))).thenResolve([])
                givenFileHasContents(mockFileRepository, 'resources/default/one', 'two.' + method + '.' + status + fileExtension, fileContents)

                try {
                    const response: AxiosResponse = await axiosCall()
                    fail('expected call to throw an error')
                } catch (e) {
                    expect(e.response.status).toBe(status)
                    expect(e.response.data).toEqual(expectedResponse)
                }
            }
        )

        it.each([
            ['GET', async () => await axios.get(hostUrl + '/one/two')],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {})],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {})],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {})],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two')],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two')],
        ])('[' + typeDescription + '] 200 MEHTOD /: should return file /one/two.METHOD.STATUS.json instead of /one/two/METHOD.STATUS.json if both options exist', async (method: string, axiosCall: () => Promise<any>) => {
            givenFileHasContents(mockFileRepository, 'resources/default/one', 'two.' + method + '.200' + fileExtension, fileContents)
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one'))).thenResolve(["two." + method + '.200' + fileExtension])
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one/two'))).thenResolve([method + '.200' + fileExtension])

            const response: AxiosResponse = await axiosCall()

            expect(response.status).toBe(200)
            expect(response.data).toEqual(expectedResponse)
        })

        it.each([
            ['GET', async () => await axios.get(hostUrl + '/one/two')],
            ['POST', async () => await axios.post(hostUrl + '/one/two', {})],
            ['PUT', async () => await axios.put(hostUrl + '/one/two', {})],
            ['PATCH', async () => await axios.patch(hostUrl + '/one/two', {})],
            ['DELETE', async () => await axios.delete(hostUrl + '/one/two')],
            ['OPTIONS', async () => await axios.options(hostUrl + '/one/two')],
        ])('[' + typeDescription + '] 200 MEHTOD /: should return first file /one/two.METHOD.STATUS.json instead of /one/two/METHOD.STATUS.json if multiple of both options exist', async (method: string, axiosCall: () => Promise<any>) => {
            givenFileHasContents(mockFileRepository, 'resources/default/one', "two." + method + '.200' + fileExtension, fileContents)
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one'))).thenResolve(["two." + method + '.200' + fileExtension, "two." + method + '.500.json'])
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/one/two'))).thenResolve([method + '.200' + fileExtension, method + '.500.json'])

            const response: AxiosResponse = await axiosCall()

            expect(response.status).toBe(200)
            expect(response.data).toEqual(expectedResponse)
        })
    })

})
