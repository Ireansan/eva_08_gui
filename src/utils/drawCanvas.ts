/*
 * Original Author: nemutas
 *  GitHub: https://github.com/nemutas
 * URL: https://github.com/nemutas/app-mediapipe-hands-demo/blob/main/src/utils/drawCanvas.ts
 */

import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS, Results } from '@mediapipe/hands';

/**
 * Draw canvas
 * @param ctx canvas context
 * @param results Hand detection results
 */
export const drawCanvas = (ctx: CanvasRenderingContext2D, results: Results) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height

    ctx.save()
    ctx.clearRect(0, 0, width, height)
    // Draw capture image
    ctx.drawImage(results.image, 0, 0, width, height)
    // Draw hand
    if (results.multiHandLandmarks) {
        // Draw frames
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 1 })
            drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 2 })
        }
    }
    ctx.restore()
}