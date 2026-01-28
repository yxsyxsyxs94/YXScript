import { Chunk, OpCode } from "./chunk";

export class VM {
    static ip: number = 0;
    static stack: Float64Array = new Float64Array(256);
    static stackTop: number = 0;
    static initialize(): void {
        this.ip = 0;
        this.stackTop = 0;
        this.stack.fill(0);
    }
    static run(chunk: Chunk): void {
        this.ip = 0;
        for (; ;) {
            const instruction = chunk.code[this.ip++];
            switch (instruction) {
                case OpCode.OP_CONSTANT: {
                    const constantIndex = chunk.code[this.ip++];
                    const constant = chunk.constants[constantIndex];
                    this.push(constant);
                    break;
                }
                case OpCode.OP_ADD: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a + b);
                    break;
                }
                case OpCode.OP_SUBTRACT: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a - b);
                    break;
                }
                case OpCode.OP_MULTIPLY: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a * b);
                    break;
                }
                case OpCode.OP_DIVIDE: {
                    const b = this.pop();
                    const a = this.pop();
                    this.push(a / b);
                    break;
                }
                case OpCode.OP_RETURN: {
                    console.log(this.pop());
                    return;
                }
            }
        }
    }

    private static push(value: number): void {
        this.stack[this.stackTop] = value;
        this.stackTop++;
    }

    private static pop(): number {
        this.stackTop--;
        return this.stack[this.stackTop];
    }
}