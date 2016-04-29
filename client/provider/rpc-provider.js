
import rlp from 'rlp';

const version = 0x010000;
const separator = '/';

export default class RpcProvider {

  constructor (web3Utils, web3Formatters) {
    this._web3Utils = web3Utils;
    this._web3Formatters = web3Formatters;
  }

  formatResult (result, formatterName) {
    if (!formatterName) {
      return typeof result === 'object' ? result : String(result);
    }

    let formatter;

    // mostly we use web3Formatters (the last "else" case)
    // otherwise we use our own, or web3Utils
    if (formatterName === 'decodeExtraData') {
      formatter = ::this.decode;
    } else if (formatterName.indexOf('utils.') > -1) {
      formatter = this._web3Utils[formatterName.split('.')[1]];
    } else {
      formatter = this._web3Formatters[formatterName];
    }
    try {
      return `${formatter(result)}`;
    } catch (err) {
      const msg = `error using ${formatterName} on ${result}: ${err}`;
      console.error(msg);
      return new Error(msg);
    }
  }

  formatParams (params, inputFormatters) {
    if (!inputFormatters || !inputFormatters.length) {
      return params;
    }

    return params.map((param, i) => {
      let formatterName = inputFormatters[i];
      if (!formatterName) {
        return param;
      }

      let formatter;

      // mostly we use web3Formatters (the last "else" case)
      // otherwise we use our own, or web3Utils
      if (formatterName === 'encodeExtraData') {
        formatter = ::this.encode;
      } else if (formatterName.indexOf('utils.') > -1) {
        formatter = this._web3Utils[formatterName.split('.')[1]];
      } else {
        formatter = this._web3Formatters[formatterName];
      }

      try {
        return `${formatter(param)}`;
      } catch (err) {
        const msg = `error using ${formatterName} on ${param}: ${err}`;
        console.error(msg);
        return new Error(msg);
      }
    });
  }

  encode (str) {
    try {
      return `0x${rlp.encode([version].concat(str.split(separator))).toString('hex')}`;
    } catch (err) {
      console.error('error in encoding string: ', str, err);
      return '0xc5830100002d'; // encoding of '-'
    }
  }

  decode (str) {
    try {
      return rlp.decode(str).slice(1).join(separator);
    } catch (err) {
      console.error('error in decoding string: ', str, err);
      return '-';
    }
  }
}
