import {BufferHelper} from "../buffer-helper";


const IV = Buffer.from('20814804c1767293b99f1d9cab3bc3e7', 'hex');
const c = Buffer.from('ac1e37bfb15599e5f40eef805488281d', 'hex');
const p = Buffer.from('Pay Bob 100$\x04\x04\x04\x04');

const malP = Buffer.from('Pay Bob 500$\x04\x04\x04\x04');


console.log(`iv: ${IV.length}, p: ${p.length}`);
console.log(BufferHelper.xor(p, malP).toString('hex'));

const malIV = BufferHelper.xor(IV, BufferHelper.xor(p, malP));

console.log(`${malIV.toString('hex')} ${c.toString('hex')}`);