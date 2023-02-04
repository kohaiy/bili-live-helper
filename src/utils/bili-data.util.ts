import pako from "pako";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const readInt = (buffer: Uint8Array, start: number, len: number): number => {
  let result = 0;
  for (let i = len - 1; i >= 0; i--) {
    result += Math.pow(256, len - i - 1) * buffer[start + i];
  }
  return result;
};

const writeInt = (
  buffer: number[],
  start: number,
  len: number,
  value: number
): void => {
  let i = 0;
  while (i < len) {
    buffer[start + i] = value / Math.pow(256, len - i - 1);
    i++;
  }
};

export const encode = (
  str: string | undefined,
  op: number
): ArrayBufferLike => {
  const data = textEncoder.encode(str);
  const packetLen = 16 + data.byteLength;
  const header = [0, 0, 0, 0, 0, 16, 0, 1, 0, 0, 0, op, 0, 0, 0, 1];
  writeInt(header, 0, 4, packetLen);
  return new Uint8Array(header.concat(...data)).buffer;
};

export interface BiliMsg {
  packetLen: number;
  headerLen: number;
  ver: number;
  op: number;
  seq: number;
  body: unknown;
}

export const decode = (blob: Blob): Promise<BiliMsg> => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      // @ts-ignore
      const buffer = new Uint8Array(e.target?.result);
      const result: BiliMsg = {
        packetLen: 0,
        headerLen: 0,
        ver: 0,
        op: 0,
        seq: 0,
        body: null
      };
      result.packetLen = readInt(buffer, 0, 4);
      result.headerLen = readInt(buffer, 4, 2);
      result.ver = readInt(buffer, 6, 2);
      result.op = readInt(buffer, 8, 4);
      result.seq = readInt(buffer, 12, 4);
      if (result.op === 5) {
        const body: unknown[] = [];
        let offset = 0;
        while (offset < buffer.length) {
          const packetLen = readInt(buffer, offset, 4);
          const headerLen = 16; //readInt(buffer,offset + 4,4)
          const data = buffer.slice(offset + headerLen, offset + packetLen);
          // console.log(data);

          /**
           * 仅有两处更改
           * 1. 引入pako做message解压处理，具体代码链接如下
           *    https://github.com/nodeca/pako/blob/master/dist/pako.js
           * 2. message文本中截断掉不需要的部分，避免JSON.parse时出现问题
           */
          let rawBody;
          try {
            rawBody = textDecoder.decode(pako.inflate(data));
          } catch (e) {
            // console.log(e);
          }
          if (rawBody) {
            // console.log('--------------');
            // console.log(body);
            // console.log('--------------');
            // 同一条 message 中可能存在多条信息，用正则筛出来
            // eslint-disable-next-line no-control-regex
            const group = rawBody.split(/[\x00-\x1f]+/);
            // console.log('--------------');
            // console.log(group);
            // console.log('--------------');
            // console.log(group);
            group.forEach(item => {
              try {
                if (item && item.includes("{")) body.push(JSON.parse(item));
              } catch (e) {
                // 忽略非 JSON 字符串，通常情况下为分隔符
              }
            });
          }
          offset += packetLen;
        }
        result.body = body;
      } else if (result.op === 3) {
        result.body = {
          count: readInt(buffer, 16, 4)
        };
      }
      resolve(result);
    };
    reader.readAsArrayBuffer(blob);
  });
};

export default {
  readInt,
  writeInt,
  encode,
  decode
};
