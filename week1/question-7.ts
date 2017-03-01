import {BufferHelper} from "../buffer-helper";

let message = "attack at dawn";
let cipher = "09e1c5f70a65ac519458e7e53f36";
let newMessage = 'attack at dusk';

let messageBuffer = Buffer.from(message, 'utf8');
let cipherBuffer = Buffer.from(cipher, 'hex');

let key = BufferHelper.xor(messageBuffer, cipherBuffer);

let newMessageBuffer = Buffer.from(newMessage, 'utf8');
let newCipherBuffer = BufferHelper.xor(key, newMessageBuffer);

console.log(newCipherBuffer.toString('hex'));

console.assert(
  cipherBuffer.slice(0, 11).compare(newCipherBuffer.slice(0, 11)) === 0, 'First 11 bytes should match'
);