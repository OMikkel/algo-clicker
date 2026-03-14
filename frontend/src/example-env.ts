import type { Environment } from "./data-model";

export const example_env: Environment = {
    "intEnv": {"x": 5,"y":7},
    "boolEnv":{"maybe":false},
    "arrEnv":{"list":[1,2,3,4,5]},
    "parentEnv": {
        "intEnv": {},
        "boolEnv":{},
        "arrEnv":{"list":[]},
        "parentEnv":null
    }
}