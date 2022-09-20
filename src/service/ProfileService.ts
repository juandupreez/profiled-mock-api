import { Profile } from "../model/MockServerConfig"
import { FileRepository } from "../repository/FileRepository"
import path from 'path'

export class ProfileService {

    private readonly profiles: { [key: string]: Profile }

    constructor (profiles?: { [key: string]: Profile }) {
        this.profiles = {}
        for (const key in profiles) {
            if (Object.prototype.hasOwnProperty.call(profiles, key)) {
                const singleProfile: Profile = profiles[key]
                this._addProfile(key, path.normalize(singleProfile.responseFileBasePath))
            }
        }
    }

    getAllProfiles (): { [key: string]: Profile } {
        return { ...this.profiles }
    }

    getCurProfileBaseDir (): string {
        return 'resources/default'
    }

    async readProfilesFromFileSystem (profileDirectory: string | undefined, fileRepository: FileRepository) {
        if (profileDirectory !== undefined) {
            const subDirectoryNames: string[] = fileRepository.getAllDirectoryNamesInDirSync(profileDirectory) ?? []
            subDirectoryNames.forEach((singleSubDirectoryName) => {
                this._addProfile(singleSubDirectoryName, path.join(profileDirectory, singleSubDirectoryName))
            })
        }
    }

    private _addProfile (profileName: string, profileDirectory: string) {
        this.profiles[profileName] = {
            responseFileBasePath: profileDirectory
        }
    }

}