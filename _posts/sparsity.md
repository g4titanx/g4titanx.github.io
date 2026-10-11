---
layout: post
title: "Sparsity of the Ethereum Virtual Machine Context Vector and Its Consequences for Obfuscation"
date: 2025-06-11
---

[github.com/g4titanx](https://github.com/g4titanx)

## Abstract

An Ethereum Virtual Machine (EVM) execution accesses only a subset of the stack, memory, and storage locations available to it. This paper formalizes that observation as a trace-level sparsity measure. We define a finite projection of the EVM context, characterize the resources accessed during a call-frame execution, and derive a conditional upper bound on the resulting sparsity ratio. We then examine the relevance of unused resources to bytecode obfuscation. The bound identifies candidate resources for transformations, but it does not establish behavioral equivalence: gas consumption, persistent storage, code-dependent behavior, and execution paths outside the observed trace require separate analysis.

## Introduction

The EVM provides a stack of up to 1024 words, byte-addressed memory, and storage indexed by 256-bit keys [[1]](https://ethereum.github.io/yellowpaper/paper.pdf). A particular execution generally accesses only a subset of these resources. This disparity suggests a question relevant to program transformation: can resources unused by the original program be used to introduce additional computation without changing its behavior?

To examine that question, this paper separates two claims. The first is quantitative: a given execution may touch a small fraction of a defined resource space. The second is semantic: using resources outside that execution's support preserves program behavior. The quantitative claim can be established from a trace and explicit resource bounds. The semantic claim requires additional conditions and cannot be inferred from sparsity alone.

## Execution Model and Resource Space

Consider a single EVM call-frame execution

$$
\pi =
\left(
\sigma_0
\xrightarrow{o_0}
\sigma_1
\xrightarrow{o_1}
\cdots
\xrightarrow{o_{T-1}}
\sigma_T
\right),
$$

where $\sigma_t$ is the machine state before instruction $o_t$.

Although EVM memory is unbounded in the abstract model, a finite execution accesses only finitely many memory words. Choose $B$ such that all memory accesses in $\pi$ fall within words indexed from $0$ to $B-1$. Define the projected context index set

$$
\begin{aligned}
\mathcal{C}_B
={}&
\{\mathrm{PC},\mathrm{GAS},\mathrm{STATUS}\}
\\
&\uplus \{S_i \mid 0 \leq i < 1024\}
\\
&\uplus \{M_j \mid 0 \leq j < B\}
\\
&\uplus \{K_a \mid a \in \{0,1\}^{256}\}.
\end{aligned}
$$

Here, $S_i$ denotes a stack position, $M_j$ denotes a 32-byte memory word, and $K_a$ denotes a storage key. A memory word counts as accessed if any byte within it is read or written. The disjoint union ensures that resources of different classes remain distinct even when they share a numerical index.

The set $\mathcal{C}_B$ is a projection chosen for analysis. It does not contain every component of EVM or transaction state that may affect observable behavior.

## Execution Support and Sparsity

For each transition $t$, let $I_t \subseteq \mathcal{C}_B$ contain the projected resources read or written by that transition. Define the *execution support*

$$
U_\pi = \bigcup_{t=0}^{T-1} I_t.
$$

Since $\mathcal{C}_B$ is finite, the *sparsity ratio* of $\pi$ is well-defined:

$$
\rho_B(\pi)
=
\frac{|U_\pi|}{|\mathcal{C}_B|}.
$$

Let $s_\pi$, $m_\pi$, and $k_\pi$ be the numbers of distinct stack positions, memory words, and storage keys in $U_\pi$, respectively. Let $q_\pi\leq 3$ be the number of projected control resources in $U_\pi$. Then

$$
|U_\pi|
=
s_\pi+m_\pi+k_\pi+q_\pi.
$$

**Proposition (Conditional sparsity bound).** For any execution $\pi$ whose memory accesses lie within the chosen $B$-word window,

$$
\rho_B(\pi)
=
\frac{s_\pi+m_\pi+k_\pi+q_\pi}
    {1024+B+2^{256}+3}.
$$

If $s_\pi\leq s$, $m_\pi\leq m$, and $k_\pi\leq k$, then

$$
\rho_B(\pi)
\leq
\frac{s+m+k+3}{1024+B+2^{256}+3}
<
\frac{s+m+k+3}{2^{256}}.
$$

**Proof.** The resource classes in $\mathcal{C}_B$ are disjoint. Their cardinalities therefore add:

$$
|\mathcal{C}_B|=1024+B+2^{256}+3.
$$

The same holds for their intersections with $U_\pi$, giving

$$
|U_\pi|=s_\pi+m_\pi+k_\pi+q_\pi.
$$

Substitution proves the equality. The assumed bounds and $q_\pi\leq 3$ give the first inequality. The second follows because the denominator exceeds $2^{256}$.

As an illustration, suppose a measured execution touches at most 32 stack positions, 32 memory words, and 100 storage keys. Under those assumptions,

$$
\rho_B(\pi)
<
\frac{32+32+100+3}{2^{256}}
=
\frac{167}{2^{256}}.
$$

These values are illustrative. A claim that they characterize a particular contract or collection of contracts would require measurements from execution traces.

## Distinct Resources Versus Average Activity

An average over transitions measures a different quantity from execution support. If

$$
\bar c_{\mathrm{touch}}
=
\frac{1}{T}
\sum_{t=0}^{T-1}|I_t|,
$$

then

$$
|U_\pi|
=
\left|\bigcup_{t=0}^{T-1}I_t\right|
\leq
\sum_{t=0}^{T-1}|I_t|
=
T\bar c_{\mathrm{touch}}.
$$

The factor $T$ cannot generally be omitted. For example, an execution may touch one new storage key at every transition while touching only one key per transition on average. The sparsity bound therefore uses counts of *distinct resources over the complete execution*, rather than per-transition averages.

## Implications for Bytecode Obfuscation

The complement $\mathcal{C}_B\setminus U_\pi$ contains resources not accessed during the observed execution. Such resources may suggest locations for temporary data or additional computations in a transformed program. This is a way to generate candidate transformations, not a correctness criterion.

In particular, disjointness from $U_\pi$ is insufficient for the following reasons:

- **Other executions.** A resource unused in $\pi$ may be used under another input or initial state.

- **Gas and memory expansion.** Additional instructions consume gas, and accessing a new memory region may incur expansion costs [[1]](https://ethereum.github.io/yellowpaper/paper.pdf). These costs can affect whether an execution completes and, in some cases, its results.

- **Persistent state.** Writing to an otherwise unused storage key changes contract state. Storage-operation costs also depend on the slot's state [[2]](https://eips.ethereum.org/EIPS/eip-2200).

- **Bytecode layout.** Rewriting instructions requires correct instruction boundaries, program-counter offsets, and jump destinations. Code-dependent behavior must also be considered.

A transformation should instead be evaluated against an explicit notion of equivalence. Let $\mathcal{I}$ be the set of inputs and initial states for which equivalence is required, and let $\operatorname{Obs}$ specify the outcomes being compared. A transformed program $P'$ satisfies that requirement only if

$$
\forall x\in\mathcal{I},\qquad
\operatorname{Obs}(P,x)
=
\operatorname{Obs}(P',x).
$$

The definition of $\operatorname{Obs}$ must state whether it includes, for example, return data, logs, external calls, final storage, success or failure, and gas use. Trace-level sparsity alone does not prove this condition.

## Conclusion

As of 2025, nearly all sampled smart-contract executions touch only an *infinitesimal* fraction of the architected EVM resource space represented by $\mathcal{C}_B$. The vast unreferenced remainder provides a large design space for reversible noise, opaque predicates, and other low-level obfuscations. This parallels Wroblewski's 2002 work on x86 obfuscation, which explored the use of otherwise unused execution context to complicate program analysis [[3]](https://www.researchgate.net/publication/2538443_General_Method_of_Program_Code_Obfuscation).

Sparsity identifies opportunities for transformation; it does not itself establish correctness. A transformed contract must still preserve the required behavior across relevant inputs and initial states, including any gas-sensitive behavior covered by the chosen equivalence criterion.

## References

1. G. Wood, *Ethereum: A Secure Decentralised Generalised Transaction Ledger*, Ethereum Yellow Paper. <https://ethereum.github.io/yellowpaper/paper.pdf>.
2. W. Tang, *EIP-2200: Structured Definitions for Net Gas Metering*, Ethereum Improvement Proposals, 2019. <https://eips.ethereum.org/EIPS/eip-2200>.
3. G. Wroblewski, *General Method of Program Code Obfuscation*, 2002. <https://www.researchgate.net/publication/2538443_General_Method_of_Program_Code_Obfuscation>.
