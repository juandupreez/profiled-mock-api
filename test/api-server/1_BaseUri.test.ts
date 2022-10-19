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

// global.console = require('console')


describe.each([
    ['JSON', '.json', JSON.stringify({ testBaseResponse: 'passed', mock: 'file-contents' }), { testBaseResponse: 'passed', mock: 'file-contents' }],
    ['XML', '.xml', "<?xml version='1.0' encoding='UTF-8'?>\n<someTag>someValue</someTag>", "<?xml version='1.0' encoding='UTF-8'?>\n<someTag>someValue</someTag>"]
])('MockApiServer: Base URI', (typeDescription: string, fileExtension: string, fileContents: string, expectedResponse: any) => {

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

    it.each([
        ['GET', async () => await axios.get(hostUrl + '/')],
        ['POST', async () => await axios.post(hostUrl + '/', {})],
        ['PUT', async () => await axios.put(hostUrl + '/', {})],
        ['PATCH', async () => await axios.patch(hostUrl + '/', {})],
        ['DELETE', async () => await axios.delete(hostUrl + '/')],
        ['OPTIONS', async () => await axios.options(hostUrl + '/')],
    ])('[' + typeDescription + '] 200 MEHTOD /: should return file contents as mock response 200 when calling METHOD base path',
        async (method: string, axiosCall: () => Promise<any>) => {

            givenFileHasContents(mockFileRepository, 'resources/default/', method + '.200' + fileExtension, fileContents)
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/'))).thenResolve([method + '.200' + fileExtension])

            const response: AxiosResponse = await axiosCall()

            expect(response.status).toBe(200)
            expect(response.data).toEqual(expectedResponse)
        }
    )

    it.each([
        ['GET', async () => await axios.get(hostUrl + '/')],
        ['POST', async () => await axios.post(hostUrl + '/', {})],
        ['PUT', async () => await axios.put(hostUrl + '/', {})],
        ['PATCH', async () => await axios.patch(hostUrl + '/', {})],
        ['DELETE', async () => await axios.delete(hostUrl + '/')],
        ['OPTIONS', async () => await axios.options(hostUrl + '/')],
    ])('[' + typeDescription + '] 404 METHOD /: should return 404 when no METHOD.STATUS.json file exists at given path', async (method: string, axiosCall: () => Promise<any>) => {
        when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/'))).thenResolve([])

        try {
            const response: AxiosResponse = await axiosCall()
            fail('expected call to throw an error')
        } catch (e) {
            expect(e.response.status).toBe(404)
            expect(e.response.data).toEqual({
                message: "No possible responses found in directory: \"resources\\default\\\" for method: " + method,
            })
        }
    })

    it.each([
        ['GET', async () => await axios.get(hostUrl + '/')],
        ['POST', async () => await axios.post(hostUrl + '/', {})],
        ['PUT', async () => await axios.put(hostUrl + '/', {})],
        ['PATCH', async () => await axios.patch(hostUrl + '/', {})],
        ['DELETE', async () => await axios.delete(hostUrl + '/')],
        ['OPTIONS', async () => await axios.options(hostUrl + '/')],
    ])('[' + typeDescription + '] 500 METHOD /: should return 500 when reading throws strange error', async (method: string, axiosCall: () => Promise<any>) => {
        when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/'))).thenResolve([method + '.200' + fileExtension])
        when(mockFileRepository.readFileContents(path.join('resources/default/', method + '.200' + fileExtension)))
            .thenReject(new Error("some generic error"))

        try {
            const response: AxiosResponse = await axiosCall()
            fail('expected call to throw an error')
        } catch (e) {
            expect(e.response.status).toBe(500)
            expect(e.response.data).toEqual({
                message: "some generic error",
            })
        }
    })

    it.each([
        ['GET', async () => await axios.get(hostUrl + '/'), 200],
        ['GET', async () => await axios.get(hostUrl + '/'), 201],
        ['GET', async () => await axios.get(hostUrl + '/'), 202],
        ['POST', async () => await axios.post(hostUrl + '/', {}), 200],
        ['POST', async () => await axios.post(hostUrl + '/', {}), 201],
        ['POST', async () => await axios.post(hostUrl + '/', {}), 202],
        ['PUT', async () => await axios.put(hostUrl + '/', {}), 200],
        ['PUT', async () => await axios.put(hostUrl + '/', {}), 201],
        ['PUT', async () => await axios.put(hostUrl + '/', {}), 202],
        ['PATCH', async () => await axios.patch(hostUrl + '/', {}), 200],
        ['PATCH', async () => await axios.patch(hostUrl + '/', {}), 201],
        ['PATCH', async () => await axios.patch(hostUrl + '/', {}), 202],
        ['DELETE', async () => await axios.delete(hostUrl + '/'), 200],
        ['DELETE', async () => await axios.delete(hostUrl + '/'), 201],
        ['DELETE', async () => await axios.delete(hostUrl + '/'), 202],
        ['OPTIONS', async () => await axios.options(hostUrl + '/'), 200],
        ['OPTIONS', async () => await axios.options(hostUrl + '/'), 201],
        ['OPTIONS', async () => await axios.options(hostUrl + '/'), 202],
    ])('[' + typeDescription + '] STATUS MEHTOD /: should return file contents as mock response with configured STATUS when calling METHOD base path',
        async (method: string, axiosCall: () => Promise<any>, status: number) => {

            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/'))).thenResolve([method + '.' + status + fileExtension])
            givenFileHasContents(mockFileRepository, 'resources/default/', method + '.' + status + fileExtension, fileContents)

            const response: AxiosResponse = await axiosCall()

            expect(response.status).toBe(status)
            expect(response.data).toEqual(expectedResponse)
        })

    it.each([
        ['GET', async () => await axios.get(hostUrl + '/'), 400],
        ['GET', async () => await axios.get(hostUrl + '/'), 301],
        ['GET', async () => await axios.get(hostUrl + '/'), 502],
        ['POST', async () => await axios.post(hostUrl + '/', {}), 400],
        ['POST', async () => await axios.post(hostUrl + '/', {}), 301],
        ['POST', async () => await axios.post(hostUrl + '/', {}), 502],
        ['PUT', async () => await axios.put(hostUrl + '/', {}), 400],
        ['PUT', async () => await axios.put(hostUrl + '/', {}), 301],
        ['PUT', async () => await axios.put(hostUrl + '/', {}), 502],
        ['PATCH', async () => await axios.patch(hostUrl + '/', {}), 400],
        ['PATCH', async () => await axios.patch(hostUrl + '/', {}), 301],
        ['PATCH', async () => await axios.patch(hostUrl + '/', {}), 502],
        ['DELETE', async () => await axios.delete(hostUrl + '/'), 400],
        ['DELETE', async () => await axios.delete(hostUrl + '/'), 301],
        ['DELETE', async () => await axios.delete(hostUrl + '/'), 502],
        ['OPTIONS', async () => await axios.options(hostUrl + '/'), 400],
        ['OPTIONS', async () => await axios.options(hostUrl + '/'), 301],
        ['OPTIONS', async () => await axios.options(hostUrl + '/'), 502],
    ])('[' + typeDescription + '] STATUS MEHTOD /: should return file contents as mock response with configured STATUS when calling METHOD base path',
        async (method: string, axiosCall: () => Promise<any>, status: number) => {
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/'))).thenResolve([method + '.' + status + fileExtension])
            givenFileHasContents(mockFileRepository, 'resources/default/', method + '.' + status + fileExtension, fileContents)

            try {
                const response: AxiosResponse = await axiosCall()
                fail('expected call to throw an error')
            } catch (e) {
                expect(e.response.status).toBe(status)
                expect(e.response.data).toEqual(expectedResponse)
            }
        })

    it.each([
        ['GET', async () => await axios.get(hostUrl + '/')],
        ['POST', async () => await axios.post(hostUrl + '/', {})],
        ['PUT', async () => await axios.put(hostUrl + '/', {})],
        ['PATCH', async () => await axios.patch(hostUrl + '/', {})],
        ['DELETE', async () => await axios.delete(hostUrl + '/')],
        ['OPTIONS', async () => await axios.options(hostUrl + '/')],
    ])('[' + typeDescription + '] 200 MEHTOD /: should return first file contents as mock response 200 there are two ore more possible results',
        async (method: string, axiosCall: () => Promise<any>) => {
            givenFileHasContents(mockFileRepository, 'resources/default/', method + '.200' + fileExtension, fileContents)
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/'))).thenResolve([method + '.200' + fileExtension, method + '.500' + fileExtension])

            const response: AxiosResponse = await axiosCall()

            expect(response.status).toBe(200)
            expect(response.data).toEqual(expectedResponse)
        }
    )

})
