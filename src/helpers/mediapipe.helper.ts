import { Vector3 } from "three";
import { Size } from "@react-three/fiber";
import * as HANDS from "@mediapipe/hands";

export class MediapipeHelper {
    results: HANDS.Results;
    viewport: Size;

    handLandmarks: HANDS.NormalizedLandmarkListList;
    handWorldLandmarks: HANDS.NormalizedLandmarkListList;

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
    searchIndex(label: string | undefined): number | undefined{
        if (label === undefined) {
            return 0;
        }
        else {
            this.label = label;
        }

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
    checkLength(label?: string | undefined): boolean {
        const index: number = this.searchIndex(label)!;

        if (
            this.handLandmarks.length > 0 &&
            this.handLandmarks[index].length > 8
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
            (this.handLandmarks[i][j].y - 1 / 2) * -this.viewport.height,
            -this.handLandmarks[i][j].z * this.viewport.width
        );

        return vector;
    }

    /**
     * vector a to b
     * @param a
     * @param b
     */
    toDirection(a: number[], b: number[]): Vector3 {
        const pa: Vector3 = this.toVector3(a[0], a[1]);
        const pb: Vector3 = this.toVector3(b[0], b[1]);

        return pb.sub(pa);
    }

    // --------------------------------------------------
    /**
     * calculate angle between planes
     * @param labels
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
            // p1 -> p0
            const v10: Vector3 = this.toDirection(
                [this.searchIndex(labels[1])!, indexes[1]],
                [this.searchIndex(labels[0])!, indexes[0]]
            );
            // p1 -> p2
            const v12: Vector3 = this.toDirection(
                [this.searchIndex(labels[1])!, indexes[1]],
                [this.searchIndex(labels[2])!, indexes[2]]
            );
            const n0: Vector3 = new Vector3().crossVectors(v10, v12); // v10 x v12

            // p4 -> p3
            const v43: Vector3 = this.toDirection(
                [this.searchIndex(labels[4])!, indexes[4]],
                [this.searchIndex(labels[3])!, indexes[3]]
            );
            // p4 -> p5
            const v45: Vector3 = this.toDirection(
                [this.searchIndex(labels[4])!, indexes[4]],
                [this.searchIndex(labels[5])!, indexes[5]]
            );
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

    /**
     * calculate angle
     * @param labels
     * @param indexes
     */
    /*
     * p0 -> p1
     * p2 -> p3
     */
    angleVector(labels: string[], indexes: number[]): number | undefined {
        const checkUndefined = (i: string) => this.searchIndex(i) !== undefined;

        if (
            labels.length === 4 &&
            indexes.length === 4 &&
            labels.every(checkUndefined)
        ) {
            const v01: Vector3 = this.toDirection(
                [this.searchIndex(labels[0])!, indexes[0]],
                [this.searchIndex(labels[1])!, indexes[1]]
            );

            const v23: Vector3 = this.toDirection(
                [this.searchIndex(labels[2])!, indexes[2]],
                [this.searchIndex(labels[3])!, indexes[3]]
            );

            return v01.angleTo(v23);
        }
    }
}
