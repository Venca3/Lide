# ws.controller.tools

Shared controller helpers.

## Contents
- ControllerTools: builds pagination headers (`X-Total-Count`, `Link`) for paged list endpoints.
- ControllerTools: parses `sort` query params into Spring `Sort`.

## API

```java
HttpHeaders buildPaginationHeaders(Page<?> pageRes, int size)
Sort parseSort(List<String> sortParams)
```
