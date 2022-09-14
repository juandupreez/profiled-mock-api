module.exports = {
    // roots: [
    //     "<rootDir>/src"
    // ],
    testMatch: [
        // "**/test/repository/FileRepository.test.ts",
        // "**/test/handler/MockRequestHandler.test.ts",
        "**/test/api-server/BaseUri.test.ts",
        "**/test/api-server/SimpleUri.test.ts",
        
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    }
}