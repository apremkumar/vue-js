var eventBus = new Vue();
Vue.component('product-details', {
    props: {
        details: {
            type: Object,
            required: true
        },
    },
    template: `<ul>
        <li v-for="detail in details">{{detail}}</li>
    </ul>`
});

Vue.component('product', {
    props: {
        cart: Array,
        premium: { type: Boolean, default: false }
    },
    template: `<div class="product">
        <div class="product-image">
            <img :src="image">
        </div>
        <div class="product-info">
            <h1>{{ title }}</h1>
            <span v-if="onSale">On Sale! <a v-show="inStock > 0" :href="link">Link</a></span>
            <p v-if="inStock > 10">In Stock</p>
            <p v-else-if="inStock <= 10 && inStock > 0">Only few items left</p>
            <p v-else :class="{outOfStock: !inStock}">Out of Stock</p>
            <p>{{ description }}</p>
            <product-detail-tabs :shipping="shipping" :details="details"></product-detail-tabs>
            <div>
                <span class="options-parent">
                    <span>Colors:</span>
                    <span class="options">
                        <span v-for="(variant, index) in variants" class="color-box"
                            @mouseover="updateProduct(index)"
                            :style="{display:'inline-block', backgroundColor: variant.color}" :key="variant.id">
                        </span>
                    </span>
                </span>
                <span class="options-parent">
                    <span>Sizes:</span>
                    <span class="options">
                        <span v-for="size in sizes" :key="size.id">{{ size.text }}</span>
                    </span>
                </span>
            </div>
            <div>
                <span>
                    <button v-on:click="addToCart" :disabled="!inStock" :class="{disabledButton: !inStock}">
                        Add to Cart
                    </button>
                    <button :style="{width: '135px'}" v-on:click="removeFromCart" :disabled="!isRemoveEnabled" :class="{disabledButton: !isRemoveEnabled}">
                        Remove from Cart
                    </button>
                </span>
                <span class="spacer"></span>
                <span>Quantity
                    <span>
                        <button :disabled="!inStock" class="spinnerButton" :class="[{disabledButton: !inStock}]"
                            v-on:click="increaseQuantity">+</button>
                    </span>
                    <span>{{quantity}}</span>
                    <span>
                        <button class="spinnerButton" :class="{disabledButton: (!inStock || quantity === 0)}" :disabled="quantity === 0" v-on:click="decreaseQuantity">-</button>
                    </span>
                </span>
            </div>
            <product-tabs :reviews="reviews"></product-tabs>
        </div>
    </div>`,
    data() {
        return {
            quantity: 0,
            brand: 'Vue',
            product: 'Socks',
            link: 'https://vuejs.org',
            onSale: true,
            selectedVariant: 0,
            details: ['80% Woolen', '20% Cotton', 'Gender neutral'],
            description: 'This is a woolen socks that keeps you warm and comfortable even during the heights of winter!',
            variants: [{
                id: 2234,
                color: 'green',
                quantity: 8,
                image: './assets/green_sock.png'
            }, {
                id: 2235,
                color: 'blue',
                quantity: 10,
                image: './assets/blue_sock.png'
            }],
            sizes: [{
                id: 2281,
                text: 'S'
            }, {
                id: 2282,
                text: 'M'
            }, {
                id: 2283,
                text: 'L'
            }],
            reviews: []
        };
    },
    methods: {
        addToCart(productId) {
            this.$emit('add-to-cart', this.currentVariantId, this.quantity);
            this.quantity = 0;
        },
        increaseQuantity() { this.quantity += 1; },
        decreaseQuantity() { this.quantity -= 1; },
        updateProduct(index) {
            this.quantity = 0;
            this.selectedVariant = index;
        },
        updateItemsOfCart() { this.cartEl = this.cartItems; },
        removeFromCart() { this.$emit('remove-from-cart', this.currentVariantId); }
    },
    computed: {
        title() { return this.brand + ' ' + this.product; },
        currentVariantId() { return this.variants[this.selectedVariant].id; },
        image() { return this.variants[this.selectedVariant].image; },
        inStock() { return this.variants[this.selectedVariant].quantity; },
        shipping() { return this.premium ? 'Free' : '2.99'; },
        uniqueCartItems() { return [...new Set(this.cart)]; },
        isRemoveEnabled() { return this.uniqueCartItems.indexOf(this.currentVariantId) > -1; }
    },
    mounted() {
        eventBus.$on('review-submitted', review => { this.reviews.push(review) });
    }
});

Vue.component('product-review', {
    template: `<form class="review-form" @submit.prevent="onSubmit">
        <p v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul>
                <li v-for="error in errors">{{error}}</li>
            </ul>
        </p>
        <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name" placeholder="name">
        </p>
        <p>
            <label for="review">Review:</label>      
            <textarea id="review" v-model="review"></textarea>
        </p>
        <p>
            Would you recommend this product?<br>
            <span><input type="radio" id="yes" value="Yes" v-model="recommendation"><label for="yes">Yes</label></span>
            <span><input type="radio" id="no" value="No" v-model="recommendation"><label for="no">No</label></span>
        </p>
        <p>
            <label for="rating">Rating:</label>
            <select id="rating" v-model.number="rating">
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
            </select>
        </p>
        <p>
            <input type="submit" value="Submit">  
        </p>    
    </form>`,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommendation: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors = [];
            if (this.name && this.review && this.rating && this.recommendation) {
                let review = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommendation: this.recommendation
                };
                eventBus.$emit('review-submitted', review);
                this.name = null;
                this.review = null;
                this.rating = null;
                this.recommendation = null
            } else {
                if (!this.name) this.errors.push('Name required');
                if (!this.review) this.errors.push('Review required');
                if (!this.rating) this.errors.push('Rating required');
                if (!this.recommendation) this.errors.push('Recommendation required');
            }
        }
    }
});

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `<div>
        <span class="tab" v-for="(tab, index) in tabs" :key="index" :class="{ activeTab: selectedTab === tab }" @click="selectedTab = tab">{{tab}}</span>
        <div v-show="selectedTab === 'Reviews'">
        <p v-if="!reviews.length">No reviews to display</p>
        <ul>
            <li v-for="(review, index) in reviews" :key="index">
                <p><span>{{review.rating}}</span>  <span>{{review.name}}</span></p>
                <p>Recommendation: {{review.recommendation}}</p>
                <p>{{review.review}}</p>
            </li>
        </ul>
    </div>
    <product-review v-show="selectedTab === 'Make a Review'"></product-review>
    </div>`,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
});

Vue.component('product-detail-tabs', {
    props: {
        details: {
            type: Array,
            required: true
        },
        shipping: String
    },
    template: `<div>
    <span class="tab" v-for="(tab, index) in tabs" :key="index" :class="{ activeTab: selectedTab === tab }" @click="selectedTab = tab">{{tab}}</span>
        <product-details v-show="selectedTab === 'Details'" :details="details"></product-details>
        <div v-show="selectedTab === 'Shipping'">
            <p>Shipping: {{shipping}}</p>
        </div>
    </div>`,
    data() {
        return {
            tabs: ['Details', 'Shipping'],
            selectedTab: 'Details'
        }
    }
})

Vue.config.devtools = true;
var app = new Vue({
    el: '#app',
    data: {
        cart: [],
        premium: true
    },
    methods: {
        updateCart(productId, quantity) {
            let quantityOfProduct = Array.from({ length: !quantity ? 1 : quantity }).fill(productId)
            this.cart = this.cart.concat(quantityOfProduct);
        },
        removeProductFromCart(productId) {
            this.cart = this.cart.filter(el => el !== productId);
        }
    }
});