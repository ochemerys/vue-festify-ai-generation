Feature: User Preferences Settings
  As a user
  I want to customize my application preferences
  So that I can have a personalized experience

  Background:
    Given I am logged in as a user
    And I am on the Settings page

  Scenario: View current user preferences
    When I navigate to the "User Preferences" section
    Then I should see my current theme setting
    And I should see my current language setting
    And I should see my current notification preferences
    And I should see my current dashboard layout preferences

  Scenario: Change theme from light to dark mode
    Given I am in the "User Preferences" section
    And the current theme is "light"
    When I select "dark" theme
    And I click "Save Changes"
    Then the theme should change to dark mode
    And I should see a success message "Preferences saved successfully"
    And the theme preference should persist after page reload

  Scenario: Change theme from dark to light mode
    Given I am in the "User Preferences" section
    And the current theme is "dark"
    When I select "light" theme
    And I click "Save Changes"
    Then the theme should change to light mode
    And I should see a success message "Preferences saved successfully"

  Scenario: Update language preference
    Given I am in the "User Preferences" section
    When I select "Spanish" from the language dropdown
    And I click "Save Changes"
    Then the application language should change to Spanish
    And I should see a success message in Spanish
    And the language preference should persist after page reload

  Scenario: Configure notification preferences
    Given I am in the "User Preferences" section
    When I enable "Email notifications"
    And I enable "Low stock alerts"
    And I disable "Order updates"
    And I click "Save Changes"
    Then my notification preferences should be updated
    And I should see a success message "Preferences saved successfully"

  Scenario: Set default landing page
    Given I am in the "User Preferences" section
    When I select "Products" as my default landing page
    And I click "Save Changes"
    Then my default landing page should be set to "Products"
    And when I log in next time, I should land on the Products page

  Scenario: Reset preferences to default
    Given I am in the "User Preferences" section
    And I have customized my preferences
    When I click "Reset to Defaults"
    And I confirm the reset action
    Then all preferences should be reset to default values
    And I should see a success message "Preferences reset to defaults"

  Scenario: Cancel preference changes
    Given I am in the "User Preferences" section
    And I have made changes to my preferences
    When I click "Cancel"
    Then my changes should be discarded
    And the original preferences should remain unchanged

  Scenario: Validation error when saving invalid preferences
    Given I am in the "User Preferences" section
    When I enter invalid data in a preference field
    And I click "Save Changes"
    Then I should see a validation error message
    And the preferences should not be saved
