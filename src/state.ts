import { proxy } from 'valtio'
import { Results } from '@mediapipe/hands'
import * as THREE from "three"

class Configs {
    mode: number = 0
    label: string | undefined = "Left"
    speed: number = 5
}

class EVA08States {
    startEuler: THREE.Euler = new THREE.Euler(0, 0, 0)
    endEuler: THREE.Euler = new THREE.Euler(0, Math.PI / 2, 0)
    count: number = 0
    countFlag: boolean = true
    // 
    rotation: THREE.Euler = new THREE.Euler(0, 0, 0)
    rotateFlag: boolean = false
    // 
    upIndex: boolean = false
    flagIndex: boolean = false
    // 
    upMiddle: boolean = false
    flagMiddle: boolean = false
}

class States {
    config: Configs = new Configs()
    handResults: Results | any = {}
    eva08state: EVA08States = new EVA08States()
}

export const states = proxy(new States());