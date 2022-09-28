import axios from "axios"
import { AxiosResponse } from "axios"
import { MockApiServer } from "../../src/MockApiServer"
import { MockServerConfig } from "../../src/model/MockServerConfig"
import { FileRepository } from "../../src/repository/FileRepository"
import { mock, instance, when, reset } from 'ts-mockito'
import { GlobalLogger, LogLevel } from "../../src/util/Logger"

// global.console = require('console')

GlobalLogger.getInstance().logLevel = LogLevel.OFF

describe('MockApiServer: Profile State Management', () => {

    const mockFileRepository: FileRepository = mock(FileRepository)

    // const port: number = IdProvider.getInstance().getNextPortNumber()
    const port: number = 3010
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

    it('should set initial active profile to what is in config property: initialActiveProfile', async () => {
        const response: AxiosResponse = await axios.get(hostUrl + '/activeProfile')

        expect(response.status).toBe(200)
        expect(response.data).toEqual({
            activeProfile: 'default'
        })
    })

    describe('400 errors when wrong parameters given to set active profile', () => {

        it('POST activeProfile: should throw 400 error when incorrent body format', async () => {
            try {
                await axios.post(hostUrl + '/activeProfile', { wrongBodyFormat: 123 })
                fail('expected funciton to throw an error')
            } catch (e) {
                expect(e.response.status).toBe(400)
                expect(e.response.data).toEqual({
                    message: 'Could not set active profile. Was expecting body with parameter newlyActiveProfile'
                })
            }
        })

        it('GET setActiveProfile: should throw 400 error when incorrent URI parameter', async () => {
            try {
                await axios.get(hostUrl + '/setActiveProfile')
                fail('expected funciton to throw an error')
            } catch (e) {
                expect(e.response.status).toBe(400)
                expect(e.response.data).toEqual({
                    message: 'Could not set active profile. Was expecting URI parameter newlyActiveProfile'
                })
            }
        })
    })

    describe.each([
        ['POST activeProfile', async (newlyActiveProfile: string) => {
            return await axios.post(hostUrl + '/activeProfile', { newlyActiveProfile: newlyActiveProfile })
        }],
        ['GET setActiveProfile', async (newlyActiveProfile: string) => {
            return await axios.get(hostUrl + '/setActiveProfile?newlyActiveProfile=' + newlyActiveProfile)
        }]
    ])('Different ways of setting active profile', (descriptionForChangingActiveProfile: string, axiosChangeActiveProfileCall: (n: string) => Promise<any>) => {

        it(descriptionForChangingActiveProfile + ': should be able to set newly active profile', async () => {
            await axiosChangeActiveProfileCall('conf_profile_1')

            const response: AxiosResponse = await axios.get(hostUrl + '/activeProfile')

            expect(response.status).toBe(200)
            expect(response.data).toEqual({
                activeProfile: 'conf_profile_1'
            })
        })


        it(descriptionForChangingActiveProfile + ': should return newly active profile as response to what has just been set', async () => {
            const response: AxiosResponse = await axiosChangeActiveProfileCall('conf_profile_1')

            expect(response.status).toBe(200)
            expect(response.data).toEqual({
                activeProfile: 'conf_profile_1'
            })
        })

        it(descriptionForChangingActiveProfile + ': should return 404 when trying to set an active profile that does not exist', async () => {
            try {
                await axiosChangeActiveProfileCall('no_such_profile')
                fail('expected funciton to throw an error')
            } catch (e) {
                expect(e.response.status).toBe(404)
                expect(e.response.data).toEqual({
                    message: 'Could not set active profile (no_such_profile) because no such profile is configured'
                })
            }
        })

    })
})
