import { proxy } from 'valtio'
import { NormalizedLandmarkListList } from '@mediapipe/hands'

class States {
    mode: number = 0;
    drawHands: boolean = true;
    handLandmarks: NormalizedLandmarkListList = [];
}

export const state = proxy(new States());