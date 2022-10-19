import { Profile } from "../model/MockServerConfig"
import { FileRepository } from "../repository/FileRepository"
import path from 'path'

export class ProfileService {

    private readonly profiles: { [key: string]: Profile }
    private activeProfile: string

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

    readProfilesFromFileSystem (profileDirectory: string | undefined, fileRepository: FileRepository) {
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

    assertExistsAndSetActiveProfile (newlyActiveProfile: string) {
        if (this.profiles[newlyActiveProfile] === undefined) {
            throw new Error('Could not set active profile (' + newlyActiveProfile + ') because no such profile is configured')
        }
        this.activeProfile = newlyActiveProfile
    }

    getActiveProfile (): string {
        return this.activeProfile
    }

}