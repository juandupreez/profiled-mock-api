
import bodyParser from 'body-parser'
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
        '/profiles',
        '/activeProfile',
        '/setActiveProfile'
    ]
    private readonly profileService: ProfileService
    private readonly fileRepository: FileRepository

    constructor (mockServerConfig: MockServerConfig = defaultMockServerConfig) {
        this.config = { ...mockServerConfig }
        this.fileRepository = mockServerConfig.fileRepository ?? new FileRepository()
        this.profileService = new ProfileService(this.config.profiles)
        this.profileService.readProfilesFromFileSystem(this.config.profileDirectory, this.fileRepository)
        this.profileService.assertExistsAndSetActiveProfile(this.config.initialActiveProfile)
        this.responseController = new FileResponseController(
            this.fileRepository,
            this.profileService
        )
        this._initializeApp()
    }

    private _initializeApp () {
        this.app.use(bodyParser.json())
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

        this.app.get('/activeProfile', (req, res) => {
            res.send({
                activeProfile: this.profileService.getActiveProfile()
            })
        })

        this.app.post('/activeProfile', (req, res) => {
            const newlyActiveProfile: string | undefined = req.body.newlyActiveProfile
            if (newlyActiveProfile === undefined) {
                res.status(400).send({
                    message: 'Could not set active profile. Was expecting body with parameter newlyActiveProfile'
                })
            } else {
                try {
                    this.profileService.assertExistsAndSetActiveProfile(newlyActiveProfile)
                    res.send({
                        activeProfile: this.profileService.getActiveProfile()
                    })
                } catch (e) {
                    this.logger.error(e)
                    if ((e?.message ?? '' as string).includes('Could not set active profile')) {
                        res.status(404).send({
                            message: e.message
                        })
                    } else {
                        res.status(500).send({
                            message: e.message
                        })
                    }
                }
            }
        })

        this.app.get('/setActiveProfile', (req, res) => {
            const newlyActiveProfile: string = (req.query as any).newlyActiveProfile
            if (newlyActiveProfile === undefined) {
                res.status(400).send({
                    message: 'Could not set active profile. Was expecting URI parameter newlyActiveProfile'
                })
            } else {
                try {
                    this.profileService.assertExistsAndSetActiveProfile(newlyActiveProfile)
                    res.send({
                        activeProfile: this.profileService.getActiveProfile()
                    })
                } catch (e) {
                    this.logger.error(e)
                    if ((e?.message ?? '' as string).includes('Could not set active profile')) {
                        res.status(404).send({
                            message: e.message
                        })
                    } else {
                        res.status(500).send({
                            message: e.message
                        })
                    }
                }
            }
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
    initialActiveProfile: 'default',
    profiles: {
        default: {
            responseFileBasePath: "./resources/default"
        }
    },
    fileRepository: new FileRepository()
}
