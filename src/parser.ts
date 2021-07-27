import {
  Expression,
  Identifier,
  Lexer,
  Module,
  Node,
  Statement,
  Token,
} from "./ast.ts";
import { error } from "./error.ts";
import { lex } from "./lexer.ts";

export function parse(lexer: Lexer): Module {
  lexer.scan();
  return parseModule();

  function tryParseToken(expected: Token): boolean {
    const ok = lexer.token() === expected;
    if (ok) {
      lexer.scan();
    }
    return ok;
  }

  function parseIdentifierOrLiteral(): Expression {
    const pos = lexer.pos();

    if (tryParseToken(Token.Identifier)) {
      return { kind: Node.Identifier, text: lexer.text(), pos };
    } else if (tryParseToken(Token.StringLiteral)) {
      return { kind: Node.StringLiteral, text: lexer.text(), pos };
    } else if (tryParseToken(Token.NumberLiteral)) {
      return { kind: Node.NumberLiteral, value: +lexer.text(), pos };
    } else {
      error(
        pos,
        "Expected identifier or literal but got " + Token[lexer.token()],
      );

      lexer.scan();
      return { kind: Node.Identifier, pos };
    }
  }

  function parseIdentifier(): Identifier {
    const expression = parseIdentifierOrLiteral();
    if (expression.kind === Node.Identifier) {
      return expression;
    } else {
      error(expression.pos, "Expected identifier bot got a literal");
      return { kind: Node.Identifier, text: lexer.text(), pos: expression.pos };
    }
  }

  function parseExpected(expected: Token) {
    if (!tryParseToken(expected)) {
      error(
        lexer.pos(),
        `parseToken: Expected ${Token[expected]} but got ${
          Token[lexer.token()]
        }`,
      );
    }
  }

  function parseExpression(): Expression {
    const pos = lexer.pos();
    const expression = parseIdentifierOrLiteral();
    if (expression.kind === Node.Identifier && tryParseToken(Token.Equals)) {
      return {
        kind: Node.Assignment,
        name: expression,
        value: parseExpression(),
        pos,
      };
    }
    return expression;
  }

  function parseStatement(): Statement {
    const pos = lexer.pos();

    if (tryParseToken(Token.Var)) {
      const name = parseIdentifier();
      const typename = tryParseToken(Token.Colon)
        ? parseIdentifier()
        : undefined;
      parseExpected(Token.Equals);
      const init = parseExpression();
      return { kind: Node.Var, name, typename: typename!, init, pos };
    } else if (tryParseToken(Token.Let)) {
      const name = parseIdentifier();
      const typename = tryParseToken(Token.Colon)
        ? parseIdentifier()
        : undefined;
      parseExpected(Token.Equals);
      const init = parseExpression();
      return { kind: Node.Let, name, typename: typename!, init, pos };
    } else if (tryParseToken(Token.Type)) {
      const name = parseIdentifier();
      parseExpected(Token.Equals);
      const typename = parseIdentifier();
      return { kind: Node.TypeAlias, name, typename, pos };
    }
    return { kind: Node.ExpressionStatement, expr: parseExpression(), pos };
  }

  function parseSeparated<T>(element: () => T, separator: () => unknown) {
    const list = [element()];
    while (separator()) {
      list.push(element());
    }
    return list;
  }

  function parseModule(): Module {
    const statements = parseSeparated(
      parseStatement,
      () => tryParseToken(Token.Semicolon),
    );
    parseExpected(Token.EOF);
    return { statements, locals: new Map() };
  }
}
