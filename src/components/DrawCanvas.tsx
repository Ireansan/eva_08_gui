/*
 * Original Author: nemutas
 *  GitHub: https://github.com/nemutas
 * URL: https://github.com/nemutas/app-mediapipe-hands-demo/blob/main/src/utils/drawCanvas.ts
 */

import React, { useRef, useCallback, useEffect, useState } from "react";
import { css } from "@emotion/css";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {
    HAND_CONNECTIONS,
    NormalizedLandmarkListList,
    Results,
} from "@mediapipe/hands";
import { useSnapshot } from "valtio";

import { state } from "../state";

/**
 * Draw canvas
 * @param ctx canvas context
 * @param results Hand detection results
 */
// type drawCanvasCustomProp = {
//     ref: React.RefObject<HTMLCanvasElement>;
//     ctx: CanvasRenderingContext2D;
//     results: Results;
// };
// export function DrawCanvas({ ref }: drawCanvasCustomProp) {
export function DrawCanvas({ ...prop }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { handResults } = useSnapshot(state);

    useEffect(() => {
        const ctx = canvasRef.current!.getContext("2d")!;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        // const canvasCtx = canvasRef.current!.getContext("2d")!;

        ctx.save();
        ctx.clearRect(0, 0, width, height);
        // Draw capture image
        ctx.drawImage(handResults.image, 0, 0, width, height);
        // Draw hand
        if (handResults.multiHandLandmarks) {
            // Draw frames
            for (const landmarks of handResults.multiHandLandmarks) {
                drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
                    color: "#00FF00",
                    lineWidth: 1,
                });
                drawLandmarks(ctx, landmarks, {
                    color: "#FF0000",
                    lineWidth: 1,
                    radius: 2,
                });
            }
            // Draw circle
            drawCircle(ctx, handResults.multiHandLandmarks);
        }
        ctx.restore();
    }, []);

    return (
        <div className={styles.container}>
            <canvas
                ref={canvasRef}
                className={styles.canvas}
                width={1280}
                height={720}
            />
        </div>
    );
}

/**
 * Draw a circle between the tip of the index finger and the tip of the forefinger
 * @param ctx
 * @param handLandmarks
 */
const drawCircle = (
    ctx: CanvasRenderingContext2D,
    handLandmarks: NormalizedLandmarkListList
) => {
    if (handLandmarks.length > 0 && handLandmarks[0].length > 8) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const [x1, y1, z1] = [
            handLandmarks[0][8].x * width,
            handLandmarks[0][8].y * height,
            handLandmarks[0][8].z * width,
        ];
        const [x2, y2, z2] = [
            handLandmarks[0][4].x * width,
            handLandmarks[0][4].y * height,
            handLandmarks[0][4].z * width,
        ];
        const x = (x1 + x2) / 2;
        const y = (y1 + y2) / 2;
        const r =
            Math.sqrt(
                Math.pow(x1 - x2, 2) +
                    Math.pow(y1 - y2, 2) +
                    Math.pow(z1 - z2, 2)
            ) / 2;

        ctx.strokeStyle = "#0082cf";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.stroke();
    }
};

// ==============================================
// styles
const styles = {
    container: css`
        position: relative;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    `,
    canvas: css`
        position: absolute;
        width: 1280px;
        height: 720px;
        background-color: #fff;
    `,
};
