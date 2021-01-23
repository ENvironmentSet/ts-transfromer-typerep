export type TypeRep = NumberRep | BooleanRep | BigIntRep | StringRep | SymbolRep | NullRep | UndefinedRep
  | VoidRep | AnyRep | UnknownRep | NeverRep | NonPrimitiveRep;

export enum TypeKind {
  Any,
  Number,
  Boolean,
  String,
  Symbol,
  BigInt,
  NonPrimitive, // Represents `object` type. It's not for both `Object` nor `{}`.
  Null,
  Undefined,
  Unknown,
  Never,
  Void,
  Enum,
  Object,
  Function,
  Union, //@TODO: variants
  Intersection, //@TODO: parts
  TemplateLiteral, //@TODO
  Conditional, //@TODO: antecedent, consequent
  Tuple,
  NotSupportedYet
}

interface TypeRepresentation<K extends TypeKind> { //Do we need Binding name?
  kind: K;
}

type PrimitiveTypeKind = TypeKind.Number | TypeKind.Boolean | TypeKind.BigInt
  | TypeKind.String | TypeKind.Symbol | TypeKind.Null | TypeKind.Undefined;
interface PrimTypeKindToPrimType {
  [TypeKind.Number]: number;
  [TypeKind.Boolean]: boolean;
  [TypeKind.BigInt]: bigint;
  [TypeKind.String]: string;
  [TypeKind.Symbol]: symbol;
  [TypeKind.Null]: null;
  [TypeKind.Undefined]: undefined;
}

export interface PrimitiveRep<K extends PrimitiveTypeKind = PrimitiveTypeKind> extends TypeRepresentation<K> {
  literal?: PrimTypeKindToPrimType[K];
}

export type NumberRep = PrimitiveRep<TypeKind.Number>;
export type BooleanRep = PrimitiveRep<TypeKind.Boolean>;
export type BigIntRep = PrimitiveRep<TypeKind.BigInt>;
export type StringRep = PrimitiveRep<TypeKind.String>;
export type SymbolRep = PrimitiveRep<TypeKind.Symbol>;
export type NullRep = PrimitiveRep<TypeKind.Null>;
export type UndefinedRep = PrimitiveRep<TypeKind.Undefined>;

export type VoidRep = TypeRepresentation<TypeKind.Void>;

export type AnyRep = TypeRepresentation<TypeKind.Any>;
export type UnknownRep = TypeRepresentation<TypeKind.Unknown>;
export type NeverRep = TypeRepresentation<TypeKind.Never>;

export type NonPrimitiveRep = TypeRepresentation<TypeKind.NonPrimitive>;