(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('big.js')) :
  typeof define === 'function' && define.amd ? define(['big.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.regression = factory(global.Big));
})(this, (function (Big) { 'use strict';

  const DEFAULT_OPTIONS = {
    precision: 2,
    precisionBig: 20,
    //default for Big.DP https://mikemcl.github.io/big.js/#dp
    predictPoints: false,
    bigRoundingMode: 1
  };
  function round(number, precision) {
    const factor = 10 ** precision;
    return Math.round(number * factor) / factor;
  }
  function roundBig(number, precision, roundingMode) {
    return number.round(precision, Big.roundHalfUp);
  }
  function _linear(data, options) {
    const sum = [0, 0, 0, 0, 0];
    let len = 0;
    for (let n = 0; n < data.length; n++) {
      if (data[n][1] !== null) {
        len++;
        sum[0] += data[n][0];
        sum[1] += data[n][1];
        sum[2] += data[n][0] * data[n][0];
        sum[3] += data[n][0] * data[n][1];
        sum[4] += data[n][1] * data[n][1];
      }
    }
    const run = len * sum[2] - sum[0] * sum[0];
    const rise = len * sum[3] - sum[0] * sum[1];
    const gradient = run === 0 ? 0 : round(rise / run, options.precision);
    const intercept = round(sum[1] / len - gradient * sum[0] / len, options.precision);
    const predict = (x) => [
      round(x, options.precision),
      round(gradient * x + intercept, options.precision)
    ];
    return {
      points: options.predictPoints ? data.map((point) => predict(point[0])) : [],
      predict,
      equation: [gradient, intercept],
      string: intercept === 0 ? `y = ${gradient}x` : `y = ${gradient}x + ${intercept}`
    };
  }
  function _linearBig(data, options) {
    const sum = [Big(0), Big(0), Big(0), Big(0), Big(0)];
    let len = Big(0);
    for (let n = 0; n < data.length; n++) {
      if (data[n][1] !== null) {
        len = len.add(1);
        sum[0] = sum[0].add(data[n][0]);
        sum[1] = sum[1].add(data[n][1]);
        sum[2] = sum[2].add(data[n][0].mul(data[n][0]));
        sum[3] = sum[3].add(data[n][0].mul(data[n][1]));
        sum[4] = sum[4].add(data[n][1].mul(data[n][1]));
      }
    }
    const run = len.mul(sum[2]).minus(sum[0].mul(sum[0]));
    const rise = len.mul(sum[3]).minus(sum[0].mul(sum[1]));
    const zero = Big(0);
    const gradient = run.cmp(zero) === 0 ? zero : roundBig(rise.div(run), options.precisionBig, options.bigRoundingMode);
    const intercept = roundBig(sum[1].div(len).sub(gradient.mul(sum[0]).div(len)), options.precisionBig, options.bigRoundingMode);
    const predict = (x) => [
      roundBig(x, options.precisionBig, options.bigRoundingMode),
      roundBig(gradient.mul(x).add(intercept), options.precisionBig, options.bigRoundingMode)
    ];
    return {
      points: options.predictPoints ? data.map((point) => predict(point[0])) : [],
      predict,
      equation: [gradient, intercept],
      string: intercept.cmp(zero) === 0 ? `y = ${gradient}x` : `y = ${gradient}x + ${intercept}`
    };
  }
  const regression = {
    linear: (data, options) => {
      return _linear(data, {
        ...DEFAULT_OPTIONS,
        ...options
      });
    },
    linearBig: (data, options) => {
      return _linearBig(data, {
        ...DEFAULT_OPTIONS,
        ...options
      });
    }
  };

  return regression;

}));
