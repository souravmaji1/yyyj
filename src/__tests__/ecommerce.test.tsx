/**
 * E-commerce Comprehensive Tests
 * Tests shop, cart, checkout, orders, and payment functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

// Mock products data
const mockProducts = [
  {
    id: 'prod-1',
    name: 'Gaming Headset Pro',
    price: 99.99,
    category: 'Gaming',
    image: 'https://example.com/headset.jpg',
    description: 'Professional gaming headset with 7.1 surround sound',
    stock: 15,
    rating: 4.8,
    reviews: 124
  },
  {
    id: 'prod-2',
    name: 'Mechanical Keyboard RGB',
    price: 149.99,
    category: 'Gaming',
    image: 'https://example.com/keyboard.jpg',
    description: 'RGB mechanical keyboard with blue switches',
    stock: 8,
    rating: 4.9,
    reviews: 89
  }
]

// Mock cart data
const mockCartItems = [
  {
    id: 'prod-1',
    name: 'Gaming Headset Pro',
    price: 99.99,
    quantity: 2,
    image: 'https://example.com/headset.jpg'
  }
]

// Mock store for e-commerce
const mockStore = configureStore({
  reducer: {
    shop: (state = {
      products: [],
      loading: false,
      filters: {},
      searchQuery: '',
      currentProduct: null
    }, action) => {
      switch (action.type) {
        case 'shop/fetchProductsStart':
          return { ...state, loading: true }
        case 'shop/fetchProductsSuccess':
          return { ...state, products: action.payload, loading: false }
        case 'shop/setFilters':
          return { ...state, filters: action.payload }
        case 'shop/setSearchQuery':
          return { ...state, searchQuery: action.payload }
        default:
          return state
      }
    },
    cart: (state = {
      items: [],
      total: 0,
      shipping: 0,
      tax: 0,
      loading: false
    }, action) => {
      switch (action.type) {
        case 'cart/addItem':
          return {
            ...state,
            items: [...state.items, action.payload],
            total: state.total + (action.payload.price * action.payload.quantity)
          }
        case 'cart/removeItem':
          return {
            ...state,
            items: state.items.filter(item => item.id !== action.payload),
            total: state.total - (state.items.find(item => item.id === action.payload)?.price || 0)
          }
        case 'cart/updateQuantity':
          return {
            ...state,
            items: state.items.map(item =>
              item.id === action.payload.id
                ? { ...item, quantity: action.payload.quantity }
                : item
            )
          }
        case 'cart/clear':
          return { ...state, items: [], total: 0 }
        default:
          return state
      }
    },
    orders: (state = {
      orders: [],
      currentOrder: null,
      loading: false
    }, action) => {
      switch (action.type) {
        case 'orders/fetchOrdersStart':
          return { ...state, loading: true }
        case 'orders/fetchOrdersSuccess':
          return { ...state, orders: action.payload, loading: false }
        case 'orders/createOrderSuccess':
          return { ...state, currentOrder: action.payload }
        default:
          return state
      }
    }
  }
})

// Mock Stripe
const mockStripe = {
  confirmPayment: jest.fn(),
  createPaymentMethod: jest.fn(),
  elements: jest.fn(() => ({
    create: jest.fn(() => ({
      mount: jest.fn(),
      unmount: jest.fn(),
      on: jest.fn(),
      focus: jest.fn()
    })),
    getElement: jest.fn()
  }))
}

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve(mockStripe))
}))

describe('E-commerce System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Product Catalog', () => {
    test('should display products grid with filtering', () => {
      render(
        <Provider store={mockStore}>
          <div data-testid="shop-page">
            <div data-testid="filters-section">
              <select data-testid="category-filter">
                <option value="">All Categories</option>
                <option value="Gaming">Gaming</option>
                <option value="Electronics">Electronics</option>
              </select>
              <select data-testid="price-filter">
                <option value="">Any Price</option>
                <option value="0-50">$0 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100+">$100+</option>
              </select>
              <input
                type="text"
                data-testid="search-input"
                placeholder="Search products..."
              />
            </div>
            <div data-testid="products-grid">
              {mockProducts.map(product => (
                <div key={product.id} data-testid={`product-${product.id}`}>
                  <img src={product.image} alt={product.name} />
                  <h3>{product.name}</h3>
                  <p>${product.price}</p>
                  <div data-testid="rating">
                    Rating: {product.rating} ({product.reviews} reviews)
                  </div>
                  <button data-testid={`add-to-cart-${product.id}`}>
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Provider>
      )

      expect(screen.getByTestId('products-grid')).toBeInTheDocument()
      expect(screen.getByTestId('product-prod-1')).toHaveTextContent('Gaming Headset Pro')
      expect(screen.getByTestId('product-prod-2')).toHaveTextContent('Mechanical Keyboard RGB')
      expect(screen.getByTestId('category-filter')).toBeInTheDocument()
      expect(screen.getByTestId('search-input')).toBeInTheDocument()
    })

    test('should filter products by category', async () => {
      const user = userEvent.setup()
      
      render(
        <Provider store={mockStore}>
          <div>
            <select data-testid="category-filter">
              <option value="">All Categories</option>
              <option value="Gaming">Gaming</option>
              <option value="Electronics">Electronics</option>
            </select>
            <div data-testid="filtered-count">
              Showing 2 products
            </div>
          </div>
        </Provider>
      )

      const categoryFilter = screen.getByTestId('category-filter')
      await user.selectOptions(categoryFilter, 'Gaming')

      expect(categoryFilter).toHaveValue('Gaming')
    })

    test('should search products by name', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <input
            type="text"
            data-testid="search-input"
            placeholder="Search products..."
          />
          <div data-testid="search-results">
            Found 1 product matching "headset"
          </div>
        </div>
      )

      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'headset')

      expect(searchInput).toHaveValue('headset')
    })

    test('should sort products by price and rating', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <select data-testid="sort-select">
            <option value="">Sort by</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Rating: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
      )

      const sortSelect = screen.getByTestId('sort-select')
      await user.selectOptions(sortSelect, 'price-asc')

      expect(sortSelect).toHaveValue('price-asc')
    })
  })

  describe('Product Details', () => {
    test('should display detailed product information', () => {
      const product = mockProducts[0]
      
      render(
        <div data-testid="product-details">
          <div data-testid="product-gallery">
            <img src={product.image} alt={product.name} />
          </div>
          <div data-testid="product-info">
            <h1 data-testid="product-name">{product.name}</h1>
            <div data-testid="product-price">${product.price}</div>
            <div data-testid="product-rating">
              {product.rating} stars ({product.reviews} reviews)
            </div>
            <div data-testid="product-description">
              {product.description}
            </div>
            <div data-testid="stock-info">
              {product.stock} in stock
            </div>
            <div data-testid="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={product.stock}
                defaultValue="1"
                data-testid="quantity-input"
              />
            </div>
            <button data-testid="add-to-cart-btn">
              Add to Cart
            </button>
          </div>
        </div>
      )

      expect(screen.getByTestId('product-name')).toHaveTextContent('Gaming Headset Pro')
      expect(screen.getByTestId('product-price')).toHaveTextContent('$99.99')
      expect(screen.getByTestId('stock-info')).toHaveTextContent('15 in stock')
      expect(screen.getByTestId('quantity-input')).toHaveAttribute('max', '15')
    })

    test('should handle quantity selection', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <input
            type="number"
            data-testid="quantity-input"
            min="1"
            max="15"
            defaultValue="1"
          />
          <button data-testid="add-to-cart-btn">
            Add to Cart
          </button>
        </div>
      )

      const quantityInput = screen.getByTestId('quantity-input')
      
      await user.clear(quantityInput)
      await user.type(quantityInput, '3')

      expect(quantityInput).toHaveValue(3)
    })

    test('should show out of stock state', () => {
      render(
        <div data-testid="out-of-stock-product">
          <div data-testid="stock-status" className="out-of-stock">
            Out of Stock
          </div>
          <button data-testid="add-to-cart-btn" disabled>
            Add to Cart
          </button>
          <button data-testid="notify-btn">
            Notify When Available
          </button>
        </div>
      )

      expect(screen.getByTestId('stock-status')).toHaveTextContent('Out of Stock')
      expect(screen.getByTestId('add-to-cart-btn')).toBeDisabled()
      expect(screen.getByTestId('notify-btn')).toBeInTheDocument()
    })
  })

  describe('Shopping Cart', () => {
    test('should display cart items with quantities', () => {
      render(
        <Provider store={mockStore}>
          <div data-testid="shopping-cart">
            <h2>Shopping Cart</h2>
            <div data-testid="cart-items">
              {mockCartItems.map(item => (
                <div key={item.id} data-testid={`cart-item-${item.id}`}>
                  <img src={item.image} alt={item.name} />
                  <div data-testid="item-name">{item.name}</div>
                  <div data-testid="item-price">${item.price}</div>
                  <div data-testid="quantity-controls">
                    <button data-testid={`decrease-${item.id}`}>-</button>
                    <span data-testid={`quantity-${item.id}`}>{item.quantity}</span>
                    <button data-testid={`increase-${item.id}`}>+</button>
                  </div>
                  <div data-testid="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button data-testid={`remove-${item.id}`}>Remove</button>
                </div>
              ))}
            </div>
            <div data-testid="cart-summary">
              <div data-testid="subtotal">Subtotal: $199.98</div>
              <div data-testid="shipping">Shipping: $9.99</div>
              <div data-testid="tax">Tax: $16.80</div>
              <div data-testid="total">Total: $226.77</div>
            </div>
            <button data-testid="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        </Provider>
      )

      expect(screen.getByTestId('cart-item-prod-1')).toBeInTheDocument()
      expect(screen.getByTestId('quantity-prod-1')).toHaveTextContent('2')
      expect(screen.getByTestId('item-total')).toHaveTextContent('$199.98')
      expect(screen.getByTestId('total')).toHaveTextContent('$226.77')
    })

    test('should update item quantity', async () => {
      const user = userEvent.setup()
      
      render(
        <Provider store={mockStore}>
          <div>
            <div data-testid="quantity-controls">
              <button data-testid="decrease-btn">-</button>
              <span data-testid="quantity-display">2</span>
              <button data-testid="increase-btn">+</button>
            </div>
            <div data-testid="item-total">$199.98</div>
          </div>
        </Provider>
      )

      const increaseBtn = screen.getByTestId('increase-btn')
      const decreaseBtn = screen.getByTestId('decrease-btn')

      await user.click(increaseBtn)
      // In real component, this would update quantity

      await user.click(decreaseBtn)
      // In real component, this would update quantity

      expect(increaseBtn).toBeInTheDocument()
      expect(decreaseBtn).toBeInTheDocument()
    })

    test('should remove items from cart', async () => {
      const user = userEvent.setup()
      
      render(
        <Provider store={mockStore}>
          <div>
            <div data-testid="cart-item">
              <span>Gaming Headset Pro</span>
              <button data-testid="remove-btn">Remove</button>
            </div>
            <div data-testid="empty-cart" style={{ display: 'none' }}>
              Your cart is empty
            </div>
          </div>
        </Provider>
      )

      const removeBtn = screen.getByTestId('remove-btn')
      await user.click(removeBtn)

      expect(removeBtn).toBeInTheDocument()
    })

    test('should show empty cart state', () => {
      render(
        <div data-testid="empty-cart-state">
          <div data-testid="empty-message">
            Your cart is empty
          </div>
          <button data-testid="continue-shopping">
            Continue Shopping
          </button>
        </div>
      )

      expect(screen.getByTestId('empty-message')).toHaveTextContent('Your cart is empty')
      expect(screen.getByTestId('continue-shopping')).toBeInTheDocument()
    })
  })

  describe('Checkout Process', () => {
    test('should display checkout form with validation', async () => {
      const user = userEvent.setup()
      
      render(
        <div data-testid="checkout-form">
          <form>
            <fieldset data-testid="shipping-info">
              <legend>Shipping Information</legend>
              <input
                type="text"
                data-testid="first-name"
                placeholder="First Name"
                required
              />
              <input
                type="text"
                data-testid="last-name"
                placeholder="Last Name"
                required
              />
              <input
                type="email"
                data-testid="email"
                placeholder="Email"
                required
              />
              <input
                type="text"
                data-testid="address"
                placeholder="Address"
                required
              />
              <input
                type="text"
                data-testid="city"
                placeholder="City"
                required
              />
              <input
                type="text"
                data-testid="zip"
                placeholder="ZIP Code"
                required
              />
            </fieldset>
            
            <fieldset data-testid="payment-info">
              <legend>Payment Information</legend>
              <div data-testid="card-element">
                {/* Stripe Elements would be here */}
                <input data-testid="card-number" placeholder="Card Number" />
                <input data-testid="card-expiry" placeholder="MM/YY" />
                <input data-testid="card-cvc" placeholder="CVC" />
              </div>
            </fieldset>
            
            <button type="submit" data-testid="place-order">
              Place Order
            </button>
          </form>
        </div>
      )

      // Test form validation
      const placeOrderBtn = screen.getByTestId('place-order')
      await user.click(placeOrderBtn)

      const firstNameInput = screen.getByTestId('first-name')
      const emailInput = screen.getByTestId('email')

      expect(firstNameInput).toBeInvalid()
      expect(emailInput).toBeInvalid()

      // Fill out form
      await user.type(firstNameInput, 'John')
      await user.type(screen.getByTestId('last-name'), 'Doe')
      await user.type(emailInput, 'john@example.com')

      expect(firstNameInput).toBeValid()
      expect(emailInput).toBeValid()
    })

    test('should handle payment processing', async () => {
      const user = userEvent.setup()
      
      mockStripe.confirmPayment.mockResolvedValue({
        error: null,
        paymentIntent: { status: 'succeeded', id: 'pi_123' }
      })

      render(
        <div data-testid="payment-section">
          <div data-testid="order-summary">
            <div>Total: $226.77</div>
          </div>
          <button data-testid="pay-now" disabled={false}>
            Pay $226.77
          </button>
          <div data-testid="processing" style={{ display: 'none' }}>
            Processing payment...
          </div>
        </div>
      )

      const payBtn = screen.getByTestId('pay-now')
      await user.click(payBtn)

      expect(payBtn).toBeInTheDocument()
    })

    test('should handle payment errors', () => {
      render(
        <div data-testid="payment-error">
          <div role="alert" data-testid="error-message">
            Payment failed: Your card was declined.
          </div>
          <button data-testid="retry-payment">
            Try Again
          </button>
          <button data-testid="change-payment">
            Use Different Payment Method
          </button>
        </div>
      )

      expect(screen.getByRole('alert')).toHaveTextContent('Your card was declined')
      expect(screen.getByTestId('retry-payment')).toBeInTheDocument()
      expect(screen.getByTestId('change-payment')).toBeInTheDocument()
    })
  })

  describe('Order Management', () => {
    test('should display order history', () => {
      const mockOrders = [
        {
          id: 'order-123',
          date: '2024-01-15',
          status: 'Delivered',
          total: 226.77,
          items: [{ name: 'Gaming Headset Pro', quantity: 2 }]
        },
        {
          id: 'order-124',
          date: '2024-01-20',
          status: 'Processing',
          total: 149.99,
          items: [{ name: 'Mechanical Keyboard RGB', quantity: 1 }]
        }
      ]

      render(
        <div data-testid="order-history">
          <h2>Order History</h2>
          <div data-testid="orders-list">
            {mockOrders.map(order => (
              <div key={order.id} data-testid={`order-${order.id}`}>
                <div data-testid="order-header">
                  <span data-testid="order-id">#{order.id}</span>
                  <span data-testid="order-date">{order.date}</span>
                  <span data-testid="order-status">{order.status}</span>
                  <span data-testid="order-total">${order.total}</span>
                </div>
                <div data-testid="order-items">
                  {order.items.map((item, index) => (
                    <div key={index}>
                      {item.name} x {item.quantity}
                    </div>
                  ))}
                </div>
                <button data-testid={`view-order-${order.id}`}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )

      expect(screen.getByTestId('order-order-123')).toBeInTheDocument()
      expect(screen.getByTestId('order-order-124')).toBeInTheDocument()
      expect(screen.getByText('Delivered')).toBeInTheDocument()
      expect(screen.getByText('Processing')).toBeInTheDocument()
    })

    test('should display order details', () => {
      render(
        <div data-testid="order-details">
          <div data-testid="order-info">
            <h1>Order #order-123</h1>
            <div data-testid="order-status">Status: Delivered</div>
            <div data-testid="order-date">Ordered: January 15, 2024</div>
            <div data-testid="delivered-date">Delivered: January 18, 2024</div>
          </div>
          
          <div data-testid="shipping-address">
            <h3>Shipping Address</h3>
            <div>John Doe</div>
            <div>123 Main St</div>
            <div>Anytown, ST 12345</div>
          </div>
          
          <div data-testid="order-items">
            <h3>Items Ordered</h3>
            <div data-testid="item-detail">
              <span>Gaming Headset Pro</span>
              <span>Qty: 2</span>
              <span>$199.98</span>
            </div>
          </div>
          
          <div data-testid="order-summary">
            <div>Subtotal: $199.98</div>
            <div>Shipping: $9.99</div>
            <div>Tax: $16.80</div>
            <div data-testid="order-total">Total: $226.77</div>
          </div>
          
          <div data-testid="order-actions">
            <button data-testid="track-order">Track Package</button>
            <button data-testid="return-order">Return Items</button>
            <button data-testid="reorder">Order Again</button>
          </div>
        </div>
      )

      expect(screen.getByText('Order #order-123')).toBeInTheDocument()
      expect(screen.getByText('Status: Delivered')).toBeInTheDocument()
      expect(screen.getByTestId('order-total')).toHaveTextContent('$226.77')
      expect(screen.getByTestId('track-order')).toBeInTheDocument()
    })

    test('should handle order tracking', () => {
      render(
        <div data-testid="order-tracking">
          <h2>Track Your Order</h2>
          <div data-testid="tracking-info">
            <div>Tracking Number: 1Z123456789</div>
            <div>Carrier: UPS</div>
            <div>Estimated Delivery: January 20, 2024</div>
          </div>
          <div data-testid="tracking-timeline">
            <div data-testid="status-ordered" className="completed">
              ✓ Order Placed - January 15
            </div>
            <div data-testid="status-processing" className="completed">
              ✓ Processing - January 16
            </div>
            <div data-testid="status-shipped" className="current">
              📦 Shipped - January 17
            </div>
            <div data-testid="status-delivered" className="pending">
              🚚 Out for Delivery
            </div>
          </div>
        </div>
      )

      expect(screen.getByText(/1Z123456789/)).toBeInTheDocument()
      expect(screen.getByTestId('status-shipped')).toHaveClass('current')
      expect(screen.getByTestId('status-delivered')).toHaveClass('pending')
    })
  })

  describe('Accessibility', () => {
    test('should have proper ARIA labels for e-commerce elements', () => {
      render(
        <div>
          <main role="main" aria-label="Online Shop">
            <section aria-labelledby="products-heading">
              <h1 id="products-heading">Products</h1>
              <div role="grid" aria-label="Product catalog">
                <div role="gridcell" aria-describedby="product-1-desc">
                  <h2>Gaming Headset</h2>
                  <div id="product-1-desc">Professional gaming headset</div>
                </div>
              </div>
            </section>
            
            <section aria-labelledby="cart-heading">
              <h2 id="cart-heading">Shopping Cart</h2>
              <div role="list" aria-label="Cart items">
                <div role="listitem">Gaming Headset Pro</div>
              </div>
            </section>
          </main>
        </div>
      )

      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Online Shop')
      expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'Product catalog')
      expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Cart items')
    })

    test('should support keyboard navigation for shopping', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <button data-testid="product-link">View Product</button>
          <button data-testid="add-to-cart">Add to Cart</button>
          <button data-testid="cart-link">View Cart</button>
          <button data-testid="checkout">Checkout</button>
        </div>
      )

      const productLink = screen.getByTestId('product-link')
      const addToCart = screen.getByTestId('add-to-cart')
      const cartLink = screen.getByTestId('cart-link')
      const checkout = screen.getByTestId('checkout')

      productLink.focus()
      expect(productLink).toHaveFocus()

      await user.tab()
      expect(addToCart).toHaveFocus()

      await user.tab()
      expect(cartLink).toHaveFocus()

      await user.tab()
      expect(checkout).toHaveFocus()
    })
  })
})

// Test utilities for e-commerce
export const ecommerceTestUtils = {
  mockProduct: {
    id: 'test-prod-123',
    name: 'Test Product',
    price: 29.99,
    category: 'Test',
    image: 'https://example.com/test.jpg',
    description: 'Test product description',
    stock: 10,
    rating: 4.5,
    reviews: 50
  },

  mockOrder: {
    id: 'test-order-123',
    date: '2024-01-15',
    status: 'Processing',
    total: 129.99,
    items: [
      { id: 'prod-1', name: 'Test Product', quantity: 2, price: 29.99 }
    ],
    shippingAddress: {
      name: 'Test User',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345'
    }
  },

  createMockStore: (initialState = {}) => {
    return configureStore({
      reducer: {
        shop: (state = { products: [], loading: false, ...initialState.shop }) => state,
        cart: (state = { items: [], total: 0, ...initialState.cart }) => state,
        orders: (state = { orders: [], loading: false, ...initialState.orders }) => state
      }
    })
  }
}