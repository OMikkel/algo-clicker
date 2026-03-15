


export interface Environment {
    "intEnv": {[key:string]: number},
    "boolEnv":{[key:string]: boolean},
    "arrEnv":{[key:string]: number[]},
    "parentEnv": Environment | null
}

export function emptyEnvironment() {
    return {"intEnv": {},
    "boolEnv":{},
    "arrEnv":{},
    "parentEnv": null}
}