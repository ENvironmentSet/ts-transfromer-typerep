# ts-transformer-typerep

A typescript custom transformer that brings type-level information into value level(runtime).

> **WARNING⚠️**: This transformer is on construction. It's not recommended to use this in any kinds of serious project.

> **WARNING⚠️**: Precious document will be updated in alpha releases.

## Installation

```
npm i -D ts-transformer-typerep
```

[See here](https://github.com/madou/typescript-transformer-handbook#consuming-transformers) to learn how to apply custom transformer.

## Example

> Since this transformer is on construction, Only minimal features are implemented so far.

```typescript
import { typeRep, TypeKind } from 'ts-transformer-typerep';

function add<A extends number, B extends number>(): number {
  const a = typeRep<A>();
  const b = typeRep<B>();

  if (a.kind === TypeKind.Number && b.kind === TypeKind.Number) return (a.literal ?? 0) + (b.literal ?? 0);
  throw new Error('impossible situation');
}

add<1, 2>(); // 3
```