import { randomFillSync } from 'crypto';

export default async function (data0_0x1F0080: any) {
  /*
   * Outputs 0x1000 - 0x10000 and the last 128 bytes of the firmware
   */

  let data = Buffer.alloc(0x800000);
  randomFillSync(data); // to not get a esptool timeout

  const bootloader = await fetch(
    'https://github.com/icomsdetectionsorganization/low_js_esp32/releases/download/v0.0.1/bootloader.bin'
  )
    .then((res) => res.arrayBuffer())
    .then((buf) => Buffer.from(buf));
  if (bootloader.length == 0 || bootloader.length > 0x6800)
    throw new Error('bootloader too large');
  bootloader.copy(data, 0x1000);
  const partitions = await fetch(
    'https://github.com/icomsdetectionsorganization/low_js_esp32/releases/download/v0.0.1/partitions.bin'
  )
    .then((res) => res.arrayBuffer())
    .then((buf) => Buffer.from(buf));
  if (partitions.length == 0 || partitions.length > 0x1000)
    throw new Error('partition table too large');
  partitions.copy(data, 0x8000);
  const ota = await fetch(
    'https://github.com/icomsdetectionsorganization/low_js_esp32/releases/download/v0.0.1/ota_data_initial.bin'
  )
    .then((res) => res.arrayBuffer())
    .then((buf) => Buffer.from(buf));
  if (ota.length == 0 || ota.length > 0x2000) throw new Error('ota too large');
  ota.copy(data, 0xe000);

  data0_0x1F0080.copy(data, 0x10000, 0, 0x80);
  data0_0x1F0080.copy(data, 0x400000, 0x80 + 0x1f0000 - 128);

  return data;
}
