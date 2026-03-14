import type { Environment } from "./data-model";

export const example_env: Environment = {
    "intEnv": {"x": 5,"y":71},
    "boolEnv":{"maybe":false},
    "arrEnv":{},
    "parentEnv": {
        "intEnv": {},
        "boolEnv":{},
        "arrEnv":{"list":[1,2,3,4,5]},
        "parentEnv":null
    }
}