---
title: Reading the volatility surface
date: 2026-05-05
author: Yuan Wang
category: Quant
tags: vol, options, quant, math
readTime: 11 min read
excerpt: A walk through what implied volatility actually means, why the smile and term structure refuse to flatten, and a practical SVI parameterization that fits market quotes well enough to trade against.
---

The first thing you learn about Black–Scholes is that it assumes constant volatility. The first thing you learn about real markets is that they don't. Take any liquid options chain — SPX, AAPL, BTC — back out the implied vol from each quote, and the surface you get isn't a flat plane: it bends across strike, sags or steepens with maturity, and shifts shape every time the spot moves a few percent. The shape of that surface contains, in a fairly literal sense, everything the market is willing to commit to about future returns: skew, kurtosis, jump risk, term-structure expectations. Reading it is part of the job.

This post is a careful walk through the geometry: what an implied vol surface is, why it has the shape it does, and how to parameterize it so you can fit one to market quotes and use it.

## What "implied volatility" actually means

Black–Scholes prices a European call as

$$
C(S, K, T, \sigma) = S\,N(d_1) - K e^{-rT}\,N(d_2)
$$

with

$$
d_1 = \frac{\log(S/K) + (r + \tfrac{1}{2}\sigma^2)\,T}{\sigma\sqrt{T}}, \qquad d_2 = d_1 - \sigma\sqrt{T}.
$$

Fix the market price $C^{\text{mkt}}$ and solve for the single $\sigma$ that reproduces it. The number you get is the *implied volatility* $\sigma_{\text{imp}}(K, T)$. This is **not** an estimate of realized volatility — it's the constant vol that, plugged into the Black–Scholes machine, would justify the price someone is paying for that contract today.

Two consequences follow. First, implied vol is a clean, comparable number across strikes and maturities — option prices have wildly different scales, but their implied vols all live in the same neighborhood (typically 10%–60% for liquid equity names). Second, because the market doesn't actually believe vol is constant, $\sigma_{\text{imp}}$ varies by $K$ and $T$. The function

$$
\Sigma : (K, T) \mapsto \sigma_{\text{imp}}(K, T)
$$

is the *implied volatility surface*. A horizontal slice at fixed $T$ gives you the *smile* (or *skew*, depending on the asset). A vertical slice at fixed moneyness gives you the *term structure*.

Convention: it's customary to plot the smile not in raw strikes $K$ but in *log-moneyness* $k = \log(K/F)$, where $F = S\,e^{(r - q)T}$ is the forward. This makes smiles at different maturities directly comparable.

## Why the surface isn't flat

If the world looked exactly like Black–Scholes — geometric Brownian returns, constant volatility, no jumps — the surface would be a flat plane at the realized-vol level. It isn't, for three reasons that show up cleanly in the geometry.

**Returns aren't lognormal.** Equity returns have fat left tails: large drops are more likely than a Gaussian model predicts. The market prices that into out-of-the-money put options, which sit at $k < 0$. Higher demand for crash protection raises put prices, and therefore their implied vols. The result is the *equity skew* — implied vol monotonically falling as $k$ increases — visible in any SPX smile.

![Volatility smile at fixed maturity, showing characteristic equity skew. Out-of-the-money puts (left) trade at higher implied vol than ATM, reflecting demand for crash protection.](/figures/vol-smile.svg)

**Vol of vol matters.** Under any stochastic-vol model — Heston, SABR, you pick — the implied surface has *curvature* in $k$, a U-shape. Contracts struck far from the forward have payoffs that benefit asymmetrically from realized vol being uncertain; the more uncertain vol is, the more those contracts are worth. This convexity is visible in single-name equity smiles and is dominant in FX, where the smile is roughly symmetric.

**Time aggregates risks.** Short-dated options sit closest to the next earnings call, the next FOMC, the next jump. Long-dated options average those events out. So the smile is most pronounced at short maturities and *flattens with $T$* — the surface tends toward a plane as $T \to \infty$.

![Smile curves at four maturities. Short-dated smiles are sharply curved; long-dated smiles flatten as event risk averages out.](/figures/vol-smiles-by-maturity.svg)

