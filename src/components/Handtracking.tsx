/*
 * Original Author: nemutas
 *  GitHub: https://github.com/nemutas
 * URL: https://github.com/nemutas/app-mediapipe-hands-demo/blob/main/src/components/App.tsx
 *
 */

import React, { useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { css } from "@emotion/css";
import { Camera } from "@mediapipe/camera_utils";
import { Hands, Results } from "@mediapipe/hands";
import { useSnapshot } from "valtio";
import { useControls } from "leva";

import { drawCanvas } from "../utils/drawCanvas";
import { CubeUI } from "./CubeUI";
import { SphereUI } from "./SphereUI";
import { EVA08UI } from "./EVA08UI";
import { Box, LabelBox } from "./Mesh";
import { states } from "../state";

export function Handtracking() {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { config } = useSnapshot(states);

    const [configPanle, set] = useControls(() => ({
        type_0: {
            options: ["EVA_08", "Soft Sphere", "Follow Box"],
            label: "Mode Select",
            onChange: (e) => {
                if (e === "EVA_08") {
                    states.config.mode = 0;
                } else if (e === "Soft Sphere") {
                    states.config.mode = 1;
                } else if (e === "Follow Box") {
                    states.config.mode = 2;
                }
            },
        },
        type_1: {
            options: ["Left", "Right", "Undefined"],
            label: "L/R Select",
            onChange: (e) => {
                if (e === "Left" || e === "Right") {
                    states.config.label = e;
                } else if (e === "Undefined") {
                    states.config.label = undefined;
                }
            },
        },
    }));

    /**
     * Detection results (called every frame)
     * @param results
     */
    const onResults = useCallback((results: Results) => {
        const canvasCtx = canvasRef.current!.getContext("2d")!;
        drawCanvas(canvasCtx, results);

        states.handResults = results;
    }, []);

    // Init
    useEffect(() => {
        const hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            },
        });

        hands.setOptions({
            selfieMode: true,
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

        console.log("useEffect");
    }, [onResults]);

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
            {/* 3D draw */}
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
                    {config.mode === 0 && (
                        <EVA08UI>
                            {/* <LabelBox /> */}
                            <></>
                        </EVA08UI>
                    )}
                    {config.mode === 1 && <SphereUI />}
                    {config.mode === 2 && <CubeUI />}
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
};
