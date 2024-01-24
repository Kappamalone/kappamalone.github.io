---
title: "Recompiler Boy Project"
description: "A post mortem of a project I worked on over summer"
publishDate: "24 Jan 2024"
tags: ["emulation"]
---

This is a fun little project I started over the summer in order to attempt to apply dynamic recompilation techniques
(or more commonly referred to as JIT ie Just-in-time compilation) to a commercial piece of hardware. Let's start with the "what"

## What is an Interpreter?

To answer this question, we have to take a a bit of a detour to explain how we are able to actually "emulate" the Gameboy in the first
place. In order to do that, we need to execute instructions held on the rom of a catridge, that we would usually just pop into our
console of choice. Except, there's one tiny issue. The console that we want to emulate (the "guest") CPU's architecture is
completely different to our (the host's) architecture.

This means that we need some sort of translator that can execute instructions from the guest on our host computer. The easiest, and
most naive solution to this is something like:

```cpp
auto instruction = read_next_instruction();
increment_program_counter();

switch (instruction) {
    case 0x10:
        ld_register_with_value();
        break;
    ...
    default:
        printf("UNHANDLED INSTRUCTION");
}
```

This is what you would call an "interpreter". It sequentially reads every instruction that is meant to be executed on the Gameboy,
and does the corresponding action on our own computer. This approach works, and there's nothing wrong with it, until you start
considering performance.

The Gameboy's Sharp LR35902 CPU runs at 4.19MHz, but all instructions take a multiple of 4 cycles to execute, therefore we can
say it executes up to around 1 million instructions per second. If we look at more modern consoles, we can be executing
a lot more every second, meaning we have an efficiency problem we need to solve. Queue, JIT's...

## Dynamic Recompilation

Instead, what we can do is implement a compiler that works at runtime to **dynamic**ally  **recompile** our guest code into
host code. This means that every time a segment of code is encountered by our JIT, we simply have to look up if this block of code
has been executed before.

If it hasn't, then we have to do the initial interpretation manually, yes. However, on every subsequent rerun of that code
(cough, temporal locality) we have an O(1) operation on executing up to potentially thousands of instructions instantly.

While this sounds great, this introduces a whole bag of worms in terms of creative ways we can break our emulator, and there's a
lot more steps I've overlooked. So let's do a deep dive into how exactly Recompiler Boy's JIT works.



