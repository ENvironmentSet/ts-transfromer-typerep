import * as ts from 'typescript';

function compileObject(object: object): ts.ObjectLiteralExpression {
  function f(entries: [string, unknown][]): ts.ObjectLiteralElementLike[] {
    if (entries.length === 0) return [];
    else return f(entries.slice(1)).concat(ts.factory.createPropertyAssignment(entries[0][0], compileValue(entries[0][1])))
  }

  return ts.factory.createObjectLiteralExpression(f(Object.entries(object)));
}

export function compileValue(value: unknown): ts.Expression {
  switch (typeof value) {
    case 'number': return ts.factory.createNumericLiteral(value);
    case 'string': return ts.factory.createStringLiteral(value);
    case 'boolean': return value ? ts.factory.createTrue() : ts.factory.createFalse();
    case 'undefined': return ts.factory.createVoidZero();
    case 'bigint': return ts.factory.createBigIntLiteral(`${value}n`);
    case 'object': return value === null ? ts.factory.createNull() : compileObject(value);
    default: return compileValue(undefined); //@TODO: Converting Function and Symbol are not supported yet
  }
}

export function checkFlag(target: number, flag: number): boolean {
  return (target & flag) === flag;
}