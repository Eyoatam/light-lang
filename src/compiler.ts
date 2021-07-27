import { Error, Module } from "./ast.ts";
import { errors } from "./error.ts";
import { lex } from "./lexer.ts";
import { parse } from "./parser.ts";
import { bind } from "./bind.ts";
import { check } from "./checker.ts";
import { transform } from "./printer.ts";
import { emit } from "./printer.ts";

export function compile(input: string): [Module, Error[], string] {
  errors.clear();
  const tokens = lex(input);
  const tree = parse(tokens);
  bind(tree);
  check(tree);
  const js = emit(transform(tree.statements));
  return [tree, Array.from(errors.values()), js];
}
