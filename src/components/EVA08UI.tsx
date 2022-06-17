import React, { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useSnapshot } from "valtio";
import { useControls, folder } from "leva";

import { states } from "../state";
import { MediapipeHelper } from "../helpers/mediapipe.helper";

type EVA08UIProps = {
    children: React.ReactElement;
};

function ActionIndex({ children }: EVA08UIProps) {
    const ref = useRef<THREE.Group>(new THREE.Group());
    const { handResults, eva08state, config } = useSnapshot(states);
    const viewport = useThree((state) => state.viewport);
    const results = new MediapipeHelper(handResults, viewport);
    const rotationMatrix = new THREE.Matrix4();
    const targetQuaternion = new THREE.Quaternion();

    const [configControl, set] = useControls(() => ({
        setting: folder({
            "Index Threshold": {
                value: 30,
                min: 5,
                max: 90,
                step: 5,
                // lable: "Index Threshold",
                onChange: (e) => {
                    states.eva08state.thresholdIndex =
                        THREE.MathUtils.degToRad(e);
                },
            },
            "Middle Threshold": {
                value: 45,
                min: 5,
                max: 90,
                step: 5,
                // lable: "Middle Threshold",
                onChange: (e) => {
                    states.eva08state.thresholdMiddle =
                        THREE.MathUtils.degToRad(e);
                },
            },
            "Index <-> Middle": {
                value: 30,
                min: 5,
                max: 90,
                step: 5,
                // lable: "Index Middle",
                onChange: (e) => {
                    states.eva08state.thresholdFinger =
                        THREE.MathUtils.degToRad(e);
                },
            },
            s3: {
                value: 1,
                label: "Time [s]",
                onChange: (e) => {
                    states.eva08state.timer = e;
                },
            },
            s4: {
                value: 0,
                label: "Time left [s]",
            },
        }),
        view: folder({
            v0: { value: 0, label: "Finger radian" },
            v1: { value: 0, label: "n x 5to8" },
            v2: { value: 0, label: "n x 9to12" },
            v4: { value: 0, label: "rotation" },
            v5: { value: false, label: "Index Up" },
            v6: { value: false, label: "flagIndex" },
            v7: { value: false, label: "Middle Up" },
            v8: { value: false, label: "flagMiddle" },
            v9: { value: false, label: "rotateFlag" },
            v10: { value: "", label: "Pre Action" },
            v11: { value: "", label: "Latest Action" },
        }),
    }));

    useFrame((state, delta) => {
        if (results.checkLength()) {
            const i = results.searchIndex(config.label);

            if (i !== undefined) {
                const vIndex: THREE.Vector3 = results.toDirection(i, 5, i, 6); // 5 -> 8
                const vMiddle: THREE.Vector3 = results.toDirection(i, 9, i, 10); // 9 -> 12
                const angleFinger: number = vIndex.angleTo(vMiddle);
                set({ v0: angleFinger });

                // normal vector
                const v5to0: THREE.Vector3 = results.toDirection(i, 5, i, 0);
                const v5to9: THREE.Vector3 = results.toDirection(i, 5, i, 9);
                const n: THREE.Vector3 = new THREE.Vector3()
                    .crossVectors(v5to0, v5to9)
                    .multiplyScalar(config.label === "Left" ? -1 : 1);
                const angleIndex: number = Math.PI / 2 - vIndex.angleTo(n);
                set({ v1: angleIndex });
                const angleMiddle: number = Math.PI / 2 - vMiddle.angleTo(n);
                set({ v2: angleMiddle });

                /**
                 * Left
                 *  index up -> down -> middle up => rotate -Math.PI / 2
                 *  middle up -> down -> index up => rotate +Math.PI / 2
                 *  index up -> down -> index up => count ++
                 *  middle up -> down -> middle up => count --
                 * Right
                 *  index up -> down -> middle up => rotate +Math.PI / 2
                 *  middle up -> down -> index up => rotate -Math.PI / 2
                 *  index up -> down -> index up => count ++
                 *  middle up -> down -> middle up => count --
                 */
                // check Index finger / Up
                if (
                    !eva08state.rotateFlag &&
                    angleIndex > eva08state.thresholdIndex &&
                    angleFinger > eva08state.thresholdFinger
                ) {
                    // Rotate / Middle
                    if (eva08state.flagMiddle && !eva08state.rotateFlag) {
                        states.eva08state.targetVector = new THREE.Vector3()
                            .crossVectors(
                                states.eva08state.targetVector.clone(),
                                new THREE.Vector3(0, -1, 0)
                            )
                            .multiplyScalar(config.label === "Left" ? 1 : -1);
                        states.eva08state.flagMiddle = false;
                        states.eva08state.rotateFlag = true;

                        console.log("Rotate: Middle -> Index"); //
                        set({ v8: false }); // set({ v8: eva08state.flagMiddle }); //
                        set({ v9: true }); // set({ v9: eva08state.rotateFlag }); //
                        set({ v10: configControl.v11 }); //
                        set({ v11: "Rotate: Middle -> Index" }); //
                    }
                    // call event / Index
                    else if (eva08state.flagIndex && !eva08state.rotateFlag) {
                        //
                        states.eva08state.count++;
                        states.eva08state.flagIndex = false;

                        console.log("Call Event: Index -> Index"); //
                        set({ v6: false }); // set({ v6: eva08state.flagIndex }); //
                        set({ v10: configControl.v11 }); //
                        set({ v11: "Call Event: Index -> Index" }); //
                    } else {
                        states.eva08state.upIndex = true;
                        states.eva08state.elapsedTime =
                            state.clock.getElapsedTime();

                        console.log("Up: Index"); //
                        set({ v5: true }); // set({ v5: eva08state.upIndex }); //
                        set({ v10: configControl.v11 }); //
                        set({ v11: "Up: Index" }); //
                    }
                }
                // check Index finger / Down
                else if (
                    eva08state.upIndex &&
                    angleIndex < eva08state.thresholdIndex &&
                    angleFinger < eva08state.thresholdFinger
                ) {
                    states.eva08state.upIndex = false;
                    states.eva08state.flagIndex = true;
                    states.eva08state.elapsedTime =
                        state.clock.getElapsedTime();

                    console.log("Down: Index"); //
                    set({ v5: false }); // set({ v5: eva08state.upIndex }); //
                    set({ v6: true }); // set({ v6: eva08state.flagIndex }); //
                    set({ v10: configControl.v11 }); //
                    set({ v11: "Down Index" }); //
                }
                // check Miggle finger / Up
                else if (
                    !eva08state.rotateFlag &&
                    Math.PI / 2 - angleMiddle > eva08state.thresholdMiddle &&
                    angleFinger > eva08state.thresholdFinger
                ) {
                    // Rotate / Index
                    if (eva08state.flagIndex && !eva08state.rotateFlag) {
                        states.eva08state.targetVector = new THREE.Vector3()
                            .crossVectors(
                                states.eva08state.targetVector.clone(),
                                new THREE.Vector3(0, -1, 0)
                            )
                            .multiplyScalar(config.label === "Left" ? -1 : 1);
                        states.eva08state.flagIndex = false;
                        states.eva08state.rotateFlag = true;

                        console.log("Rotate: Index -> Middle"); //
                        set({ v6: false }); // set({ v6: eva08state.flagIndex }); //
                        set({ v9: true }); // set({ v9: eva08state.rotateFlag }); //
                        set({ v10: configControl.v11 }); //
                        set({ v11: "Rotate: Index -> Middle" }); //
                    }
                    // call event
                    else if (eva08state.flagMiddle && !eva08state.rotateFlag) {
                        //
                        states.eva08state.count--;
                        states.eva08state.flagMiddle = false;

                        console.log("Call Event: Middle -> Middle"); //
                        set({ v8: false }); // set({ v8: eva08state.flagMiddle }); //
                        set({ v10: configControl.v11 }); //
                        set({ v11: "Call Event: Middle -> Middle" }); //
                    } else {
                        states.eva08state.upMiddle = true;
                        states.eva08state.elapsedTime =
                            state.clock.getElapsedTime();

                        console.log("Up: Middle"); //
                        set({ v7: true }); // set({ v7: eva08state.upMiddle }); //
                        set({ v10: configControl.v11 }); //
                        set({ v11: "Up: Middle" }); //
                    }
                }
                // check Miggle finger Down
                else if (
                    eva08state.upMiddle &&
                    angleMiddle < eva08state.thresholdMiddle &&
                    angleFinger < eva08state.thresholdFinger
                ) {
                    states.eva08state.upMiddle = false;
                    states.eva08state.flagMiddle = true;
                    states.eva08state.elapsedTime =
                        state.clock.getElapsedTime();

                    console.log("Down: Middle"); //
                    set({ v7: false }); // set({ v7: eva08state.upMiddle }); //
                    set({ v8: true }); // set({ v8: eva08state.flagMiddle }); //
                    set({ v10: configControl.v11 }); //
                    set({ v11: "Down: Middle" }); //
                }
                // Rotate
                if (eva08state.rotateFlag) {
                    rotationMatrix.lookAt(
                        ref.current.position,
                        new THREE.Vector3()
                            .copy(eva08state.targetVector)
                            .add(ref.current.position),
                        ref.current!.up
                    );
                    targetQuaternion.setFromRotationMatrix(rotationMatrix);
                    ref.current.quaternion.rotateTowards(
                        targetQuaternion,
                        config.speed * delta
                    );

                    console.log("Rotate: Start"); //
                    set({ v4: ref.current.rotation.y }); //
                    set({ v10: configControl.v11 }); //
                    set({ v11: "Rotate: Start" }); //

                    if (
                        ref.current.rotation.y ===
                        new THREE.Euler().setFromQuaternion(targetQuaternion).y
                    ) {
                        states.eva08state.rotateFlag = false;

                        console.log("Rotate: Finish"); //
                        set({ v9: false }); // set({ v9: eva08state.rotateFlag }); //
                        set({ v10: configControl.v11 }); //
                        set({ v11: "Rotate: Finish" }); //
                    }
                }
                // Timeout
                if (
                    eva08state.upIndex === true ||
                    eva08state.flagIndex === true ||
                    eva08state.upMiddle === true ||
                    eva08state.flagMiddle === true
                ) {
                    if (
                        state.clock.getElapsedTime() - eva08state.elapsedTime >
                        eva08state.timer
                    ) {
                        states.eva08state.upIndex = false;
                        states.eva08state.flagIndex = false;
                        states.eva08state.upMiddle = false;
                        states.eva08state.flagMiddle = false;

                        set({ v6: false }); // set({ v6: eva08state.flagIndex }); //
                        set({ v8: false }); // set({ v8: eva08state.flagMiddle }); //
                    }
                    set({
                        s4:
                            eva08state.timer -
                            (state.clock.getElapsedTime() -
                                eva08state.elapsedTime),
                    }); //
                } else {
                    set({
                        s4: eva08state.timer,
                    }); //
                }
            }
            //
        }
    });

    return (
        <group ref={ref}>
            {/*  */}
            {children}
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={"orange"} />
                <Text
                    anchorX="center"
                    anchorY="middle"
                    rotation={[0, 0, 0]}
                    position={[0, 0, 0.75]}
                    fontSize={1}
                    children={1 + eva08state.count}
                />
                <Text
                    anchorX="center"
                    anchorY="middle"
                    rotation={[0, Math.PI / 2, 0]}
                    position={[0.75, 0, 0]}
                    fontSize={1}
                    children={2 + eva08state.count}
                />
                <Text
                    anchorX="center"
                    anchorY="middle"
                    rotation={[0, Math.PI, 0]}
                    position={[0, 0, -0.75]}
                    fontSize={1}
                    children={3 + eva08state.count}
                />
                <Text
                    anchorX="center"
                    anchorY="middle"
                    rotation={[0, -Math.PI / 2, 0]}
                    position={[-0.75, 0, 0]}
                    fontSize={1}
                    children={4 + eva08state.count}
                />
                {/* <meshNormalMaterial attach="material" /> */}
            </mesh>
        </group>
    );
}

export function EVA08UI({ children }: EVA08UIProps) {
    return (
        <>
            {/* <ActionThumb children={children} /> */}
            <ActionIndex children={children} />
        </>
    );
}
