import * as HTTP from "http";
import {BufferHelper} from "../buffer-helper";

const BLOCK_SIZE = 16;

const baseUrl = 'http://crypto-class.appspot.com/po?er=';
const c = Buffer.from('f20bdba6ff29eed7b046d1df9fb7000058b1ffb4210a580f748b4ac714c001bd4a61044426fb515dad3f21f18aa577c0bdf302936266926ff37dbf7035d5eeb4', 'hex');

console.assert((c.length % BLOCK_SIZE) === 0, 'invalid cipertext');
const blockCount = c.length / BLOCK_SIZE;

enum MessageStatus {InvalidPad, MalformedMessage, ValidMessage}

function checkMessageStatus(c: Buffer): Promise<MessageStatus> {
  return new Promise((resolve) => {
    // console.log(`${c.toString('hex')}`);
    HTTP.get(`${baseUrl}${c.toString('hex')}`, (resp) => {
      switch (resp.statusCode) {
        case 403:
          resolve(MessageStatus.InvalidPad);
          break;
        case 404:
          // console.log('malformed message');
          resolve(MessageStatus.MalformedMessage);
          break;
        case 200:
          // console.log('valid message')
          resolve(MessageStatus.ValidMessage);
          break;
        default:
          throw 'unknown response: ' + resp.statusCode;
      }
    });
  });
}

// Unit test
checkMessageStatus(c)
  .then((status: MessageStatus) => {
    console.assert(status === MessageStatus.ValidMessage, 'Incorrect status for known correct ciphertext');
  })
  .catch(() => {
    console.error('error getting status');
  });

function makeGuesses(iv: Buffer, c: Buffer, p: Buffer, idx: number, guess?: number): Promise<MessageStatus> {
  if (!guess) {
    guess = 0x0;
  } else if (guess > 0xff) {
    throw `guess is invalid: ${guess}`;
  } else if (guess === 0x1 && idx === 15) {
    guess++;
  }

  console.log(`${idx}:${guess}`);

  p[idx] = guess;
  let testIv = BufferHelper.xor(iv, p);

  // console.log(p.toString('hex')); // p

  // Added padding
  for (let padPosition = idx; padPosition < BLOCK_SIZE; padPosition++) {
    testIv[padPosition] ^= (BLOCK_SIZE - idx);
  }

  // console.log(BufferHelper.xor(p, BufferHelper.xor(testIv, iv)).toString('hex')); // pad
  // console.log(BufferHelper.xor(testIv, iv).toString('hex')); // p ^ pad

  return checkMessageStatus(Buffer.concat([testIv, c], 32))
    .then((status: MessageStatus) => {
      if (status === MessageStatus.InvalidPad) {
        return makeGuesses(iv, c, p, idx, guess + 1);
      }
    });
}

let plaintext: string = '';
let blockIdx = blockCount - 1;
let pBlockPromises: Array<Promise<string>> = [];

while (blockIdx > 0) {
  let result = Buffer.alloc(BLOCK_SIZE);
  let iv = c.slice((blockIdx - 1) * BLOCK_SIZE, blockIdx * BLOCK_SIZE);
  let cWork = c.slice(blockIdx * BLOCK_SIZE, (blockIdx + 1) * BLOCK_SIZE);
  let guessPositionValues = Promise.resolve();

  // console.log(Buffer.concat([iv, cWork], 32).toString('hex'));
  for (let position = BLOCK_SIZE - 1; position >= 0; position--) {
    guessPositionValues = guessPositionValues.then(() => {
      return makeGuesses(iv, cWork, result, position);
    });
  }

  pBlockPromises[blockIdx] = guessPositionValues
    .then<string>(() => {
      console.log(`${blockIdx}: ${result.toString('utf8')}`);
      return result.toString('utf8');
    });
  blockIdx--
}

Promise.all<string>(pBlockPromises)
  .then((pBlocks: Array<string>) => {
    console.log(pBlocks.join(''));
  });
