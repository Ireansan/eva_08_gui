import React, { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, Vector3, Euler, Quaternion } from "three";
import { useSnapshot } from "valtio";
import { useControls } from "leva";

import { states } from "../state";
import { MediapipeHelper } from "../helpers/mediapipe.helper";

type EVA08UIProps = {
    children: React.ReactElement;
};

function ActionThumb({ children }: EVA08UIProps) {
    const ref = useRef<Group>(new Group());
    const { handResults, eva08state, config } = useSnapshot(states);
    const viewport = useThree((state) => state.viewport);
    const results = new MediapipeHelper(handResults, viewport);

    const [configControl, set] = useControls(() => ({
        v20: { value: 0, label: "radian" },
        v25: { value: 0, label: "rotation" },
        v21: { value: 0, label: "count" },
        v22: { value: true, label: "count Flag" },
        v23: { value: 0, label: "start Euler" },
        v24: { value: 0, label: "end Euler" },
    }));

    useFrame((state, delta) => {
        if (results.checkLength()) {
            const i = results.searchIndex(config.label);

            if (i !== undefined) {
                /*
                 * p5 -- p4
                 * |  \   |
                 * |   \  |
                 * p9 -- p0
                 */
                const angle: number =
                    Math.PI / 2 - results.angleHinge(5, 4, 0, 9)!;
                set({ v20: angle });

                // check
                if (eva08state.countFlag) {
                    set({ v23: eva08state.startEuler }); //
                    set({ v22: eva08state.countFlag }); //

                    ref.current.rotation.y = eva08state.startEuler.y + angle!;
                    set({ v25: ref.current.rotation.y }); //

                    // rotate
                    if (angle > Math.PI / 3) {
                        ++states.eva08state.count;
                        states.eva08state.startEuler.copy(eva08state.endEuler);
                        states.eva08state.endEuler.setFromQuaternion(
                            new Quaternion().setFromEuler(
                                new Euler(
                                    0,
                                    (eva08state.count * Math.PI) / 2,
                                    0
                                )
                            )
                        );

                        set({ v21: eva08state.count }); //
                        set({ v23: eva08state.startEuler.y }); //
                        set({ v24: eva08state.endEuler.y }); //

                        states.eva08state.countFlag = false;
                    }
                } else {
                    ref.current.quaternion.rotateTowards(
                        new Quaternion().setFromEuler(eva08state.startEuler),
                        config.speed * delta
                    );

                    set({ v21: ref.current.rotation.y }); //
                    set({ v22: eva08state.countFlag }); //

                    // check rotate fin
                    if (
                        ref.current.rotation.y === eva08state.startEuler.y &&
                        angle < Math.PI / 16
                    ) {
                        states.eva08state.countFlag = true;
                    }
                    if (eva08state.count === 0) {
                        states.eva08state.countFlag = true;
                    }
                }
            }
        } else {
            ref.current.quaternion.rotateTowards(
                new Quaternion().setFromEuler(eva08state.startEuler),
                config.speed * delta
            );
        }
    });

    return (
        <group ref={ref}>
            {/*  */}
            {children}
        </group>
    );
}

