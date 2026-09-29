# ArkUI State Management

Use this file for ArkUI state decorators and reactive rendering decisions.

## Decision guide

| Need | Prefer |
|---|---|
| Local primitive state | State decorator |
| Parent to child one-way value | Prop decorator |
| Parent-child two-way binding | Link decorator |
| Object item passed into child row component | ObjectLink with Observed class |
| Cross-level dependency injection | Provide and Consume decorators |
| App-level or storage-backed state | StorageLink or StorageProp |
| Page-level local storage | LocalStorageLink or LocalStorageProp |

## V2 is the default for new code

V2 decorators (`@ComponentV2`, `@Local`, `@Param`/`@Once`, `@Event`, `@ObservedV2`/`@Trace`, `@Monitor`, `@Provider`/`@Consumer`, `AppStorageV2`, `PersistenceV2`) have been stable since API 23 and are the recommended choice for new projects on API 24 and API 26.0.0; API 26.0.0 adds new components built on V2. The table above remains the reference for reading and reviewing V1 code.

## Rules

- Do not use ObjectLink without an Observed class.
- For list rows, prefer stable object models and stable keys.
- Explain whether changing an array element property triggers refresh in the chosen pattern.
- Under V1, observation is first-level only; nested object changes are not detected.
- Avoid React hook analogies unless the user explicitly asks for comparison.

## Review checklist

- Correct decorator for ownership direction.
- No unnecessary global state.
- No accidental object identity loss.
- List updates have stable keys and predictable refresh behavior.
