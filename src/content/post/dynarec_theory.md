---
title: "Dynamic Recompilation for Dummies"
description: "A compilation (pun intended) of knowledge I have of dynarec techniques"
publishDate: "1 Feb 2024"
tags: ["emulation"]
---

Dynamic recompilation. When you first hear that term, it sounds intimidating. Dynamic? Recompilation? Compilation?
Simply put, it's the process of emitting and executing assembly at runtime based on a source platform. It's an incredibly
complex topic that is necessary to be implemented for emulators that target modern systems (like PCSX2 and Yuzu) as it is
orders of magnitudes faster than the simple interpreter we programmed last post.

Let's break down how we can implement dynamic recomilation techniques and what is necessary to get it to work.

- \> A code emitter
- \> Making a cached interpreter
- \> Optimisations
- \> Common pitfalls
- \> Recompiler Boy's cached interpreter

### Quick Foreword

As dynamic recompilation is inherently architecture and ABI dependant, I should note that these examples are done on a machine
with an x64 ISA using the system V ABI (Arch Linux). If you're on a MacBook with an Apple Silicon processor or are on Windows,
these examples won't work for you.

## The "Hello World" of dynamic recompilation feat. Xbyak

What is a function under the hood? It's simply an address that holds instructions that are to be executed and then returned from.
Therefore, it follows that if we want to dynamically recompile a function to execute at runtime, all we need to do is
to emit some bytes into an array and then execute it, simple right!?

The specifics of writing a code emitter are beyond this blog post, but in summary it's a lot of repetitive leg work that needs to
be done every time you want to emit a new assembly instruction. Therefore, we'll use an excellent code emitter used by
many projects (including *[dynarmic](https://github.com/merryhime/dynarmic)*) called *[xbyak](https://github.com/herumi/xbyak)*.

In terms of setting it up, you can have a look at this [repository](/). So let's look at an example:

```cpp

...

void test() {
  printf("Hello from function!\n");
  return;
}

int main() {
  // the xbyak 64 emitter
  x64Emitter code;

  // get the address of the function
  auto emitted_func = (FunctionPointer)code.getCurr();

  // move the function pointer into a 64 bit scratch register
  code.mov(rax, (uintptr_t)test);
  // execute the function
  code.call(rax);
  // return from the function, giving us back control from the dynamically emitted function
  code.ret();

  emitted_func();

  return 0;
}

```

## An incredibly simple dynamic recompiler aka cached interpreter

Let's have a look at the structure of an interpreter. It's basically a bunch of functions that modify the CPU's state in some
way shape or form. Therefore, if we want to write a very simple dynamic recompiler, we can write something called a cached interpreter,
that leverages the fact that we already have a working interpreter in order to benefit from the block optimisations of a dynarec.



