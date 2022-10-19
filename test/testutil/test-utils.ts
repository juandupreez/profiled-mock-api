import { when } from "ts-mockito"
import { FileRepository } from "../../src/repository/FileRepository"
import path from 'path'
import { FilteredLogger, GlobalLogger } from "../../src/util/Logger"


export function givenFileHasContents (mockFileRepository: FileRepository, directoryPath: string, fileName: string, fileContents: string) {
    const logger: FilteredLogger = GlobalLogger.getInstance()
    logger.trace('Setting up file contents for file at: ' + path.join(directoryPath, fileName))
    when(mockFileRepository.readFileContents(path.join(directoryPath, fileName))).thenResolve(fileContents)
}