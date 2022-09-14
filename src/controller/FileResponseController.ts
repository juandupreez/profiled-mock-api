import { Request, ParamsDictionary, Response } from "express-serve-static-core"
import { ParsedQs } from "qs"
import { FileRepository } from "../repository/FileRepository"
import path from 'path'
import { ProfileService } from "../service/ProfileService"

export class FileResponseController {

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
            const possibleResponseFilePaths: string[] = await this._getPossibleFilePaths(path.join(profileBaseDir, requestUri), method)
            const chosenResponseFileLocation: string = this._assertExistsAndSelectSingleFilePath(possibleResponseFilePaths, path.join(profileBaseDir, requestUri), method)
            const extractedStatus: number = this._extractStatusFromFilePath(chosenResponseFileLocation)
            console.log('Looking for file: ' + chosenResponseFileLocation)
            const responseBody: any = await this.fileRepository.readFileContents(chosenResponseFileLocation)
            res.status(extractedStatus).send(responseBody)
        } catch (e) {
            console.error(e)

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

    private async _getPossibleFilePaths (directoryPath: string, method: string): Promise<string[]> {
        const allFilesInDirectory: string[] = await this.fileRepository.getAllFilenamesInDir(directoryPath)
        const fileNamesWithMethod: string[] = allFilesInDirectory.filter((singleFileName) => {
            return singleFileName.includes(method)
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
            console.warn('Multiple possible response files. Defaulting to first one: \n\t'
                + JSON.stringify(possibleResponseFilePaths[0], null, 2)
                + '\nAll possibilities: '
                + JSON.stringify(possibleResponseFilePaths, null, 2))
        }
        return possibleResponseFilePaths[0]
    }

    private _extractStatusFromFilePath (fileLocation: string): number {
        const httpCodeMatches: RegExpMatchArray = fileLocation.match(/\d\d\d/)
        return parseInt(httpCodeMatches[0] ?? '200')
    }

}