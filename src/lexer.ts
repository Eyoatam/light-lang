import { Lexer, Token } from "./ast.ts";

const keywords = {
  "function": Token.Function,
  "var": Token.Var,
  "type": Token.Type,
  "return": Token.Return,
  "let": Token.Let,
};

export function lex(input: string): Lexer {
  let pos = 0;
  let text = "";
  let token = Token.BOF;

  return {
    scan,
    token: () => token,
    pos: () => pos,
    text: () => text,
  };

  function scanForward(cb: (v: string) => boolean) {
    while (pos < input.length && cb(input.charAt(pos))) {
      pos++;
    }
  }

  function scan() {
    scanForward((char) => /[ \t\b\n]/.test(char));
    const start = pos;

    // todo(@Eyoatam): #1 simplify this
    if (pos === input.length) {
      token = Token.EOF;
    } else if (/[0-9]/.test(input.charAt(pos))) {
      scanForward((char) => /[0-9]/.test(char));
      text = input.slice(start, pos);
      token = Token.NumberLiteral;
    } else if (/\"/.test(input.charAt(pos))) {
      scanForward((char) => /\"/.test(char));
      text = input.slice(start, pos);
      token = Token.StringLiteral;
    } else if (/[_a-zA-Z]/.test(input.charAt(pos))) {
      scanForward((char) => /[_a-zA-Z0-9]/.test(char));
      text = input.slice(start, pos);
      token = text in keywords
        ? keywords[text as keyof typeof keywords]
        : Token.Identifier;
    } else {
      pos++;
      switch (input.charAt(pos - 1)) {
        case "=":
          token = Token.Equals;
          break;
        case ";":
          token = Token.Semicolon;
          break;
        case ":":
          token = Token.Colon;
          break;
        case "{":
          token = Token.LeftCurlyBrace;
          break;
        case "}":
          token = Token.RightCurlyBrace;
          break;
        case "(":
          token = Token.LeftParenthesis;
          break;
        case ")":
          token = Token.RightParenthesis;
          break;
        case ",":
          token = Token.Comma;
          break;
        default:
          token = Token.Unknown;
          break;
      }
    }
  }
}

export function lexAll(input: string) {
  const lexer = lex(input);
  const tokens: Array<{ token: Token; text?: string }> = [];
  let token;
  while (true) {
    lexer.scan();
    token = lexer.token();
    switch (token) {
      case Token.EOF:
        return tokens;
      case Token.Identifier:
      case Token.NumberLiteral:
        tokens.push({ token: token, text: lexer.text() });
        break;
      default:
        tokens.push({ token: token });
        break;
    }
  }
}
