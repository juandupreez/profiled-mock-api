import { FileRepository } from "../../src/repository/FileRepository"

global.console = require('console')

describe('FileRepository', () => {

    it('should get all filenames in a directory', async () => {
        const fileRepository: FileRepository = new FileRepository()

        const directoryContents: string[] = await fileRepository.getAllFilenamesInDirIfDirExists('.')
        
        expect(directoryContents).toEqual([
            '.gitignore',
            'build.tsconfig.json',
            'jest.config.js',
            'package-lock.json',
            'package.json',
            'tsconfig.json'
        ])
    })

})