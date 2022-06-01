import {proxy} from 'valtio'
import { NormalizedLandmarkListList } from '@mediapipe/hands'

class States {
    handLandmarks: NormalizedLandmarkListList = [];
}

export const state = proxy(new States());