# 攒金金

A personal gold asset tracker for a single user, accessed via the web. Track physical gold holdings (jewelry and gold bars), view daily gold price trends, and see current holding values.

## Language

**Gold Asset** (黄金资产):
A physical gold item owned and tracked. Has a classification, weight in grams, purchase price, and one or more photos.
_Avoid_: item, product, holding, position

**Classification**:
Jewelry or Gold Bar. The top-level type of a Gold Asset.
_Avoid_: category, type, kind

**Jewelry**:
A decorative Gold Asset. Has a subtype: bracelet, chain, ring, necklace, earrings, or pendant.
_Avoid_: accessory, adornment, ornament

**Gold Bar**:
An investment-grade Gold Asset with no subtype.
_Avoid_: bullion, ingot

**Subtype**:
For Jewelry assets: bracelet, chain, ring, necklace, earrings, pendant.
_Avoid_: subcategory, variant, style

**Weight**:
The mass of a Gold Asset in grams. When multiplied by the latest Gold Price, gives the Holding Value.
_Avoid_: grammage, mass

**Purchase Price per Gram** (下单克价):
The per-gram gold market price in RMB at the time of purchase. Used to calculate pure gold-market gain/loss, excluding workmanship fees.
_Avoid_: unit price, cost per gram

**Purchase Price** (买入总价):
The total all-in price in RMB paid when the asset was acquired, including any workmanship fees or premiums.
_Avoid_: cost, buy price, original price

**Gold Price**:
The latest daily RMB/gram price fetched from an external free API, stored as a time series. Drives Holding Value calculations and the trend chart.
_Avoid_: gold rate, spot price, market price

**Holding Value**:
A computed value: Weight × latest Gold Price. Reflects what the asset is worth at current market.
_Avoid_: current value, mark-to-market, valuation

**Photo**:
An image file of a Gold Asset, stored on the local filesystem. Each asset has at least one photo.
_Avoid_: picture, image, attachment

**User**:
The single person who owns all assets and holds the login password. There is no multi-account registration or tenant concept.
_Avoid_: account, member, tenant

## Relationships

- Each **Gold Asset** belongs to the single **User**
- A **Gold Asset** has exactly one **Classification**
- A **Jewelry** asset has exactly one **Subtype**
- A **Gold Bar** asset has no **Subtype**
- A **Gold Asset** has one or more **Photos**
- A **Gold Asset** has one **Weight**, one **Purchase Price**, and one computed **Holding Value**
- **Gold Price** is a daily time series; the latest entry determines all **Holding Values**
- **Gold Price** data is fetched by a backend scheduled task, not on user request

## Boundaries

- No purity/karat tracking — all assets are treated as pure gold for valuation
- No workmanship fee ("工费") tracking — purchase price is the all-in total paid
- Single-user only — password-based login protects public access, but there is no registration, multi-tenancy, or role system
- Daily price granularity — intraday or real-time pricing is out of scope

## Flagged ambiguities

None yet.

## Example dialogue

**Dev:** When I add a 10g gold bar bought at 4,000 RMB, and today's gold price is 520 RMB/g — what's the holding value?

**Expert:** 5,200 RMB. Weight × latest price. The purchase price (4,000) is unrelated to holding value — it's just for your own record of what you paid.

**Dev:** And if I add a 15g necklace bought at 7,500 RMB?

**Expert:** 7,800 RMB holding value. Again, 15 × 520. The fact that it's a necklace (Jewelry, subtype: necklace) doesn't change the math — it's just for filtering and browsing.

**Dev:** What if the latest gold price is from 3 days ago because the API was down?

**Expert:** We use the most recent price we have. The chart shows the gap visually. Holding values are always computed against the latest available data point.
