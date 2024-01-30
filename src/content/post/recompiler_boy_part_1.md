---
title: "Recompiler Boy - Part I"
description: "A post mortem of a project I worked on over summer"
publishDate: "24 Jan 2024"
tags: ["emulation"]
---

This is a fun little project I started over the summer in order to attempt to apply some
dynamic recompilation techniques to a commercial piece of hardware.

Dynamic recompilation can be employed in an emulator through a "JIT" compiler. However, in order
to write a JIT, we need to have a working emulator in the first place. The first part of this
series will be focused on how to create a working Gameboy emulator that can emulate most games
accurately. The following post will be on how to take this emulator and then optimise it using a
JIT.

## What is "emulation"?

Emulation is the technique by which a guest system is run on a host system. In this case, the guest
system is the original Nintendo Gameboy, and the host system is my laptop.

What we need to understand however, is that the Gameboy's architecture and design is completely different
to our modern pieces of hardware. For example, the Gameboy's Sharp LR35902 is based on the Zilog Z80
ISA, whereas (most) modern CPU's on computers and laptops are based on the x86 ISA. The Gameboy's
Pixel Processing Unit (PPU) is also a completely custom bit of hardware designed to push pixels
to the screen, and again does not hold any resemblance to modern monitors. This leaves us with a
big question, how do we play Gameboy games on modern hardware?

If your answer was through emulating the Gameboy's hardware, then you'd be right! What we can do,
is we can recreate the Gameboy's hardware and internal state from the ground up, so that when we start
executing a game's rom, we can *trick* the game into thinking it's being run on actual hardware.

So, how exactly do we begin this process? We first start where all things start in computer science:
memory.

## The Gameboy's memory map

First, let's have a look at how the 16 bit memory bus of the Gameboy is structured
(courtesy of the great resource: https://gbdev.io/pandocs/):

![Memory map](./images/memory_map.png)

From here we can see that the game's ROM is mapped from `0x0000` to `0x7FFF`. Great! Let's load the
game's rom into this region and start executing instructions!

## Executing instructions, an interpreter

Let's do a quick rundown of how the internals of a CPU work. The Gameboy's program counter starts at
the position `0x0000`. It also has a stack pointer, and 4 registers `AF`, `BC`, `DE` and `HL`.

Gameboy instructions are variable length, and can be decoded using *this* opcode table.
Once we figure out what instruction we're dealing with, we simply need to "emulate"
how the instruction works. Let's show an example:

Let's take this opcode: `0x04`. Looking at the opcode table - we can see that this decodes to
`INC B`. Let's look at the instruction reference [here](https://rgbds.gbdev.io/docs/v0.5.1/gbz80.7#INC_r8)

Nice! So let's look at the implementation that I've written:

```cpp
int GBInterpreter::inc_r8(Core& core, uint8_t r8) {
  auto& src = get_r8(core, r8);
  core.set_flag(Regs::H, (src & 0xf) == 0xf);
  src++;
  core.set_flag(Regs::Z, src == 0);
  core.set_flag(Regs::N, false);

  return 0;
}
```

## The Pixel Processing Unit

## Interrupts, timing, and putting it all together

## Future Topics

The project's future posts will delve into JIT compilation to optimize the emulator further.
The focus will be on enhancing performance and accuracy for a wide range of Gameboy games.

[Next article](../recompiler_boy_part_2)
