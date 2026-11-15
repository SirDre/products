/**
 * AG Store - Assignment 2
 *
 * The set of filters currently applied in the Browse view.
 *
 * Holding this in one small object - rather than reading the state back out
 * of the checkboxes every time - means the filter chips, the results list and
 * the sidebar are all driven from a single source of truth.
 *
 * The two multiple-choice filters (category and rating) are kept in ordinary
 * arrays. Chapter 8, 8.6: "an array is a data structure that allows the
 * programmer to collect a number of related elements together in a single
 * variable", and Test Your Knowledge #4 covers all the operations needed here:
 * push() to add, indexOf() to look up, splice() to remove, sort() to order.
 *
 * Reference:
 * - Assignment 2 specification
 * - https://shop.merch.google/ 
 * - Fundamentals of Web Development, Chapters 8-10 
 *     - Ch 10 "Classes" - class / constructor / methods.
 *     - Ch 10 "Modules" - export, and module scope instead of globals.
 *     - Ch 9 "Number Validation" - parseFloat() / isNaN() on the price boxes, and compare a values to detect empty fields.
 *     - Ch 8 "Objects" - the chip descriptions are object literals.
 *     - Ch 8 "Arrays" - push(), indexOf(), slice(), length, spread syntax. 
 *     - Ch 8 "Conditionals" + 8.4.1 "Truthy and Falsy".
 *     - Ch 8 "Concatenation" - template literals for the chip labels.
 *
 * Author: Andre Gardiner
 */


export class FilterStatus {

    constructor() {
        this.reset();
        this.isEmpty();
    }

    /**
     * Returns every filter to its "nothing selected" state.
     */
    reset() {
        this.name = '';
        this.categories = [];
        this.ratings = [];
        this.priceOver = null;
        this.priceUnder = null;
    }

    /**
     * Checks if no filter is currently active.
     */
    isEmpty() {
        return this.name === ''
            && this.categories.length === 0
            && this.ratings.length === 0
            && this.priceOver === null
            && this.priceUnder === null;
    }

    /**
     * Adds or removes one value from the given list based on the selected flag.
     */
    toggleValue(list, value, selected) {

        const position = list.indexOf(value); // Find the position of the value in the list

        if (selected) {
            if (position === -1) {
                list.push(value);
            }
        } else if (position !== -1) {
            list.splice(position, 1);
        }
    }

    /**
     * Adds or removes one category from the filter.
     */
    toggleCategory(category, selected) {
        this.toggleValue(this.categories, category, selected);
    }

    /**
     * Adds or removes one whole-star rating.
     */
    toggleRating(stars, selected) {
        this.toggleValue(this.ratings, stars, selected);
    }

    /**
     * Checks if a given category is currently active in the filter.
     */
    hasCategory(category) {
        return this.categories.indexOf(category) !== -1;
    }

    /**
     * Checks if a given star rating is currently active in the filter.
     */
    hasRating(stars) {
        return this.ratings.indexOf(stars) !== -1;
    }

    /**
     * Sets the price filter for either the lower or upper bound.
     */
    setPrice(bound, rawValue) {
        let value = null;

        // Treat empty strings as null
        if (rawValue !== null && rawValue !== '') {
            const parsed = parseFloat(rawValue);
            if (!isNaN(parsed) && parsed >= 0) {
                value = parsed;
            }
        }

        // Set the appropriate price bound based on the 'bound' argument
        if (bound === 'over') {
            this.priceOver = value;
        } else {
            this.priceUnder = value;
        }
    }

    /**
     * Converts the current filter state into a criteria object suitable for Catalogue.filter().
     */
    toCriteria() {
        return {
            name: this.name,
            categories: this.categories,
            ratings: this.ratings,
            priceOver: this.priceOver,
            priceUnder: this.priceUnder
        };
    }
 
    /**
     * Removes the filter corresponding to the given chip type and value.
     */
    remove(type, value) {
        switch (type) {
            case 'name':
                this.name = '';
                break;
            case 'category':
                this.toggleCategory(value, false);
                break;
            case 'rating':
                this.toggleRating(parseInt(value), false);
                break;
            case 'price_over':
                this.priceOver = null;
                break;
            case 'price_under':
                this.priceUnder = null;
                break;
            default:
                break;
        }
    }
}
