# light-lang

Light-lang is an experimental programming language that compiles to JavaScript.
I started this project because I wanted to learn more about compiler backends.
It was inspired by
[mini-typescript](https://github.com/sandersn/mini-typescript). and The syntax
is inspired by TypeScript.

> This is still an experiment and it is not intended for real use. The main
> limitation is the only types are `string` and `number`

## Example

```ts
var x: string = "Hello";
let y: number = 1;

function main(a: string) {
  return a;
}
```
