export type TypeRep = NumberRep | BooleanRep | BigIntRep | StringRep | SymbolRep | NullRep | UndefinedRep
  | VoidRep | AnyRep | UnknownRep | NeverRep | NonPrimitiveRep | UnionRep | IntersectionRep | ObjectRep;

export enum TypeKind { //@TODO: Categorize Better & Provide more information through representation.
  Any,
  Number,
  Boolean,
  String,
  Symbol,
  BigInt,
  Null,
  Undefined,
  NonPrimitive,
  Unknown,
  Never,
  Void,
  Enum, //@TODO
  This,
  Object, //@TODO
  Function, //@TODO
  Array,
  Tuple,
  Union,
  Intersection,
  TemplateLiteral, //@TODO
  Class, //@TODO
}

interface TypeRepresentation<K extends TypeKind> {
  kind: K;
}

export interface NumberRep extends TypeRepresentation<TypeKind.Number> {
  literal: number;
}
export interface BooleanRep extends TypeRepresentation<TypeKind.Boolean> {
  literal: boolean;
}
export interface BigIntRep extends TypeRepresentation<TypeKind.BigInt> {
  literal: bigint;
}
export interface StringRep extends TypeRepresentation<TypeKind.String> {
  literal: string;
}
export type SymbolRep = TypeRepresentation<TypeKind.Symbol>;
export type NullRep = TypeRepresentation<TypeKind.Null>;
export type UndefinedRep = TypeRepresentation<TypeKind.Undefined>;

export type VoidRep = TypeRepresentation<TypeKind.Void>;

export type AnyRep = TypeRepresentation<TypeKind.Any>;
export type UnknownRep = TypeRepresentation<TypeKind.Unknown>;
export type NeverRep = TypeRepresentation<TypeKind.Never>;

export type NonPrimitiveRep = TypeRepresentation<TypeKind.NonPrimitive>;
export interface ObjectRep extends TypeRepresentation<TypeKind.Object> {
  properties: [string, TypeRep][];
}
export interface UnionRep extends TypeRepresentation<TypeKind.Union> {
  parts: TypeRep[];
}
export interface IntersectionRep extends TypeRepresentation<TypeKind.Intersection> {
  parts: TypeRep[];
}

export interface FunctionRep extends TypeRepresentation<TypeKind.Function> { //@TODO Support Type Parameter
  parameters: TypeRep[];
  returnType: TypeRep;
}