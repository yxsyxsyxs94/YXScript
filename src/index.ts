import * as readline from "readline";
import { Scanner } from "./scanner";
import { Token, TokenType } from "./token";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function getInput(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer);
        });
    });
}

async function main() {
    for (; ;) {
        const input = await getInput("> ");
        const scanner: Scanner = new Scanner(input);
        let token: Token | undefined;
        do {
            token = scanner.scanToken();
            console.log(token);
        } while (token && token.type !== TokenType.EOF);
        if (input.toLowerCase() === "exit") {
            break;
        }
    }
    rl.close();
}

main();