// ==================================================
function ActionIndex({ children }: EVA08UIProps) {
    const ref = useRef<Group>(new Group());
    const { handResults, eva08state, config } = useSnapshot(states);
    const viewport = useThree((state) => state.viewport);
    const results = new MediapipeHelper(handResults, viewport);
    const Threshold: number = Math.PI / 16;

    const [viewStates, set] = useControls(() => ({
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
    }));

    useEffect(() => {
        states.eva08state.rotation = new Euler().copy(ref.current.rotation);
    }, []);

    useFrame((state, delta) => {
        if (results.checkLength()) {
            const i = results.searchIndex(config.label);

            if (i !== undefined) {
                const vIndex: Vector3 = results.toDirection(i, 5, i, 6); // 5 -> 8
                const vMiddle: Vector3 = results.toDirection(i, 9, i, 10); // 9 -> 12
                const angleFinger: number = vIndex.angleTo(vMiddle);
                set({ v0: angleFinger });

                // normal vector
                const v5to0: Vector3 = results.toDirection(i, 5, i, 0);
                const v5to9: Vector3 = results.toDirection(i, 5, i, 9);
                const n: Vector3 = new Vector3()
                    .crossVectors(v5to0, v5to9)
                    .multiplyScalar(-1);
                const angleIndex: number = vIndex.angleTo(n);
                set({ v1: angleIndex });
                const angleMiddle: number = vMiddle.angleTo(n);
                set({ v2: angleMiddle });

                /**
                 * Left
                 *  index up -> down -> middle up => rotate -Math.PI / 2
                 *  middle up -> down -> index up => rotate +Math.PI / 2
                 *  index up -> down -> index up => count --
                 *  middle up -> down -> middle up => count ++
                 * Right
                 *  index up -> down -> middle up => rotate +Math.PI / 2
                 *  middle up -> down -> index up => rotate -Math.PI / 2
                 *  index up -> down -> index up => count ++
                 *  middle up -> down -> middle up => count --
                 */
                // check Index finger / Up
                if (
                    !eva08state.rotateFlag &&
                    angleIndex < Math.PI / 3 &&
                    angleFinger > Math.PI / 4
                ) {
                    // Rotate / Middle
                    if (eva08state.flagMiddle && !eva08state.rotateFlag) {
                        states.eva08state.rotation.y +=
                            (Math.PI / 2) * (config.label === "Left" ? 1 : -1);
                        // convert -PI / 2 ~ PI / 2
                        states.eva08state.rotation.setFromQuaternion(
                            new Quaternion().setFromEuler(
                                states.eva08state.rotation
                            )
                        );
                        states.eva08state.flagMiddle = false;
                        states.eva08state.rotateFlag = true;

                        console.log("Rotate: Middle -> Index"); //
                        set({ v8: false }); // set({ v8: eva08state.flagMiddle }); //
                        set({ v9: true }); // set({ v9: eva08state.rotateFlag }); //
                        set({ v10: viewStates.v11 }); //
                        set({ v11: "Rotate: Middle -> Index" }); //
                    }
                    // call event / Index
                    else if (eva08state.flagIndex) {
                        //
                        states.eva08state.flagIndex = false;

                        console.log("Call Event: Index -> Index"); //
                        set({ v6: false }); // set({ v6: eva08state.flagIndex }); //
                        set({ v10: viewStates.v11 }); //
                        set({ v11: "Call Event: Index -> Index" }); //
                    } else {
                        states.eva08state.upIndex = true;

                        console.log("Up: Index"); //
                        set({ v5: true }); // set({ v5: eva08state.upIndex }); //
                        set({ v10: viewStates.v11 }); //
                        set({ v11: "Up: Index" }); //
                    }
                }
                // check Index finger / Down
                if (
                    eva08state.upIndex &&
                    angleIndex > Math.PI / 6 &&
                    angleFinger < Math.PI / 4
                ) {
                    states.eva08state.upIndex = false;
                    states.eva08state.flagIndex = true;

                    console.log("Down: Index"); //
                    set({ v5: false }); // set({ v5: eva08state.upIndex }); //
                    set({ v6: true }); // set({ v6: eva08state.flagIndex }); //
                    set({ v10: viewStates.v11 }); //
                    set({ v11: "Down Index" }); //
                }
                // check Miggle finger / Up
                if (
                    !eva08state.rotateFlag &&
                    angleMiddle < Math.PI / 3 &&
                    angleFinger > Math.PI / 4
                ) {
                    // Rotate / Index
                    if (eva08state.flagIndex && !eva08state.rotateFlag) {
                        states.eva08state.rotation.y +=
                            (Math.PI / 2) * (config.label === "Left" ? -1 : 1);
                        // convert -PI / 2 ~ PI / 2
                        states.eva08state.rotation.setFromQuaternion(
                            new Quaternion().setFromEuler(
                                states.eva08state.rotation
                            )
                        );

                        states.eva08state.flagIndex = false;
                        states.eva08state.rotateFlag = true;

                        console.log("Rotate: Index -> Middle"); //
                        set({ v6: false }); // set({ v6: eva08state.flagIndex }); //
                        set({ v9: true }); // set({ v9: eva08state.rotateFlag }); //
                        set({ v10: viewStates.v11 }); //
                        set({ v11: "Rotate: Index -> Middle" }); //
                    }
                    // call event
                    else if (eva08state.flagMiddle) {
                        //
                        states.eva08state.flagMiddle = false;

                        console.log("Call Event: Middle -> Middle"); //
                        set({ v8: false }); // set({ v8: eva08state.flagMiddle }); //
                        set({ v10: viewStates.v11 }); //
                        set({ v11: "Call Event: Middle -> Middle" }); //
                    } else {
                        states.eva08state.upMiddle = true;

                        console.log("Up: Middle"); //
                        set({ v7: true }); // set({ v7: eva08state.upMiddle }); //
                        set({ v10: viewStates.v11 }); //
                        set({ v11: "Up: Middle" }); //
                    }
                }
                // check Miggle finger Down
                if (
                    eva08state.upMiddle &&
                    angleMiddle > Math.PI / 6 &&
                    angleFinger < Math.PI / 4
                ) {
                    states.eva08state.upMiddle = false;
                    states.eva08state.flagMiddle = true;

                    console.log("Down: Middle"); //
                    set({ v7: false }); // set({ v7: eva08state.upMiddle }); //
                    set({ v8: true }); // set({ v8: eva08state.flagMiddle }); //
                    set({ v10: viewStates.v11 }); //
                    set({ v11: "Down: Middle" }); //
                }
                // rotate
                if (eva08state.rotateFlag) {
                    ref.current.quaternion.rotateTowards(
                        new Quaternion().setFromEuler(
                            eva08state.rotation.clone()
                        ),
                        config.speed * delta
                    );

                    console.log("Rotate: Start"); //
                    set({ v4: ref.current.rotation.y }); //
                    set({ v10: viewStates.v11 }); //
                    set({ v11: "Rotate: Start" }); //

                    if (ref.current.rotation.y === eva08state.rotation.y) {
                        states.eva08state.rotateFlag = false;

                        console.log("Rotate: Finish"); //
                        set({ v9: false }); // set({ v9: eva08state.rotateFlag }); //
                        set({ v10: viewStates.v11 }); //
                        set({ v11: "Rotate: Finish" }); //
                    }
                }
            }
            //
        }
    });

    return (
        <group ref={ref}>
            {/*  */}
            {children}
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
