import { default as Big } from 'big.js';
type DataPoint = number[];
type DataPointBig = Big[];
declare const DEFAULT_OPTIONS: {
    precision: number;
    precisionBig: number;
    predictPoints: boolean;
    bigRoundingMode: number;
};
declare const _default: {
    linear: (data: DataPoint[], options?: typeof DEFAULT_OPTIONS) => {
        points: number[][];
        predict: (x: number) => number[];
        equation: number[];
        string: string;
    };
    linearBig: (data: DataPointBig[], options?: typeof DEFAULT_OPTIONS) => {
        points: Big.Big[][];
        predict: (x: Big) => Big.Big[];
        equation: Big.Big[];
        string: string;
    };
};
export default _default;
