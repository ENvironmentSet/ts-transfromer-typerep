import * as ts from 'typescript';
import { TypeFlags } from 'typescript';
import { TypeKind } from './typeReps';
import { checkFlag, encode } from './helper';

function isTypeRepCall(node: ts.Node, program: ts.Program): node is ts.CallExpression {
  if (!ts.isCallExpression(node)) return false;

  const typeChecker = program.getTypeChecker();
  const resolvedDeclaration = (typeChecker.getResolvedSignature(node)?.declaration as ts.SignatureDeclaration);

  return Boolean(
    resolvedDeclaration &&
    resolvedDeclaration?.name?.getText() === 'typeRep'
  );
}

function getTypeKind({ flags }: ts.Type): TypeKind {
  if (checkFlag(flags, ts.TypeFlags.Number) || checkFlag(flags, ts.TypeFlags.NumberLiteral)) return TypeKind.Number;
  if (checkFlag(flags, ts.TypeFlags.Boolean) || checkFlag(flags, ts.TypeFlags.BooleanLiteral)) return TypeKind.Boolean;
  if (checkFlag(flags, ts.TypeFlags.BigInt) || checkFlag(flags, ts.TypeFlags.BigIntLiteral)) return TypeKind.BigInt;
  if (checkFlag(flags, ts.TypeFlags.String) || checkFlag(flags, ts.TypeFlags.StringLiteral)) return TypeKind.String;
  if (checkFlag(flags, ts.TypeFlags.ESSymbol)) return TypeKind.Symbol;
  if (checkFlag(flags, ts.TypeFlags.Null)) return TypeKind.Null;
  if (checkFlag(flags, ts.TypeFlags.Undefined)) return TypeKind.Undefined;
  if (checkFlag(flags, ts.TypeFlags.Void)) return TypeKind.Void;
  if (checkFlag(flags, ts.TypeFlags.Any)) return TypeKind.Any;
  if (checkFlag(flags, ts.TypeFlags.Unknown)) return TypeKind.Unknown;
  if (checkFlag(flags, ts.TypeFlags.Never)) return TypeKind.Never;
  if (checkFlag(flags, ts.TypeFlags.NonPrimitive)) return TypeKind.Object;
  else return TypeKind.NotSupportedYet; //@TODO: Some types are not supported yet;
}

function getLiteralField(type: ts.Type, typeChecker: ts.TypeChecker): number | boolean | bigint | string | symbol | null | undefined {
  const literal = typeChecker.typeToString(type);

  if (checkFlag(type.flags, ts.TypeFlags.NumberLiteral)) return Number(literal);
  if (checkFlag(type.flags, ts.TypeFlags.BooleanLiteral)) return Boolean(literal);
  if (checkFlag(type.flags, ts.TypeFlags.BigIntLiteral)) return BigInt(literal);
  if (checkFlag(type.flags, ts.TypeFlags.StringLiteral)) return String(literal).substring(1, literal.length - 1);
  if (checkFlag(type.flags, ts.TypeFlags.Null)) return null;
  else return undefined;
}

function typeRep(type: ts.Type, typeChecker: ts.TypeChecker): object { //@TODO: Return type should be `TypeRep`.
  const kind = getTypeKind(type);
  const literal = getLiteralField(type, typeChecker);

  return { kind, ... (kind === TypeKind.Undefined || literal !== undefined) && { literal } };
}

function isTypeParameter(type: ts.Type): boolean {
  return checkFlag(type.flags, TypeFlags.TypeParameter);
}

function evalTypeRepCall(node: ts.CallExpression, program: ts.Program): ts.Node | undefined {
  if (node.typeArguments?.length !== 1) return; // @TODO: display error

  const typeChecker = program.getTypeChecker();
  const typeNode = (node.typeArguments[0] as ts.TypeNode);
  const type = typeChecker.getTypeFromTypeNode(typeNode);

  return isTypeParameter(type) ? ts.factory.createIdentifier(`_typeRep_typeParameter_${typeNode.getText()}`) : encode(typeRep(type, typeChecker));
}

