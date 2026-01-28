import { writeConstant, Chunk, OpCode, writeChunk } from "./chunk";
import { Scanner } from "./scanner";
import { Token, TokenType } from "./token";

export enum Precedence {
    NONE,
    ASSIGNMENT,
    OR,
    AND,
    EQUALITY,
    COMPARISON,
    TERM,
    FACTOR,
    UNARY,
    CALL,
    PRIMARY
}

export interface ParseRule {
    prefix?: () => void;
    infix?: () => void;
    precedence: Precedence;
}

// export enum TokenType {
//     // Single-character tokens.
//     LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
//     COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR,
//     // One or two character tokens.
//     BANG, BANG_EQUAL,
//     EQUAL, EQUAL_EQUAL,
//     GREATER, GREATER_EQUAL,
//     LESS, LESS_EQUAL,
//     // Literals.
//     IDENTIFIER, STRING, NUMBER,
//     // Keywords.
//     AND, CLASS, ELSE, FALSE, FUN, FOR, IF, NIL, OR,
//     PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE,
//     EOF
// }

export class Compiler {
    static curScanner: Scanner | undefined = undefined;
    static curChunk: Chunk | undefined = undefined;
    static previous: Token | undefined = undefined;
    static current: Token | undefined = undefined;
    static Rules: ParseRule[] = [
        { prefix: this.grouping.bind(this), infix: undefined, precedence: Precedence.NONE }, // LEFT_PAREN
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // RIGHT_PAREN
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // LEFT_BRACE
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // RIGHT_BRACE
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // COMMA
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // DOT
        { prefix: undefined, infix: this.binary.bind(this), precedence: Precedence.TERM }, // MINUS
        { prefix: undefined, infix: this.binary.bind(this), precedence: Precedence.TERM }, // PLUS
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // SEMICOLON
        { prefix: undefined, infix: this.binary.bind(this), precedence: Precedence.FACTOR }, // SLASH
        { prefix: undefined, infix: this.binary.bind(this), precedence: Precedence.FACTOR }, // STAR
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // BANG
        { prefix: undefined, infix: undefined, precedence: Precedence.EQUALITY }, // BANG_EQUAL
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // EQUAL
        { prefix: undefined, infix: undefined, precedence: Precedence.EQUALITY }, // EQUAL_EQUAL
        { prefix: undefined, infix: undefined, precedence: Precedence.COMPARISON }, // GREATER
        { prefix: undefined, infix: undefined, precedence: Precedence.COMPARISON }, // GREATER_EQUAL
        { prefix: undefined, infix: undefined, precedence: Precedence.COMPARISON }, // LESS
        { prefix: undefined, infix: undefined, precedence: Precedence.COMPARISON }, // LESS_EQUAL
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // IDENTIFIER
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // STRING
        { prefix: this.number.bind(this), infix: undefined, precedence: Precedence.NONE }, // NUMBER
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // AND
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // CLASS
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // ELSE
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // FALSE
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // FUN
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // FOR
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // IF
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // NIL
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // OR
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // PRINT
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // RETURN
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // SUPER
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // THIS
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // TRUE
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // VAR
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }, // WHILE
        { prefix: undefined, infix: undefined, precedence: Precedence.NONE }  // EOF
    ];

    static compile(source: string, chunk: Chunk): void {
        const scanner: Scanner = new Scanner(source);
        this.curScanner = scanner;
        this.curChunk = chunk;
        this.advance();
        this.expression();
        this.emitByte(OpCode.OP_RETURN);
    }

    private static parsePrecedence(precedence: Precedence): void {
        this.advance();
        const prefixRule = this.Rules[this.previous!.type].prefix;
        if (!prefixRule) {
            throw new Error("Expect expression.");
        }
        prefixRule();
        while (precedence <= this.Rules[this.current!.type].precedence) {
            this.advance();
            const infixRule = this.Rules[this.previous!.type].infix;
            infixRule!();
        }
    }

    private static expression(): void {
        this.parsePrecedence(Precedence.ASSIGNMENT);
    }

    private static advance(): void {
        this.previous = this.current;
        if (this.curScanner) {
            this.current = this.curScanner.scanToken();
        }
    }

    private static consume(type: number, message: string): void {
        if (this.current && this.current.type === type) {
            this.advance();
            return;
        }
        throw new Error(message);
    }

    private static errorAtCurrent(message: string): void {
        if (this.current) {
            throw new Error(`[line ${this.current.line}] Error at '${this.current.lexeme}': ${message}`);
        }
    }

    private static binary(): void {
        const operatorType = this.previous!.type;
        const rule = this.Rules[operatorType];
        this.parsePrecedence(rule.precedence + 1);
        switch (operatorType) {
            case TokenType.PLUS:
                this.emitByte(OpCode.OP_ADD);
                break;
            case TokenType.MINUS:
                this.emitByte(OpCode.OP_SUBTRACT);
            case TokenType.STAR:
                this.emitByte(OpCode.OP_MULTIPLY);
                break;
            case TokenType.SLASH:
                this.emitByte(OpCode.OP_DIVIDE);
                break;
        }
    }

    private static grouping(): void {
        this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
    }

    private static number(): void {
        const value = parseFloat(this.previous!.lexeme);
        this.emitConstant(value);
    }

    private static emitByte(byte: number): void {
        writeChunk(this.curChunk!, byte);
    }

    private static emitBytes(byte1: number, byte2: number): void {
        this.emitByte(byte1);
        this.emitByte(byte2);
    }

    private static emitConstant(value: number): void {
        const constantIndex = this.addConstant(value);
        this.emitBytes(OpCode.OP_CONSTANT, constantIndex!);
    }

    private static addConstant(value: number): number | undefined {
        const index = writeConstant(this.curChunk!, value);
        return index;
    }
}