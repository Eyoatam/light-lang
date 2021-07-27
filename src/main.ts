import { compile } from "./compiler.ts";
import {
  bold,
  brightRed,
  green,
  white,
} from "https://deno.land/std@0.102.0/fmt/colors.ts";

const args = Deno.args;
const boldWhite = (str: string) => console.log(bold(white(str)));

if (args.length < 1) {
  console.log(
    brightRed(bold("error: ")),
    "Expected a path to a file as the argument",
  );
  Deno.exit(1);
}

console.log(green("Looking at: " + white(args[0] + "\n")));
const code = Deno.readFileSync(args[0]);
const [_tree, errors, js] = compile(new TextDecoder().decode(code));

console.log(white(bold("> input:")));
console.log(new TextDecoder().decode(code));

if (errors.length) {
  boldWhite("> Errors:" + "\t\t");
  // errors.forEach((error) => errorClr(error));
  console.log(errors);
}

boldWhite("> Output:");
console.log(js);

// Print errors, write js to file
Deno.writeFileSync(args[0] + ".js", new TextEncoder().encode(js));
