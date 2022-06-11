import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import { useSnapshot } from "valtio";
import { useControls } from "leva";

import { state } from "../state";
import { MediapipeHelper } from "../helpers/mediapipe.helper";

type EVA08UIProps = {
    children: React.ReactElement;
};

export function EVA08UI({ children }: EVA08UIProps) {
    const ref = useRef<Group>(new Group());
    const { handResults } = useSnapshot(state);
    const viewport = useThree((state) => state.viewport);

    const results = new MediapipeHelper(handResults, viewport);

    const [config, set] = useControls(() => ({
        v0: { value: 0, label: "distance 0 <-> 8" },
        v1: { value: 0, label: "distance 0 <-> 12" },
        v2: { value: 0, label: "radian" },
    }));

    useFrame((state, delta) => {
        if (results.checkLength()) {
            // results.updateLabel("Right");
            const i = results.searchIndex();

            if (i !== undefined) {
                const np0: Vector3 = results.toVector3(i, 0);
                const np8: Vector3 = results.toVector3(i, 8);
                const np12: Vector3 = results.toVector3(i, 12);

                const d0to8: number = np0.distanceTo(np8);
                set({ v0: d0to8 });

                const d0to12: number = np0.distanceTo(np12);
                set({ v1: d0to12 });

                /*
                 * p5 -- p4
                 * |  \   |
                 * |   \  |
                 * p9 -- p0
                 */
                const angle: number | undefined = results.angleHinge([
                    5, 4, 0, 9,
                ]);
                set({ v2: angle });
            }
        }
    });

    return (
        <group ref={ref}>
            {/*  */}
            {children}
        </group>
    );
}
