import React from "react";

export function Box({ ...props }) {
    return (
        <mesh {...props}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={"orange"} />
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
