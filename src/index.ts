import * as readline from "readline";
import { Scanner } from "./scanner";
import { Token, TokenType } from "./token";
import { Compiler } from "./compiler";
import { Chunk, initChunk } from "./chunk";
import { VM } from "./vm";

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
        if (input.toLowerCase() === "exit") {
            break;
        }
        const chunk: Chunk = initChunk();
        Compiler.compile(input, chunk);
        VM.initialize();
        VM.run(chunk);
    }
    rl.close();
}

main();