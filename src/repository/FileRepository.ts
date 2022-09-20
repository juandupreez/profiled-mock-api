import fs from 'fs'

export class FileRepository {
    async readFileContents (responseFileBasePath: string): Promise<any> {
        const fileContents: Buffer = fs.readFileSync(responseFileBasePath)
        return JSON.parse(fileContents.toString())
    }

    async getAllFilenamesInDir (directoryPath: string): Promise<string[]> {
        const directoryContents: fs.Dirent[] = fs.readdirSync(directoryPath, { withFileTypes: true })
        const filesOnly: fs.Dirent[] = directoryContents.filter((singleDirent) => {
            return singleDirent.isFile()
        })
        const fileNames: string[] = filesOnly.map((singleDirent) => {
            return singleDirent.name
        })
        return fileNames
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