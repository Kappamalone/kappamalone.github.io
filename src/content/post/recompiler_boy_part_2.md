---
title: "Recompiler Boy - Part II"
description: "A post mortem of a project I worked on over summer - electric boogaloo"
publishDate: "28 Jan 2024"
tags: ["emulation"]
---

Let's dive into the cached interpreter that currently exists in *[Recompiler Boy](https://github.com/Kappamalone/recompiler_boy)*!

## Why a cached interpreter?

There are three general areas you have to address when writing a dynarec. Those are

- \> Emitting assembly
- \> Managing blocks of emitted code, how they're accessed and invalidating them
- \> Actually implementing instructions in assembly, optimisations, intermediate representations etc

The emitting of assembly is excellently handled by *[xbyak](https://github.com/herumi/xbyak)*. This leaves us with both managing
the blocks of code and the implementation of instructions. The twin terror of doing both of these is enough work and debugging to
put off most emulator developers away from ever attempting to write a dynarec, and rightfully so.

However, there's a type of dynamic recompilation that can leverage an already existing interpreter that emulator's nearly always
already have written, and that's a cached interpreter! A cached interpreter uses the interpreter that you've written in order to
execute the guest machine's instructions. This means that you can focus solely on managing the emitted code, and can then
use that as a base to write a fully fledged dynamic recompiler later down the line!

## Our requirements

Let's review what we want from a dynamic recompiler. Our requirements are:

- \> O(1) emitted block lookup and deletion
- \> Any writes to an address should mark all containing blocks for recompilation

The first requirement is fairly simple to understand. If we want our dynarec to operate as fast as possible, then we want to be
able to execute our code as quickly as we can.

However, the second requirement is a lot more nuanced. Here's an example to understand the kind of problem we're facing:

Let's say that on our Hypothetical Game Station 2000, the addresses 0x100 and 0x101 have the corresponding instructions,

0x100: ADD 1 to A
0x101: SUB 1 from A

We then run our dynamic recompiler, and we generate the functions for this small block

Block lookup: 0x100 -> function pointer -> translates instructions to ADD 1 and SUB 1

Later down the line, we have an instruction that changes 0x101 to be the instruction ADD 1 to A. However, when we look up our
block at 0x100, our dynarec still executes the old code where we SUB 1 from A!

In order to satisfy both requirements, we need to divy up the address space into pages. These pages then contain blocks of
function pointers that we can index into, that only contain instructions up to page boundaries. This means that if an instruction
writes to a given address, we can discard all blocks inside the page safely without worry of the scenario I just described.
The only drawback being that instruction blocks have to be a fixed size and end at page boundaries.

## Managing emitted code

So let's think of how an interpreter works. We have our program counter, which is basically our lookup into our emitted functions.
The Gameboy has an address space of 16 bits, meaning 65535 possible values that our program counter could be. If each address
was to hold an 8 byte pointer to a function pointer, we'd be looking at

<p style="text-align: center;">65535 * 8 / 1024 / 1024 = 0.5 mb</p>

worth of pointers. This is not terribly large, but would be completely infeasible to manage for a 32 or 64 bit system. Furthermore,
we also need to manage the deletion of blocks that are written to. For this purpose, let us divide our address space into pages,
where the first n bits are the page, and the rest index into blocks.

What this allows us to do is to cut back on the amount of pointers we allocate.

