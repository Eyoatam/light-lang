import { Expression, Node, Statement } from "./ast.ts";

export function emit(statements: Statement[]): string {
  return statements.map(printStatement).join(";\n");
}

function printStatement(statement: Statement) {
  switch (statement.kind) {
    case Node.ExpressionStatement:
      return printExpression(statement.expr);
    case Node.Var: {
      const typestring = statement.typename ? ": " + statement.name : "";
      return `var ${statement.name.text}${typestring} = ${
        printExpression(statement.init)
      }`;
    }
    case Node.Let: {
      const typestring = statement.typename ? ": " + statement.name : "";
      return `let ${statement.name.text}${typestring} = ${
        printExpression(statement.init)
      }`;
    }
    case Node.FunctionDeclaration: {
      return `function ${statement.name.text}(${
        statement.params[0].text
<<<<<<< HEAD
      }) { return ${statement.returnVal} }`;
=======
      }){ // replace with real code
      }`;
>>>>>>> 451b7875b50f2f43feb514b7c1de561fe22fc4fa
    }
    case Node.TypeAlias:
      return `type ${statement.name.text} = ${statement.typename.text}`;
  }
}

function printExpression(expression: Expression): string {
  switch (expression.kind) {
    case Node.Identifier:
      return expression.text!;
    case Node.NumberLiteral:
      return "" + expression.value;
    case Node.StringLiteral:
      return `"${expression.text}"`;
    case Node.Assignment:
      return `${expression.name.text} = ${printExpression(expression.value)}`;
    default:
      return "undefined";
  }
}

export function transform(statements: Statement[]) {
  return transformToJS(statements);
}

// remove type annotations and declarations
function transformToJS(statements: Statement[]) {
  return statements.flatMap(transformStatement);

  function transformStatement(statement: Statement): Statement[] {
    switch (statement.kind) {
      case Node.ExpressionStatement:
        return [statement];
      case Node.Var:
      case Node.Let:
        return [{ ...statement, typename: undefined }];
      case Node.TypeAlias:
        return [];
      default:
        return [statement];
    }
  }
}
