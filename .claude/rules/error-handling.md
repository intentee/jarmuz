---
paths:
  - "src/**/*"
---

# Error Handling

- Operations that should not happen must result in a hard error.
- Never silently ignore issues. When a operation that cannot be completed is requested, that needs to be an error (for example using a worker that does not exist, or trying to invoke an action that is not registered).
