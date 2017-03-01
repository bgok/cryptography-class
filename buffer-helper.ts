export class BufferHelper {
  public static xor(a: Buffer, b: Buffer): Buffer {
    let resultLength = Math.min(a.length, b.length);
    let result = new Buffer(resultLength);
    for (let idx = 0; idx < resultLength; idx++) {
      result[idx] = a[idx] ^ b[idx];
    }
    return result;
  }
}

console.assert(
  BufferHelper.xor(new Buffer('0088ff', 'hex'), new Buffer('08F08f', 'hex')).toString('hex') === '087870'
);
