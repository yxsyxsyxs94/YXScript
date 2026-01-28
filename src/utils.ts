export type TypedArray =
    | Int8Array | Uint8Array | Uint8ClampedArray
    | Int16Array | Uint16Array
    | Int32Array | Uint32Array
    | Float32Array | Float64Array;

export function grow<T extends TypedArray>(array: T): T {
    const newLength = array.length * 2;
    const constructor = array.constructor as new (length: number) => T;
    const result = new constructor(newLength);
    result.set(array);
    return result;
}