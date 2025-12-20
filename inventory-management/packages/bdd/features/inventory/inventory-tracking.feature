Feature: Inventory Tracking
  As an inventory manager
  I want to track inventory levels and movements
  So that I can maintain accurate stock information

  Background:
    Given the system is initialized
    And I am logged in as an inventory staff member
    And a product "Wireless Mouse" with SKU "PROD-001" exists

  Scenario: Record purchase transaction
    Given the product has 0 current quantity
    When I record a purchase transaction:
      | Field     | Value        |
      | Quantity  | 100          |
      | Reference | PO-2024-001  |
      | Notes     | Initial stock|
    Then the transaction should be recorded successfully
    And the product quantity should be 100
    And the transaction type should be "PURCHASE"

  Scenario: Record sale transaction
    Given the product has 100 current quantity
    When I record a sale transaction:
      | Field     | Value        |
      | Quantity  | 5            |
      | Reference | ORD-2024-001 |
      | Notes     | Customer order |
    Then the transaction should be recorded successfully
    And the product quantity should be 95
    And the transaction type should be "SALE"

  Scenario: Record inventory adjustment
    Given the product has 100 current quantity
    When I record an adjustment transaction:
      | Field     | Value        |
      | Quantity  | -10          |
      | Reference | ADJ-2024-001 |
      | Notes     | Inventory count discrepancy |
    Then the transaction should be recorded successfully
    And the product quantity should be 90

  Scenario: Record damage transaction
    Given the product has 100 current quantity
    When I record a damage transaction:
      | Field     | Value        |
      | Quantity  | 3            |
      | Reference | DMG-2024-001 |
      | Notes     | Damaged during shipping |
    Then the transaction should be recorded successfully
    And the product quantity should be 97

  Scenario: Record return transaction
    Given the product has 95 current quantity
    When I record a return transaction:
      | Field     | Value        |
      | Quantity  | 2            |
      | Reference | RET-2024-001 |
      | Notes     | Customer return |
    Then the transaction should be recorded successfully
    And the product quantity should be 97

  Scenario: View inventory transaction history
    Given the product has the following transactions:
      | Type       | Quantity | Reference    |
      | PURCHASE   | 100      | PO-2024-001  |
      | SALE       | 5        | ORD-2024-001 |
      | ADJUSTMENT | -10      | ADJ-2024-001 |
    When I retrieve the transaction history for the product
    Then I should see 3 transactions
    And the transactions should be in chronological order
    And the first transaction should be "PURCHASE"

  Scenario: Calculate available quantity
    Given the product has:
      | Current Quantity  | 100 |
      | Reserved Quantity | 20  |
    When I check the available quantity
    Then the available quantity should be 80

  Scenario: Reserve inventory for order
    Given the product has 100 current quantity
    When I reserve 20 units for an order
    Then the reserved quantity should be 20
    And the available quantity should be 80
    And the current quantity should remain 100

  Scenario: Release reserved inventory
    Given the product has:
      | Current Quantity  | 100 |
      | Reserved Quantity | 20  |
    When I release the reserved inventory
    Then the reserved quantity should be 0
    And the available quantity should be 100

  Scenario: Cannot sell more than available
    Given the product has:
      | Current Quantity  | 50  |
      | Reserved Quantity | 30  |
    When I attempt to sell 25 units
    Then the operation should fail
    And I should receive an error message "Insufficient available inventory"

  Scenario: Track inventory by location
    Given the product has inventory at multiple locations:
      | Location | Quantity |
      | Warehouse A | 50 |
      | Warehouse B | 30 |
      | Store 1     | 20 |
    When I check total inventory
    Then the total quantity should be 100

  Scenario: Generate low stock alert
    Given the product has:
      | Current Quantity | 8  |
      | Reorder Level    | 10 |
    When I check for low stock alerts
    Then a low stock alert should be generated
    And the alert should indicate "Current: 8, Reorder Level: 10"

  Scenario: Generate out of stock alert
    Given the product has 0 current quantity
    When I check for stock alerts
    Then an out of stock alert should be generated
    And the alert should be marked as critical
