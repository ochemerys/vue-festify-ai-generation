Feature: Order Settings
  As a user with order management permissions
  I want to configure order-related settings
  So that I can streamline order processing and fulfillment

  Background:
    Given I am logged in as a user with order permissions
    And I am on the Settings page

  Scenario: View current order settings
    When I navigate to the "Order Settings" section
    Then I should see order approval workflow settings
    And I should see invoice configuration settings
    And I should see shipping method settings
    And I should see payment terms settings

  Scenario: Enable order approval workflow
    Given I am in the "Order Settings" section
    When I enable "Require approval for orders"
    And I set approval threshold to "$1000"
    And I click "Save Changes"
    Then order approval should be enabled
    And orders above $1000 should require approval
    And I should see a success message "Order settings updated successfully"

  Scenario: Disable order approval workflow
    Given I am in the "Order Settings" section
    And order approval is currently enabled
    When I disable "Require approval for orders"
    And I click "Save Changes"
    Then order approval should be disabled
    And all orders should be auto-approved

  Scenario: Configure multi-level approval
    Given I am in the "Order Settings" section
    When I enable "Multi-level approval"
    And I set first approval level to "$500" requiring "Manager" approval
    And I set second approval level to "$5000" requiring "Admin" approval
    And I click "Save Changes"
    Then multi-level approval should be configured
    And orders should route to appropriate approvers based on amount

  Scenario: Enable auto-fulfillment for orders
    Given I am in the "Order Settings" section
    When I enable "Auto-fulfill orders"
    And I set auto-fulfillment condition to "Payment confirmed"
    And I click "Save Changes"
    Then auto-fulfillment should be enabled
    And orders should automatically move to fulfillment after payment

  Scenario: Configure invoice numbering format
    Given I am in the "Order Settings" section
    When I navigate to the "Invoice Settings" tab
    And I set invoice prefix to "INV"
    And I set invoice number length to "6"
    And I set starting number to "1000"
    And I click "Save Changes"
    Then invoice format should be configured
    And new invoices should be numbered like "INV001000"

  Scenario: Configure invoice with date-based numbering
    Given I am in the "Order Settings" section
    When I navigate to the "Invoice Settings" tab
    And I enable date-based invoice numbering
    And I set format to "INV-YYYY-MM-####"
    And I click "Save Changes"
    Then invoices should include date in number
    And January 2024 invoices should be like "INV-2024-01-0001"

  Scenario: Set default payment terms
    Given I am in the "Order Settings" section
    When I navigate to the "Payment Terms" tab
    And I set default payment terms to "Net 30"
    And I click "Save Changes"
    Then default payment terms should be "Net 30"
    And new invoices should show 30-day payment terms

  Scenario: Add custom payment terms
    Given I am in the "Order Settings" section
    When I navigate to the "Payment Terms" tab
    And I click "Add Payment Term"
    And I enter term name "Net 45"
    And I enter term description "Payment due in 45 days"
    And I enter days value "45"
    And I click "Save Term"
    Then the new payment term should be added
    And it should be available for selection in orders

  Scenario: Configure default shipping method
    Given I am in the "Order Settings" section
    When I navigate to the "Shipping Settings" tab
    And I select "Standard Shipping" as default
    And I click "Save Changes"
    Then default shipping method should be "Standard Shipping"
    And new orders should default to this shipping method

  Scenario: Add new shipping method
    Given I am in the "Order Settings" section
    When I navigate to the "Shipping Settings" tab
    And I click "Add Shipping Method"
    And I enter method name "Express Overnight"
    And I enter base cost "$25.00"
    And I enter estimated delivery "1 day"
    And I click "Save Method"
    Then the new shipping method should be added
    And it should be available for selection in orders

  Scenario: Configure shipping carrier integration
    Given I am in the "Order Settings" section
    When I navigate to the "Shipping Settings" tab
    And I click "Add Carrier Integration"
    And I select carrier "FedEx"
    And I enter API credentials
    And I enable tracking number generation
    And I click "Save Integration"
    Then the carrier integration should be configured
    And orders should support FedEx tracking

  Scenario: Set order confirmation email template
    Given I am in the "Order Settings" section
    When I navigate to the "Email Templates" tab
    And I select "Order Confirmation" template
    And I customize the email subject
    And I customize the email body
    And I click "Save Template"
    Then the email template should be updated
    And customers should receive customized confirmation emails

  Scenario: Enable order status notifications
    Given I am in the "Order Settings" section
    When I navigate to the "Notifications" tab
    And I enable "Order placed" notifications
    And I enable "Order shipped" notifications
    And I enable "Order delivered" notifications
    And I click "Save Changes"
    Then order notifications should be enabled
    And customers should receive status update emails

  Scenario: Configure order cancellation policy
    Given I am in the "Order Settings" section
    When I navigate to the "Policies" tab
    And I enable "Allow order cancellation"
    And I set cancellation window to "24" hours
    And I click "Save Changes"
    Then order cancellation should be enabled
    And orders can be cancelled within 24 hours

  Scenario: Set minimum order value
    Given I am in the "Order Settings" section
    When I set minimum order value to "$50.00"
    And I click "Save Changes"
    Then minimum order value should be set to $50
    And orders below this amount should show a warning

  Scenario: Configure order priority rules
    Given I am in the "Order Settings" section
    When I navigate to the "Priority Rules" tab
    And I add rule "VIP customers get high priority"
    And I add rule "Orders over $5000 get high priority"
    And I click "Save Changes"
    Then priority rules should be configured
    And orders should be automatically prioritized

  Scenario: Enable backorder handling
    Given I am in the "Order Settings" section
    When I enable "Allow backorders"
    And I set backorder notification to "Automatic"
    And I click "Save Changes"
    Then backorders should be enabled
    And customers should be notified of backorder status

  Scenario: Configure return and refund settings
    Given I am in the "Order Settings" section
    When I navigate to the "Returns" tab
    And I enable "Allow returns"
    And I set return window to "30" days
    And I enable "Automatic refund processing"
    And I click "Save Changes"
    Then return settings should be configured
    And customers can return items within 30 days

  Scenario: Set order tags and labels
    Given I am in the "Order Settings" section
    When I navigate to the "Tags & Labels" tab
    And I add custom tag "Rush Order"
    And I add custom tag "Gift Wrap"
    And I click "Save Changes"
    Then custom tags should be available
    And users can apply these tags to orders

  Scenario: Validation error for negative approval threshold
    Given I am in the "Order Settings" section
    When I set approval threshold to "-100"
    And I click "Save Changes"
    Then I should see an error message "Threshold must be a positive number"
    And the settings should not be saved

  Scenario: Validation error for invalid invoice format
    Given I am in the "Order Settings" section
    When I set invoice prefix to "INV@#$"
    And I click "Save Changes"
    Then I should see an error message "Invoice prefix can only contain letters and numbers"
    And the settings should not be saved

  Scenario: Manager can configure order settings
    Given I am logged in as a "MANAGER" user
    When I navigate to the "Order Settings" section
    Then I should be able to view and edit order settings

  Scenario: Staff user has limited access to order settings
    Given I am logged in as a "STAFF" user
    When I navigate to the Settings page
    Then I should see limited order settings
    And I should not be able to change approval workflows
    And I should not be able to change invoice numbering
