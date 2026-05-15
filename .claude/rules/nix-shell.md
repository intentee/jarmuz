---
paths:
  - "**/shell.nix"
---

# Nix Shell Standards

- shell.nix must follow idiomatic NixOS ways of providing packages
- shell.nix must be minimal, and only providing project dependencies that would not be able to run natively otherwise
- shell.nix must not contain any workarounds
- shell.nix must not contain any kind of ELF patching
- shell.nix must not contain any kind of monkey patching
