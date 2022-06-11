import { Vector3 } from "three";
import { Size } from "@react-three/fiber";
import * as HANDS from "@mediapipe/hands";

export class MediapipeHelper {
    results: HANDS.Results;
    viewport: Size;

    handLandmarks: HANDS.NormalizedLandmarkListList;
    handWorldLandmarks: HANDS.NormalizedLandmarkListList;

    mirroring: boolean = true;
    label: string = "Right";
    index: number = 0;

    /**
     *
     * @param results
     * @param viewport
     */
    constructor(results: HANDS.Results, viewport: Size) {
        this.results = results;
        this.viewport = viewport;

        this.handLandmarks = this.results.multiHandLandmarks;
        this.handWorldLandmarks = this.results.multiHandWorldLandmarks;
    }

    // --------------------------------------------------
    /**
     * search index by label
     * @param label
     */
    searchIndex(label: string = this.label): number | undefined {
        if (this.handLandmarks !== undefined) {
            for (
                let index: number = 0;
                index < this.handLandmarks.length;
                index++
            ) {
                if (this.results.multiHandedness[index].label === label) {
                    return index;
                }
            }
        }
    }

    // --------------------------------------------------
    /**
     * check length of Landmarks
     */
    checkLength(): boolean {
        if (
            this.handLandmarks.length > 0 &&
            this.handLandmarks[this.index].length > 8
        ) {
            return true;
        }

        return false;
    }

    // --------------------------------------------------
    /**
     * convert Landmarks to Vector3
     * @param i
     */
    toVector3(i: number, j: number, world: boolean = true): Vector3 {
        if (world) {
            return new Vector3(
                this.handWorldLandmarks[i][j].x,
                this.handWorldLandmarks[i][j].y,
                this.handWorldLandmarks[i][j].z
            );
        }

        return new Vector3(
            this.handLandmarks[i][j].x,
            this.handLandmarks[i][j].y,
            this.handLandmarks[i][j].z
        );
    }

    /**
     * convert Landmarks to 3D coordinate
     * @param i
     * @param j
     */
    toThree(i: number, j: number): Vector3 {
        const vector = new Vector3(
            (this.handLandmarks[i][j].x - 1 / 2) * this.viewport.width,
            (this.handLandmarks[i][j].y - 1 / 2) * this.viewport.height,
            this.handLandmarks[i][j].z * this.viewport.width
        );

        if (this.mirroring) {
            vector.multiplyScalar(-1);
        }

        return vector;
    }

    // --------------------------------------------------
    /**
     * calculate angle between planes
     * @param array
     */
    /*
     * Right Hand
     * _p0 --- _p1      _p3 --- _p4
     *  |  \    |        |  \    |
     *  |   \   |        |   \   |
     *  |    \  |        |    \  |
     *  L  --- _p2       L  --- _p5
     */
    anglePlanes(labels: string[], indexes: number[]): number | undefined {
        const checkUndefined = (i: string) => this.searchIndex(i) !== undefined;

        if (
            labels.length === 6 &&
            indexes.length === 6 &&
            labels.every(checkUndefined)
        ) {
            const p0: Vector3 = this.toVector3(
                this.searchIndex(labels[0])!,
                indexes[0]
            );
            const p1: Vector3 = this.toVector3(
                this.searchIndex(labels[1])!,
                indexes[1]
            );
            const p2: Vector3 = this.toVector3(
                this.searchIndex(labels[2])!,
                indexes[2]
            );
            const v10: Vector3 = p0.sub(p1); // p1 -> p0
            const v12: Vector3 = p2.sub(p1); // p1 -> p2
            const n0: Vector3 = new Vector3().crossVectors(v10, v12); // v10 x v12

            const p3: Vector3 = this.toVector3(
                this.searchIndex(labels[3])!,
                indexes[3]
            );
            const p4: Vector3 = this.toVector3(
                this.searchIndex(labels[4])!,
                indexes[4]
            );
            const p5: Vector3 = this.toVector3(
                this.searchIndex(labels[5])!,
                indexes[5]
            );
            const v43: Vector3 = p3.sub(p4); // p4 -> p3
            const v45: Vector3 = p5.sub(p4); // p4 -> p5
            const n1: Vector3 = new Vector3().crossVectors(v43, v45); // v43 x v45

            return n0.angleTo(n1);
        }
    }

    /**
     * calculate angle
     * @param array
     */
    /*
     *  Right Hand
     * _p0 --- _p1      _p0 --- _p1      _p5 ---  +
     *  |  \    |        |  \    |        |  \    |
     *  |   \   |   ==   |   \   |        |   \   |
     *  |    \  |        |    \  |        |    \  |
     * _p3 --- _p2       L  --- _p2      _p4 --- _p3
     */
    angleHinge(array: number[]): number | undefined {
        if (array.length === 4) {
            const labels: string[] = new Array(6).fill(this.label);
            const indexes: number[] = [
                array[0],
                array[1],
                array[2],
                array[2],
                array[3],
                array[0],
            ];

            return this.anglePlanes(labels, indexes);
        }
    }
}
