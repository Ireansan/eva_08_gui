import { proxy } from 'valtio'
import { Results } from '@mediapipe/hands'

class States {
    mode: number = 0
    drawHands: boolean = true
    handResults: Results | any = {}
}

export const state = proxy(new States());