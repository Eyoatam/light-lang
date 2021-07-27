import {
  Expression,
  Identifier,
  Module,
  Node,
  Statement,
  Type,
  TypeAlias,
} from "./ast.ts";
import { error } from "./error.ts";
import { resolve } from "./bind.ts";

const stringType: Type = { id: "string" };
const numberType: Type = { id: "number" };
const errorType: Type = { id: "error" };

function typeToString(type: Type) {
  return type.id;
}

export function check(module: Module) {
  return module.statements.map(checkStatement);

  function checkStatement(statement: Statement): Type {
    switch (statement.kind) {
      case Node.ExpressionStatement:
        return checkExpression(statement.expr);
      case Node.Var: {
        const init = checkExpression(statement.init);
        if (!statement.typename) {
          return init;
        }
        const type = checkType(statement.typename);
        if (type !== init && type !== errorType) {
          error(
            statement.init.pos,
            `Cannot assign initialiser of type '${
              typeToString(init)
            }' to variable with declared type '${typeToString(type)}'.`,
          );
        }
        return type;
      }
      case Node.FunctionDeclaration: {
        const type = checkType(statement.typename!);
        return type;
      }
      case Node.TypeAlias:
        return checkType(statement.typename);
      default:
        return errorType;
    }
  }

  function checkExpression(expression: Expression): Type {
    switch (expression.kind) {
      case Node.Identifier: {
        const symbol = resolve(module.locals, expression.text!, Node.Var);
        if (symbol) {
          return checkStatement(symbol.valueDeclaration!);
        }
        // else
        error(expression.pos, "Could not resolve " + expression.text);
        return errorType;
        // }
      }
      case Node.NumberLiteral:
        return numberType;
      case Node.StringLiteral:
        return stringType;
      case Node.Assignment: {
        const value = checkExpression(expression.value);
        const type = checkExpression(expression.name);
        if (type !== value) {
          error(
            expression.value.pos,
            `Cannot assign value of type '${
              typeToString(value)
            }' to variable of type '${typeToString(type)}'.`,
          );
        }
        return type;
      }
    }
  }

  function checkType(name: Identifier): Type {
    switch (name.text) {
      case "string":
        return stringType;
      case "number":
        return numberType;
      default: {
        const symbol = resolve(module.locals, name.text!, Node.TypeAlias);
        if (symbol) {
          return checkType(
            (symbol.declarations.find((declaration) =>
              declaration.kind === Node.TypeAlias
            ) as TypeAlias).typename,
          );
        }
        error(name.pos, "Could not resolve type " + name.text);
        return errorType;
      }
    }
  }
}
