import * as crypto from 'crypto';

const SIGN_SECRET_1 = '8s9OIOjw8§9OPcFSoDOCQ0dfspOK$MFA';

export default async function () {
  const content = await fetch(
    'https://github.com/icomsdetectionsorganization/low_js_esp32/releases/download/v0.0.1/data_esp32_pro.bin'
  )
    .then((res) => res.arrayBuffer())
    .then((buf) => Buffer.from(buf));

  const data = Buffer.alloc(0x80 + 0x1f0000 + content.length);
  crypto.randomFillSync(data); // to not get a esptool timeout

  const file = await fetch(
    'https://github.com/icomsdetectionsorganization/low_js_esp32/releases/download/v0.0.1/neonious_one.bin'
  )
    .then((res) => res.arrayBuffer())
    .then((buf) => Buffer.from(buf));
  if (file.length == 0 || file.length > 0x1f0000 - 32)
    throw new Error('app too large');
  file.copy(data, 0x80);
  content.copy(data, 0x80 + 0x1f0000);

  data.write('lwjs', 0);
  data.writeUInt8(8, 8);

  const mac = '8D54A42C937B';
  const macBinary = Buffer.alloc(6);
  macBinary.writeUInt8(parseInt(mac.substr(0, 2), 16), 0);
  macBinary.writeUInt8(parseInt(mac.substr(2, 2), 16), 1);
  macBinary.writeUInt8(parseInt(mac.substr(4, 2), 16), 2);
  macBinary.writeUInt8(parseInt(mac.substr(6, 2), 16), 3);
  macBinary.writeUInt8(parseInt(mac.substr(8, 2), 16), 4);
  macBinary.writeUInt8(parseInt(mac.substr(10, 2), 16), 5);
  const hash = crypto
    .createHash('sha1')
    .update(
      Buffer.concat([
        data.slice(0x80, 0x80 + 0x1f0000 - 32),
        Buffer.from(macBinary),
        Buffer.from(SIGN_SECRET_1),
      ])
    )
    .digest();
  hash.copy(data, 0x80 + 0x1f0000 - 20);

  return data;
}
