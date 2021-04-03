import * as ts from 'typescript';
import { typeRep } from '../typeRep';

export function isGenericFunctionCall(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.CallExpression {
  if (!ts.isCallExpression(node)) return false;

  const resolvedDeclaration = typeChecker.getResolvedSignature(node)?.declaration;

  return Boolean(
    resolvedDeclaration &&
    !ts.isJSDocSignature(resolvedDeclaration) &&
    (resolvedDeclaration.typeParameters?.length ?? 0) > 0
  );
}

export function extendGenericFunctionCall(node: ts.CallExpression, typeChecker: ts.TypeChecker): ts.Node { //@TODO: Should work with type inference
  const typeArguments = node.typeArguments?.map(typeNode => typeChecker.getTypeFromTypeNode(typeNode)) ?? [];

  for (const typeArgument of typeArguments) {

    node = ts.factory.updateCallExpression(
      node,
      node.expression,
      node.typeArguments,
      [
        ...node.arguments,
        typeRep(typeArgument, typeChecker)
      ]
    );
  }

  return node;
}