# Bracelet shop

A Shopify theme for a handmade, made-to-order heishi bead bracelet shop, with a "design your own bracelet" builder.

The theme is built on [Dawn](https://github.com/Shopify/dawn) 16.0.0, Shopify's free reference theme (licence in `DAWN-LICENSE.md`). Dawn handles the header, product pages, basket, checkout and accounts. The shop's own sections sit on top.

## What's here

| Path | What it is |
| --- | --- |
| `sections/bracelet-banner.liquid` | The sliding bestseller banner with the turning bead ring. |
| `sections/bead-builder.liquid` | The bracelet builder. Script and styles are in `assets/bead-builder.js` and `assets/bead-builder.css`. |
| `sections/size-guide.liquid` | The size chart table and how-to-measure text. |
| `templates/index.json` | The home page: banner, promise strip, builder, how it's made, size guide, about, FAQ, contact and newsletter. |
| `config/settings_data.json` | Shop colours (the green and stone palette) and button shapes. |
| `assets/bead-*.jpg` | Placeholder bead photos, used until real products are linked. |
| `demo/` | The original stand-alone demo pages. Shopify ignores this folder. |
| `docs/bracelet-guide.png` | The size chart the sizes came from. |

Everything else is Dawn, unchanged.

## How the builder sells a bracelet

Each custom bracelet goes into the basket as:

- one **cord and clasp** product (the base price, £15), carrying the size and bead order, and
- one line per bead colourway, with the quantity used (5p each).

All lines from the same bracelet share a `_Bracelet ID`, and the bead lines say which bracelet they're for, so the order shows exactly what to make.

## Setting it up in Shopify

1. **Connect the theme:** Online Store › Themes › Add theme › Connect from GitHub, then pick this repository and the `main` branch.
2. **Create products:**
   - "Cord and clasp" at £15, hidden from search if you like.
   - One product per bead colourway at £0.05 (Blue/Green, Pastel/Multi, Peach/Grey, Purple/Pink, Red/Green). Turn off inventory tracking, or keep stock high, because beads are bought in tens.
   - The three bestsellers as normal products.
3. **Link them in the theme editor (Customise):**
   - In **Bracelet builder**, pick the cord and clasp product, then pick a product in each bead block.
   - In **Bestseller banner**, pick a product in each slide.
4. **Sizes:** Theme settings › Bracelet builder holds the size chart, bead length and clasp allowance. Both the builder and the size guide read from it.
5. **Menu:** Online Store › Navigation › Main menu. Add links to `/#bestsellers`, `/#design`, `/#sizes`, `/#about` and `/#contact`.

## Still placeholder

The bestseller names, the about story, delivery and returns wording and the promise strip are placeholders. Text marked "[Confirm before launch]" needs checking.
