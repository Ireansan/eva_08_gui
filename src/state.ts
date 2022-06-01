import {proxy} from 'valtio'
import { Hands, Results } from '@mediapipe/hands'

class States {
    handsData = new Hands();
    ctx = new CanvasRenderingContext2D();
}

export const state = proxy(new States());