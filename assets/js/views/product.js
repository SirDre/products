/**
 * AG Store - Assignment 2
 *
 * Single product view: gallery, details, specifications/reviews tabs and a
 * strip of related products.
 *
 * The listeners that belong to the page furniture (the add form, the main
 * image, the two tabs) are attached once in build(); render() only swaps the
 * data, so navigating between products does not pile up duplicate handlers.
 * The thumbnails are different: they are rebuilt for every product, so each
 * one gets its own listener as it is created, the way the Chapter 10 extended
 * example builds its city buttons.
 *
 *
 * Reference:
 * - Assignment 2 specification
 * - https://shop.merch.google/ - styling and color reference.
 * - Fundamentals of Web Development, Chapters 8-10
 *     - Ch 10 "Classes" - class / constructor / methods.
 *     - Ch 10 "Modules" - export, and module scope instead of globals.
 *     - Ch 8 "Objects" - a plain object used as a lookup table, read with square-bracket notation (8.7.1).
 *     - Ch 8 "Arrays" - push(), indexOf(), slice(), length, spread syntax.
 *     - Ch 8 "Functions" - defining and invoking functions, passing arguments.
 *
 * Author: Andre Gardiner
 */

import {
    cloneTemplate,
    el,
    emptyElement,
    formatDate,
    formatPrice,
    openModal,
    setImage,
    starsElement
} from '../helpers.js';


// Single product view class.
export class ProductView {

    constructor(catalogue, cart, navigate) {
        this.catalogue = catalogue;
        this.cart = cart;
        this.navigate = navigate;
        this.product = null;
        this.isBuilt = false;

        // The main container element for the single product view.
        // this.element = document.querySelector('#home');
        this.element = document.querySelector('#singleproduct');
        this.quantityInput = document.querySelector('#product_quantity');
        this.mainImage = document.querySelector('#product_image');
        this.thumbList = document.querySelector('#product_thumbs');
    }

    /**
     * Renders the product view for the given product id.
     */
    render(param) {

        // Get the product by its id from the catalogue.
        const product = this.catalogue.byId(parseInt(param));

        if (!product) {
            console.error('That product could not be found.');
            this.navigate('browse');
            return;
        }

        if (!this.isBuilt) {
            this.build();
            this.isBuilt = true;
        }

        this.product = product;
        this.renderBreadcrumb(product);
        this.renderGallery(product);
        this.renderDetails(product);
        this.renderSpecifications(product);
        this.renderReviews(product);

        this.quantityInput.value = 1;
        this.selectTab('specs');
    }

    /**
     * Attaches the listeners that stay in place for the life of the page.
     */
    build() {

        // Attach event listeners for the add-to-cart form, image button, and tabs.
        document.querySelector('#add_form').addEventListener('submit', () => {
            this.addCurrentProductToCart();
        });

        // Attach event listener for the image button to open the lightbox.
        document.querySelector('#product_image_button').addEventListener('click', () => {
            let image = document.querySelector('#lightbox_image');
            image.src = this.mainImage.src;
            image.alt = this.mainImage.alt;
            openModal('lightbox');
        });

        // Attach event listeners for the tab buttons.
        for (let tab of document.querySelectorAll('.tab')) {
            tab.addEventListener('click', () => this.selectTab(tab.dataset.tab));
        }
    }

    /**
     * Returns the value if it is defined and non-empty; otherwise, returns the fallback.
     */
    isEmpty(value, fallback) {
        if (value === undefined || value === null || value === '') {
            return fallback;
        }
        return value;
    }


    /** ---- actions ----  */


    /**
     * Adds the currently displayed product to the cart with the specified quantity.
     */
    addCurrentProductToCart() {
        let quantity = parseInt(this.quantityInput.value);
        if (isNaN(quantity) || quantity < 1) {
            quantity = 1;
        }
        this.cart.add(this.product.id, quantity);

        const unit = quantity === 1 ? 'item' : 'items';
        console.log(`Added ${quantity} ${unit} of ${this.product.title} to your cart.`);
    }


