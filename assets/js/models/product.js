/**
 * AG Store - Assignment 2
 *
 * The product catalogue: loading, caching, filtering and sorting.
 *
 * The catalogue supports loading, caching, filtering, and sorting of products.
 * It provides methods to query products by ID, category, rating, and price range.
 *
 * Reference:
 * - Assignment 2 specification
 * - https://shop.merch.google/ 
 * - Fundamentals of Web Development, Chapters 8-10
 *     - Ch 10 "Classes" - class / constructor / methods.
 *     - Ch 10 "Modules" - export, and module scope instead of globals.
 *     - Ch 8 "Objects" - a plain object used as a lookup table, read with square-bracket notation (8.7.1).
 *     - Ch 8 "Arrays" - push(), indexOf(), slice(), length, spread syntax.
 *
 * Author: Andre Gardiner
 */

import {
 compareText
} from '../helpers.js';

// The default sort order for the catalogue.
export const DEFAULT_SORT = 'name';

/**
 * Converts a decimal rating to the number of whole stars.
 * For example: 4.7 becomes 4
 */
function wholeStars(rating) {
  return Math.floor(rating);
}

// Product class represents a collection of products and provides utility methods for browsing and querying them.
export class Product {

    constructor(products) {
        this.products = products; // Store the full product list
    }

    /**
     * Finds a product by its id.
     */
    byId(id) {
        for (let product of this.products) {
            if (product.id === id) {
                return product;
            }
        }
    }

    /**
     * Returns the list of unique category names, sorted alphabetically.
     */
    categories() {
        let names = [];

        // Collect unique category names.
        for (let product of this.products) {
            if (names.indexOf(product.category) === -1) {
                names.push(product.category);
            }
        }

        // Sort the names alphabetically using a simple bubble sort.
        for (let i = 0; i < names.length; i++) {
            for (let j = i + 1; j < names.length; j++) {
                if (compareText(names[i], names[j]) > 0) {
                    let current = names[i];
                    names[i] = names[j];
                    names[j] = current;
                }
            }
        }
        return names;
    }

    /**
     * Checks if the product belongs to one of the selected categories.
     */
    matchesCategory(product, categories) {
        return categories.length === 0 || categories.indexOf(product.category) !== -1;
    }

    /**
     * Checks if the product's rating matches one of the selected whole star ratings.
     */
    matchesRating(product, ratings) {
        return ratings.length === 0 || ratings.indexOf(wholeStars(product.rating)) !== -1;
    }

    /**
     * Checks if the product's price falls within the specified bounds.
     */
    matchesPrice(product, over, under) {
        if (over !== null && product.price <= over) {
            return false;
        }
        if (under !== null && product.price >= under) {
            return false;
        }
        return true;
    }

    /**
     * Checks if the product's title matches the search pattern.
     */
    matchesName(product, matcher) {
        if (matcher === null) {
            return true;
        }
        return product.title.toLowerCase().indexOf(matcher) !== -1; // Case-insensitive match.
    }

    /**
     * Filters the products based on the specified criteria.
     * 
     * Example: "Beauty or Fragrances, under $20" should match products in either the Beauty or Fragrances category that are priced under $20.
     */
    filter(criteria) {

        const matches = []; // Initialize the array to hold matching products.

        const matcher = (criteria.name || '').toLowerCase(); // Convert the search term to lowercase for case-insensitive matching.

        // Iterate over all products and apply the filter criteria.
        for (const product of this.products) {
            if (this.matchesName(product, matcher)
                && this.matchesCategory(product, criteria.categories)
                && this.matchesRating(product, criteria.ratings)
                && this.matchesPrice(product, criteria.priceOver, criteria.priceUnder)) {

                matches.push(product); // Add the product to the matches array if it meets all criteria.
            }
        }
        return matches;
    }

    /**
     * Returns the top N products by rating.
     */
    topRated(count) {
        const sorted = [...this.products].sort((a, b) => {
            return b.rating - a.rating;
        });
        return sorted.slice(0, count);
    }

    /**
     * Calculates the average rating across all products.
     */
    averageRating() {
        if (this.products.length === 0) {
            return 0;
        }
        const sum = this.products.reduce((total, product) => total + (product.rating || 0), 0);
        return sum / this.products.length;
    }

    /**
     * Returns the count of products in each category.
     */
    categoryCounts() {
        const counts = {};
        for (let product of this.products) {
            const category = product.category;
            counts[category] = (counts[category] || 0) + 1;
        }
        return counts;
    }

    /**
     * Returns a sample product from a given category.
     */
    sampleFor(category) {
        for (let product of this.products) {
            if (product.category === category) {
                return product;
            }
        }
        return null;
    }

    /**
     * Returns the count of products in each whole star rating (1-5).
     */
    ratingCounts() {
        const counts = {};
        for (let product of this.products) {
            const rating = wholeStars(product.rating);
            counts[rating] = (counts[rating] || 0) + 1;
        }
        return counts;
    }

}

