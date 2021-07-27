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
    } else if (tryParseToken(Token.Function)) {
      const name = parseIdentifier();
      const params = [];
      let typename;
      if (tryParseToken(Token.LeftParenthesis)) {
        loop:
        while (true) {
          const param = parseIdentifier();
          typename = tryParseToken(Token.Colon) ? parseIdentifier() : undefined;
          params.push(param);
          if (!tryParseToken(Token.Comma)) {
            break loop;
          }
        }
        parseExpected(Token.RightParenthesis);
      }
      parseExpected(Token.LeftCurlyBrace);
      let returnVal;
      if (tryParseToken(Token.Return)) {
        returnVal = lexer.text();
      }
      lexer.scan();
      const body = parseStatement();
      const expr = parseExpression();
      if (tryParseToken(Token.RightCurlyBrace)) {
        lexer.scan();
      }
      return {
        kind: Node.FunctionDeclaration,
        name,
        params,
        typename,
        body,
        expr,
        returnVal: typeof returnVal !== "undefined" ? returnVal : "",
        pos,
      };
    } else if (tryParseToken(Token.Type)) {
      const name = parseIdentifier();
      parseExpected(Token.Equals);
      const typename = parseIdentifier();
      return { kind: Node.TypeAlias, name, typename, pos };
    }
    return { kind: Node.ExpressionStatement, expr: parseExpression(), pos };
  }

  function parseSeparated<T>(element: () => T, separator: () => unknown): T[] {
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
    parseExpected(Token.Identifier);
    return { statements, locals: new Map() };
  }
}
