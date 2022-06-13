import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import { useSnapshot } from "valtio";
import { Group, Vector3, Matrix4, Quaternion } from "three";

import { states } from "../state";
import { Sphere, Cone } from "./Mesh";
import { MediapipeHelper } from "../helpers/mediapipe.helper";

// Main
export function SphereUI() {
    const { handResults, config } = useSnapshot(states);
    const viewport = useThree((state) => state.viewport);

    const results = new MediapipeHelper(handResults, viewport);

    const qPI2 = new Quaternion().setFromAxisAngle(
        new Vector3(1, 0, 0),
        Math.PI / 2
    ); // rotate x,  PI / 2
    const rotationMatrix = new Matrix4();
    const targetQuaternion = new Quaternion();

    const ref = useRef<Group>(new Group());
    const ref_1 = useRef<Group>(new Group());
    const ref_2 = useRef<Group>(new Group());

    useFrame((state, delta) => {
        if (results.checkLength()) {
            const i = results.searchIndex(config.label);

            const position1: Vector3 = results.toThree(i!, 8);
            const position2: Vector3 = results.toThree(i!, 4);
            const r3 = position1.distanceTo(position2);

            // Set position, scale
            ref.current.position.set(
                (position1.x + position2.x) / 2,
                (position1.y + position2.y) / 2,
                0
            );
            ref.current!.scale.y = r3;

            // Set rotation
            rotationMatrix.lookAt(position1, position2, ref.current!.up);
            targetQuaternion.setFromRotationMatrix(rotationMatrix);
            targetQuaternion.multiply(qPI2);
            const speed = 5;
            ref.current.quaternion.rotateTowards(
                targetQuaternion,
                speed * delta
            );
            // ref.current.lookAt(position1); <-- X, not match (p1 - p2)

            // CONFIRM:
            ref_1.current.position.copy(position1);
            ref_2.current.position.copy(position2);
        }
    });

    return (
        <>
            <group ref={ref}>
                <TransformControls />
                <Sphere />
                {/* <Cone /> */}
            </group>
            <group ref={ref_1}>
                <Sphere scale={new Vector3(0.1, 0.1, 0.1)} />
            </group>
            <group ref={ref_2}>
                <Sphere scale={new Vector3(0.1, 0.1, 0.1)} />
            </group>
        </>
    );
}
