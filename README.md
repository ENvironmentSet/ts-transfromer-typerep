# ts-transformer-typerep

A typescript custom transformer which enables to pull down type-level(compile time) information into value level(runtime).

```typescript
import { typeRep, TypeKind } from 'ts-transformer-typerep';

function add<A extends number, B extends number>(): number {
  const a = typeRep<A>();
  const b = typeRep<B>();

  if (a.kind === TypeKind.Number && b.kind === TypeKind.Number) return (a.literal ?? 0) + (b.literal ?? 0);
  else throw new Error('impossible situation');
}

add<1, 2>(); // 3
```

> **WARNING⚠️**: This transformer is on construction. It's not recommended to use this on production.

## Installation

```shell script
npm i -D ts-transformer-typerep
```

[See here](https://github.com/madou/typescript-transformer-handbook#consuming-transformers) to learn how to apply custom transformer.

## Reference

> 📝 Detailed explanation will be updated soon.

### Type `TypeRep`

Type representations are value that represents types. `TypeRep` is type of every type representation.
For more information about type representations, please check type definition of `TypeRep`.

### Type `TypeKind`

`TypeKind` is type of value for discriminating type representations.
Different type representations are distinguished by it's `kind` field, whose value is `TypeKind`.
For more information about type representations, please check type definition of `TypeKind`.

```typescript
const type = typeRep<number>();

if (type.kind === TypeKind.Number) console.log('It\'s a number type!');
else console.log('It\'s not a number type :(');
```

### Function `typeRep<typeToPullDown>(): TypeRep`

`typeRep` is a function for pulling type level information into value level. It returns value-level representation of given type.

```typescript
typeRep<10>();
/**
{
  kind: TypeKind.Number,
  literal: 10
}
**/
```

> **WARNING⚠️**: This function is not fully implemented yet, please refer following 'Type Support Table' to check which types it supports.

#### Type Support Table

- Available(✅): Type is fully supported
- WIP(🚧): Type is partially supported
- Todo(📝): Type is planned to be supported

| Types | Current State |
|---------|---------------|
| Primitive types | ✅ |
| Literal types | ✅ |
| `never`/`unknown`/`any`/`void` | ✅ |
| Polymorphic types | 🚧(Single type variable such as `T`, `A` only. can't consume complex types like `Array<T>` yet.) |
| Enums | 📝 |
| Interfaces | 📝 |
| Function/Constructor types | 📝 |
| Union types | 📝 |
| Intersection types | 📝 |
| Template literal types | 📝 |
| Conditional types | 📝 |
| Tuple types | 📝 |
| Class/Instance types | 📝 |