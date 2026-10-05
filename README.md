# Bracelet shop

A one-page demo website for a handmade, made-to-order heishi bead bracelet shop, with a "design your own bracelet" builder.

## What's here

| File | What it is |
| --- | --- |
| `index.html` | The full site: bestseller banner, bracelet builder, how it's made, size guide, about, FAQ, contact and footer. |
| `configurator.html` | The bracelet builder on its own, as first demoed. |
| `css/site.css` | All the styling for `index.html`: colours, fonts, layout and dark mode. |
| `css/configurator.css` | Styling for `configurator.html`. |
| `img/` | Photos of the five placeholder bead colourways. |
| `docs/bracelet-guide.png` | The bracelet size chart the size options come from. |

## Preview it

Download the repository (green **Code** button, then **Download ZIP**), unzip it and open `index.html` in a browser. No build step or server is needed.

## Changing colours and fonts

The colour palette and fonts are set once at the top of each stylesheet (the `:root` block), with the dark-mode colours just below. Change them there and the whole page follows.

## Changing products, sizes and prices

Everything the shop sells is in the `CONFIG` block near the top of the `<script>` in `index.html`:

- `products`: bead colourways, photo, price per bead and the colours used to draw them.
- `sizes`: the wrist sizes from the size chart.
- `basePrice`: the cord and clasp price (currently £15).
- `bestsellers`: the three designs in the banner.
- `beadLengthCm` and `claspAllowanceCm`: used for the bead limit, `floor((max wrist cm − clasp) ÷ bead length)`.

## Still placeholder

Text and items marked with an orange tag on the page are placeholders: the shop name, bestseller names and prices, the about story, delivery and returns wording, email and Instagram. The basket, checkout, contact form and newsletter signup don't send or save anything yet. On Shopify, the builder would add a single "custom bracelet" product to the cart with the design saved as line item properties.
