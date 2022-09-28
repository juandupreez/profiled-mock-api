import { FileRepository } from "../repository/FileRepository"

export interface MockServerConfig {
    port: number,

    initialActiveProfile: string,
    profiles?: { [details: string]: Profile },
    profileDirectory?: string

    fileRepository?: FileRepository
}

export interface Profile {
    responseFileBasePath: string
}