
import express from 'express'
import http from 'http'
import { FileResponseController } from './controller/FileResponseController'
import { MockServerConfig } from './model/MockServerConfig'
import { FileRepository } from './repository/FileRepository'
import { ProfileService } from './service/ProfileService'
import { FilteredLogger, GlobalLogger } from './util/Logger'

export class MockApiServer {
    private readonly logger: FilteredLogger = GlobalLogger.getInstance()
    private readonly app: express.Application = express();
    private server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
    private readonly config: MockServerConfig
    private readonly responseController: FileResponseController
    private readonly pathsNotGoingToFileHandler: string[] = [
        '/profiles'
    ]
    private readonly profileService: ProfileService
    private readonly fileRepository: FileRepository

    constructor (mockServerConfig: MockServerConfig = defaultMockServerConfig) {
        this.config = { ...mockServerConfig }
        this.fileRepository = mockServerConfig.fileRepository ?? new FileRepository()
        this.profileService = new ProfileService(this.config.profiles)
        this.profileService.readProfilesFromFileSystem(this.config.profileDirectory, this.fileRepository)
        this.responseController = new FileResponseController(
            this.fileRepository,
            this.profileService
        )
        this._initializeApp()
    }

    private _initializeApp () {
        this.app.use(async (req, res, next) => {
            if (!this.pathsNotGoingToFileHandler.includes(req.path)) {
                await this.responseController.handleRequest(req, res)
            } else {
                next()
            }
        })

        this.app.get('/profiles', (req, res) => {
            res.send(this.profileService.getAllProfiles())
        })
    }

    start () {
        this.logger.info('Staring Server')
        this.server = this.app.listen(this.config.port, () => {
            this.logger.info(`Example app listening at http://localhost:${this.config.port}`)
        })
    }

    stop () {
        this.logger.info('Stopping Server')
        this.server.close()
    }

}

const defaultMockServerConfig: MockServerConfig = {
    port: 3000,
    profiles: {
        default: {
            responseFileBasePath: "./resources/default"
        }
    },
    fileRepository: new FileRepository()
}
