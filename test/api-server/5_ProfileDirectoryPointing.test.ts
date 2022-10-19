import axios from "axios"
import { AxiosResponse } from "axios"
import { MockApiServer } from "../../src/MockApiServer"
import { MockServerConfig } from "../../src/model/MockServerConfig"
import { FileRepository } from "../../src/repository/FileRepository"
import { mock, instance, when, reset } from 'ts-mockito'
import { GlobalLogger, LogLevel } from "../../src/util/Logger"
import { givenFileHasContents } from "../testutil/test-utils"
import path from 'path'

// global.console = require('console')

GlobalLogger.getInstance().logLevel = LogLevel.OFF

describe.each([
    ['JSON', '.json', JSON.stringify({ testBaseResponse: 'passed', mock: 'file-contents' }), { testBaseResponse: 'passed', mock: 'file-contents' }],
    ['XML', '.xml', "<?xml version='1.0' encoding='UTF-8'?>\n<someTag>someValue</someTag>", "<?xml version='1.0' encoding='UTF-8'?>\n<someTag>someValue</someTag>"]
])('MockApiServer: Profile State Management', (typeDescription: string, fileExtension: string, fileContents: string, expectedResponse: any) => {

    const mockFileRepository: FileRepository = mock(FileRepository)

    // const port: number = IdProvider.getInstance().getNextPortNumber()
    const port: number = 3011
    const hostUrl: string = 'http://localhost:' + port
    const mockServerConfig: MockServerConfig = {
        port: port,
        initialActiveProfile: 'default',
        profiles: {
            default: {
                responseFileBasePath: "./resources/default"
            },
            conf_profile_1: {
                responseFileBasePath: "./resources/profile_1"
            },
            conf_profile_2: {
                responseFileBasePath: "./path/to/some/distant/profile_2"
            },
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
    ])('[' + typeDescription + '] should get responses from initial active profile which is in config property: initialActiveProfile',
        async (method: string, axiosCall: () => Promise<any>) => {

            givenFileHasContents(mockFileRepository, 'resources/default/', method + '.200' + fileExtension, fileContents)
            when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/default/'))).thenResolve([method + '.200' + fileExtension])

            const response: AxiosResponse = await axiosCall()

            expect(response.status).toBe(200)
            expect(response.data).toEqual(expectedResponse)
        })

    describe.each([
        ['POST activeProfile', async (newlyActiveProfile: string) => {
            return await axios.post(hostUrl + '/activeProfile', { newlyActiveProfile: newlyActiveProfile })
        }],
        ['GET setActiveProfile', async (newlyActiveProfile: string) => {
            return await axios.get(hostUrl + '/setActiveProfile?newlyActiveProfile=' + newlyActiveProfile)
        }]
    ])('Different ways of setting active profile', (descriptionForChangingActiveProfile: string, axiosChangeActiveProfileCall: (n: string) => Promise<any>) => {


        it.each([
            ['GET', async () => await axios.get(hostUrl + '/')],
            ['POST', async () => await axios.post(hostUrl + '/', {})],
            ['PUT', async () => await axios.put(hostUrl + '/', {})],
            ['PATCH', async () => await axios.patch(hostUrl + '/', {})],
            ['DELETE', async () => await axios.delete(hostUrl + '/')],
            ['OPTIONS', async () => await axios.options(hostUrl + '/')],
        ])('[' + typeDescription + '] [Change profile with ' + descriptionForChangingActiveProfile + '] should get responses from newly set profile directory',
            async (method: string, axiosCall: () => Promise<any>) => {

                givenFileHasContents(mockFileRepository, 'resources/profile_1/', method + '.200' + fileExtension, fileContents)
                when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('resources/profile_1/'))).thenResolve([method + '.200' + fileExtension])

                await axiosChangeActiveProfileCall('conf_profile_1')
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
        ])('[' + typeDescription + '] [Change profile with ' + descriptionForChangingActiveProfile + '] should get responses from latest set profile directory',
            async (method: string, axiosCall: () => Promise<any>) => {

                givenFileHasContents(mockFileRepository, 'path/to/some/distant/profile_2/', method + '.200' + fileExtension, fileContents)
                when(mockFileRepository.getAllFilenamesInDirIfDirExists(path.join('path/to/some/distant/profile_2/'))).thenResolve([method + '.200' + fileExtension])

                await axiosChangeActiveProfileCall('conf_profile_1')
                await axiosChangeActiveProfileCall('default')
                await axiosChangeActiveProfileCall('conf_profile_2')
                const response: AxiosResponse = await axiosCall()

                expect(response.status).toBe(200)
                expect(response.data).toEqual(expectedResponse)
            }
        )

    })
})
