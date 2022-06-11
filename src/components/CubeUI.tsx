import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import { useSnapshot } from "valtio";
import { Group, Vector3 } from "three";

import { state } from "../state";
import { Box } from "./Mesh";
import { MediapipeHelper } from "../helpers/mediapipe.helper";

export function CubeUI() {
    const { handResults } = useSnapshot(state);
    const viewport = useThree((state) => state.viewport);
    const results = new MediapipeHelper(handResults, viewport);

    const ref = useRef<Group>(new Group());

    useFrame((state, delta) => {
        if (results.checkLength()) {
            const i = results.searchIndex();

            const position = new Vector3().copy(results.toThree(i!, 8));
            position.z = 0;
            ref.current!.position.copy(position);
        }

        // ref.current!.rotation.x += 0.01;
    });

    return (
        <group ref={ref}>
            <Box />
            {/* <Box position={[1, 0, 0]} />
            <Box position={[0, 1, 0]} />
            <Box position={[-1, 0, 0]} />
            <Box position={[0, -1, 0]} /> */}
        </group>
    );
}
