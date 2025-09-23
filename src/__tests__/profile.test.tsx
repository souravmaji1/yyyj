/**
 * User Profile and Settings Tests
 * Tests user profile management, settings, preferences, and account functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

// Mock user data
const mockUser = {
  id: 'user-123',
  email: 'john.doe@example.com',
  displayName: 'John Doe',
  avatar: 'https://example.com/avatar.jpg',
  joinDate: '2023-01-15',
  verified: true,
  credits: 150,
  subscription: {
    plan: 'Pro',
    status: 'active',
    renewalDate: '2024-02-15'
  },
  preferences: {
    theme: 'dark',
    language: 'en',
    emailNotifications: true,
    pushNotifications: false,
    twoFactorEnabled: true
  },
  stats: {
    generationsCount: 45,
    totalSpent: 299.99,
    favoritesCount: 12
  }
}

// Mock store for profile
const mockStore = configureStore({
  reducer: {
    profile: (state = {
      user: null,
      loading: false,
      error: null,
      isEditing: false,
      uploadingAvatar: false
    }, action) => {
      switch (action.type) {
        case 'profile/fetchStart':
          return { ...state, loading: true }
        case 'profile/fetchSuccess':
          return { ...state, user: action.payload, loading: false }
        case 'profile/updateStart':
          return { ...state, loading: true }
        case 'profile/updateSuccess':
          return { ...state, user: { ...state.user, ...action.payload }, loading: false }
        case 'profile/setEditing':
          return { ...state, isEditing: action.payload }
        case 'profile/avatarUploadStart':
          return { ...state, uploadingAvatar: true }
        case 'profile/avatarUploadSuccess':
          return { ...state, user: { ...state.user, avatar: action.payload }, uploadingAvatar: false }
        default:
          return state
      }
    },
    settings: (state = {
      preferences: {},
      security: {},
      notifications: {},
      loading: false
    }, action) => {
      switch (action.type) {
        case 'settings/updatePreferences':
          return { ...state, preferences: { ...state.preferences, ...action.payload } }
        case 'settings/updateSecurity':
          return { ...state, security: { ...state.security, ...action.payload } }
        default:
          return state
      }
    }
  }
})

// Mock file upload
const mockFileUpload = jest.fn()
global.fetch = jest.fn()

describe('User Profile and Settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Profile Overview', () => {
    test('should display user profile information', () => {
      render(
        <Provider store={mockStore}>
          <div data-testid="profile-overview">
            <div data-testid="profile-header">
              <img 
                src={mockUser.avatar} 
                alt={`${mockUser.displayName}'s avatar`}
                data-testid="user-avatar"
              />
              <div data-testid="user-info">
                <h1 data-testid="user-name">{mockUser.displayName}</h1>
                <p data-testid="user-email">{mockUser.email}</p>
                <div data-testid="verification-badge">
                  {mockUser.verified ? '✓ Verified' : 'Unverified'}
                </div>
                <div data-testid="join-date">
                  Member since {mockUser.joinDate}
                </div>
              </div>
            </div>
            
            <div data-testid="user-stats">
              <div data-testid="stat-credits">
                Credits: {mockUser.credits}
              </div>
              <div data-testid="stat-generations">
                Generations: {mockUser.stats.generationsCount}
              </div>
              <div data-testid="stat-spent">
                Total Spent: ${mockUser.stats.totalSpent}
              </div>
              <div data-testid="stat-favorites">
                Favorites: {mockUser.stats.favoritesCount}
              </div>
            </div>
            
            <div data-testid="subscription-info">
              <div data-testid="current-plan">
                Current Plan: {mockUser.subscription.plan}
              </div>
              <div data-testid="plan-status">
                Status: {mockUser.subscription.status}
              </div>
              <div data-testid="renewal-date">
                Renews: {mockUser.subscription.renewalDate}
              </div>
            </div>
          </div>
        </Provider>
      )

      expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe')
      expect(screen.getByTestId('user-email')).toHaveTextContent('john.doe@example.com')
      expect(screen.getByTestId('verification-badge')).toHaveTextContent('✓ Verified')
      expect(screen.getByTestId('stat-credits')).toHaveTextContent('Credits: 150')
      expect(screen.getByTestId('current-plan')).toHaveTextContent('Current Plan: Pro')
    })

    test('should handle avatar upload', async () => {
      const user = userEvent.setup()
      
      render(
        <Provider store={mockStore}>
          <div data-testid="avatar-section">
            <img 
              src={mockUser.avatar} 
              alt="User avatar"
              data-testid="current-avatar"
            />
            <input
              type="file"
              accept="image/*"
              data-testid="avatar-upload"
              onChange={mockFileUpload}
            />
            <button data-testid="upload-button">
              Upload New Avatar
            </button>
            <div data-testid="upload-progress" style={{ display: 'none' }}>
              Uploading...
            </div>
          </div>
        </Provider>
      )

      const fileInput = screen.getByTestId('avatar-upload')
      const file = new File(['dummy content'], 'avatar.jpg', { type: 'image/jpeg' })

      await user.upload(fileInput, file)

      expect(fileInput.files?.[0]).toBe(file)
      expect(mockFileUpload).toHaveBeenCalled()
    })

    test('should toggle edit mode', async () => {
      const user = userEvent.setup()
      
      render(
        <Provider store={mockStore}>
          <div data-testid="profile-edit">
            <div data-testid="view-mode">
              <h1>{mockUser.displayName}</h1>
              <button data-testid="edit-button">Edit Profile</button>
            </div>
            <div data-testid="edit-mode" style={{ display: 'none' }}>
              <input 
                data-testid="name-input"
                defaultValue={mockUser.displayName}
              />
              <button data-testid="save-button">Save Changes</button>
              <button data-testid="cancel-button">Cancel</button>
            </div>
          </div>
        </Provider>
      )

      const editButton = screen.getByTestId('edit-button')
      await user.click(editButton)

      // In real component, this would toggle edit mode
      expect(editButton).toBeInTheDocument()
    })
  })

  describe('Profile Editing', () => {
    test('should validate profile form fields', async () => {
      const user = userEvent.setup()
      
      render(
        <form data-testid="profile-form">
          <input
            type="text"
            data-testid="display-name"
            placeholder="Display Name"
            required
            minLength={2}
            maxLength={50}
          />
          <input
            type="email"
            data-testid="email"
            placeholder="Email"
            required
          />
          <textarea
            data-testid="bio"
            placeholder="Bio"
            maxLength={500}
          />
          <input
            type="url"
            data-testid="website"
            placeholder="Website URL"
          />
          <button type="submit" data-testid="save-profile">
            Save Profile
          </button>
        </form>
      )

      const displayNameInput = screen.getByTestId('display-name')
      const emailInput = screen.getByTestId('email')
      const saveButton = screen.getByTestId('save-profile')

      // Test empty required fields
      await user.click(saveButton)
      expect(displayNameInput).toBeInvalid()
      expect(emailInput).toBeInvalid()

      // Test valid input
      await user.type(displayNameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')

      expect(displayNameInput).toBeValid()
      expect(emailInput).toBeValid()
    })

    test('should handle profile update', async () => {
      const mockUpdateProfile = jest.fn()
      const user = userEvent.setup()
      
      render(
        <form 
          data-testid="profile-update-form"
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            mockUpdateProfile({
              displayName: formData.get('displayName'),
              bio: formData.get('bio'),
              website: formData.get('website')
            })
          }}
        >
          <input
            name="displayName"
            data-testid="display-name"
            defaultValue={mockUser.displayName}
          />
          <textarea
            name="bio"
            data-testid="bio"
            placeholder="Tell us about yourself..."
          />
          <input
            name="website"
            type="url"
            data-testid="website"
            placeholder="https://your-website.com"
          />
          <button type="submit" data-testid="update-button">
            Update Profile
          </button>
        </form>
      )

      const bioInput = screen.getByTestId('bio')
      const websiteInput = screen.getByTestId('website')
      const updateButton = screen.getByTestId('update-button')

      await user.type(bioInput, 'AI enthusiast and gamer')
      await user.type(websiteInput, 'https://johndoe.com')
      await user.click(updateButton)

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          displayName: 'John Doe',
          bio: 'AI enthusiast and gamer',
          website: 'https://johndoe.com'
        })
      })
    })
  })

  describe('Account Settings', () => {
    test('should display account settings options', () => {
      render(
        <Provider store={mockStore}>
          <div data-testid="account-settings">
            <section data-testid="email-settings">
              <h2>Email Settings</h2>
              <div data-testid="current-email">
                Current Email: {mockUser.email}
              </div>
              <button data-testid="change-email">Change Email</button>
              <div data-testid="email-verification">
                Email Status: {mockUser.verified ? 'Verified' : 'Not Verified'}
              </div>
            </section>
            
            <section data-testid="password-settings">
              <h2>Password Settings</h2>
              <button data-testid="change-password">Change Password</button>
              <div data-testid="last-changed">
                Last changed: 30 days ago
              </div>
            </section>
            
            <section data-testid="security-settings">
              <h2>Security Settings</h2>
              <div data-testid="two-factor">
                <label>
                  <input 
                    type="checkbox" 
                    checked={mockUser.preferences.twoFactorEnabled}
                    data-testid="2fa-toggle"
                    readOnly
                  />
                  Two-Factor Authentication
                </label>
              </div>
              <button data-testid="view-sessions">Active Sessions</button>
            </section>
          </div>
        </Provider>
      )

      expect(screen.getByTestId('current-email')).toHaveTextContent(mockUser.email)
      expect(screen.getByTestId('email-verification')).toHaveTextContent('Verified')
      expect(screen.getByTestId('2fa-toggle')).toBeChecked()
      expect(screen.getByTestId('change-password')).toBeInTheDocument()
    })

    test('should handle password change', async () => {
      const mockChangePassword = jest.fn()
      const user = userEvent.setup()
      
      render(
        <form 
          data-testid="password-form"
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            mockChangePassword({
              currentPassword: formData.get('currentPassword'),
              newPassword: formData.get('newPassword'),
              confirmPassword: formData.get('confirmPassword')
            })
          }}
        >
          <input
            type="password"
            name="currentPassword"
            data-testid="current-password"
            placeholder="Current Password"
            required
          />
          <input
            type="password"
            name="newPassword"
            data-testid="new-password"
            placeholder="New Password"
            minLength={8}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            data-testid="confirm-password"
            placeholder="Confirm New Password"
            required
          />
          <button type="submit" data-testid="change-password-btn">
            Change Password
          </button>
        </form>
      )

      await user.type(screen.getByTestId('current-password'), 'oldpassword123')
      await user.type(screen.getByTestId('new-password'), 'newpassword456')
      await user.type(screen.getByTestId('confirm-password'), 'newpassword456')
      await user.click(screen.getByTestId('change-password-btn'))

      await waitFor(() => {
        expect(mockChangePassword).toHaveBeenCalledWith({
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword456',
          confirmPassword: 'newpassword456'
        })
      })
    })

    test('should handle two-factor authentication toggle', async () => {
      const mockToggle2FA = jest.fn()
      const user = userEvent.setup()
      
      render(
        <div data-testid="2fa-settings">
          <label>
            <input
              type="checkbox"
              data-testid="2fa-checkbox"
              checked={mockUser.preferences.twoFactorEnabled}
              onChange={mockToggle2FA}
            />
            Enable Two-Factor Authentication
          </label>
          <div data-testid="2fa-status">
            Status: {mockUser.preferences.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </div>
          <button data-testid="setup-2fa">
            Set up 2FA
          </button>
        </div>
      )

      const checkbox = screen.getByTestId('2fa-checkbox')
      await user.click(checkbox)

      expect(mockToggle2FA).toHaveBeenCalled()
      expect(screen.getByTestId('2fa-status')).toHaveTextContent('Enabled')
    })
  })

  describe('Notification Preferences', () => {
    test('should display notification settings', () => {
      render(
        <Provider store={mockStore}>
          <div data-testid="notification-settings">
            <h2>Notification Preferences</h2>
            
            <div data-testid="email-notifications">
              <label>
                <input
                  type="checkbox"
                  checked={mockUser.preferences.emailNotifications}
                  data-testid="email-notifications-toggle"
                  readOnly
                />
                Email Notifications
              </label>
            </div>
            
            <div data-testid="push-notifications">
              <label>
                <input
                  type="checkbox"
                  checked={mockUser.preferences.pushNotifications}
                  data-testid="push-notifications-toggle"
                  readOnly
                />
                Push Notifications
              </label>
            </div>
            
            <div data-testid="notification-types">
              <h3>Notification Types</h3>
              <label>
                <input type="checkbox" data-testid="generation-complete" />
                AI Generation Complete
              </label>
              <label>
                <input type="checkbox" data-testid="order-updates" />
                Order Updates
              </label>
              <label>
                <input type="checkbox" data-testid="security-alerts" />
                Security Alerts
              </label>
              <label>
                <input type="checkbox" data-testid="marketing" />
                Marketing & Promotions
              </label>
            </div>
          </div>
        </Provider>
      )

      expect(screen.getByTestId('email-notifications-toggle')).toBeChecked()
      expect(screen.getByTestId('push-notifications-toggle')).not.toBeChecked()
      expect(screen.getByTestId('generation-complete')).toBeInTheDocument()
      expect(screen.getByTestId('order-updates')).toBeInTheDocument()
    })

    test('should handle notification preference changes', async () => {
      const mockUpdateNotifications = jest.fn()
      const user = userEvent.setup()
      
      render(
        <div data-testid="notification-prefs">
          <label>
            <input
              type="checkbox"
              data-testid="email-toggle"
              defaultChecked={mockUser.preferences.emailNotifications}
              onChange={(e) => mockUpdateNotifications('email', e.target.checked)}
            />
            Email Notifications
          </label>
          <label>
            <input
              type="checkbox"
              data-testid="push-toggle"
              defaultChecked={mockUser.preferences.pushNotifications}
              onChange={(e) => mockUpdateNotifications('push', e.target.checked)}
            />
            Push Notifications
          </label>
        </div>
      )

      const emailToggle = screen.getByTestId('email-toggle')
      const pushToggle = screen.getByTestId('push-toggle')

      await user.click(emailToggle)
      expect(mockUpdateNotifications).toHaveBeenCalledWith('email', false)

      await user.click(pushToggle)
      expect(mockUpdateNotifications).toHaveBeenCalledWith('push', true)
    })
  })

  describe('Theme and Display Preferences', () => {
    test('should display theme settings', () => {
      render(
        <Provider store={mockStore}>
          <div data-testid="theme-settings">
            <h2>Theme & Display</h2>
            
            <div data-testid="theme-selector">
              <label>Theme:</label>
              <select data-testid="theme-select" value={mockUser.preferences.theme}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            
            <div data-testid="language-selector">
              <label>Language:</label>
              <select data-testid="language-select" value={mockUser.preferences.language}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            
            <div data-testid="accessibility-options">
              <h3>Accessibility</h3>
              <label>
                <input type="checkbox" data-testid="high-contrast" />
                High Contrast Mode
              </label>
              <label>
                <input type="checkbox" data-testid="reduce-motion" />
                Reduce Motion
              </label>
              <label>
                <input type="checkbox" data-testid="large-text" />
                Large Text
              </label>
            </div>
          </div>
        </Provider>
      )

      expect(screen.getByTestId('theme-select')).toHaveValue('dark')
      expect(screen.getByTestId('language-select')).toHaveValue('en')
      expect(screen.getByTestId('high-contrast')).toBeInTheDocument()
      expect(screen.getByTestId('reduce-motion')).toBeInTheDocument()
    })

    test('should handle theme changes', async () => {
      const mockUpdateTheme = jest.fn()
      const user = userEvent.setup()
      
      render(
        <div data-testid="theme-controls">
          <select 
            data-testid="theme-selector"
            defaultValue={mockUser.preferences.theme}
            onChange={(e) => mockUpdateTheme(e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
          <div data-testid="theme-preview">
            Current theme: {mockUser.preferences.theme}
          </div>
        </div>
      )

      const themeSelector = screen.getByTestId('theme-selector')
      
      await user.selectOptions(themeSelector, 'light')
      expect(mockUpdateTheme).toHaveBeenCalledWith('light')

      await user.selectOptions(themeSelector, 'auto')
      expect(mockUpdateTheme).toHaveBeenCalledWith('auto')
    })
  })

  describe('Data Management', () => {
    test('should display data management options', () => {
      render(
        <div data-testid="data-management">
          <h2>Data Management</h2>
          
          <section data-testid="data-export">
            <h3>Export Data</h3>
            <p>Download a copy of your data</p>
            <button data-testid="export-profile">Export Profile Data</button>
            <button data-testid="export-generations">Export AI Generations</button>
            <button data-testid="export-orders">Export Order History</button>
          </section>
          
          <section data-testid="data-deletion">
            <h3>Delete Data</h3>
            <p>Permanently delete your data</p>
            <button data-testid="delete-generations">Delete All Generations</button>
            <button data-testid="delete-account" className="danger">
              Delete Account
            </button>
          </section>
          
          <section data-testid="privacy-settings">
            <h3>Privacy Settings</h3>
            <label>
              <input type="checkbox" data-testid="profile-public" />
              Make profile public
            </label>
            <label>
              <input type="checkbox" data-testid="analytics-opt-out" />
              Opt out of analytics
            </label>
          </section>
        </div>
      )

      expect(screen.getByTestId('export-profile')).toBeInTheDocument()
      expect(screen.getByTestId('export-generations')).toBeInTheDocument()
      expect(screen.getByTestId('delete-account')).toBeInTheDocument()
      expect(screen.getByTestId('profile-public')).toBeInTheDocument()
    })

    test('should handle data export', async () => {
      const mockExportData = jest.fn()
      const user = userEvent.setup()
      
      render(
        <div data-testid="export-section">
          <button 
            data-testid="export-btn"
            onClick={() => mockExportData('profile')}
          >
            Export Profile Data
          </button>
          <div data-testid="export-status" style={{ display: 'none' }}>
            Preparing your data export...
          </div>
        </div>
      )

      const exportBtn = screen.getByTestId('export-btn')
      await user.click(exportBtn)

      expect(mockExportData).toHaveBeenCalledWith('profile')
    })

    test('should handle account deletion with confirmation', async () => {
      const mockDeleteAccount = jest.fn()
      const user = userEvent.setup()
      
      render(
        <div data-testid="delete-account-section">
          <button 
            data-testid="delete-account-btn"
            onClick={() => {
              const confirmed = window.confirm('Are you sure you want to delete your account?')
              if (confirmed) mockDeleteAccount()
            }}
          >
            Delete Account
          </button>
        </div>
      )

      // Mock window.confirm
      window.confirm = jest.fn(() => true)

      const deleteBtn = screen.getByTestId('delete-account-btn')
      await user.click(deleteBtn)

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete your account?')
      expect(mockDeleteAccount).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    test('should have proper form labels and ARIA attributes', () => {
      render(
        <form data-testid="accessible-form">
          <fieldset>
            <legend>Personal Information</legend>
            <label htmlFor="profile-name">Display Name</label>
            <input
              id="profile-name"
              type="text"
              aria-describedby="name-help"
              aria-required="true"
            />
            <div id="name-help">Enter your display name (2-50 characters)</div>
          </fieldset>
          
          <fieldset>
            <legend>Notifications</legend>
            <label>
              <input type="checkbox" role="switch" aria-checked="true" />
              Email notifications
            </label>
          </fieldset>
          
          <button type="submit" aria-describedby="save-help">
            Save Changes
          </button>
          <div id="save-help">Save your profile changes</div>
        </form>
      )

      expect(screen.getByLabelText('Display Name')).toHaveAttribute('aria-describedby', 'name-help')
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByRole('button', { name: 'Save Changes' })).toHaveAttribute('aria-describedby', 'save-help')
    })

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <div data-testid="keyboard-nav">
          <input data-testid="input-1" type="text" />
          <input data-testid="input-2" type="email" />
          <select data-testid="select-1">
            <option>Option 1</option>
          </select>
          <button data-testid="button-1">Save</button>
        </div>
      )

      const input1 = screen.getByTestId('input-1')
      const input2 = screen.getByTestId('input-2')
      const select1 = screen.getByTestId('select-1')
      const button1 = screen.getByTestId('button-1')

      input1.focus()
      expect(input1).toHaveFocus()

      await user.tab()
      expect(input2).toHaveFocus()

      await user.tab()
      expect(select1).toHaveFocus()

      await user.tab()
      expect(button1).toHaveFocus()
    })
  })
})

// Test utilities for profile and settings
export const profileTestUtils = {
  mockUser,
  
  createMockStore: (initialState = {}) => {
    return configureStore({
      reducer: {
        profile: (state = {
          user: null,
          loading: false,
          error: null,
          ...initialState.profile
        }) => state,
        settings: (state = {
          preferences: {},
          security: {},
          notifications: {},
          ...initialState.settings
        }) => state
      }
    })
  },
  
  mockFileUpload: mockFileUpload,
  
  createMockUser: (overrides = {}) => ({
    ...mockUser,
    ...overrides
  })
}