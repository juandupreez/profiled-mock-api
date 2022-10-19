import fs from 'fs'

export class FileRepository {
    async readFileContents (responseFileBasePath: string): Promise<string> {
        const fileContents: Buffer = fs.readFileSync(responseFileBasePath)
        return fileContents.toString()
    }

    async getAllFilenamesInDirIfDirExists (directoryPath: string): Promise<string[]> {
        const doesExist: boolean = fs.existsSync(directoryPath)
        if (doesExist) {
            const directoryContents: fs.Dirent[] = fs.readdirSync(directoryPath, { withFileTypes: true })
            const filesOnly: fs.Dirent[] = directoryContents.filter((singleDirent) => {
                return singleDirent.isFile()
            })
            const fileNames: string[] = filesOnly.map((singleDirent) => {
                return singleDirent.name
            })
            return fileNames
        } else {
            return []
        }
    }

    getAllDirectoryNamesInDirSync (directoryPath: string): string[] {
        const directoryContents: fs.Dirent[] = fs.readdirSync(directoryPath, { withFileTypes: true })
        const directoriesOnly: fs.Dirent[] = directoryContents.filter((singleDirent) => {
            return singleDirent.isDirectory()
        })
        const dirNames: string[] = directoriesOnly.map((singleDirent) => {
            return singleDirent.name
        })
        return dirNames
    }

}