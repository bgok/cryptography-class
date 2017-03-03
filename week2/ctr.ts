import * as Crypto from "crypto";
import {BufferHelper} from "../buffer-helper";
let AES = require('aes-js');

/**
 * DISCLAIMER
 *
 * This code should not be used for a production system. It was written as a learning experience and isn't reviewed or
 * vetted. It should be considered a vulnerable implementation. Use the node Crypto library for a secure implementation
 * of this algorithm.
 *
 */
const IV_LENGTH = 16;
const BLOCK_SIZE = 16;

export class CTR {
  private aes: any;

  constructor(key: Buffer) {
    this.aes = new AES.AES(key);
  }

  public encrypt(m: Buffer): Buffer {
    let cipherText: Buffer = new Buffer(IV_LENGTH + m.length);
    let iv = Crypto.randomBytes(IV_LENGTH);
    // let iv = Buffer.from('69dda8455c7dd4254bf353b773304eec', 'hex');

    iv.copy(cipherText, 0);
    let blockStart = 0;
    while (blockStart < m.length) {
      const blockLength = Math.min(m.length - blockStart, BLOCK_SIZE);
      const ct = BufferHelper.xor(this.aes.encrypt(iv), m.slice(blockStart, blockStart + blockLength));
      ct.copy(cipherText, blockStart + IV_LENGTH);
      blockStart += BLOCK_SIZE;
      BufferHelper.increment(iv);
    }
    return cipherText;
  }

  public decrypt(cipher: Buffer): Buffer {
    let message = new Buffer(cipher.length - IV_LENGTH);
    let iv = cipher.slice(0, IV_LENGTH);

    let blockStart = IV_LENGTH;
    while (blockStart < cipher.length) {
      const blockLength = Math.min(cipher.length - blockStart, BLOCK_SIZE);
      const block = cipher.slice(blockStart, blockStart + blockLength);
      const pt = BufferHelper.xor(this.aes.encrypt(iv), block);
      pt.copy(message, blockStart - IV_LENGTH);

      BufferHelper.increment(iv);
      blockStart += BLOCK_SIZE;
    }

    return message;
  }
}

let message = 'CTR mode lets you build a stream cipher from a block cipher.';
let key = Buffer.from('36f18357be4dbd77f050515c73fcf9f2', 'hex');
let ctr = new CTR(key);

console.assert(Buffer.from(ctr.decrypt(ctr.encrypt(new Buffer(message)))).toString('utf8') === message);
