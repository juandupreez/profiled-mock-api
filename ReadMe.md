# Profiled Mock API

This is a server built on top of [express](https://www.npmjs.com/package/express) which serves JSON and XML files based on file/folder configuration.
The root directory of the response files can be separated by "profiles."



## Getting Started

### Step 1: Create mock server
One can create a new `index.ts` file and fill it with contents:

```
import { MockApiServer, GlobalLogger, LogLevel } from 'profiled-mock-api'

GlobalLogger.getInstance().logLevel = LogLevel.ALL

const mockServer: MockApiServer = new MockApiServer({
    initialActiveProfile: "default", // default: 'default'
    port: 3000, // default 3000
    profileDirectory: "responses"
})


mockServer.start()
```

### Step 2: Create response files
With file structure: 

```
node_modules
responses
    default
        ping.json
index.ts
package.json

```
we can create ping.json: 
```json
{
    "message": "pong"
}
```

`responses` is where the profile directories will be stored. `responses/default` is the root directory where responses of the "default" profile will be served from. 

### Step 3: Run the server:
```
ts-node index.ts
```

### Step 4: Call the endpoint:

GET http://localhost:3000/ping





## Specify method and response 

### Option 1: Simple files:
Directory Structure:
```
resources
    default
        ping.json
        some
            deep
                path
                    status.json
```
Calls:
- GET http://localhost:3000/ping
- POST http://localhost:3000/ping
- <any http method> http://localhost:3000/ping
- GET http://localhost:3000/some/deep/path/status
- POST http://localhost:3000/some/deep/path/status
- <any http method> http://localhost:3000/some/deep/path/status

### Option 2: Complex Files with HTTP Method:
Directory Structure:

```
resources
    default
        ping.GET.json
        ping.POST.json
        some
            deep
                path
                    status.GET.json
                    status.PUT.json
```
Calls:
- GET http://localhost:3000/ping
- POST http://localhost:3000/ping
- GET http://localhost:3000/some/deep/path/status
- PUT http://localhost:3000/some/deep/path/status

### Option 3: Complex Files with HTTP Method and response status:
Directory Structure:

```
resources
    default
        ping.GET.200.json
        ping.POST.500.json
        some
            deep
                path
                    status.GET.200.json
                    status.PUT.201.json
        health
            check.500.json
```
Calls:
- GET http://localhost:3000/ping
- POST http://localhost:3000/ping
- GET http://localhost:3000/some/deep/path/status
- PUT http://localhost:3000/some/deep/path/status


### Option 4: Directories:
Directory Structure:

```
resources
    default
        ping
            GET.json
            POST.json
        health
            check
                GET.json
                POST.201.json
                PUT.500.json
```

Calls:
- GET http://localhost:3000/ping
- POST http://localhost:3000/ping
- GET http://localhost:3000/health/check
- POST http://localhost:3000/health/check
- PUT http://localhost:3000/health/check


## Profiles
Suppose we have a directory structure as follows:

```
resources
    test_case_happy_path
        ping
            GET.200.json
        health
            check
                GET.200.json
    test_case_evtang_broken
        ping
            GET.500.json
        health
            check
                GET.500.json
```

### All Profiles:
Profiles can be seen at
GET ```http://localhost:3000/profiles```: 
```
{
    "test_case_happy_path": {
        "responseFileBasePath": "responses\\test_case_happy_path"
    },
    "test_case_evtang_broken": {
        "responseFileBasePath": "responses\\test_case_evtang_broken"
    }
}
```

### Active Profiles:
The active profile can be seen at
GET ```http://localhost:3000/activeProfile```: 
```
{
    "activeProfile": "test_case_happy_path"
}
```

### Changing Active Profile:
The active profile can be seen at
POST ```http://localhost:3000/activeProfile```: 
with body
```
{
    "newlyActiveProfile": "test_case_happy_path"
}
```
Response 200: {

}