import axios from "axios"
import { AxiosResponse } from "axios"
import { MockApiServer } from "../../src/MockApiServer"
import { MockServerConfig, Profile } from "../../src/model/MockServerConfig"
import { FileRepository } from "../../src/repository/FileRepository"
import { mock, instance, when, reset } from 'ts-mockito'
import path from 'path'
import { IdProvider } from "../testutil/IdProvider"

global.console = require('console')

describe('MockApiServer: Simple URI', () => {

    const mockFileRepository: FileRepository = mock(FileRepository)

    beforeEach(() => {
        reset(mockFileRepository)
    })

    it('should setup profiles from config setting: profiles', async () => {
        // const port: number = IdProvider.getInstance().getNextPortNumber()
        const port: number = 3003
        const hostUrl: string = 'http://localhost:' + port
        const mockServerConfig: MockServerConfig = {
            port: port,
            profiles: {
                default: {
                    responseFileBasePath: "./resources/default"
                },
                profile_1: {
                    responseFileBasePath: "./resources/profile_1"
                },
                profile_2: {
                    responseFileBasePath: "./some/long/path/to/profile_1"
                }
            },
            fileRepository: instance(mockFileRepository)
        }
        const mockApiServer: MockApiServer = new MockApiServer(mockServerConfig)
        mockApiServer.start()

        try {
            const response: AxiosResponse = await axios.get(hostUrl + '/profiles')

            expect(response.status).toBe(200)
            expect(response.data).toEqual({
                default: {
                    responseFileBasePath: path.normalize("./resources/default")
                },
                profile_1: {
                    responseFileBasePath: path.normalize("./resources/profile_1")
                },
                profile_2: {
                    responseFileBasePath: path.normalize("./some/long/path/to/profile_1")
                }
            })
        } finally {
            mockApiServer.stop()
        }
    })

    it('should setup profiles from file system based on config setting: profileDirectory', async () => {

        // const port: number = IdProvider.getInstance().getNextPortNumber()
        const port: number = 3004
        const hostUrl: string = 'http://localhost:' + port
        const mockServerConfig: MockServerConfig = {
            port: port,
            profileDirectory: './path/to/profileDirectory',
            fileRepository: instance(mockFileRepository)
        }
        when(mockFileRepository.getAllDirectoryNamesInDirSync('./path/to/profileDirectory')).thenReturn([
            'profile_1_dir',
            'profile_2_dir',
            'dir_asdf',
            '1-success-test-case',
        ])
        const mockApiServer: MockApiServer = new MockApiServer(mockServerConfig)
        mockApiServer.start()

        try {
            const response: AxiosResponse = await axios.get(hostUrl + '/profiles')

            expect(response.status).toBe(200)
            expect(response.data).toEqual({
                'profile_1_dir': {
                    responseFileBasePath: path.normalize('./path/to/profileDirectory/profile_1_dir')
                },
                'profile_2_dir': {
                    responseFileBasePath: path.normalize('./path/to/profileDirectory/profile_2_dir')
                },
                'dir_asdf': {
                    responseFileBasePath: path.normalize('./path/to/profileDirectory/dir_asdf')
                },
                '1-success-test-case': {
                    responseFileBasePath: path.normalize('./path/to/profileDirectory/1-success-test-case')
                },
            })
        } finally {
            mockApiServer.stop()
        }
    })

})
