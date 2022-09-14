
import express from 'express'
import http from 'http'
import { FileResponseController } from './controller/FileResponseController'
import { MockServerConfig } from './model/MockServerConfig'
import { FileRepository } from './repository/FileRepository'
import { ProfileService } from './service/ProfileService'

export class MockApiServer {

    private readonly app: express.Application = express();
    private server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
    private readonly config: MockServerConfig
    private readonly responseController: FileResponseController

    constructor (mockServerConfig: MockServerConfig = defaultMockServerConfig) {
        this.config = { ...mockServerConfig }
        this.responseController = new FileResponseController(
            mockServerConfig.fileRepository ?? new FileRepository(),
            new ProfileService()
        )
        this._initializeApp()
    }

    private _initializeApp () {
        this.app.use(async (req, res) => {
            await this.responseController.handleRequest(req, res)
        })
    }

    start () {
        console.log('Staring Server')
        this.server = this.app.listen(this.config.port, () => {
            console.log(`Example app listening at http://localhost:${this.config.port}`)
        })
    }

    stop () {
        console.log('Stopping Server')
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
// import express from 'express'
// import xmlBodyParser from 'express-xml-bodyparser'
// import bodyParser from 'body-parser'
// import cors from 'cors'
// import { shouldHaveAuthorizationHeader } from './middlewares/policies'

// import { PostRFCController } from './controllers/PostRFCController'
// import { PostRFCDelayedController } from './controllers/PostRFCDelayedController'
// import { MetaController } from './controllers/MetaController'
// import { inboundRequestLogging } from './middlewares/request-log'

// const app: express.Application = express()
// const port: number = 3000
// const postRFCController: PostRFCController = new PostRFCController()
// const postRFCDelayedController: PostRFCDelayedController = new PostRFCDelayedController()
// const metaController: MetaController = new MetaController()

// // app.use(shouldHaveAuthorizationHeader);
// app.use(inboundRequestLogging)
// app.use(xmlBodyParser())
// app.use(bodyParser.json())
// app.use(cors())

// // Meta
// app.get('/', (req, res) => {
//     res.send({
//         message: "hello world"
//     })
// })

// app.get('/v1/setTestProfile', (req, res) => {
//     const testProfileName: string = req.query.testProfileName ? req.query.testProfileName.toString() : ""

//     metaController.setActiveTestCase(testProfileName).then((responseBody) => {
//         console.log(responseBody)
//         res.send(responseBody)
//     })

// })

// app.post('/v1/setRequestBodyDirectory', (req, res) => {

//     const inboundDirectory: string = req.body.requestBodyDirectory ? req.body.requestBodyDirectory : ""
//     console.log("new inbound directory: " + inboundDirectory)

//     metaController.setRequestBodyDirectory(inboundDirectory).then((responseBody) => {
//         console.log(responseBody)
//         res.send(responseBody)
//     })

// })

// // RFC
// app.post('/v1/function/:rfcName', (req, res) => {

//     const rfcName = req.params.rfcName
//     const rfcCallBody = req.body
//     const waitTimeInSeconds = 0
//     postRFCDelayedController.handlePostRFCRequestWithWait(rfcName, rfcCallBody, waitTimeInSeconds).then((responseBody) => {
//         console.log("Response: 200")
//         res.send(responseBody)
//     })

// })


// var server = app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`)
// })


