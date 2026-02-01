import { grow } from "./utils";

export interface Chunk {
    code: Uint8Array;
    constants: Float64Array;
    capacity: number;
    codeTop: number;
    constantsTop: number;
}

export function initChunk(capacity: number = 8): Chunk {
    return {
        capacity: capacity,
        codeTop: 0,
        code: new Uint8Array(capacity),
        constantsTop: 0,
        constants: new Float64Array(capacity)
    };
}

export function writeConstant(chunk: Chunk, value: number): number {
    const curIndex = chunk.constantsTop;
    if (curIndex >= chunk.constants.length) {
        const newConstants = grow(chunk.constants);
        chunk.constants = newConstants;
    }
    chunk.constants[curIndex] = value;
    chunk.constantsTop++;
    return curIndex;
}

export function writeChunk(chunk: Chunk, byte: number): void {
    if (chunk.codeTop >= chunk.code.length) {
        const newCode = grow(chunk.code);
        chunk.code = newCode;
    }
    chunk.code[chunk.codeTop] = byte;
    chunk.codeTop++;
}


export enum OpCode {
    OP_CONSTANT = 1,
    OP_ADD,
    OP_SUBTRACT,
    OP_MULTIPLY,
    OP_DIVIDE,
    OP_NEGATE,
    OP_RETURN
}