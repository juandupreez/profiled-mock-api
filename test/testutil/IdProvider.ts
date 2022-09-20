export class IdProvider {

    private static instance: IdProvider
    
    private curPortNumber = 3001

    private constructor () { }

    static getInstance (): IdProvider {
        if (this.instance === undefined) {
            this.instance = new IdProvider()
        }
        return this.instance
    }

    getNextPortNumber (): number {
        return this.curPortNumber++
    }

}