/**
 * AG Store - Assignment 2
 *
 * Home view: hero banner, department tiles and a featured product strip.
 *
 * The content here is derived from the catalogue rather than hard-coded, so
 * the departments shown always match the data that was actually loaded.
 *
 * Reference:
 * - Assignment 2 specification
 * - https://shop.merch.google/ - styling and color reference.
 * - Fundamentals of Web Development, Chapters 8-10
 *     - Ch 10 "Classes" - class / constructor / methods.
 *     - Ch 10 "Modules" - export, and module scope instead of globals.
 *     - Ch 9 "Templates" - appendChild(), addEventListener() and the <template> clone.
 *     - Ch 8 "Closures" - each tile handler remembers its own category.
 *     - Ch 8 "Arrow Syntax" - the callbacks passed to the product grid.
 *
 * Author: Andre Gardiner
 */

import {
    cloneTemplate,
    emptyElement,
    renderProductGrid,
    setImage,
    formatTitle
} from '../helpers.js';

// How many products to show in the featured strip.
const FEATURED_COUNT = 4;

// Home view class for the AG Store. Handles rendering the hero banner, department tiles, and featured products.
export class HomeView {

    constructor(catalogue, cart, navigate, addToCart) {
        this.catalogue = catalogue;
        this.cart = cart;
        this.navigate = navigate;
        this.addToCart = addToCart;
        this.isBuilt = false; // Tracks whether the view has been built before.


        this.element = document.querySelector('#home');
    }

    /**
     * Fills the view with the hero banner, stats, department tiles, and featured products.
     * Does nothing if the view has already been built.
     * Subsequent calls will have no effect.
     */
    render() {
        if (this.isBuilt) {
            return;
        }
        this.renderHero();
        this.renderStats();
        this.renderDepartments();
        this.renderFeatured();
        this.isBuilt = true;
    }

    /**
     * Displays the hero image using the highest rated product.
     */
    renderHero() {

        let best = this.catalogue.topRated(1); // Get the top rated product.

        let image = document.querySelector('#hero_image');

        let star = best[0]; // The highest rated product.

        let source = star.thumbnail;

        if (best.length === 0) {
            return;
        }
        // If the product has images, use the first one instead of the thumbnail.
        if (Array.isArray(star.images) && star.images.length > 0) {
            source = star.images[0];
        }
        // Set the hero image with the chosen source.
        setImage(image, source, star.title, image.parentNode);
        document.querySelector('#hero_caption').textContent = `Pictured: ${star.title}, our highest rated product.`;
    }

    /**
     * Displays the total number of products, categories, and the average rating.
     */
    renderStats() {
        document.querySelector('#home_stat_products').textContent = this.catalogue.products.length;
        document.querySelector('#home_stat_categories').textContent = this.catalogue.categories().length;
        document.querySelector('#home_stat_rating').textContent = this.catalogue.averageRating().toFixed(2); // toFixed() for a fixed number of decimal places.
    }

    /**
     * Renders a tile for each department (category) with a sample image, name, and product count.
     */
    renderDepartments() {
        let counts = this.catalogue.categoryCounts();
        let list = document.querySelector('#department_tiles');
        let categories = this.catalogue.categories();

        // Cleared first so this function can safely be called more than once.
        emptyElement(list);

        // Loop over each category to create its department tile.
        for (let i = 0; i < categories.length; i += 1) {
            let category = categories[i];
            let sample = this.catalogue.sampleFor(category);
            let tile = cloneTemplate('department_tile_template', '.department_tile');
            let link = tile.querySelector('.department_tile_link');

            // Determine the product count for this category.
            let count = counts[category] === undefined ? 0 : counts[category];

            setImage(tile.querySelector('.department_tile_image'), sample ? sample.thumbnail : '', '', link);

            tile.querySelector('.department_tile_name').textContent = formatTitle(category);

            tile.querySelector('.department_tile_count').textContent = count === 1 ? '1 product' : `${count} products`;

            link.addEventListener('click', (event) => {
                event.preventDefault(); //  preventDefault() stops the href="#" jump.
                this.navigate('browse', category);
            });

            list.appendChild(tile);
        }
    }

    /**
     * Shows the best rated products, using the same card as the browse view.
     */
    renderFeatured() {
        renderProductGrid(
            document.querySelector('#featured_grid'),
            this.catalogue.topRated(FEATURED_COUNT),
            (product) => this.navigate('product', product.id),
            (product) => this.addToCart(product)
        );
    }
}
