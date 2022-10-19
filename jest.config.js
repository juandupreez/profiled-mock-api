module.exports = {
    // roots: [
    //     "<rootDir>/src"
    // ],
    testMatch: [
        // "**/test/repository/FileRepository.test.ts",
        // // "**/test/handler/MockRequestHandler.test.ts",

        "**/test/api-server/1_BaseUri.test.ts",
        "**/test/api-server/2_SimpleUri.test.ts",
        "**/test/api-server/3_ProfileInitialization.test.ts",
        "**/test/api-server/4_ProfileStateManagement.test.ts",
        "**/test/api-server/5_ProfileDirectoryPointing.test.ts",
        
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    }
}