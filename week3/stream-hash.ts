import * as fs from "fs";
import * as crypto from "crypto";

const blockLength = 1024;

function hashFile(fileName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, (err, data) => {
      if (err) {
        reject(err);
      }
      let prevHash: Buffer;

      for (let blockIdx = Math.ceil(data.length / blockLength); blockIdx > 0; blockIdx--) {
        const blockstart = (blockIdx - 1) * blockLength;
        const blockend = Math.min(blockstart + blockLength, data.length);
        const hash = crypto.createHash('sha256');

        hash.update(data.slice(blockstart, blockend));
        if (prevHash) {
          hash.update(prevHash);
        }

        prevHash = hash.digest();
      }

      resolve(prevHash);
    });
  })
}

const testFileName = '/Users/bgok/WebstormProjects/crypto-class/week3/6.2.birthday.mp4';
const knownHash = Buffer.from('03c08f4ee0b576fe319338139c045c89c3e8e9409633bea29442e21425006ea8', 'hex');

hashFile(testFileName)
  .then((hash: Buffer) => {
    console.assert(hash.compare(knownHash) === 0, 'hash does not match known hash');
  });

const assignmentFileName = '/Users/bgok/WebstormProjects/crypto-class/week3/6.1.intro.mp4';

hashFile(assignmentFileName)
  .then((hash: Buffer) => {
    console.log(hash.toString('hex'));
  });