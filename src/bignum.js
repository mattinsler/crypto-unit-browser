const BigInteger = require('jsbn').BigInteger;
const Buffer = require('buffer').Buffer;

function BigNum(str, base) {
  if (str && str._jsbn) {
    this._jsbn = str._jsbn;
  } else {
    if (typeof str === 'number') {
      str = str.toString();
    }
    this._jsbn = new BigInteger(str, base || 10);
  }
}

function fromJsbn(n) {
  const bi = new BigNum(0);
  bi._jsbn = n;
  bi.constructor = BigNum;
  return bi;
}

BigNum.prototype = {
  powm: function(a, b) {
    if (!a._jsbn) a = new BigNum(a);
    if (!b._jsbn) b = new BigNum(b);
    return fromJsbn(this._jsbn.modPow(a._jsbn, b._jsbn));
  },
  eq: function(a) {
    if (!a._jsbn) a = new BigNum(a);
    return this._jsbn.equals(a._jsbn);
  },
  cmp: function(a) {
    if (!a._jsbn) a = new BigNum(a);
    return this._jsbn.compareTo(a._jsbn);
  },
  gt: function(a) {
    return this.cmp(a) > 0;
  },
  ge: function(a) {
    return this.cmp(a) >= 0;
  },
  lt: function(a) {
    return this.cmp(a) < 0;
  },
  le: function(a) {
    return this.cmp(a) <= 0;
  },
  abs: function() {
    return fromJsbn(this._jsbn.abs());
  },
  neg: function() {
    return fromJsbn(this._jsbn.negate());
  },
  isbitset: function(i) {
    return this._jsbn.testBit(i)
  },
  bitLength: function() {
    return this._jsbn.bitLength();
  },
  toBuffer: function() {
    let hex = this._jsbn.toString(16);
    if (hex.length % 2) hex = '0' + hex;
    return new Buffer(hex, 'hex');
  },
  toString: function(base) {
    return this._jsbn.toString(base);
  },
  toNumber: function(){
    return parseInt(this._jsbn.toString());
  }
};

var binOps = {
  add: 'add',
  sub: 'subtract',
  mul: 'multiply',
  div: 'divide',
  mod: 'mod',
  invertm: 'modInverse',
  pow: 'pow',
  xor: 'xor',
  and: 'and',
  shiftLeft: 'shiftLeft',
  shiftRight: 'shiftRight'
};

Object.keys(binOps).forEach(function(op) {
  BigNum.prototype[op] = function (a) {
    if (!a._jsbn) a = new BigNum(a);
    return fromJsbn(this._jsbn[binOps[op]](a._jsbn));
  };
});

BigNum.fromBuffer = function(buffer) {
  return new BigNum(buffer.toString('hex'), 16);
};

BigNum.isBigNum = function(num) {
  if (!num) {
    return false;
  }
  for (let key in BigNum.prototype) {
    if (!num[key]) {
      return false;
    }
  }
  return true;
};

Object.keys(BigNum.prototype).forEach(function(name) {
  if (name === 'inspect' || name === 'toString') return;

  BigNum[name] = function (num) {
    var args = [].slice.call(arguments, 1);

    if (num._jsbn) {
      return num[name].apply(num, args);
    }
    else {
      const bigi = new BigNum(num);
      return bigi[name].apply(bigi, args);
    }
  };
});

module.exports = BigNum;
