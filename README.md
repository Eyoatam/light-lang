# Light Programming Language

> Light is a programming language that compiles to JavaScript.

I made this compiler because I wanted to learn more about compilers. it is largely an experiment meant for learning.
**It is not intended for real use.**

## Example

```ts
var x: string = "Hello";
let y: number = 1;

function main(a: string) {
  return a;
}
```

## Setup

```sh
git clone https://github.com/Eyoatam/light-lang.git
# open with vscode
code light-lang/

# Run the Compiler
deno run --allow-read --allow-write src/main.ts
```

## Inspirations

- [mini-typescript](https://github.com/sandersn/mini-typescript)

## License

[MIT](https://github.com/Eyoatam/light-lang/blob/main/LICENSE)
