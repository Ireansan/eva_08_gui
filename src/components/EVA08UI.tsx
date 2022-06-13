import React, { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, Vector3, Euler, Quaternion } from "three";
import { useSnapshot } from "valtio";
import { useControls } from "leva";

import { states } from "../state";
import { MediapipeHelper } from "../helpers/mediapipe.helper";

type EVA08UIProps = {
    children: React.ReactElement;
};

export function EVA08UI({ children }: EVA08UIProps) {
    const ref = useRef<Group>(new Group());
    const { handResults, record, config } = useSnapshot(states);
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
                    Math.PI / 2 - results.angleHinge([5, 4, 0, 9])!;
                set({ v20: angle });

                // check
                if (record.countFlag) {
                    set({ v23: record.startEuler }); //
                    set({ v22: record.countFlag }); //

                    ref.current.rotation.y = record.startEuler.y + angle!;
                    set({ v25: ref.current.rotation.y }); //

                    // rotate
                    if (angle > Math.PI / 3) {
                        ++states.record.count;
                        states.record.startEuler.copy(record.endEuler);
                        states.record.endEuler.setFromQuaternion(
                            new Quaternion().setFromEuler(
                                new Euler(0, (record.count * Math.PI) / 2, 0)
                            )
                        );

                        set({ v21: record.count }); //
                        set({ v23: record.startEuler.y }); //
                        set({ v24: record.endEuler.y }); //

                        states.record.countFlag = false;
                    }
                } else {
                    ref.current.quaternion.rotateTowards(
                        new Quaternion().setFromEuler(record.startEuler),
                        config.speed * delta
                    );

                    set({ v21: ref.current.rotation.y }); //
                    set({ v22: record.countFlag }); //

                    // check rotate fin
                    if (
                        ref.current.rotation.y === record.startEuler.y &&
                        angle < Math.PI / 16
                    ) {
                        states.record.countFlag = true;
                    }
                    if (record.count === 0) {
                        states.record.countFlag = true;
                    }
                }
            }
        } else {
            ref.current.quaternion.rotateTowards(
                new Quaternion().setFromEuler(record.startEuler),
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
