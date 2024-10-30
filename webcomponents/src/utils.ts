/** */
import {HoloHashB64} from "@holochain/client";

export interface HoloHashedB64<T> {
  hash: HoloHashB64;
  content: T;
}


export function str2obj(input: string): { [key: string]: null } {
  const obj: { [key: string]: null } = {};
  obj[input] = null;
  return obj;
}

// export function areArraysEqual(first: Uint8Array, second: Uint8Array) {
//   return first.length === second.length && first.every((value, index) => value === second[index])
// }
//
// export function areCellsEqual(cellA: CellId, cellB: CellId) {
//   return areArraysEqual(cellA[0], cellB[0]) && areArraysEqual(cellA[1], cellB[1])
// }


/** Better way to catch and handle "throttled" error */
export function catchThrottled<T>(promise: Promise<T>): Promise<[undefined, T] | [Error]> {
  return promise
    .then(data => [undefined, data] as [undefined, T])
    .catch(error => {
      if (error.throttled) {
        return [error];
      }
      throw error;
    })
}


/**
 *
 * @param key
 * @param value
 */
export function mapReplacer(key:any, value:any) {
  if(value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()),
    };
  } else {
    return value;
  }
}

export function mapReviver(key:any, value:any) {
  if(typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}