function isGenericFunction(node: ts.Node, program: ts.Program): node is ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction {
  if (!ts.isFunctionDeclaration(node) && !ts.isFunctionExpression(node) && !ts.isArrowFunction(node)) return false;

  const typeChecker = program.getTypeChecker();
  const resolvedDeclaration = typeChecker.getSignatureFromDeclaration(node)?.declaration!;
  const typeParams = resolvedDeclaration?.typeParameters;

  return !ts.isJSDocSignature(resolvedDeclaration) && (typeParams?.length ?? 0) > 0;
}

function extendGenericFunction(node: ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction, program: ts.Program): ts.Node | undefined {
  const typeChecker = program.getTypeChecker();
  const typeParams = (typeChecker.getSignatureFromDeclaration(node)?.declaration as ts.SignatureDeclaration)?.typeParameters!;

  for (const typeParam of typeParams) {
    const uniqueName = `_typeRep_typeParameter_${typeParam.name.text}`;
    const realParam = ts.factory.createParameterDeclaration(undefined, undefined, undefined, uniqueName);

    if (ts.isFunctionDeclaration(node)) node = ts.factory.updateFunctionDeclaration(node, node.decorators, node.modifiers, node.asteriskToken, node.name, node.typeParameters, [...node.parameters, realParam], node.type, node.body);
    else if (ts.isFunctionExpression(node)) node = ts.factory.updateFunctionExpression(node, node.modifiers, node.asteriskToken, node.name, node.typeParameters, [...node.parameters, realParam], node.type, node.body);
    else node = ts.factory.updateArrowFunction(node, node.modifiers, node.typeParameters, [...node.parameters, realParam], node.type, node.equalsGreaterThanToken, node.body);
  }

  return node;
}

function isGenericFunctionCall(node: ts.Node, program: ts.Program): node is ts.CallExpression {
  if (!ts.isCallExpression(node)) return false;

  const typeChecker = program.getTypeChecker();
  const resolvedDeclaration = typeChecker.getResolvedSignature(node)?.declaration;

  return Boolean(
    resolvedDeclaration &&
    (resolvedDeclaration.typeParameters?.length ?? 0) > 0
  );
}

function extendGenericFunctionCall(node: ts.CallExpression, program: ts.Program): ts.Node { //@TODO: Should work with type inference
  const typeChecker = program.getTypeChecker();
  const resolvedSignature = typeChecker.getResolvedSignature(node);
  //@ts-ignore Monkey patch.
  const typeArguments = 'target' in resolvedSignature.mapper ? [resolvedSignature.mapper.target] : resolvedSignature.mapper.targets;

  for (const typeArgument of typeArguments) {

    node = ts.factory.updateCallExpression(
      node,
      node.expression,
      node.typeArguments,
      [
        ...node.arguments,
        isTypeParameter(typeArgument) ?
          ts.factory.createIdentifier(`_typeRep_typeParameter_${typeChecker.typeToString(typeArgument)}`) :
          encode(typeRep(typeArgument, typeChecker))
      ]
    );
  }

  return node;
}

function transformNode(node: ts.SourceFile, program: ts.Program): ts.SourceFile;
function transformNode(node: ts.Node, program: ts.Program): ts.Node | undefined;
function transformNode(node: ts.Node, program: ts.Program): ts.Node | undefined {
  if (isTypeRepCall(node, program)) return evalTypeRepCall(node, program);
  if (isGenericFunction(node, program)) return extendGenericFunction(node, program);
  if (isGenericFunctionCall(node, program)) return extendGenericFunctionCall(node, program);
  else return node;
}

function travel(node: ts.SourceFile, program: ts.Program, context: ts.TransformationContext): ts.SourceFile;
function travel(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node | undefined;
function travel(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node | undefined {
  return ts.visitEachChild(transformNode(node, program), childNode => travel(childNode, program, context), context);
}

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  return context => file => travel(file, program, context);
}