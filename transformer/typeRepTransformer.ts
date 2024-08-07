import * as ts from 'typescript';
import { checkFlag, encode, isPolymorphicType } from './helper';
import { TypeKind, TypeRep } from '../TypeRepresentation'

export function isTypeRepCall(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.CallExpression {
  if (!ts.isCallExpression(node)) return false;

  const resolvedSignature = typeChecker.getResolvedSignature(node);

  return (resolvedSignature?.declaration as ts.SignatureDeclaration)?.name?.getText() === 'typeRep';
}

export function evalTypeRepCall(node: ts.CallExpression, typeChecker: ts.TypeChecker): ts.Expression | undefined {
  if (node.typeArguments?.length !== 1) return; // @TODO: display error

  const typeNode = (node.typeArguments[0] as ts.TypeNode);
  const type = typeChecker.getTypeFromTypeNode(typeNode);

  return typeRep(type, typeChecker);
}

function getTypeKind(type: ts.Type): TypeKind {
  const flags = type.flags;

  if (type.isUnion()) return TypeKind.Union;
  if (type.isIntersection()) return TypeKind.Intersection;
  if (checkFlag(flags, ts.TypeFlags.Number) || checkFlag(flags, ts.TypeFlags.NumberLiteral)) return TypeKind.Number;
  if (checkFlag(flags, ts.TypeFlags.Boolean) || checkFlag(flags, ts.TypeFlags.BooleanLiteral)) return TypeKind.Boolean;
  if (checkFlag(flags, ts.TypeFlags.BigInt) || checkFlag(flags, ts.TypeFlags.BigIntLiteral)) return TypeKind.BigInt;
  if (checkFlag(flags, ts.TypeFlags.String) || checkFlag(flags, ts.TypeFlags.StringLiteral)) return TypeKind.String;
  if (checkFlag(flags, ts.TypeFlags.ESSymbol)) return TypeKind.Symbol;
  if (checkFlag(flags, ts.TypeFlags.Null)) return TypeKind.Null;
  if (checkFlag(flags, ts.TypeFlags.Undefined)) return TypeKind.Undefined;
  if (checkFlag(flags, ts.TypeFlags.Void)) return TypeKind.Void;
  if (checkFlag(flags, ts.TypeFlags.Never)) return TypeKind.Never;
  if (checkFlag(flags, ts.TypeFlags.Object)) {
    if (type.getCallSignatures().length !== 0) return TypeKind.Function;
    else return TypeKind.Object
  }
  if (checkFlag(flags, ts.TypeFlags.NonPrimitive)) return TypeKind.NonPrimitive;
  if (checkFlag(flags, ts.TypeFlags.Unknown)) return TypeKind.Unknown;
  else return TypeKind.Any;
}

function getLiteralField(type: ts.Type, typeChecker: ts.TypeChecker): number | boolean | bigint | string | undefined {
  const literal = typeChecker.typeToString(type);

  if (checkFlag(type.flags, ts.TypeFlags.NumberLiteral)) return Number(literal);
  if (checkFlag(type.flags, ts.TypeFlags.BooleanLiteral)) return Boolean(literal);
  if (checkFlag(type.flags, ts.TypeFlags.BigIntLiteral)) return BigInt(literal.substring(0, literal.length - 1));
  if (checkFlag(type.flags, ts.TypeFlags.StringLiteral)) return String(literal).substring(1, literal.length - 1);
  else return undefined;
}
function isUnionOrIntersectionType(type: ts.Type): type is ts.UnionOrIntersectionType {
  return checkFlag(type.flags, ts.TypeFlags.Intersection) || checkFlag(type.flags, ts.TypeFlags.Union);
}

function getParts(type: ts.Type, typeChecker: ts.TypeChecker): TypeRep[] | undefined {
  if (isUnionOrIntersectionType(type)) return type.types.map(type => monomorphicTypeRep(type, typeChecker));
  else return undefined;
}

function getProperties(type: ts.Type, typeChecker: ts.TypeChecker): [string, TypeRep][] | undefined {
  const declaration = type.symbol?.declarations;

  if (checkFlag(type.flags, ts.TypeFlags.Object) && declaration) return typeChecker.getPropertiesOfType(type).map(symbol => [typeChecker.symbolToString(symbol), monomorphicTypeRep(typeChecker.getTypeOfSymbolAtLocation(symbol, declaration[0]), typeChecker)]);
  else return undefined;
}

function getParameters(type: ts.Type, typeChecker: ts.TypeChecker): TypeRep[] {
  if (checkFlag(type.flags, ts.TypeFlags.Object) && type.getCallSignatures().length !== 0) {
    const signature = typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call)[0];
    const signatureDeclaration = signature.getDeclaration();

    return signature.getParameters().map(symbol => {
      const type = typeChecker.getTypeOfSymbolAtLocation(symbol, signatureDeclaration);

      return monomorphicTypeRep(type, typeChecker);
    });
  }

  return [];
}

function getReturnType(type: ts.Type, typeChecker: ts.TypeChecker): TypeRep | undefined {
  if (checkFlag(type.flags, ts.TypeFlags.Object) && type.getCallSignatures().length !== 0) {
    const signature = typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call)[0];

    return monomorphicTypeRep(typeChecker.getReturnTypeOfSignature(signature), typeChecker);
  }

  return undefined;
}

export function monomorphicTypeRep(type: ts.Type, typeChecker: ts.TypeChecker): TypeRep {
  return ({
    kind: getTypeKind(type),
    literal: getLiteralField(type, typeChecker),
    properties: getProperties(type, typeChecker),
    parts: getParts(type, typeChecker),
    parameters: getParameters(type, typeChecker),
    returnType: getReturnType(type, typeChecker)
  }) as TypeRep;
}

//Encode Polymorphic type as a function(which runs with runtime-typerep-of-type-parameter.
//Encode support for function -> typeRep returns TypeRep.
//@TODO
export function polymorphicTypeRep(type: ts.Type, typeChecker: ts.TypeChecker): ts.Expression {
  if (type.isTypeParameter()) return ts.factory.createIdentifier(`_typeRep_typeParameter_${typeChecker.typeToString(type)}`);
  else return ts.factory.createVoidZero(); // make error
}

export function typeRep(type: ts.Type, typeChecker: ts.TypeChecker): ts.Expression {
  return isPolymorphicType(type, typeChecker) ? polymorphicTypeRep(type, typeChecker) : encode(monomorphicTypeRep(type, typeChecker));
}