The term structure tells its own story. In quiet markets, the ATM volatility curve typically slopes upward (*contango*) — long-dated vol is higher than short-dated vol because the longer horizon embeds more uncertainty. After a shock this often inverts: short-dated vol spikes above the long end (*backwardation*), as the market prices in immediate dislocation while expecting things to settle.

![ATM implied vol vs. maturity in a typical regime. The upward slope is contango — uncertainty grows with horizon.](/figures/atm-term-structure.svg)

## Parameterizing the smile

In production you don't store an unstructured grid of vols. You fit a function. The dominant parameterization for equity-style smiles is Gatheral's **SVI** — *Stochastic Volatility Inspired*:

$$
w(k) = a + b\!\left[\rho(k - m) + \sqrt{(k - m)^2 + \sigma^2}\right]
$$

where $w(k) = \sigma_{\text{imp}}^2(k) \cdot T$ is the *total variance* (vol squared times time-to-expiry). The five parameters have clean meanings:

| Parameter | Interpretation |
| --- | --- |
| $a$ | Vertical level — the baseline of total variance |
| $b$ | Slope magnitude — sets how steep the wings are |
| $\rho \in [-1, 1]$ | Asymmetry — negative means equity-style skew |
| $m$ | Horizontal shift of the smile's minimum |
| $\sigma > 0$ | Curvature — how rounded the bottom of the smile is |

SVI has two virtues. First, it's flexible enough to fit nearly every observed smile to within bid–ask. Second — and this is non-trivial — there are explicit conditions on $(a, b, \rho, m, \sigma)$ that guarantee the resulting smile is *arbitrage-free*: no calendar arbitrage, no butterfly arbitrage. The original Gatheral & Jacquier paper works this out in detail.

To fit SVI to a single maturity slice, you minimize the squared error to market vols:

```python
import numpy as np
from scipy.optimize import minimize

def svi(k, params):
    a, b, rho, m, sigma = params
    return a + b * (rho * (k - m) + np.sqrt((k - m) ** 2 + sigma ** 2))

def fit_svi(k_market, w_market, x0=None):
    """Fit SVI to market total variances at log-moneyness k."""
    x0 = x0 or [0.04, 0.1, -0.5, 0.0, 0.1]
    bounds = [
        (1e-6, None),    # a > 0
        (1e-6, None),    # b > 0
        (-0.999, 0.999), # |rho| < 1
        (None, None),    # m unconstrained
        (1e-3, None),    # sigma > 0
    ]
    obj = lambda p: np.mean((svi(k_market, p) - w_market) ** 2)
    res = minimize(obj, x0, method='L-BFGS-B', bounds=bounds)
    return res.x
```

This is the lazy version. Production code adds the explicit no-arbitrage constraints, weighting by inverse bid–ask spread, and a sensible initialization derived from the data — typically $m_0 \approx \arg\min_k w_{\text{mkt}}(k)$. You fit each maturity independently and then enforce calendar consistency across maturities afterward.

For a full surface you have a few options. The cleanest is *SSVI* (Surface SVI), which constrains the parameters to vary smoothly with $T$ in a way that automatically enforces no calendar arbitrage. The cruder option is to fit each slice independently and reject any solution that violates calendar consistency — fast, but produces visible kinks in the surface.

## What you actually do with the fitted surface

A fitted surface is a tool. Three uses come up almost daily:

**Pricing illiquid options.** A trader gets asked for a quote on a strike that doesn't exist on the screen. Look up $\sigma_{\text{imp}}$ from the fitted surface, plug it into Black–Scholes, hand back a price. The surface is the interpolator.

**Computing risk.** Vega isn't a single number — it's a vector along the surface. By bumping the surface in structured ways (parallel shift, smile twist, term-structure tilt) you can decompose vega into modes that correspond to actual hedgeable risks. Most option desks track these modes daily.

**Detecting dislocations.** When the market vol on a particular strike sits well above what the calibrated surface predicts, you've either got a fitting error or a trade. Either way it's a flag worth investigating.

The shape changes over time, of course — calibrate again tomorrow and the parameters will have moved. But the surface itself is remarkably persistent in *form*. Equity skews stay negative. FX smiles stay roughly symmetric. Vol cones drift with the regime. Watch one long enough and you start to read it the way an experienced sailor reads water.

> The surface isn't a model of the world. It's the market's confession of what it doesn't know — written in the only language the Black–Scholes formula speaks.
