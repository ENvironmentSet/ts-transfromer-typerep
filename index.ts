import { TypeRep } from './typeRep.js';

export declare function typeRep<T>(): TypeRep;
export {
  TypeKind, TypeRep, NumberRep, BooleanRep, BigIntRep, StringRep, SymbolRep, NullRep, UndefinedRep,
  VoidRep, AnyRep, UnknownRep, NeverRep, NonPrimitiveRep, UnionRep, IntersectionRep, ObjectRep
} from './typeRep';