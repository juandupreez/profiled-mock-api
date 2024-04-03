import { Request, Response } from "express-serve-static-core"
import { FileRepository } from "../repository/FileRepository"
import path from 'path'
import { ProfileService } from "../service/ProfileService"
import { FilteredLogger, GlobalLogger } from "../util/Logger"

export class FileResponseController {

    private readonly logger: FilteredLogger = GlobalLogger.getInstance()
    private readonly fileRepository: FileRepository
    private readonly profileService: ProfileService

    constructor (fileRepository: FileRepository, profileService: ProfileService) {
        this.fileRepository = fileRepository
        this.profileService = profileService
    }

    async handleRequest (req: Request, res: Response): Promise<void> {

        try {
            const profileBaseDir: string = this.profileService.getCurProfileBaseDir()
            const requestUri: string = req.url
            const method: string = req.method

            const possibleResponseFilePaths: string[] = [
                ...await this._getPossibleFilePathsByFile(path.join(profileBaseDir, requestUri), method, path.normalize(profileBaseDir)),
                ...await this._getPossibleFilePathsByDirectory(path.join(profileBaseDir, requestUri), method)
            ]
            const chosenResponseFileLocation: string = this._assertExistsAndSelectSingleFilePath(possibleResponseFilePaths, path.join(profileBaseDir, requestUri), method)
            const extractedStatus: number = this._extractStatusFromFilePath(chosenResponseFileLocation)
            this.logger.trace('Response file: ' + chosenResponseFileLocation)
            const responseBody: any = await this.fileRepository.readFileContents(chosenResponseFileLocation)
            res.status(extractedStatus).send(responseBody)
        } catch (e) {
            this.logger.error(e)

            if ((e?.message as string ?? '').includes('no such file or directory')
                || (e?.message as string ?? '').includes('No possible responses found in directory')) {
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
    private async _getPossibleFilePathsByFile (directoryPath: string, method: string, dirToExclude: string): Promise<string[]> {
        if (directoryPath.split(/[\\|/]+$/).join('') == dirToExclude.split(/[\\|/]+$/).join('')) {
            return []
        }
        const oneDirectoryUp: string = path.normalize(path.join(directoryPath, '..'))
        const lastUriPartToUseAsFile: string = directoryPath.replace(oneDirectoryUp, "")
        const allFilesInOneUpDirectory: string[] = await this.fileRepository.getAllFilenamesInDirIfDirExists(oneDirectoryUp) ?? []
        // const fileNamesWithLastUriPartAndMethod: string[] = allFilesInOneUpDirectory.filter((singleFileName) => {
        //     return path.join('/', singleFileName).includes(lastUriPartToUseAsFile + '.' + method)
        // })
        const filteredFilesWithDirectory: string[] = allFilesInOneUpDirectory.map((singleFileName: string) => {
            return path.join(oneDirectoryUp, singleFileName)
        })
        return filteredFilesWithDirectory
    }

    private async _getPossibleFilePathsByDirectory (directoryPath: string, method: string): Promise<string[]> {
        const allFilesInDirectory: string[] = await this.fileRepository.getAllFilenamesInDirIfDirExists(directoryPath) ?? []
        const fileNamesWithMethod: string[] = allFilesInDirectory.filter((singleFileName) => {
            return singleFileName.startsWith(method)
        })
        const filteredFilesWithDirectory: string[] = fileNamesWithMethod.map((singleFileName: string) => {
            return path.join(directoryPath, singleFileName)
        })
        return filteredFilesWithDirectory
    }

    private _assertExistsAndSelectSingleFilePath (possibleResponseFilePaths: string[], directoryPath: string, method: string): string {
        if (possibleResponseFilePaths.length === 0) {
            throw new Error('No possible responses found in directory: "' + directoryPath + '" for method: ' + method)
        } else if (possibleResponseFilePaths.length > 1) {
            this.logger.warn('Multiple possible response files. Defaulting to first one: \n  '
                + JSON.stringify(possibleResponseFilePaths[0], null, 2)
                + '\nAll possibilities: '
                + JSON.stringify(possibleResponseFilePaths, null, 2))
        }
        return possibleResponseFilePaths[0]
    }

    private _extractStatusFromFilePath (fileLocation: string): number {
        const httpCodeMatches: RegExpMatchArray | null = fileLocation.match(/\d\d\d/)
        if (httpCodeMatches === null) {
            return 200
        } else {
            return parseInt(httpCodeMatches[0] ?? '200')
        }
    }

}