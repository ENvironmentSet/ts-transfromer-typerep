import * as ts from 'typescript';
import { isTypeRepCall, evalTypeRepCall } from './typeRepTransformer';
import { isGenericFunction, extendGenericFunction } from './genericFunctionTransformer';
import { isGenericFunctionCall, extendGenericFunctionCall } from './genericFunctionCallTransformer';

function transformNode(node: ts.SourceFile, program: ts.Program): ts.SourceFile;
function transformNode(node: ts.Node, program: ts.Program): ts.Node | undefined;
function transformNode(node: ts.Node, program: ts.Program): ts.Node | undefined {
  const typeChecker = program.getTypeChecker();

  if (isTypeRepCall(node, typeChecker)) return evalTypeRepCall(node, typeChecker);
  if (isGenericFunction(node, typeChecker)) return extendGenericFunction(node, typeChecker);
  if (isGenericFunctionCall(node, typeChecker)) return extendGenericFunctionCall(node, typeChecker);
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