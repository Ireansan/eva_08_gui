/*
 * Original Author: nemutas
 *  GitHub: https://github.com/nemutas
 * URL: https://github.com/nemutas/app-mediapipe-hands-demo/blob/main/src/components/App.tsx
 *
 */

import React, { useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { Canvas } from "@react-three/fiber";
import { GizmoHelper, GizmoViewport } from "@react-three/drei";
import { css } from "@emotion/css";
import { Camera } from "@mediapipe/camera_utils";
import { Hands, Results } from "@mediapipe/hands";
import { useSnapshot } from "valtio";

import { drawCanvas } from "./utils/drawCanvas";
import { CubeUI } from "./utils/CubeUI";
import { SphereUI } from "./utils/SphereUI";
import { state } from "./state";
import { OrbitControls } from "@react-three/drei";

export function Handtracking() {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const resultsRef = useRef<Results>();

    const { handLandmarks } = useSnapshot(state);
    /**
     * 検出結果（フレーム毎に呼び出される）
     * @param results
     */
    const onResults = useCallback((results: Results) => {
        resultsRef.current = results;

        const canvasCtx = canvasRef.current!.getContext("2d")!;
        drawCanvas(canvasCtx, results);

        state.handLandmarks = results.multiHandLandmarks;
    }, []);

    // 初期設定
    useEffect(() => {
        const hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            },
        });

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);

        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null
        ) {
            const camera = new Camera(webcamRef.current.video!, {
                onFrame: async () => {
                    await hands.send({ image: webcamRef.current!.video! });
                },
                width: 1280,
                height: 720,
            });
            camera.start();
        }
    }, [onResults]);

    /** 検出結果をconsoleに出力する */
    const OutputData = () => {
        const results = resultsRef.current!;
        console.log(results.multiHandLandmarks);
    };

    return (
        <div className={styles.container}>
            {/* capture */}
            <Webcam
                audio={false}
                style={{ visibility: "hidden" }}
                width={1280}
                height={720}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user",
                }}
            />
            {/* draw */}
            <canvas
                ref={canvasRef}
                className={styles.canvas}
                width={1280}
                height={720}
            />
            {/* output */}
            <div className={styles.buttonContainer}>
                <button className={styles.button} onClick={OutputData}>
                    Output Data
                </button>
            </div>
            <div
                style={{
                    position: "absolute",
                    height: "100%",
                    width: "100%",
                    top: "0px",
                    zIndex: "1",
                }}
            >
                <Canvas>
                    <ambientLight intensity={0.5} />
                    {/* <CubeUI /> */}
                    <SphereUI />
                    <OrbitControls />

                    <GizmoHelper
                        alignment="bottom-right"
                        margin={[80, 80]}
                        // renderPriority={2}
                    >
                        <GizmoViewport
                            axisColors={["hotpink", "aquamarine", "#3498DB"]}
                            labelColor="black"
                        />
                    </GizmoHelper>
                </Canvas>
            </div>
        </div>
    );
}

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
    buttonContainer: css`
        position: absolute;
        top: 20px;
        left: 20px;
        z-index: 2;
    `,
    button: css`
        color: #fff;
        background-color: #0082cf;
        font-size: 1rem;
        border: none;
        border-radius: 5px;
        padding: 10px 10px;
        cursor: pointer;
    `,
};
