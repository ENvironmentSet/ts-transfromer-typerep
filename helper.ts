import * as ts from 'typescript';

function encodeObject(object: object): ts.ObjectLiteralExpression {
  function encodeEntries([entry, ...rest]: [string, unknown][]): ts.ObjectLiteralElementLike[] {
    if (!entry) return [];
    else return [
      ...encodeEntries(rest),
      ts.factory.createPropertyAssignment(entry[0], encode(entry[1]))
    ];
  }

  return ts.factory.createObjectLiteralExpression(encodeEntries(Object.entries(object)));
}

function encodeSymbol({ description }: symbol): ts.CallExpression {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier('Symbol'),
    undefined,
    description ? [ts.factory.createStringLiteral(description)] : undefined
  );
}

export function encode(value: unknown): ts.Expression {
  switch (typeof value) {
    case 'number': return ts.factory.createNumericLiteral(value);
    case 'string': return ts.factory.createStringLiteral(value);
    case 'boolean': return value ? ts.factory.createTrue() : ts.factory.createFalse();
    case 'undefined': return ts.factory.createVoidZero();
    case 'bigint': return ts.factory.createBigIntLiteral(`${value}n`);
    case 'object': return value === null ? ts.factory.createNull() : Array.isArray(value) ? ts.factory.createArrayLiteralExpression(value.map(encode)) : encodeObject(value);
    case 'symbol': return encodeSymbol(value);
    default: return encode(undefined); //@TODO: Converting Function are not supported yet
  }
}

export function checkFlag(target: number, flag: number): boolean {
  return (target & flag) === flag;
}

function isTypeReference(type: ts.Type): type is ts.TypeReference {
  return 'target' in type;
}

export function isPolymorphicType(type: ts.Type, typeChecker: ts.TypeChecker): boolean {
  if (checkFlag(type.flags, ts.TypeFlags.TypeParameter)) return true;
  else return isTypeReference(type) && typeChecker.getTypeArguments(type).some(typeArgument => isPolymorphicType(typeArgument, typeChecker));
}