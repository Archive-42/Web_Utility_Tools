/*
 * js-crc v0.1.0
 * https://github.com/emn178/js-crc
 *
 * Copyright 2015, emn178@gmail.com
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
((root, undefined) => {
  "use strict";

  const NODE_JS = typeof module != "undefined";
  if (NODE_JS) {
    root = global;
  }
  const HEX_CHARS = "0123456789abcdef".split("");

  const Modules = [
    {
      name: "crc32",
      polynom: 0xedb88320,
      initValue: -1,
      bytes: 4,
    },
    {
      name: "crc16",
      polynom: 0xa001,
      initValue: 0,
      bytes: 2,
    },
  ];

  let i;
  let j;
  let k;
  let b;
  for (i = 0; i < Modules.length; ++i) {
    var m = Modules[i];
    m.method = (m => {
      return message => {
        return crc(message, m);
      };
    })(m);
    m.table = [];
    for (j = 0; j < 256; ++j) {
      b = j;
      for (k = 0; k < 8; ++k) {
        b = b & 1 ? m.polynom ^ (b >>> 1) : b >>> 1;
      }
      m.table[j] = b >>> 0;
    }
  }

  var crc = (message, module) => {
    const notString = typeof message != "string";
    if (notString && message.constructor == ArrayBuffer) {
      message = new Uint8Array(message);
    }

    let crc = module.initValue;
    let code;
    let i;
    const length = message.length;
    const table = module.table;
    if (notString) {
      for (i = 0; i < length; ++i) {
        crc = table[(crc ^ message[i]) & 0xff] ^ (crc >>> 8);
      }
    } else {
      for (i = 0; i < length; ++i) {
        code = message.charCodeAt(i);
        if (code < 0x80) {
          crc = table[(crc ^ code) & 0xff] ^ (crc >>> 8);
        } else if (code < 0x800) {
          crc = table[(crc ^ (0xc0 | (code >> 6))) & 0xff] ^ (crc >>> 8);
          crc = table[(crc ^ (0x80 | (code & 0x3f))) & 0xff] ^ (crc >>> 8);
        } else if (code < 0xd800 || code >= 0xe000) {
          crc = table[(crc ^ (0xe0 | (code >> 12))) & 0xff] ^ (crc >>> 8);
          crc =
            table[(crc ^ (0x80 | ((code >> 6) & 0x3f))) & 0xff] ^ (crc >>> 8);
          crc = table[(crc ^ (0x80 | (code & 0x3f))) & 0xff] ^ (crc >>> 8);
        } else {
          code =
            0x10000 +
            (((code & 0x3ff) << 10) | (message.charCodeAt(++i) & 0x3ff));
          crc = table[(crc ^ (0xf0 | (code >> 18))) & 0xff] ^ (crc >>> 8);
          crc =
            table[(crc ^ (0x80 | ((code >> 12) & 0x3f))) & 0xff] ^ (crc >>> 8);
          crc =
            table[(crc ^ (0x80 | ((code >> 6) & 0x3f))) & 0xff] ^ (crc >>> 8);
          crc = table[(crc ^ (0x80 | (code & 0x3f))) & 0xff] ^ (crc >>> 8);
        }
      }
    }
    crc ^= module.initValue;

    let hex = "";
    if (module.bytes > 2) {
      hex +=
        HEX_CHARS[(crc >> 28) & 0x0f] +
        HEX_CHARS[(crc >> 24) & 0x0f] +
        HEX_CHARS[(crc >> 20) & 0x0f] +
        HEX_CHARS[(crc >> 16) & 0x0f];
    }
    hex +=
      HEX_CHARS[(crc >> 12) & 0x0f] +
      HEX_CHARS[(crc >> 8) & 0x0f] +
      HEX_CHARS[(crc >> 4) & 0x0f] +
      HEX_CHARS[crc & 0x0f];
    return hex;
  };

  let exports;
  if (!root.HI_CRC32_TEST && NODE_JS) {
    exports = module.exports = {};
  } else if (root) {
    exports = root;
  }
  for (i = 0; i < Modules.length; ++i) {
    var m = Modules[i];
    exports[m.name] = m.method;
  }
})(this);
