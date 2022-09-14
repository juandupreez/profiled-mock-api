import fs from 'fs'

export class FileRepository {
    async readFileContents (responseFileBasePath: string): Promise<any> {
        const fileContents: Buffer = fs.readFileSync(responseFileBasePath)
        return JSON.parse(fileContents.toString())
    }
    
    async getAllFilenamesInDir (directoryPath: string): Promise<string[]> {
        const directoryContents: string[] = fs.readdirSync(directoryPath)
        return directoryContents
    }

}