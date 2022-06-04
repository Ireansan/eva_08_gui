import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import { useSnapshot } from "valtio";
import { Group, Vector3, Matrix4, Quaternion } from "three";

import { state } from "../state";
import { Sphere, Cone } from "./Mesh";
import { normalizeToWorld } from "../helpers/mediapipe.helper";

// Main
export function SphereUI() {
    const { handLandmarks } = useSnapshot(state);
    const viewport = useThree((state) => state.viewport);

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
        if (handLandmarks.length > 0 && handLandmarks[0].length > 8) {
            const landmarks1 = new Vector3(
                handLandmarks[0][8].x,
                handLandmarks[0][8].y,
                handLandmarks[0][8].z
            );
            const landmarks2 = new Vector3(
                handLandmarks[0][4].x,
                handLandmarks[0][4].y,
                handLandmarks[0][4].z
            );
            const position1 = normalizeToWorld(landmarks1, viewport);
            const position2 = normalizeToWorld(landmarks2, viewport);
            const r3 =
                Math.sqrt(
                    Math.pow(position1.x - position2.x, 2) +
                        Math.pow(position1.y - position2.y, 2) +
                        Math.pow(position1.z - position2.z, 2)
                ) / 2;

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
