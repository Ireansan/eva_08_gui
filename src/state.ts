import { proxy } from 'valtio'
import { Results } from '@mediapipe/hands'
import * as THREE from "three"

class Configs {
    mode: number = 0
    label: string | undefined = "Right"
    speed: number = 5
}

class EVA08_States {
    startEuler: THREE.Euler = new THREE.Euler(0, 0, 0)
    endEuler: THREE.Euler = new THREE.Euler(0, Math.PI / 2, 0)
    count: number = 0
    countFlag: boolean = true
}

class States {
    config: Configs = new Configs()
    handResults: Results | any = {}
    record: EVA08_States = new EVA08_States()
}

export const states = proxy(new States());