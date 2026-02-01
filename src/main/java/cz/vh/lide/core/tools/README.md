# core.tools

Utilities used by the service layer.

## Tools
- JpaTools: helper for safe relation linking and collection handling.

## API

```java
<OWNER extends BaseEntity, CHILD extends BaseEntity> void safeLink(OWNER owner, CHILD child, Function<OWNER, List<CHILD>> listGetter, BiConsumer<CHILD, OWNER> ownerSetter)
<LEFT extends BaseEntity, RIGHT extends BaseEntity> void safeLinkManyToMany(LEFT left, RIGHT right, Function<LEFT, List<RIGHT>> leftListGetter, Function<RIGHT, List<LEFT>> rightListGetter)
```