    /**
     * Swaps the large image without reloading the rest of the view.
     */
    showImage(source) {

        this.mainImage.src = source;

        // Update the active thumbnail button to match the displayed image.
        for (let button of this.thumbList.querySelectorAll('.product_thumb_button')) {
            if (button.dataset.source === source) {
                button.classList.add('is_active');
            } else {
                button.classList.remove('is_active');
            }
        }
        console.log(`Displayed image: ${source}`);
    }

    /**
     * Shows one tab panel and hides the other.
     */
    selectTab(name) {

        // Deselect all tabs and hide all panels before selecting the new one.
        for (let tab of document.querySelectorAll('.tab')) {

            let panel = document.querySelector(`#panel_${tab.dataset.tab}`); // Find the corresponding panel for this tab.

            let selected = tab.dataset.tab === name;

            tab.setAttribute('aria-selected', selected); // Mark the tab as selected or not for accessibility.
 
        }
        console.log(`Selected tab: ${name}`);
    }


    /** ---- rendering ----  */

    /**
     * Home > Category > Product title. The first two links work, which the
     * assignment lists as a bonus.
     *
     * Both links hold only text, so they are picked up by the one delegated
     * navigation listener in router.js: the view to switch to is in data-view
     * and the category to pre-select is in data-param (Ch 9, 9.3.6).
     * 
     */
    renderBreadcrumb(product) {
        let list = document.querySelector('#breadcrumb_list');

        emptyElement(list); // Clear any existing breadcrumb items.

        let crumbs = [
            { label: 'Home', view: 'home', param: '' },
            { label: (product.category), view: 'browse', param: product.category },
            { label: product.title, view: '', param: '' }
        ];

        // Render each breadcrumb item.
        for (let crumb of crumbs) {
            let item = el('li', 'breadcrumb_item'); // Create a list item for the breadcrumb.

            if (crumb.view) {
                let link = el('a');
                link.textContent = crumb.label;
                link.dataset.view = crumb.view;
                link.dataset.param = crumb.param;
                item.appendChild(link);
            } else {
                item.textContent = crumb.label;
            }

            list.appendChild(item);
        }
        console.log(`Rendered breadcrumb for product: ${product.title}`);
    }

    /**
     * Renders the main product image and any additional thumbnails.
     */
    renderGallery(product) {

        let media = document.querySelector('#product_media');

        let images = [product.thumbnail];

        // If the product has additional images, use them instead of the thumbnail.
        if (Array.isArray(product.images) && product.images.length > 0) {
            images = product.images;
        }

        media.classList.remove('no_image'); // Remove the no_image class if it was previously set.

        setImage(this.mainImage, images[0], product.title, media);

        emptyElement(this.thumbList); // Clear any existing thumbnail items.
 

        // Loop through each image source and create a thumbnail button.
        for (let source of images) {

            let item = el('li', 'product_thumb');
            let button = el('button', 'product_thumb_button');
            let thumb = el('img', 'product_thumb_image');

            button.type = 'button';
            button.dataset.source = source;
            button.setAttribute('aria-label', `Show another view of ${product.title}`);

            thumb.src = source;
            thumb.alt = '';

            button.appendChild(thumb);
            button.addEventListener('click', () => this.showImage(source));
            item.appendChild(button);
            this.thumbList.appendChild(item);
        }
        this.thumbList.classList.remove('hidden');
        this.showImage(images[0]);
        console.log(`Displayed main image for product: ${product.title}`);
    
    }

