/**
 * AG Store - Assignment 2
 *
 * Browse view: the filter sidebar, the sort control and the results grid.
 * Handles the rendering and interaction of the browse view, including filters, sorting, and product grid.
 * Provides methods to build and render the filter sidebar, handle user interactions, and update the product grid accordingly.
 *
 *
 * Reference:
 * - Assignment 2 specification
 * - https://shop.merch.google/ - styling and color reference.
 * - Fundamentals of Web Development, Chapters 8-10
 *     - Ch 10 "Classes" - class / constructor / methods.
 *     - Ch 10 "Modules" - export, and module scope instead of globals.
 *     - Ch 9 "Event Delegation" - one change listener per filter group and one click listener
 *     - Ch 9 "Using the Dataset Property" - remove button carries the filter it represents in data
 *     - Ch 9 "Form Events" - the change event on the checkboxes and the <select>
 *
 * Author: Andre Gardiner
 */

import { FilterStatus } from '../models/filter.js';
import {
    DEFAULT_SORT,
} from '../models/product.js';
import {
    cloneTemplate,
    emptyElement,
    renderProductGrid,
    starsElement,
    sortProducts
} from '../helpers.js';

export class PageView {

    constructor(catalogue, cart, navigate, addToCart) {
        this.catalogue = catalogue;
        this.cart = cart;
        this.navigate = navigate;
        this.addToCart = addToCart;
        this.sort = DEFAULT_SORT;
        this.isBuilt = false;

        // Initialize the filter status object to keep track of the current filter state.
        this.filters = new FilterStatus();

        // The main container element for the browse view.
        this.element = document.querySelector('#browse');
        this.nameInput = document.querySelector('#filter_name');
        this.categoryList = document.querySelector('#filter_categories');
        this.ratingList = document.querySelector('#filter_ratings');
        this.priceOverInput = document.querySelector('#filter_price_over');
        this.priceUnderInput = document.querySelector('#filter_price_under');
        this.sortSelect = document.querySelector('#sort_order');
        this.chipList = document.querySelector('#chip_list');
        this.activeFilters = document.querySelector('#active_filters');
        this.countElement = document.querySelector('#results_count');
        this.messageElement = document.querySelector('#results_message');
        this.grid = document.querySelector('#product_grid');
    }

    /**
     * Renders the browse view, optionally pre-selecting a category.
     */
    render(category) {
        if (!this.isBuilt) {
            this.buildCategoryFilters();
            this.buildRatingFilters();
            this.bindEvents();
            this.isBuilt = true;
        }

        if (category) {
            this.filters.categories = [category];
            this.syncControls();
        }

        this.apply();
    }

    /** ---- building the sidebar ----  */

    /**
     * Builds the category checkboxes from the catalogue data.
     */
    buildCategoryFilters() {
        const counts = this.catalogue.categoryCounts();

        // import emptyElement from '../ui.js' - Clear the existing category list before rebuilding it.
        emptyElement(this.categoryList);

        const categories = this.catalogue.categories();

        // Build each category checkbox and append it to the list.
        for (let index = 0; index < categories.length; index++) {
            const category = categories[index];
            const count = counts[category] === undefined ? 0 : counts[category];
            const item = this.createCheckbox(category, (category), count);
            this.categoryList.appendChild(item);
        }
        console.log(`Built category filters.`);
    }

    /**
     * Builds the rating checkboxes, highest first, each labelled with stars.
     */
    buildRatingFilters() {
        const counts = this.catalogue.ratingCounts();

        emptyElement(this.ratingList);

        // Build the rating checkboxes, highest first.
        for (let stars = 0; stars <= 5; stars++) {
            const count = counts[stars] === undefined ? 0 : counts[stars];
            const item = this.createCheckbox(`${stars}`, '', count);
            item.querySelector('.checkbox_text').appendChild(starsElement(stars));
            this.ratingList.appendChild(item);
        }
        console.log(`Built rating filters.`);
    }

    /**
     * Creates a checkbox list item for the filters.
     */
    createCheckbox(value, label, count) {
        const item = cloneTemplate('checkbox_filter_template', '.checkbox_item');
        item.querySelector('.checkbox_input').value = value;
        item.querySelector('.checkbox_text').textContent = label;
        item.querySelector('.checkbox_count').textContent = count;
        return item;
    }

    /** ---- events ----  */

    /**
     * Attaches the event listeners for all filter inputs and the sort select.
     */
    bindEvents() {
        // Listen for input events on the name filter.
        this.nameInput.addEventListener('input', () => {
            this.filters.name = this.nameInput.value;
            this.apply();
        });
        // Listen for changes on the category checkboxes.
        this.categoryList.addEventListener('change', (event) => {
            let box = event.target;
            if (box && box.nodeName.toLowerCase() === 'input') {
                this.filters.toggleCategory(box.value, box.checked);
                this.apply();
            }
        });
        // Listen for changes on the rating checkboxes.
        this.ratingList.addEventListener('change', (event) => {
            let box = event.target;
            if (box && box.nodeName.toLowerCase() === 'input') {
                this.filters.toggleRating(parseInt(box.value), box.checked);
                this.apply();
            }
        });
        console.log(`Bound events for filters and sort select.`);

    }

    /**
     * Switches every filter off and redraws.
     */
    clearFilters() {
        this.filters.reset();
        this.syncControls();
        this.apply();
    }


    /** ---- rendering ----  */

    /**
     * Pushes the filter state back into the sidebar controls. Needed whenever
     * the state changes from somewhere other than the controls themselves,
     * such as removing a chip or following a department tile.
     */
    syncControls() {
        this.nameInput.value = this.filters.name;
        this.priceOverInput.value = this.filters.priceOver === null ? '' : this.filters.priceOver;
        this.priceUnderInput.value = this.filters.priceUnder === null ? '' : this.filters.priceUnder;

    }

    /**
     * Applies the current filters and sort order, then redraws the product grid and count.
     */
    apply() {
        const matches = sortProducts(this.catalogue.filter(this.filters.toCriteria()), this.sort);

        renderProductGrid(
            this.grid,
            matches,
            (product) => this.navigate('product', product.id),
            (product) => this.addToCart(product)
        );
        this.renderCount(matches.length);
        console.log(`Applied filters and rendered ${matches.length} products.`);
    }

    /**
     * Renders the count of matching products and shows a message if none match.
     */
    renderCount(total) {
        this.countElement.textContent = total === 1 ? '1 product' : `${total} products`;

        if (total === 0) {
            this.messageElement.textContent = 'There are no products to show.';
            this.messageElement.classList.remove('hidden');
        } else {
            this.messageElement.classList.add('hidden');
        }
        console.log(`Rendered count: ${total}`);
    }

}
