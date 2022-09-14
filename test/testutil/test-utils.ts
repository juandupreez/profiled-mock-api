import { when } from "ts-mockito"
import { FileRepository } from "../../src/repository/FileRepository"
import path from 'path'


export function givenFileHasContents (mockFileRepository: FileRepository, directoryPath: string, fileName: string, fileContents: object) {
    console.log('Setting up file contents for file at: ' + path.join(directoryPath, fileName))
    when(mockFileRepository.readFileContents(path.join(directoryPath, fileName))).thenResolve(fileContents)
}