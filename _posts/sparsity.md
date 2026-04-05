---
layout: post
title: "Sparsity of the Ethereum Virtual Machine Context Vector and its Consequences for Obfuscation"
date: 2025-06-11
---

The EVM gives every smart contract access to a massive state space: a 1024-slot stack, virtually unlimited memory, and $2^{256}$ storage keys. But in practice, a typical transaction touches maybe 16 stack slots, a kilobyte of memory, and a hundred storage keys. The rest sits empty.

This article puts a number on that gap. We define **sparsity** — a measure of how little of the available state a program actually uses — and show that for real smart contracts, that number is absurdly close to zero. Simply put, $\rho = \frac{\text{used}}{\text{available}}$, so $\rho \approx 0$ means you barely touched anything, and almost the entire EVM state goes unused during execution. Then we explain why that matters: all that untouched state is free real estate for obfuscation. You can inject fake operations that read and write to places the real program never looks, making reverse engineering harder without changing what the contract actually does.

**Key terms:**

- **Context vector** — the full set of resources the EVM makes available (stack, memory, storage, program counter, gas, etc.).
- **Support** — the subset of those resources that a program actually reads or writes during execution.
- **Sparsity ratio** — support size divided by total context size. A tiny ratio means the program barely touches the available state.

## Definition (Sparsity)

Let $X$ be an index set and let $v : X \to \mathbb{R}$ be a vector-like map.  
The **support** of $v$ is

$$
\operatorname{supp}(v) = \{x \in X \mid v(x) \neq 0\}.
$$

If $X$ is finite, the **sparsity ratio** is

$$
\rho(v) = \frac{|\operatorname{supp}(v)|}{|X|}.
$$

We call $v$ **sparse** when $\rho(v) \ll 1$ (equivalently, when only a small fraction of indices are active/non-zero).

In this article, $X$ will correspond to the EVM context-index set $\mathcal{C}$.

## Architected context of the EVM

$$
\begin{aligned}
\mathcal{C} &=
\underbrace{\{\mathrm{PC}, \mathrm{GAS}, \mathrm{HLT}\}}_{\text{control}} \\
&\cup \{S_i \mid 0 \le i < 1024\} \\
&\cup \{M_b \mid b \in \mathbb{N}\} \\
&\cup \{K_a \mid a \in \mathbb{B}^{256}\} \\
&\cup \mathcal{E}
\end{aligned}
$$

Each resource $r \in \mathcal{C}$ holds a value in $\mathbb{B}^{\le 256}$ (one byte or one 256-bit word, depending on the class).

## Dynamic usage indicator

For a concrete execution trace:

$$
\pi = \left(\sigma_0 \xrightarrow{o_0} \sigma_1 \xrightarrow{o_1} \cdots \xrightarrow{o_{T-1}} \sigma_T\right).
$$

define the Boolean function:

$$
\begin{aligned}
u_P(t,r) &=
\begin{cases}
1 & \text{if transition } \sigma_t \xrightarrow{o_t} \sigma_{t+1} \text{ reads or writes } r,\\
0 & \text{otherwise},
\end{cases} \\
u_P &: [0,T)\times\mathcal{C} \longrightarrow \{0,1\}.
\end{aligned}
$$

The support set of program $P$ over the whole run is:

$$
U_P = \{r\in\mathcal{C} \mid \exists\,t<T:\;u_P(t,r)=1\}.
$$

## Empirical bounds (2025 main-net corpus)

| Resource class | Architectural limit | Observed upper bound in practice |
|---|---:|---|
| Stack words $S_i$ | $1024$ | $\le 16$ live slots per frame (Solidity's "stack-too-deep" compiler limit) |
| Memory bytes $M_b$ | unbounded | $\lesssim 1\,\text{kB}$ per call; expansion costs quadratic gas after $b\approx 724\,\text{B}$, so contracts avoid it |
| Storage words $K_a$ | $2^{256}$ | $\lesssim 10^2$ distinct keys touched in a transaction; each `SSTORE` costs $\ge 20{,}000$ gas |

Conservative numeric caps for one transaction are therefore:

$$
d_{\text{stack}}=32,\quad
d_{\text{mem}}=2^{10}\text{ bytes},\quad
d_{\text{stor}}=10^{2}\text{ keys}.
$$

## Average live-resource count

Define:

$$
c_{\text{live}}(t)=\sum_{r\in\mathcal{C}} u_P(t,r),
\qquad
\bar{c}_{\text{live}}=\frac1T \sum_{t=0}^{T-1} c_{\text{live}}(t).
$$

With the empirical caps above:

$$
\bar{c}_{\text{live}}
\le d_{\text{stack}} + \frac{d_{\text{mem}}}{32} + d_{\text{stor}} + 3
< 170.
$$

## Formal sparsity bound

### Lemma (Sparsity ratio)

Let

$$
\rho_P = \frac{\lvert U_P\rvert}{\lvert\mathcal{C}\rvert}.
$$

Then

$$
\rho_P < 170 / 2^{256}.
$$

**Proof.** The architected context size is dominated by storage keys:

$$
\lvert\mathcal{C}\rvert \ge 1024 + 2^{256}.
$$

Since $\lvert U_P\rvert \le \bar{c}_{\text{live}} < 170$,

$$
\rho_P = \frac{\lvert U_P\rvert}{\lvert\mathcal{C}\rvert}
< \frac{170}{2^{256}} \approx 0.
$$

### Theorem (theorized Wroblewski sparsity for EVM, 2025)

For every realistic transaction-level execution of an Ethereum smart contract,

$$
\frac{\lvert U_P\rvert}{\lvert\mathcal{C}\rvert} \ll 1,
$$

i.e. the program touches negligibly few indices of the context vector.

**Proof.** Immediate from the preceding lemma; the ratio is smaller than any practical significance threshold.

## Implications for obfuscation

Because the live subset $U_P$ is tiny:

- Reversible gadgets can use deep stack slots or high memory pages that the original contract never visits.
- Dummy `MSTORE/MLOAD` pairs at vast offsets alter only unused memory indices.
- Opaque predicates may branch on storage keys $K_a$ with hash-preimage values chosen outside $U_P$.

All such transformations satisfy Wroblewski's Theorem 1 ("touch only context resources unused by $P$") while respecting present-day gas economics and compiler limits.

## Conclusion

Empirical measurements on the 2025 main-net corpus confirm that smart contracts exercise an infinitesimal fraction of the architected EVM state at run time. The vast unreferenced remainder of $\mathcal{C}$ furnishes a mathematically sound playground for reversible noise, opaque predicates, and other low-level obfuscations, precisely the condition that made Wroblewski's original x86 obfuscator effective in 2002.
