import {BufferHelper} from "../buffer-helper";

let message = "attack at dawn";
let cipher = "09e1c5f70a65ac519458e7e53f36";
let newMessage = 'attack at dusk';

let messageBuffer = BufferHelper.toBuffer(message, 'utf8');
let cipherBuffer = BufferHelper.toBuffer(cipher, 'hex');

let key = BufferHelper.xor(messageBuffer, cipherBuffer);

let newMessageBuffer = BufferHelper.toBuffer(newMessage, 'utf8');
let newCipherBuffer = BufferHelper.xor(key, newMessageBuffer);

console.log(BufferHelper.toString(newCipherBuffer, 'hex'));

console.assert(BufferHelper.compare(cipherBuffer.slice(0, 11), newCipherBuffer.slice(0, 11)) === 0, 'First 11 bytes should match');