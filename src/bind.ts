import { Module, Node, Statement, Table } from "./ast.ts";
import { error } from "./error.ts";

export function bind(module: Module) {
  for (const statement of module.statements) {
    bindStatement(module.locals, statement);
  }

  function bindStatement(locals: Table, statement: Statement) {
    if (statement.kind === Node.Var || statement.kind === Node.TypeAlias) {
      const symbol = locals.get(statement.name.text!);
      if (symbol) {
        const other = symbol.declarations.find((declaration) =>
          declaration.kind === statement.kind
        );
        if (other) {
          error(
            statement.pos,
            `Cannot redeclare ${statement.name.text}; first declared at ${other.pos}`,
          );
        } else {
          symbol.declarations.push(statement);
          if (statement.kind === Node.Var) {
            symbol.valueDeclaration = statement;
          }
        }
      } else {
        locals.set(statement.name.text!, {
          declarations: [statement],
          valueDeclaration: statement.kind === Node.Var ? statement : undefined,
        });
      }
    }
  }
}

export function resolve(
  locals: Table,
  name: string,
  meaning: Node.Var | Node.TypeAlias,
) {
  const symbol = locals.get(name);
  if (
    symbol?.declarations.some((declaration) => declaration.kind === meaning)
  ) {
    return symbol;
  }
}
