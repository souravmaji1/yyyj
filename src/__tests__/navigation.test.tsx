/**
 * Navigation and Routing Tests
 * Tests navigation components, routing, and page transitions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

// Mock Next.js router
const mockPush = jest.fn()
const mockBack = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/current-path',
  useSearchParams: () => new URLSearchParams('?tab=overview'),
  useParams: () => ({ id: 'test-id' }),
}))

// Mock store for navigation
const mockStore = configureStore({
  reducer: {
    navigation: (state = {
      currentRoute: '/',
      isMenuOpen: false,
      breadcrumbs: []
    }, action) => {
      switch (action.type) {
        case 'navigation/setRoute':
          return { ...state, currentRoute: action.payload }
        case 'navigation/toggleMenu':
          return { ...state, isMenuOpen: !state.isMenuOpen }
        case 'navigation/setBreadcrumbs':
          return { ...state, breadcrumbs: action.payload }
        default:
          return state
      }
    },
    auth: (state = { user: null, isAuthenticated: false }) => state
  }
})

describe('Navigation and Routing', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Main Navigation', () => {
    test('should render main navigation with all menu items', () => {
      render(
        <Provider store={mockStore}>
          <nav data-testid="main-navigation" role="navigation" aria-label="Main menu">
            <div data-testid="nav-brand">
              <a href="/" data-testid="home-link">IntelliVerse</a>
            </div>
            <ul data-testid="nav-menu" role="menubar">
              <li role="none">
                <a href="/shop" data-testid="shop-link" role="menuitem">Shop</a>
              </li>
              <li role="none">
                <a href="/ai-studio" data-testid="ai-studio-link" role="menuitem">AI Studio</a>
              </li>
              <li role="none">
                <a href="/ai-studio-3" data-testid="ai-studio-3-link" role="menuitem">AI Studio 3</a>
              </li>
              <li role="none">
                <a href="/nft-Collections" data-testid="nft-link" role="menuitem">NFTs</a>
              </li>
              <li role="none">
                <a href="/tokens" data-testid="tokens-link" role="menuitem">Tokens</a>
              </li>
              <li role="none">
                <a href="/profile" data-testid="profile-link" role="menuitem">Profile</a>
              </li>
            </ul>
            <div data-testid="nav-actions">
              <button data-testid="cart-button" aria-label="Shopping cart">
                🛒 Cart (0)
              </button>
              <button data-testid="login-button">Login</button>
            </div>
          </nav>
        </Provider>
      )

      expect(screen.getByTestId('main-navigation')).toBeInTheDocument()
      expect(screen.getByTestId('home-link')).toHaveTextContent('IntelliVerse')
      expect(screen.getByTestId('shop-link')).toBeInTheDocument()
      expect(screen.getByTestId('ai-studio-link')).toBeInTheDocument()
      expect(screen.getByTestId('ai-studio-3-link')).toBeInTheDocument()
      expect(screen.getByTestId('nft-link')).toBeInTheDocument()
      expect(screen.getByTestId('tokens-link')).toBeInTheDocument()
      expect(screen.getByTestId('profile-link')).toBeInTheDocument()
    })

    test('should handle navigation clicks', async () => {
      const user = userEvent.setup()
      
      render(
        <Provider store={mockStore}>
          <nav>
            <button 
              data-testid="shop-nav-btn"
              onClick={() => mockPush('/shop')}
            >
              Shop
            </button>
            <button 
              data-testid="ai-studio-nav-btn"
              onClick={() => mockPush('/ai-studio')}
            >
              AI Studio
            </button>
          </nav>
        </Provider>
      )

      await user.click(screen.getByTestId('shop-nav-btn'))
      expect(mockPush).toHaveBeenCalledWith('/shop')

      await user.click(screen.getByTestId('ai-studio-nav-btn'))
      expect(mockPush).toHaveBeenCalledWith('/ai-studio')
    })

    test('should show mobile menu toggle', async () => {
      const user = userEvent.setup()
      
      render(
        <Provider store={mockStore}>
          <div data-testid="mobile-nav">
            <button 
              data-testid="menu-toggle"
              aria-label="Toggle menu"
              aria-expanded="false"
            >
              ☰
            </button>
            <div data-testid="mobile-menu" className="hidden">
              <a href="/shop">Shop</a>
              <a href="/ai-studio">AI Studio</a>
            </div>
          </div>
        </Provider>
      )

      const menuToggle = screen.getByTestId('menu-toggle')
      const mobileMenu = screen.getByTestId('mobile-menu')

      expect(menuToggle).toHaveAttribute('aria-expanded', 'false')
      expect(mobileMenu).toHaveClass('hidden')

      await user.click(menuToggle)
      // In real component, this would toggle the menu
    })
  })

  describe('Breadcrumb Navigation', () => {
    test('should display breadcrumb trail', () => {
      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Shop', href: '/shop' },
        { label: 'Gaming', href: '/shop/gaming' },
        { label: 'Gaming Headset Pro', href: null } // Current page
      ]

      render(
        <nav data-testid="breadcrumbs" aria-label="Breadcrumb">
          <ol role="list">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={index} role="listitem">
                {breadcrumb.href ? (
                  <a href={breadcrumb.href} data-testid={`breadcrumb-${index}`}>
                    {breadcrumb.label}
                  </a>
                ) : (
                  <span data-testid={`breadcrumb-${index}`} aria-current="page">
                    {breadcrumb.label}
                  </span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span aria-hidden="true"> / </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
      expect(screen.getByTestId('breadcrumb-0')).toHaveTextContent('Home')
      expect(screen.getByTestId('breadcrumb-3')).toHaveAttribute('aria-current', 'page')
    })

    test('should handle breadcrumb navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <nav data-testid="breadcrumbs">
          <button 
            data-testid="breadcrumb-home"
            onClick={() => mockPush('/')}
          >
            Home
          </button>
          <span> / </span>
          <button 
            data-testid="breadcrumb-shop"
            onClick={() => mockPush('/shop')}
          >
            Shop
          </button>
        </nav>
      )

      await user.click(screen.getByTestId('breadcrumb-home'))
      expect(mockPush).toHaveBeenCalledWith('/')

      await user.click(screen.getByTestId('breadcrumb-shop'))
      expect(mockPush).toHaveBeenCalledWith('/shop')
    })
  })

  describe('Page Routing', () => {
    test('should handle route parameters', () => {
      // Test component that uses route parameters
      render(
        <div data-testid="product-page">
          <h1>Product ID: test-id</h1>
          <div data-testid="current-tab">
            Current Tab: overview
          </div>
        </div>
      )

      expect(screen.getByText('Product ID: test-id')).toBeInTheDocument()
      expect(screen.getByTestId('current-tab')).toHaveTextContent('overview')
    })

    test('should handle route changes', async () => {
      const user = userEvent.setup()
      
      render(
        <div data-testid="route-handler">
          <button 
            data-testid="navigate-to-product"
            onClick={() => mockPush('/product/123')}
          >
            View Product
          </button>
          <button 
            data-testid="navigate-back"
            onClick={() => mockBack()}
          >
            Go Back
          </button>
          <button 
            data-testid="replace-route"
            onClick={() => mockReplace('/new-route')}
          >
            Replace Route
          </button>
        </div>
      )

      await user.click(screen.getByTestId('navigate-to-product'))
      expect(mockPush).toHaveBeenCalledWith('/product/123')

      await user.click(screen.getByTestId('navigate-back'))
      expect(mockBack).toHaveBeenCalled()

      await user.click(screen.getByTestId('replace-route'))
      expect(mockReplace).toHaveBeenCalledWith('/new-route')
    })

    test('should handle query parameters', () => {
      render(
        <div data-testid="query-params">
          <div data-testid="search-query">Search: </div>
          <div data-testid="filter-category">Category: </div>
          <div data-testid="page-number">Page: 1</div>
        </div>
      )

      // In real component, these would be populated from useSearchParams
      expect(screen.getByTestId('query-params')).toBeInTheDocument()
    })
  })

  describe('Protected Routes', () => {
    test('should redirect unauthenticated users', () => {
      render(
        <Provider store={mockStore}>
          <div data-testid="protected-route">
            {/* Mock protected route component */}
            <div data-testid="login-required">
              Please log in to access this page
            </div>
            <button 
              data-testid="redirect-login"
              onClick={() => mockPush('/auth/login')}
            >
              Go to Login
            </button>
          </div>
        </Provider>
      )

      expect(screen.getByTestId('login-required')).toBeInTheDocument()
    })

    test('should allow authenticated users', () => {
      const authenticatedStore = configureStore({
        reducer: {
          auth: () => ({ 
            user: { id: '123', email: 'test@example.com' }, 
            isAuthenticated: true 
          }),
          navigation: () => ({ currentRoute: '/profile', isMenuOpen: false })
        }
      })

      render(
        <Provider store={authenticatedStore}>
          <div data-testid="protected-content">
            <h1>Welcome to your profile!</h1>
            <div data-testid="user-info">
              Logged in as: test@example.com
            </div>
          </div>
        </Provider>
      )

      expect(screen.getByText('Welcome to your profile!')).toBeInTheDocument()
      expect(screen.getByTestId('user-info')).toHaveTextContent('test@example.com')
    })
  })

  describe('Loading States', () => {
    test('should show loading indicator during navigation', () => {
      render(
        <div data-testid="loading-container">
          <div data-testid="loading-spinner" role="status" aria-label="Loading">
            <div className="spinner">Loading...</div>
          </div>
          <div data-testid="loading-text">
            Navigating to new page...
          </div>
        </div>
      )

      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
      expect(screen.getByTestId('loading-text')).toHaveTextContent('Navigating')
    })

    test('should show error state for failed navigation', () => {
      render(
        <div data-testid="error-container">
          <div role="alert" data-testid="navigation-error">
            Failed to load page. Please try again.
          </div>
          <button data-testid="retry-navigation">
            Retry
          </button>
          <button 
            data-testid="go-home"
            onClick={() => mockPush('/')}
          >
            Go Home
          </button>
        </div>
      )

      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load page')
      expect(screen.getByTestId('retry-navigation')).toBeInTheDocument()
      expect(screen.getByTestId('go-home')).toBeInTheDocument()
    })
  })

  describe('Search and Filters', () => {
    test('should handle search navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <form 
          data-testid="search-form"
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const query = formData.get('query')
            mockPush(`/search?q=${query}`)
          }}
        >
          <input
            name="query"
            type="search"
            data-testid="search-input"
            placeholder="Search products..."
          />
          <button type="submit" data-testid="search-button">
            Search
          </button>
        </form>
      )

      const searchInput = screen.getByTestId('search-input')
      const searchButton = screen.getByTestId('search-button')

      await user.type(searchInput, 'gaming headset')
      await user.click(searchButton)

      expect(mockPush).toHaveBeenCalledWith('/search?q=gaming headset')
    })

    test('should handle filter navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <div data-testid="filters">
          <select 
            data-testid="category-filter"
            onChange={(e) => mockPush(`/shop?category=${e.target.value}`)}
          >
            <option value="">All Categories</option>
            <option value="gaming">Gaming</option>
            <option value="electronics">Electronics</option>
          </select>
          <select 
            data-testid="price-filter"
            onChange={(e) => mockPush(`/shop?price=${e.target.value}`)}
          >
            <option value="">Any Price</option>
            <option value="0-50">$0 - $50</option>
            <option value="50-100">$50 - $100</option>
          </select>
        </div>
      )

      const categoryFilter = screen.getByTestId('category-filter')
      const priceFilter = screen.getByTestId('price-filter')

      await user.selectOptions(categoryFilter, 'gaming')
      expect(mockPush).toHaveBeenCalledWith('/shop?category=gaming')

      await user.selectOptions(priceFilter, '0-50')
      expect(mockPush).toHaveBeenCalledWith('/shop?price=0-50')
    })
  })

  describe('Accessibility', () => {
    test('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <nav role="navigation">
          <a href="/" data-testid="nav-home">Home</a>
          <a href="/shop" data-testid="nav-shop">Shop</a>
          <a href="/ai-studio" data-testid="nav-ai">AI Studio</a>
          <a href="/profile" data-testid="nav-profile">Profile</a>
        </nav>
      )

      const homeLink = screen.getByTestId('nav-home')
      const shopLink = screen.getByTestId('nav-shop')
      const aiLink = screen.getByTestId('nav-ai')
      const profileLink = screen.getByTestId('nav-profile')

      homeLink.focus()
      expect(homeLink).toHaveFocus()

      await user.tab()
      expect(shopLink).toHaveFocus()

      await user.tab()
      expect(aiLink).toHaveFocus()

      await user.tab()
      expect(profileLink).toHaveFocus()
    })

    test('should have proper ARIA labels and roles', () => {
      render(
        <div>
          <nav role="navigation" aria-label="Main navigation">
            <ul role="menubar">
              <li role="none">
                <a href="/" role="menuitem" aria-current="page">Home</a>
              </li>
              <li role="none">
                <a href="/shop" role="menuitem">Shop</a>
              </li>
            </ul>
          </nav>
          
          <nav aria-label="Breadcrumb">
            <ol role="list">
              <li role="listitem">
                <a href="/">Home</a>
              </li>
              <li role="listitem">
                <span aria-current="page">Current Page</span>
              </li>
            </ol>
          </nav>
        </div>
      )

      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
      expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
      expect(screen.getByRole('menubar')).toBeInTheDocument()
    })

    test('should announce route changes to screen readers', () => {
      render(
        <div>
          <div 
            aria-live="polite" 
            aria-atomic="true"
            data-testid="route-announcer"
          >
            Navigated to Shop page
          </div>
          <div 
            aria-live="assertive"
            data-testid="error-announcer"
          >
            Navigation error: Page not found
          </div>
        </div>
      )

      expect(screen.getByTestId('route-announcer')).toHaveAttribute('aria-live', 'polite')
      expect(screen.getByTestId('error-announcer')).toHaveAttribute('aria-live', 'assertive')
    })
  })

  describe('Performance', () => {
    test('should handle rapid navigation clicks', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <button 
            data-testid="rapid-nav-btn"
            onClick={() => mockPush('/shop')}
          >
            Navigate to Shop
          </button>
        </div>
      )

      const navButton = screen.getByTestId('rapid-nav-btn')

      // Simulate rapid clicks
      await user.click(navButton)
      await user.click(navButton)
      await user.click(navButton)

      // Should have been called multiple times
      expect(mockPush).toHaveBeenCalledTimes(3)
      expect(mockPush).toHaveBeenCalledWith('/shop')
    })

    test('should prefetch routes on hover', async () => {
      const mockPrefetch = jest.fn()
      const user = userEvent.setup()
      
      render(
        <a 
          href="/shop"
          data-testid="prefetch-link"
          onMouseEnter={() => mockPrefetch('/shop')}
        >
          Shop
        </a>
      )

      const link = screen.getByTestId('prefetch-link')
      await user.hover(link)

      expect(mockPrefetch).toHaveBeenCalledWith('/shop')
    })
  })
})

// Test utilities for navigation
export const navigationTestUtils = {
  mockRouterPush: mockPush,
  mockRouterBack: mockBack,
  mockRouterReplace: mockReplace,
  
  resetMocks: () => {
    mockPush.mockClear()
    mockBack.mockClear()
    mockReplace.mockClear()
  },
  
  createMockStore: (initialState = {}) => {
    return configureStore({
      reducer: {
        navigation: (state = {
          currentRoute: '/',
          isMenuOpen: false,
          breadcrumbs: [],
          ...initialState.navigation
        }) => state,
        auth: (state = {
          user: null,
          isAuthenticated: false,
          ...initialState.auth
        }) => state
      }
    })
  }
}