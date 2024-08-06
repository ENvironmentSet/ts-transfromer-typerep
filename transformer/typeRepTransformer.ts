import * as ts from 'typescript';
import { typeRep } from '../typeRep.js';

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