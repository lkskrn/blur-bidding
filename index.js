import { fork } from "child_process";
import fs from "fs";
import readline from "readline";

const controller = new AbortController();
const { signal } = controller;

console.log("Running main.js");

async function readFile() {
  const fileStream = fs.createReadStream("private_keys.txt");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const child = fork("child.js", [line], { signal });
    child.on("done", function () {
      console.log(">>> CHILD DONE <<<");
      controller.abort();
    });
    child.on("error", (err) => {
      console.log(err);
      controller.abort();
    });
  }
}

readFile();
