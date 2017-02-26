export class BufferHelper {
  public static toString(arr: Uint8Array, enc: 'utf8' | 'hex') {
    return Buffer.from(arr.buffer).toString(enc);
  }

  public static xor(a: Uint8Array, b: Uint8Array): Uint8Array {
    let resultLength = Math.min(a.length, b.length);
    let result = new Uint8Array(resultLength);
    let idx = 0;
    for (let idx = 0; idx < resultLength; idx++) {
      result[idx] = a[idx] ^ b[idx];
    }
    return result;
  }

  public static toBuffer(m: string, enc: 'utf8' | 'hex'): Uint8Array {
    return new Uint8Array(Buffer.from(m, enc));
  }

  public static compare(b1: Uint8Array, b2: Uint8Array): number {
    return Buffer.from(b1.buffer).compare(Buffer.from(b2.buffer));
  }
}

console.assert(
  BufferHelper.toString(
    BufferHelper.xor(
      BufferHelper.toBuffer('0088ff', 'hex'),
      BufferHelper.toBuffer('08F08f', 'hex')
    ), 'hex'
  ) === '087870'
);