    /**
     * Renders the product details including title, price, rating, tags, stock, and description.
     */
    renderDetails(product) {
        document.querySelector('#product_category').textContent = (product.category);
        document.querySelector('#product_title').textContent = product.title;
        document.querySelector('#product_price').textContent = formatPrice(product.price);

        let discount = parseFloat(product.discountPercentage);
        let saving = document.querySelector('#product_was');
        let rating = document.querySelector('#product_rating');
        let tags = document.querySelector('#product_tags');
        let stockBadge = document.querySelector('#product_stock');

        let stock = parseInt(product.stock);

        // Ensure stock is a valid number.
        if (isNaN(stock) || stock < 0) {
            stock = 0;
        }

        // Ensure discount is a valid number.
        if (isNaN(discount)) {
            discount = 0;
        }

        // Show the saving badge only if there is a discount.
        if (discount > 0) {
            saving.textContent = `Save ${discount.toFixed(0)}%`;
            saving.classList.remove('hidden');
        } else {
            saving.textContent = '';
            saving.classList.add('hidden');
        }

        document.querySelector('#product_sku').textContent = `SKU ${this.isEmpty(product.sku, '000-000-000-000')}`;

        emptyElement(rating); // Clear existing rating before adding new stars.

        rating.appendChild(starsElement(product.rating, true));

        emptyElement(tags); // Clear existing tags before adding new ones.

        // Add each tag as a pill element.
        if (Array.isArray(product.tags)) {
            for (let tag of product.tags) {
                tags.appendChild(el('li', 'pill', (tag)));
            }
        }
 
        console.log(`Rendered details for product: ${product.title}`);
        document.querySelector('#product_description').textContent = this.isEmpty(product.description, '');
    }

    /**
     * Renders the product specifications tab.
     */
    renderSpecifications(product) {

        let list = document.querySelector('#spec_list');
        
        let NOT_PUBLISHED = 'Not published';

        let size = product.dimensions;

        let dimensions = size
            ? `${size.width} × ${size.height} × ${size.depth} cm`
            : NOT_PUBLISHED;

        let weight = product.weight === undefined
            ? NOT_PUBLISHED
            : `${product.weight} kg`;

        /* An array of arrays, each one a term and its value (Ch 8, 8.6). */
        let rows = [
            ['Brand', this.isEmpty(product.brand, 'Unbranded')],
            ['SKU', this.isEmpty(product.sku, NOT_PUBLISHED)],
            ['Weight', weight],
            ['Dimensions (W × H × D)', dimensions],
            ['Warranty', this.isEmpty(product.warrantyInformation, NOT_PUBLISHED)],
            ['Shipping', this.isEmpty(product.shippingInformation, NOT_PUBLISHED)],
            ['Return policy', this.isEmpty(product.returnPolicy, NOT_PUBLISHED)],
            ['Availability', this.isEmpty(product.availabilityStatus, NOT_PUBLISHED)],
            ['Minimum order', `${this.isEmpty(product.minimumOrderQuantity, 1)} units`]
        ];

        emptyElement(list); // Clear the existing specification rows before adding new ones.

        // Render each specification row as a term-value pair.
        for (let row of rows) {
            let node = cloneTemplate('spec_row_template', '.spec_row');
            
            console.log(`Rendered specification row: ${row[0]} - ${row[1]}`);
            list.appendChild(node);
        }
        console.log(`Rendered specifications for product: ${product.title}`); 
    }

    /**
     * Renders the product reviews tab, displaying a scrollable list with stars, comment, date, and name.
     */
    renderReviews(product) {

        let reviews = Array.isArray(product.reviews) ? product.reviews : [];
        let summary = document.querySelector('#review_summary');
        let list = document.querySelector('#review_list');

        emptyElement(list); // Clear existing reviews before adding new ones.

        if (reviews.length === 0) {
            summary.textContent = 'This product has no reviews yet.';
            return;
        }
 
        // Render each review as a list item with the reviewer's name, stars, date, and comment.
        for (let review of reviews) {
            let item = cloneTemplate('review_template', '.review');
            item.querySelector('.review_name').textContent = this.isEmpty(review.reviewerName, 'Anonymous');
            item.querySelector('.review_stars').appendChild(starsElement(this.isEmpty(review.rating, 0)));
            item.querySelector('.review_date').textContent = this.isEmpty(formatDate(review.date), '');
            item.querySelector('.review_comment').textContent = this.isEmpty(review.comment, '');

            list.appendChild(item);
        }

        console.log(`Rendered reviews for product: ${product.title}`);
    }

}
