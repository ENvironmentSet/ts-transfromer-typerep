import * as ts from 'typescript';

export function isGenericFunction(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.FunctionLikeDeclaration {
  if (!ts.isFunctionDeclaration(node) && !ts.isFunctionExpression(node) && !ts.isArrowFunction(node)) return false;

  const resolvedDeclaration = typeChecker.getSignatureFromDeclaration(node)?.declaration!;
  const typeParams = resolvedDeclaration?.typeParameters;

  return !ts.isJSDocSignature(resolvedDeclaration) && (typeParams?.length ?? 0) > 0;
}

export function extendGenericFunction(node: ts.FunctionLikeDeclaration, typeChecker: ts.TypeChecker): ts.FunctionLikeDeclaration {
  const typeParams = (typeChecker.getSignatureFromDeclaration(node)?.declaration as ts.SignatureDeclaration)?.typeParameters!;
  const realParams = typeParams.map(({ name: { text: param }}) => ts.factory.createParameterDeclaration(undefined, undefined, `_typeRep_typeParameter_${param}`));

  if (ts.isFunctionDeclaration(node))
    return ts.factory.updateFunctionDeclaration(node, node.modifiers, node.asteriskToken, node.name, node.typeParameters, node.parameters.concat(realParams), node.type, node.body);
  else if (ts.isMethodDeclaration(node))
    return ts.factory.updateMethodDeclaration(node, node.modifiers, node.asteriskToken, node.name, node.questionToken, node.typeParameters, node.parameters.concat(realParams), node.type, node.body);
  else if (ts.isGetAccessorDeclaration(node))
    return ts.factory.updateGetAccessorDeclaration(node, node.modifiers, node.name, node.parameters.concat(realParams), node.type, node.body);
  else if (ts.isSetAccessorDeclaration(node))
    return ts.factory.updateSetAccessorDeclaration(node, node.modifiers, node.name, node.parameters.concat(realParams), node.body);
  else if (ts.isConstructorDeclaration(node))
    return ts.factory.updateConstructorDeclaration(node, node.modifiers, node.parameters.concat(realParams), node.body);
  else if (ts.isFunctionExpression(node))
    return ts.factory.updateFunctionExpression(node, node.modifiers, node.asteriskToken, node.name, node.typeParameters, node.parameters.concat(realParams), node.type, node.body);
  else return ts.factory.updateArrowFunction(node, node.modifiers, node.typeParameters, node.parameters.concat(realParams), node.type, node.equalsGreaterThanToken, node.body);
}
