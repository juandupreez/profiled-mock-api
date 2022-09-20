import { FileRepository } from "../repository/FileRepository"

export interface MockServerConfig {
    port: number,
    profiles?: { [details: string]: Profile },
    profileDirectory?: string

    fileRepository?: FileRepository
}

export interface Profile {
    responseFileBasePath: string
}