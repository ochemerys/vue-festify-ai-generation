Feature: Account Settings
  As a user
  I want to manage my account settings
  So that I can keep my profile information up to date and secure

  Background:
    Given I am logged in as a user
    And I am on the Settings page

  Scenario: View current account information
    When I navigate to the "Account Settings" section
    Then I should see my current first name
    And I should see my current last name
    And I should see my current email address
    And I should see my current phone number
    And I should see my profile picture or placeholder

  Scenario: Update profile information successfully
    Given I am in the "Account Settings" section
    When I update my first name to "John"
    And I update my last name to "Doe"
    And I update my phone number to "+1234567890"
    And I click "Save Changes"
    Then my profile information should be updated
    And I should see a success message "Profile updated successfully"
    And the updated information should be displayed in the header

  Scenario: Update email address
    Given I am in the "Account Settings" section
    When I update my email to "newemail@example.com"
    And I click "Save Changes"
    Then I should see a verification message "Verification email sent to newemail@example.com"
    And my email should remain unchanged until verified
    And I should receive a verification email

  Scenario: Upload profile picture
    Given I am in the "Account Settings" section
    When I click "Upload Profile Picture"
    And I select a valid image file
    And I click "Upload"
    Then my profile picture should be updated
    And I should see a success message "Profile picture updated successfully"
    And the new picture should appear in the sidebar

  Scenario: Remove profile picture
    Given I am in the "Account Settings" section
    And I have a profile picture uploaded
    When I click "Remove Picture"
    And I confirm the removal
    Then my profile picture should be removed
    And I should see the default avatar with my initials

  Scenario: Change password successfully
    Given I am in the "Account Settings" section
    When I click "Change Password"
    And I enter my current password "oldPassword123"
    And I enter new password "newPassword456"
    And I confirm new password "newPassword456"
    And I click "Update Password"
    Then my password should be changed
    And I should see a success message "Password changed successfully"
    And I should be able to login with the new password

  Scenario: Change password with incorrect current password
    Given I am in the "Account Settings" section
    When I click "Change Password"
    And I enter an incorrect current password
    And I enter new password "newPassword456"
    And I confirm new password "newPassword456"
    And I click "Update Password"
    Then I should see an error message "Current password is incorrect"
    And my password should not be changed

  Scenario: Change password with mismatched confirmation
    Given I am in the "Account Settings" section
    When I click "Change Password"
    And I enter my current password "oldPassword123"
    And I enter new password "newPassword456"
    And I confirm new password "differentPassword789"
    And I click "Update Password"
    Then I should see an error message "Passwords do not match"
    And my password should not be changed

  Scenario: Change password with weak password
    Given I am in the "Account Settings" section
    When I click "Change Password"
    And I enter my current password "oldPassword123"
    And I enter new password "weak"
    And I confirm new password "weak"
    And I click "Update Password"
    Then I should see an error message "Password must be at least 8 characters"
    And my password should not be changed

  Scenario: Enable two-factor authentication
    Given I am in the "Account Settings" section
    And two-factor authentication is disabled
    When I click "Enable 2FA"
    Then I should see a QR code for authentication app
    And I should see a backup code
    When I enter the verification code from my authenticator app
    And I click "Verify and Enable"
    Then two-factor authentication should be enabled
    And I should see a success message "Two-factor authentication enabled"

  Scenario: Disable two-factor authentication
    Given I am in the "Account Settings" section
    And two-factor authentication is enabled
    When I click "Disable 2FA"
    And I enter my password for confirmation
    And I click "Confirm Disable"
    Then two-factor authentication should be disabled
    And I should see a success message "Two-factor authentication disabled"

  Scenario: View active sessions
    Given I am in the "Account Settings" section
    When I navigate to the "Security" tab
    Then I should see a list of my active sessions
    And each session should show device type, location, and last active time
    And I should see my current session marked as "Current"

  Scenario: Logout from other devices
    Given I am in the "Account Settings" section
    And I have multiple active sessions
    When I navigate to the "Security" tab
    And I click "Logout from all other devices"
    And I confirm the action
    Then all other sessions should be terminated
    And I should see a success message "Logged out from all other devices"
    And only my current session should remain active

  Scenario: Validation error for invalid email format
    Given I am in the "Account Settings" section
    When I update my email to "invalid-email"
    And I click "Save Changes"
    Then I should see an error message "Please enter a valid email address"
    And my email should not be updated

  Scenario: Validation error for invalid phone number
    Given I am in the "Account Settings" section
    When I update my phone number to "abc123"
    And I click "Save Changes"
    Then I should see an error message "Please enter a valid phone number"
    And my phone number should not be updated

  Scenario: Cancel account changes
    Given I am in the "Account Settings" section
    And I have made changes to my profile
    When I click "Cancel"
    Then my changes should be discarded
    And the original information should remain unchanged
