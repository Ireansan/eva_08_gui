import React, { useRef, MutableRefObject } from "react";
import { useFrame, useThree, Size } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import { useSnapshot } from "valtio";
import { Group, Vector3, Matrix4, Quaternion } from "three";

import { state } from "../state";

// Base Meshs
function Sphere({ ...props }) {
    return (
        <mesh {...props}>
            <sphereGeometry args={[1, 32, 16]} />
            {/* <meshStandardMaterial color={"hotpink"} /> */}
            <meshNormalMaterial attach="material" />
        </mesh>
    );
}

function Cone({ ...props }) {
    return (
        <mesh {...props}>
            <cylinderBufferGeometry args={[0, 0.5, 2, 32, 4]} />
            {/* <meshStandardMaterial color={"hotpink"} /> */}
            <meshNormalMaterial attach="material" />
        </mesh>
    );
}

// Calculate functions
function convert3D(vector: Vector3, viewport: Size): Vector3 {
    const returnVector = new Vector3();
    returnVector.x = (vector.x - 1 / 2) * viewport.width;
    returnVector.y = (vector.y - 1 / 2) * viewport.height;
    returnVector.z = vector.z * viewport.width;
    returnVector.multiplyScalar(-1); // mirroring

    return returnVector;
}

function setPosition(ref: MutableRefObject<Group>, vector: Vector3) {
    ref.current.position.x = vector.x;
    ref.current.position.y = vector.y;
    ref.current.position.z = vector.z;
    ref.current.scale.x = 0.1;
    ref.current.scale.y = 0.1;
    ref.current.scale.z = 0.1;
}

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
            const position1 = convert3D(landmarks1, viewport);
            const position2 = convert3D(landmarks2, viewport);
            const r3 =
                Math.sqrt(
                    Math.pow(position1.x - position2.x, 2) +
                        Math.pow(position1.y - position2.y, 2) +
                        Math.pow(position1.z - position2.z, 2)
                ) / 2;

            // Set position, scale
            ref.current!.position.x = (position1.x + position2.x) / 2;
            ref.current!.position.y = (position1.y + position2.y) / 2;
            ref.current!.position.z = 0;
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
            setPosition(ref_1, position1);
            setPosition(ref_2, position2);
        }
    });

    return (
        <>
            <group ref={ref}>
                <TransformControls />
                {/* <Sphere /> */}
                <Cone />
            </group>
            <group ref={ref_1}>
                <Sphere />
            </group>
            <group ref={ref_2}>
                <Sphere />
            </group>
        </>
    );
}
