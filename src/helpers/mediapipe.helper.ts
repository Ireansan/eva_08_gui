import { Vector3 } from "three";
import { Size } from "@react-three/fiber";

export function normalizeToWorld(vector: Vector3, viewport: Size): Vector3 {
    const _vector = new Vector3();
    _vector.x = (vector.x - 1 / 2) * viewport.width;
    _vector.y = (vector.y - 1 / 2) * viewport.height;
    _vector.z = vector.z * viewport.width;
    _vector.multiplyScalar(-1); // mirroring

    return _vector;
}
