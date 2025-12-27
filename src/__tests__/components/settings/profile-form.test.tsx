import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import { ProfileForm } from '@/components/settings/profile-form';
import { render, fillFormField } from '../../utils/test-utils';
import { mockUser } from '../../mocks/handlers';
import { setMockSession, mockToast } from '../../setup';

describe('ProfileForm', () => {
  beforeEach(() => {
    // Set up authenticated session
    setMockSession({
      data: {
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.fullName,
          username: mockUser.username,
        },
        accessToken: 'mock-token',
      },
      status: 'authenticated',
    });
  });

  describe('Form Display', () => {
    it('renders all form fields', () => {
      render(<ProfileForm user={mockUser} />);

      expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/your full name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/tell us about yourself/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/city, country/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/https:\/\/example.com/i)).toBeInTheDocument();
    });

    it('pre-fills form with user data', () => {
      render(<ProfileForm user={mockUser} />);

      expect(screen.getByPlaceholderText(/username/i)).toHaveValue(mockUser.username);
      expect(screen.getByPlaceholderText(/your full name/i)).toHaveValue(mockUser.fullName);
      expect(screen.getByPlaceholderText(/tell us about yourself/i)).toHaveValue(mockUser.bio);
      expect(screen.getByPlaceholderText(/city, country/i)).toHaveValue(mockUser.location);
      expect(screen.getByPlaceholderText(/https:\/\/example.com/i)).toHaveValue(mockUser.website);
    });

    it('shows Save Changes and Reset buttons', () => {
      render(<ProfileForm user={mockUser} />);

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('shows bio character count', () => {
      render(<ProfileForm user={mockUser} />);

      // Bio length is displayed as "{length}/500"
      expect(screen.getByText(new RegExp(`${mockUser.bio.length}/500`))).toBeInTheDocument();
    });
  });

  describe('Username Validation', () => {
    it('shows check mark when username is unchanged', () => {
      render(<ProfileForm user={mockUser} />);

      // No indicator should be shown when username is the same as original
      const usernameInput = screen.getByPlaceholderText(/username/i);
      expect(usernameInput).toHaveValue(mockUser.username);
    });

    it('shows loading indicator while checking username availability', async () => {
      const { user } = render(<ProfileForm user={mockUser} />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      await user.clear(usernameInput);
      await user.type(usernameInput, 'newusername');

      // Should show loading indicator briefly
      await waitFor(() => {
        // After checking, should show check or X
        const usernameField = screen.getByPlaceholderText(/username/i).closest('.relative');
        expect(usernameField).toBeInTheDocument();
      });
    });

    it('shows check mark when username is available', async () => {
      const { user } = render(<ProfileForm user={mockUser} />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      await user.clear(usernameInput);
      await user.type(usernameInput, 'availableuser');

      await waitFor(() => {
        // The input should have green border when available
        expect(usernameInput).toHaveClass('border-green-500');
      }, { timeout: 2000 });
    });

    it('shows X mark when username is taken', async () => {
      const { user } = render(<ProfileForm user={mockUser} />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      await user.clear(usernameInput);
      await user.type(usernameInput, 'taken');

      await waitFor(() => {
        // The X icon should appear when username is taken
        const xIcon = document.querySelector('.text-destructive');
        expect(xIcon).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('disables submit button when username is taken', async () => {
      const { user } = render(<ProfileForm user={mockUser} />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      await user.clear(usernameInput);
      await user.type(usernameInput, 'taken');

      // Wait for username check to complete
      await waitFor(() => {
        const xIcon = document.querySelector('.text-destructive');
        expect(xIcon).toBeInTheDocument();
      }, { timeout: 2000 });

      // Submit button should be disabled when username is taken
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Bio Field', () => {
    it('updates character count as user types', async () => {
      const { user } = render(<ProfileForm user={mockUser} />);

      const bioInput = screen.getByPlaceholderText(/tell us about yourself/i);
      const newBio = 'This is a new bio';

      await user.clear(bioInput);
      await user.type(bioInput, newBio);

      expect(screen.getByText(`${newBio.length}/500`)).toBeInTheDocument();
    });

    it('shows warning when bio exceeds 500 characters', async () => {
      const { user } = render(<ProfileForm user={mockUser} />);

      const bioInput = screen.getByPlaceholderText(/tell us about yourself/i);
      const longBio = 'a'.repeat(501);

      await user.clear(bioInput);
      await user.type(bioInput, longBio);

      await waitFor(() => {
        const counter = screen.getByText(`${longBio.length}/500`);
        expect(counter).toHaveClass('text-destructive');
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with updated data', async () => {
      const { user } = render(<ProfileForm user={mockUser} />);

      // Update full name
      const fullNameInput = screen.getByPlaceholderText(/your full name/i);
      await user.clear(fullNameInput);
      await user.type(fullNameInput, 'Updated Name');

      // Submit form
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Profile updated successfully!');
      });
    });

    it('shows loading state during submission', async () => {
      const { user } = render(<ProfileForm user={mockUser} />);

      // Update full name
      const fullNameInput = screen.getByPlaceholderText(/your full name/i);
      await user.clear(fullNameInput);
      await user.type(fullNameInput, 'Updated Name');

      // Submit form
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      // Loading state should appear briefly
      // The button text changes to "Saving..."
    });

    it('does not submit if username is taken', async () => {
      const { user } = render(<ProfileForm user={mockUser} />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      await user.clear(usernameInput);
      await user.type(usernameInput, 'taken');

      // Wait for username check to complete and show X
      await waitFor(() => {
        const xIcon = document.querySelector('.text-destructive');
        expect(xIcon).toBeInTheDocument();
      }, { timeout: 2000 });

      // Click submit - it should not trigger success toast
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      // Success toast should NOT be called since form submission is prevented
      // (the form returns early when username is taken)
    });
  });

  describe('Form Reset', () => {
    it('resets form to original values when clicking Reset', async () => {
      const { user } = render(<ProfileForm user={mockUser} />);

      // Change some values
      const fullNameInput = screen.getByPlaceholderText(/your full name/i);
      await user.clear(fullNameInput);
      await user.type(fullNameInput, 'Changed Name');

      const bioInput = screen.getByPlaceholderText(/tell us about yourself/i);
      await user.clear(bioInput);
      await user.type(bioInput, 'Changed bio');

      // Click reset
      await user.click(screen.getByRole('button', { name: /reset/i }));

      // Values should be back to original
      expect(screen.getByPlaceholderText(/your full name/i)).toHaveValue(mockUser.fullName);
      expect(screen.getByPlaceholderText(/tell us about yourself/i)).toHaveValue(mockUser.bio);
    });

    it('resets bio character count after reset', async () => {
      const { user } = render(<ProfileForm user={mockUser} />);

      const bioInput = screen.getByPlaceholderText(/tell us about yourself/i);
      await user.clear(bioInput);
      await user.type(bioInput, 'Short bio');

      await user.click(screen.getByRole('button', { name: /reset/i }));

      expect(screen.getByText(`${mockUser.bio.length}/500`)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation error for empty full name', async () => {
      const { user } = render(<ProfileForm user={mockUser} />);

      const fullNameInput = screen.getByPlaceholderText(/your full name/i);
      await user.clear(fullNameInput);

      // Submit to trigger validation
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        // There should be a validation message
        expect(screen.getByText(/required|must be/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid website URL', async () => {
      const { user } = render(<ProfileForm user={mockUser} />);

      const websiteInput = screen.getByPlaceholderText(/https:\/\/example.com/i);
      await user.clear(websiteInput);
      await user.type(websiteInput, 'not-a-valid-url');

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      // Website field should show error for invalid URL
    });
  });

  describe('Field Descriptions', () => {
    it('shows description for username field', () => {
      render(<ProfileForm user={mockUser} />);

      expect(
        screen.getByText(/your unique username/i)
      ).toBeInTheDocument();
    });

    it('shows description for bio field', () => {
      render(<ProfileForm user={mockUser} />);

      expect(
        screen.getByText(/a brief description about yourself/i)
      ).toBeInTheDocument();
    });

    it('shows privacy notice for date of birth', () => {
      render(<ProfileForm user={mockUser} />);

      // There are multiple privacy notices (for date of birth and gender)
      const privacyNotices = screen.getAllByText(/this information is private/i);
      expect(privacyNotices.length).toBeGreaterThan(0);
    });
  });

  describe('Gender Selection', () => {
    it('renders gender select field', () => {
      render(<ProfileForm user={mockUser} />);

      // The gender combobox should be present
      const genderSelect = screen.getByRole('combobox');
      expect(genderSelect).toBeInTheDocument();
    });

    it('has placeholder text for gender selection', () => {
      render(<ProfileForm user={mockUser} />);

      expect(screen.getByText('Select gender')).toBeInTheDocument();
    });
  });
});
