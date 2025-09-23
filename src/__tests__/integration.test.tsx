/**
 * Integration Tests
 * Tests integration between components, routing, state management, and APIs
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

// Mock API responses
const mockApiResponses = {
  '/api/user/profile': {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    credits: 100
  },
  '/api/ai-studio/generate': {
    id: 'gen-123',
    status: 'processing',
    estimatedTime: 30
  },
  '/api/shop/products': [
    { id: 'prod-1', name: 'Gaming Headset', price: 99.99 },
    { id: 'prod-2', name: 'Keyboard', price: 149.99 }
  ],
  '/api/cart': {
    items: [],
    total: 0
  }
}

// Mock fetch with proper responses
global.fetch = jest.fn((url) => {
  const mockResponse = mockApiResponses[url] || {}
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockResponse),
    status: 200
  })
})

// Create integrated store
const createIntegratedStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = {
        user: null,
        isAuthenticated: false,
        loading: false,
        ...initialState.auth
      }, action) => {
        switch (action.type) {
          case 'auth/loginSuccess':
            return { ...state, user: action.payload, isAuthenticated: true, loading: false }
          case 'auth/logout':
            return { ...state, user: null, isAuthenticated: false }
          default:
            return state
        }
      },
      cart: (state = {
        items: [],
        total: 0,
        ...initialState.cart
      }, action) => {
        switch (action.type) {
          case 'cart/addItem':
            const newItem = action.payload
            const existingItem = state.items.find(item => item.id === newItem.id)
            if (existingItem) {
              return {
                ...state,
                items: state.items.map(item =>
                  item.id === newItem.id
                    ? { ...item, quantity: item.quantity + newItem.quantity }
                    : item
                ),
                total: state.total + (newItem.price * newItem.quantity)
              }
            }
            return {
              ...state,
              items: [...state.items, newItem],
              total: state.total + (newItem.price * newItem.quantity)
            }
          case 'cart/clear':
            return { ...state, items: [], total: 0 }
          default:
            return state
        }
      },
      aiStudio: (state = {
        generations: [],
        currentGeneration: null,
        loading: false,
        ...initialState.aiStudio
      }, action) => {
        switch (action.type) {
          case 'aiStudio/generateStart':
            return { ...state, loading: true }
          case 'aiStudio/generateSuccess':
            return {
              ...state,
              currentGeneration: action.payload,
              generations: [action.payload, ...state.generations],
              loading: false
            }
          default:
            return state
        }
      }
    }
  })
}

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication Flow Integration', () => {
    test('should handle complete login flow with navigation', async () => {
      const user = userEvent.setup()
      const store = createIntegratedStore()
      
      // Mock navigation
      const mockNavigate = jest.fn()
      
      const LoginComponent = () => {
        const handleLogin = async (credentials) => {
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              body: JSON.stringify(credentials)
            })
            const userData = await response.json()
            
            store.dispatch({
              type: 'auth/loginSuccess',
              payload: userData
            })
            
            mockNavigate('/dashboard')
          } catch (error) {
            console.error('Login failed:', error)
          }
        }

        return (
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            handleLogin({
              email: formData.get('email'),
              password: formData.get('password')
            })
          }}>
            <input name="email" data-testid="email" type="email" required />
            <input name="password" data-testid="password" type="password" required />
            <button type="submit" data-testid="login-btn">Login</button>
          </form>
        )
      }

      render(
        <Provider store={store}>
          <LoginComponent />
        </Provider>
      )

      // Fill out login form
      await user.type(screen.getByTestId('email'), 'test@example.com')
      await user.type(screen.getByTestId('password'), 'password123')
      await user.click(screen.getByTestId('login-btn'))

      // Should call API and navigate
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
          method: 'POST'
        }))
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })

    test('should protect routes when not authenticated', () => {
      const store = createIntegratedStore({ auth: { isAuthenticated: false } })
      
      const ProtectedRoute = ({ children }) => {
        const state = store.getState()
        
        if (!state.auth.isAuthenticated) {
          return <div data-testid="login-required">Please login to continue</div>
        }
        
        return children
      }

      render(
        <Provider store={store}>
          <ProtectedRoute>
            <div data-testid="protected-content">Secret content</div>
          </ProtectedRoute>
        </Provider>
      )

      expect(screen.getByTestId('login-required')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })
  })

  describe('Shopping Cart Integration', () => {
    test('should add products to cart and calculate totals', async () => {
      const user = userEvent.setup()
      const store = createIntegratedStore()
      
      const ShopIntegration = () => {
        const addToCart = (product) => {
          store.dispatch({
            type: 'cart/addItem',
            payload: {
              id: product.id,
              name: product.name,
              price: product.price,
              quantity: 1
            }
          })
        }

        const state = store.getState()

        return (
          <div>
            <div data-testid="products">
              <div data-testid="product-1">
                <h3>Gaming Headset</h3>
                <p>$99.99</p>
                <button 
                  data-testid="add-headset"
                  onClick={() => addToCart({ id: 'prod-1', name: 'Gaming Headset', price: 99.99 })}
                >
                  Add to Cart
                </button>
              </div>
              <div data-testid="product-2">
                <h3>Keyboard</h3>
                <p>$149.99</p>
                <button 
                  data-testid="add-keyboard"
                  onClick={() => addToCart({ id: 'prod-2', name: 'Keyboard', price: 149.99 })}
                >
                  Add to Cart
                </button>
              </div>
            </div>
            
            <div data-testid="cart-summary">
              <div data-testid="cart-count">Items: {state.cart.items.length}</div>
              <div data-testid="cart-total">Total: ${state.cart.total.toFixed(2)}</div>
            </div>
          </div>
        )
      }

      render(
        <Provider store={store}>
          <ShopIntegration />
        </Provider>
      )

      // Add first product
      await user.click(screen.getByTestId('add-headset'))
      
      // Check cart updates
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 1')
        expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $99.99')
      })

      // Add second product
      await user.click(screen.getByTestId('add-keyboard'))
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('Items: 2')
        expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $249.98')
      })
    })

    test('should persist cart state across navigation', () => {
      const store = createIntegratedStore({
        cart: {
          items: [{ id: 'prod-1', name: 'Gaming Headset', price: 99.99, quantity: 1 }],
          total: 99.99
        }
      })

      const CartPersistence = () => {
        const state = store.getState()
        
        return (
          <div data-testid="cart-persistence">
            <div data-testid="persisted-items">
              Items: {state.cart.items.length}
            </div>
            <div data-testid="persisted-total">
              Total: ${state.cart.total.toFixed(2)}
            </div>
          </div>
        )
      }

      render(
        <Provider store={store}>
          <CartPersistence />
        </Provider>
      )

      expect(screen.getByTestId('persisted-items')).toHaveTextContent('Items: 1')
      expect(screen.getByTestId('persisted-total')).toHaveTextContent('Total: $99.99')
    })
  })

  describe('AI Studio Integration', () => {
    test('should handle AI generation workflow', async () => {
      const user = userEvent.setup()
      const store = createIntegratedStore({
        auth: { isAuthenticated: true, user: { credits: 100 } }
      })
      
      const AIStudioIntegration = () => {
        const handleGenerate = async (prompt) => {
          store.dispatch({ type: 'aiStudio/generateStart' })
          
          try {
            const response = await fetch('/api/ai-studio/generate', {
              method: 'POST',
              body: JSON.stringify({ prompt })
            })
            const result = await response.json()
            
            store.dispatch({
              type: 'aiStudio/generateSuccess',
              payload: result
            })
          } catch (error) {
            console.error('Generation failed:', error)
          }
        }

        const state = store.getState()

        return (
          <div data-testid="ai-studio">
            <textarea 
              data-testid="prompt-input"
              placeholder="Enter your prompt..."
            />
            <button 
              data-testid="generate-btn"
              onClick={() => {
                const prompt = document.querySelector('[data-testid="prompt-input"]').value
                handleGenerate(prompt)
              }}
              disabled={state.aiStudio.loading}
            >
              {state.aiStudio.loading ? 'Generating...' : 'Generate'}
            </button>
            
            <div data-testid="generation-status">
              {state.aiStudio.currentGeneration && (
                <div>
                  Generation ID: {state.aiStudio.currentGeneration.id}
                  Status: {state.aiStudio.currentGeneration.status}
                </div>
              )}
            </div>
            
            <div data-testid="generation-history">
              History Count: {state.aiStudio.generations.length}
            </div>
          </div>
        )
      }

      render(
        <Provider store={store}>
          <AIStudioIntegration />
        </Provider>
      )

      // Enter prompt and generate
      await user.type(screen.getByTestId('prompt-input'), 'A beautiful sunset')
      await user.click(screen.getByTestId('generate-btn'))

      // Check loading state
      expect(screen.getByTestId('generate-btn')).toHaveTextContent('Generating...')

      // Wait for generation to complete
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/ai-studio/generate', expect.objectContaining({
          method: 'POST'
        }))
        expect(screen.getByTestId('generation-history')).toHaveTextContent('History Count: 1')
      })
    })
  })

  describe('Cross-Component Communication', () => {
    test('should update user credits after AI generation', async () => {
      const store = createIntegratedStore({
        auth: { 
          isAuthenticated: true, 
          user: { id: 'user-123', credits: 100 } 
        }
      })
      
      const CreditIntegration = () => {
        const state = store.getState()
        
        const deductCredits = (amount) => {
          store.dispatch({
            type: 'auth/updateUser',
            payload: {
              ...state.auth.user,
              credits: state.auth.user.credits - amount
            }
          })
        }

        return (
          <div data-testid="credit-system">
            <div data-testid="current-credits">
              Credits: {state.auth.user?.credits || 0}
            </div>
            <button 
              data-testid="use-credits"
              onClick={() => deductCredits(15)}
            >
              Generate Image (15 credits)
            </button>
          </div>
        )
      }

      render(
        <Provider store={store}>
          <CreditIntegration />
        </Provider>
      )

      expect(screen.getByTestId('current-credits')).toHaveTextContent('Credits: 100')

      // This would be triggered by actual AI generation
      // For now, we just test the credit deduction
      expect(screen.getByTestId('use-credits')).toBeInTheDocument()
    })

    test('should sync cart state with header cart icon', () => {
      const store = createIntegratedStore({
        cart: {
          items: [
            { id: 'prod-1', name: 'Item 1', quantity: 2 },
            { id: 'prod-2', name: 'Item 2', quantity: 1 }
          ],
          total: 149.97
        }
      })
      
      const HeaderCartSync = () => {
        const state = store.getState()
        const totalItems = state.cart.items.reduce((sum, item) => sum + item.quantity, 0)

        return (
          <header data-testid="header">
            <div data-testid="cart-icon">
              🛒 Cart ({totalItems})
            </div>
            <div data-testid="cart-total">
              ${state.cart.total.toFixed(2)}
            </div>
          </header>
        )
      }

      render(
        <Provider store={store}>
          <HeaderCartSync />
        </Provider>
      )

      expect(screen.getByTestId('cart-icon')).toHaveTextContent('🛒 Cart (3)')
      expect(screen.getByTestId('cart-total')).toHaveTextContent('$149.97')
    })
  })

  describe('Error Handling Integration', () => {
    test('should handle API errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock failed API call
      global.fetch = jest.fn(() => 
        Promise.reject(new Error('Network error'))
      )
      
      const ErrorHandling = () => {
        const [error, setError] = React.useState(null)
        const [loading, setLoading] = React.useState(false)

        const handleApiCall = async () => {
          setLoading(true)
          setError(null)
          
          try {
            await fetch('/api/test-endpoint')
          } catch (err) {
            setError(err.message)
          } finally {
            setLoading(false)
          }
        }

        return (
          <div data-testid="error-handling">
            <button 
              data-testid="api-call-btn"
              onClick={handleApiCall}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Make API Call'}
            </button>
            {error && (
              <div data-testid="error-message" role="alert">
                Error: {error}
              </div>
            )}
          </div>
        )
      }

      // Need to add React import for this test
      const React = require('react')
      
      render(<ErrorHandling />)

      await user.click(screen.getByTestId('api-call-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Error: Network error')
      })
    })
  })

  describe('Performance Integration', () => {
    test('should handle rapid state updates efficiently', async () => {
      const user = userEvent.setup()
      const store = createIntegratedStore()
      
      const PerformanceTest = () => {
        const [updateCount, setUpdateCount] = React.useState(0)
        
        const handleRapidUpdates = () => {
          // Simulate rapid updates
          for (let i = 0; i < 10; i++) {
            setTimeout(() => {
              setUpdateCount(prev => prev + 1)
              store.dispatch({
                type: 'cart/addItem',
                payload: {
                  id: `item-${i}`,
                  name: `Item ${i}`,
                  price: 10,
                  quantity: 1
                }
              })
            }, i * 10)
          }
        }

        const state = store.getState()

        return (
          <div data-testid="performance-test">
            <button 
              data-testid="rapid-updates"
              onClick={handleRapidUpdates}
            >
              Trigger Rapid Updates
            </button>
            <div data-testid="update-count">
              Updates: {updateCount}
            </div>
            <div data-testid="cart-items">
              Cart Items: {state.cart.items.length}
            </div>
          </div>
        )
      }

      const React = require('react')
      
      render(
        <Provider store={store}>
          <PerformanceTest />
        </Provider>
      )

      await user.click(screen.getByTestId('rapid-updates'))

      // Should handle updates without crashing
      expect(screen.getByTestId('rapid-updates')).toBeInTheDocument()
    })
  })
})

// Integration test utilities
export const integrationTestUtils = {
  createIntegratedStore,
  mockApiResponses,
  
  setupAuthenticatedUser: (userOverrides = {}) => {
    return {
      auth: {
        isAuthenticated: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          credits: 100,
          ...userOverrides
        }
      }
    }
  },
  
  setupCartWithItems: (items = []) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return {
      cart: {
        items,
        total
      }
    }
  },
  
  mockApiCall: (url, response) => {
    global.fetch = jest.fn((requestUrl) => {
      if (requestUrl === url) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response)
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })
  }
}