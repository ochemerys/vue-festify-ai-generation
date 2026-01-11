Feature: Inventory Settings
  As a user with inventory management permissions
  I want to configure inventory-related settings
  So that I can optimize stock management and alerts

  Background:
    Given I am logged in as a user with inventory permissions
    And I am on the Settings page

  Scenario: View current inventory settings
    When I navigate to the "Inventory Settings" section
    Then I should see the low stock threshold setting
    And I should see the reorder point setting
    And I should see the default product category
    And I should see the SKU format configuration
    And I should see barcode settings

  Scenario: Configure low stock threshold
    Given I am in the "Inventory Settings" section
    When I set the low stock threshold to "10" units
    And I click "Save Changes"
    Then the low stock threshold should be set to 10
    And I should see a success message "Inventory settings updated successfully"
    And products with quantity below 10 should trigger low stock alerts

  Scenario: Configure reorder point
    Given I am in the "Inventory Settings" section
    When I set the reorder point to "20" units
    And I click "Save Changes"
    Then the reorder point should be set to 20
    And I should see a success message "Inventory settings updated successfully"
    And products reaching this level should trigger reorder notifications

  Scenario: Set default product category
    Given I am in the "Inventory Settings" section
    When I select "Electronics" as the default category
    And I click "Save Changes"
    Then the default category should be set to "Electronics"
    And new products should default to this category

  Scenario: Configure SKU format with prefix
    Given I am in the "Inventory Settings" section
    When I navigate to the "SKU Configuration" tab
    And I enable automatic SKU generation
    And I set SKU prefix to "PROD"
    And I set SKU number length to "6"
    And I click "Save Changes"
    Then the SKU format should be configured
    And new products should generate SKUs like "PROD000001"

  Scenario: Configure SKU format with category-based prefix
    Given I am in the "Inventory Settings" section
    When I navigate to the "SKU Configuration" tab
    And I enable category-based SKU prefix
    And I click "Save Changes"
    Then SKUs should include category codes
    And electronics products should have SKUs like "ELEC000001"
    And furniture products should have SKUs like "FURN000001"

  Scenario: Disable automatic SKU generation
    Given I am in the "Inventory Settings" section
    And automatic SKU generation is enabled
    When I navigate to the "SKU Configuration" tab
    And I disable automatic SKU generation
    And I click "Save Changes"
    Then automatic SKU generation should be disabled
    And users must manually enter SKUs for new products

  Scenario: Configure barcode format
    Given I am in the "Inventory Settings" section
    When I navigate to the "Barcode Settings" tab
    And I select "EAN-13" as the barcode format
    And I click "Save Changes"
    Then the barcode format should be set to EAN-13
    And generated barcodes should follow EAN-13 standard

  Scenario: Enable barcode scanner integration
    Given I am in the "Inventory Settings" section
    When I navigate to the "Barcode Settings" tab
    And I enable barcode scanner integration
    And I select scanner type "USB Scanner"
    And I click "Save Changes"
    Then barcode scanner should be enabled
    And I should be able to scan products using the scanner

  Scenario: Configure stock alert notifications
    Given I am in the "Inventory Settings" section
    When I navigate to the "Alerts" tab
    And I enable "Low stock alerts"
    And I enable "Out of stock alerts"
    And I enable "Reorder point alerts"
    And I set alert frequency to "Daily"
    And I click "Save Changes"
    Then stock alerts should be configured
    And I should receive daily notifications for stock issues

  Scenario: Set alert recipients
    Given I am in the "Inventory Settings" section
    When I navigate to the "Alerts" tab
    And I add "manager@inventory.local" as an alert recipient
    And I add "warehouse@inventory.local" as an alert recipient
    And I click "Save Changes"
    Then alert recipients should be saved
    And these users should receive stock alert notifications

  Scenario: Configure default supplier
    Given I am in the "Inventory Settings" section
    When I navigate to the "Defaults" tab
    And I select "Acme Suppliers Inc." as the default supplier
    And I click "Save Changes"
    Then the default supplier should be set
    And new purchase orders should default to this supplier

  Scenario: Enable batch tracking
    Given I am in the "Inventory Settings" section
    When I navigate to the "Advanced" tab
    And I enable batch/lot tracking
    And I click "Save Changes"
    Then batch tracking should be enabled
    And products should support batch number assignment

  Scenario: Enable expiration date tracking
    Given I am in the "Inventory Settings" section
    When I navigate to the "Advanced" tab
    And I enable expiration date tracking
    And I set expiration warning period to "30" days
    And I click "Save Changes"
    Then expiration tracking should be enabled
    And I should receive alerts 30 days before product expiration

  Scenario: Configure serial number tracking
    Given I am in the "Inventory Settings" section
    When I navigate to the "Advanced" tab
    And I enable serial number tracking
    And I click "Save Changes"
    Then serial number tracking should be enabled
    And products should support individual serial numbers

  Scenario: Set minimum order quantity
    Given I am in the "Inventory Settings" section
    When I set minimum order quantity to "5" units
    And I click "Save Changes"
    Then the minimum order quantity should be set to 5
    And orders below this quantity should show a warning

  Scenario: Configure inventory valuation method
    Given I am in the "Inventory Settings" section
    When I navigate to the "Valuation" tab
    And I select "FIFO" as the valuation method
    And I click "Save Changes"
    Then the valuation method should be set to FIFO
    And inventory costs should be calculated using FIFO

  Scenario: Validation error for negative threshold
    Given I am in the "Inventory Settings" section
    When I set the low stock threshold to "-5"
    And I click "Save Changes"
    Then I should see an error message "Threshold must be a positive number"
    And the settings should not be saved

  Scenario: Validation error for invalid SKU format
    Given I am in the "Inventory Settings" section
    When I set SKU prefix to "PROD@123"
    And I click "Save Changes"
    Then I should see an error message "SKU prefix can only contain letters and numbers"
    And the settings should not be saved

  Scenario: Reset inventory settings to defaults
    Given I am in the "Inventory Settings" section
    And I have customized inventory settings
    When I click "Reset to Defaults"
    And I confirm the reset
    Then all inventory settings should be reset to defaults
    And I should see a success message "Settings reset to defaults"
