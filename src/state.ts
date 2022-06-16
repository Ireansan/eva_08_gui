import { proxy } from 'valtio'
import { Results } from '@mediapipe/hands'
import * as THREE from "three"

class Configs {
    mode: number = 0
    label: string | undefined = "Left"
    speed: number = 5
}

class EVA08States {
    count: number = 0;
    thresholdIndex: number = Math.PI / 6;
    thresholdMiddle: number = Math.PI / 4;
    thresholdFinger: number = Math.PI / 6;
    // 
    timer: number = 1;
    elapsedTime: number = 0;
    // 
    targetVector: THREE.Vector3 = new THREE.Vector3(0, 0, 1)
    // 
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