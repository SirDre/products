# Assignment 1

A single-page product browser that renders the first 20 products from the supplied JSON catalogue as a grid of cards, with no front-end framework and no third-party JavaScript.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | single HTML. Includes the header, footer, view, dialog, and the product card. |
| `assignment1.js` | Assignment module. Imports the catalogue, renders the cards, and handles clicks. |
| `styles.css` | All styling. Design and custom properties, responsive card grid. |
| `data-minifed.json` | The catalogue data. **docs/assets/data/data-minifed.json** |


## Milestone 1
 ### Functionality (products displayed, buttons and images work, hosting).
 - Reads `products` out of `data-minifed.json` and displays the first 20.
 - Each card shows the thumbnail from the data file, the title, and the price.
 - Clicking a thumbnail alerts the product id.
 - Clicking the `+` button alerts the product id and title, and bumps the header cart badge.
