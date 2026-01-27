import { Token, TokenType } from "./token"
export class Scanner {
    private source: string = '';
    private lines: number = 1;
    private start: number = 0;
    private current: number = 0;

    constructor(input: string) {
        this.source = input;
    }


    private advance(): string {
        this.current++;
        return this.source.charAt(this.current - 1);
    }
    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    private isAlpha(c: string): boolean {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
    }

    private skipWhitespace(): void {
        for (; ;) {
            const c = this.peek();
            switch (c) {
                case ' ':
                case '\r':
                case '\t':
                    this.advance();
                    break;
                case '\n':
                    this.advance();
                    this.lines++;
                    break;
                default:
                    return;
            }
        }
    }
    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }

    private peekNext(): string {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source.charAt(this.current + 1);
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    private number(): Token {
        for (; ;) {
            const c = this.peek();
            const c_next = this.peekNext();
            if (this.isDigit(c)) {
                this.advance();
            }
            else if (c === '.' && this.isDigit(c_next)) {
                this.advance();
                this.advance();
                while (this.isDigit(this.peek())) {
                    this.advance();
                }
                break;
            }
            else {
                break;
            }
        }
        return this.makeToken(TokenType.NUMBER);
    }

    private identifier(): Token {
        while (this.isAlpha(this.peek()) || this.isDigit(this.peek())) {
            this.advance();
        }
        return this.makeToken(TokenType.IDENTIFIER);
    }

    scanToken(): Token | undefined {
        //首先跳过空白字符
        this.skipWhitespace();
        //然后设置起始位置
        this.start = this.current;
        if (this.isAtEnd()) {
            return undefined
        }
        const c = this.advance();
        if (this.isDigit(c)) {
            return this.number();
        }
        if (this.isAlpha(c)) {
            return this.identifier();
        }
        switch (c) {
            case '(': return this.makeToken(TokenType.LEFT_PAREN);
            case ')': return this.makeToken(TokenType.RIGHT_PAREN);
            case '{': return this.makeToken(TokenType.LEFT_BRACE);
            case '}': return this.makeToken(TokenType.RIGHT_BRACE);
            case ',': return this.makeToken(TokenType.COMMA);
            case '.': return this.makeToken(TokenType.DOT);
            case '-': return this.makeToken(TokenType.MINUS);
            case '+': return this.makeToken(TokenType.PLUS);
            case ';': return this.makeToken(TokenType.SEMICOLON);
            case '*': return this.makeToken(TokenType.STAR);
            case "/": return this.makeToken(TokenType.SLASH);
        }
    }

    private makeToken(type: TokenType): Token {
        const text = this.source.substring(this.start, this.current);
        return {
            type: type,
            lexeme: text,
            literal: null,
            line: this.lines
        };
    }
}