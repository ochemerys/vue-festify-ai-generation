Feature: Business Settings
  As an administrator
  I want to configure business settings
  So that the system reflects my company's operational requirements

  Background:
    Given I am logged in as an administrator
    And I am on the Settings page

  Scenario: View current business settings
    When I navigate to the "Business Settings" section
    Then I should see the company name
    And I should see the company address
    And I should see the tax ID
    And I should see the company logo
    And I should see the default currency
    And I should see the list of warehouse locations

  Scenario: Update company information
    Given I am in the "Business Settings" section
    When I update the company name to "Acme Corporation"
    And I update the company address to "123 Main St, City, State 12345"
    And I update the tax ID to "12-3456789"
    And I click "Save Changes"
    Then the company information should be updated
    And I should see a success message "Business settings updated successfully"

  Scenario: Upload company logo
    Given I am in the "Business Settings" section
    When I click "Upload Logo"
    And I select a valid image file
    And I click "Upload"
    Then the company logo should be updated
    And I should see a success message "Logo uploaded successfully"
    And the logo should appear in reports and invoices

  Scenario: Add new warehouse location
    Given I am in the "Business Settings" section
    When I navigate to the "Locations" tab
    And I click "Add Location"
    And I enter location name "Warehouse North"
    And I enter location address "456 Industrial Blvd"
    And I enter location code "WH-N"
    And I click "Save Location"
    Then the new location should be added to the list
    And I should see a success message "Location added successfully"

  Scenario: Edit existing warehouse location
    Given I am in the "Business Settings" section
    And I have an existing location "Warehouse South"
    When I navigate to the "Locations" tab
    And I click "Edit" on "Warehouse South"
    And I update the location name to "Warehouse South - Expanded"
    And I click "Save Changes"
    Then the location should be updated
    And I should see a success message "Location updated successfully"

  Scenario: Delete warehouse location
    Given I am in the "Business Settings" section
    And I have a location "Old Warehouse" with no inventory
    When I navigate to the "Locations" tab
    And I click "Delete" on "Old Warehouse"
    And I confirm the deletion
    Then the location should be removed from the list
    And I should see a success message "Location deleted successfully"

  Scenario: Cannot delete warehouse location with inventory
    Given I am in the "Business Settings" section
    And I have a location "Main Warehouse" with active inventory
    When I navigate to the "Locations" tab
    And I click "Delete" on "Main Warehouse"
    Then I should see an error message "Cannot delete location with active inventory"
    And the location should remain in the list

  Scenario: Set default warehouse location
    Given I am in the "Business Settings" section
    When I navigate to the "Locations" tab
    And I select "Warehouse North" as the default location
    And I click "Save Changes"
    Then "Warehouse North" should be marked as default
    And new inventory items should default to this location

  Scenario: Configure default currency
    Given I am in the "Business Settings" section
    When I navigate to the "Currency & Units" tab
    And I select "EUR" as the default currency
    And I click "Save Changes"
    Then the default currency should be set to EUR
    And all prices should display in EUR format

  Scenario: Configure measurement units
    Given I am in the "Business Settings" section
    When I navigate to the "Currency & Units" tab
    And I select "Metric" as the measurement system
    And I click "Save Changes"
    Then the measurement system should be set to Metric
    And weights should display in kilograms
    And dimensions should display in centimeters

  Scenario: Configure tax rates
    Given I am in the "Business Settings" section
    When I navigate to the "Tax Configuration" tab
    And I add a tax rate "VAT" with value "20%"
    And I add a tax rate "Sales Tax" with value "8.5%"
    And I click "Save Changes"
    Then the tax rates should be saved
    And they should be available for selection in orders

  Scenario: Set default tax rate
    Given I am in the "Business Settings" section
    And I have multiple tax rates configured
    When I navigate to the "Tax Configuration" tab
    And I set "VAT" as the default tax rate
    And I click "Save Changes"
    Then "VAT" should be the default tax rate
    And new orders should automatically apply this tax rate

  Scenario: Non-admin user cannot access business settings
    Given I am logged in as a "STAFF" user
    When I navigate to the Settings page
    Then I should not see the "Business Settings" section
    And I should only see user-level settings

  Scenario: Validation error for empty company name
    Given I am in the "Business Settings" section
    When I clear the company name field
    And I click "Save Changes"
    Then I should see an error message "Company name is required"
    And the settings should not be saved

  Scenario: Validation error for invalid tax ID format
    Given I am in the "Business Settings" section
    When I enter an invalid tax ID "ABC"
    And I click "Save Changes"
    Then I should see an error message "Please enter a valid tax ID"
    And the settings should not be saved
