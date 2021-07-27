export enum Token {
  Function,
  Var,
  Type,
  Return,
  Equals,
  StringLiteral,
  NumberLiteral,
  Identifier,
  Newline,
  Semicolon,
  Colon,
  Comma,
  LeftParenthesis,
  RightParenthesis,
  LeftCurlyBrace,
  RightCurlyBrace,
  Whitespace,
  Unknown,
  BOF,
  EOF,
  Let,
}

export type Lexer = {
  scan(): void;
  token(): Token;
  pos(): number;
  text(): string;
};

export enum Node {
  Identifier,
  StringLiteral,
  NumberLiteral,
  Assignment,
  ExpressionStatement,
  Var,
  Let,
  TypeAlias,
}

export interface Error {
  pos: number;
  message: string;
}
export interface Location {
  pos: number;
}

export type Expression =
  | Identifier
  | NumberLiteral
  | StringLiteral
  | Assignment;

export interface Identifier extends Location {
  kind: Node.Identifier;
  text?: string;
}

export interface StringLiteral extends Location {
  kind: Node.StringLiteral;
  text: string;
}

export interface NumberLiteral extends Location {
  kind: Node.NumberLiteral;
  value: number;
}

export interface Assignment extends Location {
  kind: Node.Assignment;
  name: Identifier;
  value: Expression;
}

export type Statement = ExpressionStatement | Var | Let | TypeAlias;

export interface ExpressionStatement extends Location {
  kind: Node.ExpressionStatement;
  expr: Expression;
}

export interface Var extends Location {
  kind: Node.Var;
  name: Identifier;
  typename: Identifier | undefined;
  init: Expression;
}

export interface Let extends Location {
  kind: Node.Let;
  name: Identifier;
  typename: Identifier | undefined;
  init: Expression;
}

export interface TypeAlias extends Location {
  kind: Node.TypeAlias;
  name: Identifier;
  typename: Identifier;
}

export type Declaration = Var | TypeAlias; // plus others, like function

export interface Symbol {
  valueDeclaration: Declaration | undefined;
  declarations: Declaration[];
}

// deno-lint-ignore ban-types
export type Table = Map<string, Symbol>;

export interface Module {
  locals: Table;
  statements: Statement[];
}

export type Type = { id: string };
