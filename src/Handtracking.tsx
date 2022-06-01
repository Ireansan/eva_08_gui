/*
 * Original Author: nemutas
 *  GitHub: https://github.com/nemutas
 * URL: https://github.com/nemutas/app-mediapipe-hands-demo/blob/main/src/components/App.tsx
 *
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { css } from "@emotion/css";
import { Camera } from "@mediapipe/camera_utils";
import { Hands, Results, NormalizedLandmarkListList } from "@mediapipe/hands";

import { drawCanvas } from "./utils/drawCanvas";
// import { CubeUI } from "./utils/Cube";
import { Canvas, useThree } from "@react-three/fiber";

function Box({ ...props }) {
    // Return the view, these are regular Threejs elements expressed in JSX
    return (
        <mesh {...props}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={"orange"} />
        </mesh>
    );
}

export function Handtracking() {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const resultsRef = useRef<Results>();

    const [position, setPosition] = useState([0, 0, 0]);
    // const viewport = useThree((state) => state.viewport);
    /**
     * 検出結果（フレーム毎に呼び出される）
     * @param results
     */
    const onResults = useCallback((results: Results) => {
        resultsRef.current = results;

        const canvasCtx = canvasRef.current!.getContext("2d")!;
        drawCanvas(canvasCtx, results);

        // const width: number = canvasCtx.canvas.width;
        // const height: number = canvasCtx.canvas.height;
        const handLandmarks: NormalizedLandmarkListList =
            results.multiHandLandmarks;

        if (handLandmarks.length > 0 && handLandmarks[0].length > 8) {
            setPosition([-handLandmarks[0][8].x, -handLandmarks[0][8].y, 0]);
        }
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
        console.log(position);
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
                }}
            >
                <Canvas>
                    <Box position={position} />
                    <ambientLight intensity={0.5} />
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
