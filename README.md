# Tailorbird

The Shopify theme for Tailorbird: slow-made jewellery, stitched by hand in Yorkshire.

The theme is built on [Dawn](https://github.com/Shopify/dawn) 16.0.0, Shopify's free reference theme (licence in `DAWN-LICENSE.md`). Dawn handles the header, product pages, bag, checkout and accounts. The Tailorbird sections and styles sit on top, following the Tailorbird branding guide and website wireframes.

## What's here

| Path | What it is |
| --- | --- |
| `assets/tailorbird.css` | Brand styles: type sizes, links, placeholders, cards, forms and the builder. |
| `assets/tailorbird-*.png` | The logo and bird mark, used until the real logo files are uploaded in the theme editor. |
| `sections/tb-hero.liquid` | Big photo with a text box and two buttons. |
| `sections/tb-cards.liquid` | Rows of cards: collections, "three ways", promises, Instagram, how it's made, price tiles, reviews. |
| `sections/tb-image-text.liquid` | Photo beside text, plain, as a colour band or as a rounded panel. |
| `sections/tb-intro.liquid` | Centred title with the little bird. |
| `sections/tb-note.liquid` | A slim panel with a button, for example "Can't find quite the right one?". |
| `sections/tb-events.liquid` | Workshop dates with Book buttons, or markets and stockists. |
| `sections/tb-enquiry.liquid` | The weddings and bridesmaids enquiry form. |
| `sections/tb-collection-hero.liquid` | The collection banner and the row of collection buttons. |
| `sections/tb-design-your-own.liquid` | The Design your own builder. Script in `assets/tb-design.js`. |
| `sections/kit-grid.liquid` | DIY kit cards with "Rather have it made?" links. |
| `sections/tb-help.liquid` | Help pages: side menu, page text, size table, FAQs and contact form. |
| `snippets/tb-*.liquid` | Placeholders, icons, the size table and the product card extras. |
| `templates/*.json` | Page layouts, listed below. |
| `demo/` | The original, pre-Tailorbird demo pages. Shopify ignores this folder. |

## Page templates

| Template | Use it for | Address |
| --- | --- | --- |
| `index` | Home | `/` |
| `collection` | Every collection: Beck, Hedgerow, Dales, Meadow, Tarn, Rockpool, gifts… | `/collections/…` |
| `collection.diy-kits` | The DIY kits collection, with workshops and private parties | `/collections/diy-kits` |
| `product` | Every piece | `/products/…` |
| `product.design` | The Design your own bracelet product | `/products/design-your-own-bracelet` |
| `page.gift-guide` | Gift guide | `/pages/gift-guide` |
| `page.our-story` | Our story, with how it's made and markets further down | `/pages/our-story` |
| `page.size-guide` | Size guide | `/pages/size-guide` |
| `page.faqs`, `page.contact`, `page.help` | FAQs, contact, and any other help page (care…) | `/pages/…` |
| `password` | The holding page shown while the shop is password protected, with an email sign-up | `/password` |
| `404` | Page not found, with the little bird stitching beads | any missing address |

`page.design` is the same builder as `product.design`, kept so the old Design your own page still works.

## Setting it up in Shopify

1. **Logo:** Theme settings › Logo: upload `tailorbird-horizontal-full-colour.svg` from 02-Website / Logo-SVG. Theme settings › Brand information › Image: upload the reversed version for the dark footer. Favicon: `favicon.svg` from 02-Website / Favicons. Until then the theme shows a copy of the logo taken from the branding guide.
2. **Fonts:** Theme settings › Typography is set to Fraunces (headings) and Nunito Sans (body), both from Shopify's free font library. If either is missing, pick it there.
3. **Collections:** create Beck, Hedgerow, Dales, Meadow, Tarn and Rockpool as automated collections, each on a tag (`collection-beck`, `collection-hedgerow` and so on). Add the collection's short line ("Single-strand glass or stone") in a collection metafield called `custom.subtitle`. Also create New this month, Stacks and sets, Charms, the gift collections, DIY kits (choose the `diy-kits` template) and Workshops.
4. **Product tags the theme reads:**
   - `collection-beck` → "from the Beck collection" under the name.
   - `new` → "New" badge; `charm-included` → "Charm included" badge.
   - `one-of-a-kind`, `everyday` or `occasion` → the badges on the product page.
   - A product metafield `custom.subtitle` gives the plain description shown under the name ("Burgundy and black-gold glass bracelet"). A product reference metafield `custom.diy_kit` adds the "Make your own with the DIY kit" box.
5. **Design your own:** create a product called "Design your own bracelet" at £28, with the `product.design` template. Give it a Style option with variants Beck, Hedgerow, Dales and Meadow if the styles should be priced differently. In the theme editor, add bead photos to the colours and, for any charm that costs extra (birthstone), pick a charm product.
6. **Filters:** install Shopify's Search & Discovery app and add filters for Occasion, Made from, Colour, Charms, Charm motif and Price, using product metafields.
7. **Menus (Online Store › Navigation):**
   - Main menu: Shop (Shop all, New this month, the six collections, Stacks and sets, Charms), Design your own, DIY kits (All kits, Workshops, Private parties at `/collections/diy-kits#private`), Gifts (Gift guide and the gift collections, Gift cards), Our story (Our story, How it's made at `/pages/our-story#how-its-made`, Markets and stockists at `/pages/our-story#markets`, Journal).
   - Footer menus with the handles `footer-shop`, `footer-help` and `footer-tailorbird`.
8. **Sizes and making time:** Theme settings › Tailorbird holds the bracelet sizes, the making time and the Design your own address. The size guide, builder and product pages all read from it.

## Holding page

While Online Store › Preferences › Password protection is on, visitors see the Tailorbird holding page (`sections/tb-holding.liquid`). Emails they leave go into Customers, subscribed to email marketing and tagged `newsletter` and `holding-page`, ready for a launch email from Shopify Email. Leave the password message in Preferences blank, because the holding page has its own text.

## Still placeholder

Striped boxes are photos still to take, with the shot from the branding guide's shot list written on them. Anything in [square brackets] is a price, date or detail to confirm, as on the wireframes.
