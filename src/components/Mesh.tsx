import React from "react";
import { Text } from "@react-three/drei";

export function Box({ ...props }) {
    return (
        <mesh {...props}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={"orange"} />
            {/* <meshNormalMaterial attach="material" /> */}
        </mesh>
    );
}

export function LabelBox({ ...props }) {
    return (
        <mesh {...props}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={"orange"} />
            <Text
                anchorX="center"
                anchorY="middle"
                rotation={[0, 0, 0]}
                position={[0, 0, 0.75]}
                fontSize={1}
                children={1}
            />
            <Text
                anchorX="center"
                anchorY="middle"
                rotation={[0, Math.PI / 2, 0]}
                position={[0.75, 0, 0]}
                fontSize={1}
                children={4}
            />
            <Text
                anchorX="center"
                anchorY="middle"
                rotation={[0, Math.PI, 0]}
                position={[0, 0, -0.75]}
                fontSize={1}
                children={3}
            />
            <Text
                anchorX="center"
                anchorY="middle"
                rotation={[0, -Math.PI / 2, 0]}
                position={[-0.75, 0, 0]}
                fontSize={1}
                children={2}
            />
            {/* <meshNormalMaterial attach="material" /> */}
        </mesh>
    );
}

export function Sphere({ ...props }) {
    return (
        <mesh {...props}>
            <sphereGeometry args={[1, 32, 16]} />
            {/* <meshStandardMaterial color={"hotpink"} /> */}
            <meshNormalMaterial attach="material" />
        </mesh>
    );
}

export function Cone({ ...props }) {
    return (
        <mesh {...props}>
            <cylinderBufferGeometry args={[0, 0.5, 2, 32, 4]} />
            {/* <meshStandardMaterial color={"hotpink"} /> */}
            <meshNormalMaterial attach="material" />
        </mesh>
    );
}
