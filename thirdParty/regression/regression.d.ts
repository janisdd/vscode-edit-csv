import { default as Big } from 'big.js';
type DataPoint = number[];
type DataPointBig = Big[];
type DEFAULT_OPTIONS_TYPE = {
    [key in keyof typeof DEFAULT_OPTIONS]?: typeof DEFAULT_OPTIONS[key];
};
declare const DEFAULT_OPTIONS: {
    precision: number;
    precisionBig: number;
    predictPoints: boolean;
    bigRoundingMode: number;
};
declare const _default: {
    linear: (data: DataPoint[], options?: DEFAULT_OPTIONS_TYPE) => {
        points: number[][];
        predict: (x: number) => number[];
        equation: number[];
        string: string;
    };
    linearBig: (data: DataPointBig[], options?: DEFAULT_OPTIONS_TYPE) => {
        points: Big.Big[][];
        predict: (x: Big) => Big.Big[];
        equation: Big.Big[];
        string: string;
    };
};
export default _default;
