---
layout: post
title: "can we solve smart contract obfuscation by writing them in esolangs?"
date: 2025-05-01
---

i am currently researching the possibilities of smart contract obfuscation and i couldn’t help but put to writing an interesting idea that keeps popping in my head  (given that i want to explore every area of possibility): *are esolangs the key to solving ethereum smart contracts obfuscation?*

you can read all about [esolangs](https://esolangs.org/wiki/Main_Page) here, so we don't have to go deep into what they are and what they aren't but for some reason i feel i can spare a paragraph defining what esoteric programming languages (esolangs) are. so here we go

*note: bear in mind that this is basically a random thought i had and none of this is even real yet, this is just me exploring the possibility of what is possible and what's not*

## what are esolangs?

esoteric programming languages (esolangs) are programming languages created for fun, or to push the limits of what a programming language can be. unlike practical languages like rust, solidity or python, esolangs often prioritize obscurity, minimalism, or outright absurdity over usability e.g. brainfuck. these languages are deliberately unconventional, making them a playground for creative coders and in most cases, a nightmare for anyone trying to decipher the code.

for smart contract obfuscation, this "quirkiness" is exactly what makes esolangs intriguing. obfuscation aims to make code hard to understand or reverse-engineer while preserving its functionality. esolangs, with their inherent complexity and non-intuitive syntax, seem like a natural fit for creating code that’s tough to crack. i mean it basically felt like a divine link within my head when i read on esolangs

## why esolangs for smart contract obfuscation?

smart contracts on ethereum, typically written in solidity, are compiled into evm bytecode and deployed on the blockchain. this bytecode is publicly accessible, making it a target for reverse engineering by attackers looking to exploit vulnerabilities or steal intellectual property.

existing obfuscation techniques, like those in the [bosc approach](https://titan.csit.rmit.edu.au/~e13322/hai_dong/papers/Bytecode_Obfuscation_for_Smart_Contracts.pdf), use methods such as incomplete instruction obfuscation or control flow flattening to complicate decompilation. similarly, [the bian tool](https://yanxiao6.github.io/papers/BiAn.pdf) obfuscates solidity source code by tweaking data flows and control structures. but these methods often come with trade-offs, like increased gas costs, the only notable worthy trade-off i can mention at the moment. they could be better solutions than this i mean, i am currently researching them and hopefully build a tool that does it.

anyways, an esolang designed for evm obfuscation could take things further. it’s unconventional syntax could make the source code itself a puzzle, making conventional more difficult for reverse engineers. it would confuse decompilers that rely on standard solidity patterns. we could even have randomized compilation i.e. the compiler could introduce variability, generating different bytecode for the same logic each time, thwarting pattern-based attacks.

but is this even feasible? let’s sketch out what such a language, let's call it ***kiki***, might look like and how it could work.

## a quick rough thought process of what kiki could be

now, imagine kiki, a carefully designed esolang crafted to make smart contract bytecode as cryptic as possible while still running correctly on the evm. here’s a speculative design:

> syntax and semantics
- cryptic symbols: instead of readable keywords like function or if, kiki could use single-character operators or glyphs, like `^` for functions or `~` for assignments. this makes the source code look like a cipher.

- polymorphic expressions: the same logic could be written in multiple ways, with the compiler picking one randomly. for example, adding two numbers, `x` and `y` could be `x + y` -> `(x * 1) + (y ^ 0)`, or a more convoluted stack manipulation.

> compilation process

```
[kiki source code] → [parser → ast] → [obfuscation transforms] → [randomization engine] → [evm IR] → [obfuscated evm bytecode (.bin)]
```

so basically, the cryptic source code is parsed into an abstract syntax tree (ast), and then apply tricks like turning straightforward loops into a tangled state machine or tossing in junk instructions that do nothing. it might shuffle how data moves through the evm’s stack to hide what’s going on. a randomization step could ensure the bytecode looks different each time, even for the same code. by the end, you’d get evm bytecode packed with noise, like fake jumps or unused memory writes, ready to stump decompilers.

## could it work?

thinking through kiki, it’s tempting to imagine it making smart contract reverse engineering a real headache. the weird source code and unpredictable bytecode could trip up tools like decompilers, maybe even to the point where they just give up. it’s fun to picture a contract that’s so cryptic it protects its logic better than anything we’ve got now.

adding extra noise to the bytecode would obviously increse gas costs. existing tools already struggle with this, bosc, for example, could add enough gas to make contracts noticeably more expensive. kiki’s approach might be even heavier, which could make it impractical for real-world use (maybe we could substantially optimize it?). then there’s the issue of actually writing and checking the code. kiki’s cryptic style would be a pain for developers, and auditors, who need clear logic to spot bugs and for contract verification, but then a huge part of contracts deployed on the evm are unverified. the ethereum ecosystem is also deeply tied to solidity, so getting anyone to adopt something this out-there would be a tough sell. plus, the evm’s limited set of instructions puts a cap on how creative you can get with obfuscation, there’s only so much room to maneuver.

on top of that, decompilers and analysis tools are always getting smarter. what seems unbreakable today might not hold up tomorrow, especially if someone builds a tool specifically to tackle kiki’s tricks. testing this idea would mean building a small compiler, trying it on a simple contract, and seeing how it holds up against decompilers and gas costs. if it works decently without breaking the bank, it’d be worth digging deeper. if it’s a gas hog or too hard to use, it might just stay a neat thought experiment.

i might end up building a rough prototype of this and see what happens.