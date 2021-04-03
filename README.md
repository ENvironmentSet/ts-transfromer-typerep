# ts-transformer-typerep

A typescript custom transformer which enables a programmer to pull down type-level(compile time) information into value level(runtime).

```typescript
import { typeRep, TypeKind } from 'ts-transformer-typerep';

function keys<T>(): string[] {
  const type = typeRep<T>();

  if (type.kind === TypeKind.Object) return type.properties.map(([key]) => key);
  else return [];
}

keys<{ x: 1, y: 2, z: 3 }>(); // ['x', 'y', 'z']
```

> **WARNING⚠️**: This transformer is on construction. It's not recommended to use this on production.

## Installation

```shell script
npm i -D ts-transformer-typerep
```

[See here](https://github.com/madou/typescript-transformer-handbook#consuming-transformers) to learn how to apply custom transformers.

## Reference

> 📝 Detailed explanation will be updated soon.

### Type `TypeRep`

Type representations are values that represent types. `TypeRep` is type of every type representation.
For more information about type representations, please check type definition of `TypeRep`.

### Type `TypeKind`

`TypeKind` is type of value for discriminating type representations.
Different type representations are distinguished by its `kind` field, whose value is value of `TypeKind`.
For more information about type representations, please check type definition of `TypeKind`.

```typescript
const type = typeRep<number>();

if (type.kind === TypeKind.Number) console.log('It\'s a number type!');
else console.log('It\'s not a number type :(');
```

### Function `typeRep<typeToPullDown>(): TypeRep`

`typeRep` is a function for pulling type level information into value level. It returns value-level representation of a given type.

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

- Available(✅): A type is fully supported
- WIP(🚧): A type is partially supported
- Todo(📝): A type is planned to be supported

| Types | Current State |
|---------|---------------|
| Primitive types | ✅ |
| Literal types | ✅ |
| `never`/`unknown`/`any`/`void` | ✅ |
| Polymorphic types | 🚧(Single type variable such as `T`, `A` only) |
| Enums | 📝 |
| Function/Constructor types | 📝 |
| Union types | ✅ |
| Intersection types | ✅ |
| Template literal types | 📝 |
| Object types | 🚧(Only owned properties are extracted) |