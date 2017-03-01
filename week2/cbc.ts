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

export class CBC {
  private aes: any;

  constructor(key: Buffer) {
    this.aes = new AES.AES(key);
  }

  public encrypt(m: Buffer): Buffer {
    let blockCount = Math.ceil(m.length / BLOCK_SIZE);
    let cipherText: Buffer = new Buffer(IV_LENGTH + (blockCount * BLOCK_SIZE));
    let iv = Crypto.randomBytes(IV_LENGTH);
    // let iv = Buffer.from('4ca00ff4c898d61e1edbf1800618fb28', 'hex');

    iv.copy(cipherText, 0);
    let blockStart = 0;
    while (blockStart < m.length) {
      let block: Buffer;
      const blockLength = Math.min(m.length - blockStart, BLOCK_SIZE);

      if (blockLength < 16) {
        block = new Buffer(BLOCK_SIZE);
        m.copy(block, 0, blockStart, blockStart + blockLength);
        block.fill(16 - blockLength, blockLength);
      } else {
        block = m.slice(blockStart, blockStart + blockLength);
      }

      let ctb = Buffer.from(this.aes.encrypt(BufferHelper.xor(block, iv)));
      ctb.copy(cipherText, blockStart + IV_LENGTH);

      blockStart += BLOCK_SIZE;
      iv = ctb;
    }

    return cipherText;
  }

  public decrypt(cipher: Buffer): Buffer {
    let message = new Buffer(cipher.length - IV_LENGTH);
    let iv = cipher.slice(0, IV_LENGTH);

    let blockStart = IV_LENGTH;
    while (blockStart < cipher.length) {
      let block = cipher.slice(blockStart, blockStart + BLOCK_SIZE);
      let pt = BufferHelper.xor(Buffer.from(this.aes.decrypt(block)), iv);
      pt.copy(message, blockStart - IV_LENGTH);

      iv = block;
      blockStart += BLOCK_SIZE;
    }

    return message.slice(0, message.length - message[message.length - 1]);
  }
}

let message = 'Basic CBC mode encryption needs padding.';
let key = Buffer.from('140b41b22a29beb4061bda66b6747e14', 'hex');
let cbc = new CBC(key);
console.assert(Buffer.from(cbc.decrypt(cbc.encrypt(new Buffer(message)))).toString('utf8') === message);

