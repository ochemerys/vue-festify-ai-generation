Feature: Purchase Order Management
  As a procurement manager
  I want to manage purchase orders with suppliers
  So that I can replenish inventory efficiently

  Background:
    Given the system is initialized
    And I am logged in as a procurement manager
    And the following suppliers exist:
      | Name              | Email                  | Contact Person |
      | Tech Supplies Inc | contact@techsupplies.com | John Smith    |
      | Fashion Wholesale | sales@fashionwholesale.com | Jane Doe    |
    And the following products exist:
      | SKU      | Name           | Supplier          |
      | PROD-001 | Wireless Mouse | Tech Supplies Inc |
      | PROD-002 | USB-C Cable    | Tech Supplies Inc |

  Scenario: Create a purchase order
    When I create a purchase order with the following details:
      | Field           | Value              |
      | Supplier        | Tech Supplies Inc  |
      | Expected Date   | 2024-02-15         |
      | Notes           | Urgent delivery    |
    And I add the following items to the purchase order:
      | SKU      | Quantity | Unit Price |
      | PROD-001 | 50       | 12.50      |
      | PROD-002 | 100      | 4.00       |
    Then the purchase order should be created successfully
    And the purchase order status should be "DRAFT"
    And the purchase order total should be 1025.00

  Scenario: Submit purchase order
    Given a purchase order exists with status "DRAFT"
    When I submit the purchase order
    Then the purchase order status should be "SUBMITTED"
    And the supplier should be notified

  Scenario: Confirm purchase order
    Given a purchase order exists with status "SUBMITTED"
    When I confirm the purchase order
    Then the purchase order status should be "CONFIRMED"
    And the expected delivery date should be set

  Scenario: Receive partial goods
    Given a purchase order exists with status "CONFIRMED"
    When I receive the following items:
      | SKU      | Quantity |
      | PROD-001 | 25       |
    Then the purchase order status should be "PARTIALLY_RECEIVED"
    And the received quantity for "PROD-001" should be 25
    And the inventory should be updated with 25 units of "PROD-001"

  Scenario: Receive remaining goods
    Given a purchase order exists with status "PARTIALLY_RECEIVED"
    And 25 units of "PROD-001" have been received
    When I receive the remaining items:
      | SKU      | Quantity |
      | PROD-001 | 25       |
    Then the purchase order status should be "RECEIVED"
    And the total received quantity for "PROD-001" should be 50
    And the inventory should be updated with 25 additional units

  Scenario: Cancel purchase order
    Given a purchase order exists with status "DRAFT"
    When I cancel the purchase order
    Then the purchase order status should be "CANCELLED"
    And the supplier should be notified of cancellation

  Scenario: View purchase order details
    Given a purchase order exists with:
      | PO Number | PO-2024-001        |
      | Supplier  | Tech Supplies Inc  |
      | Status    | CONFIRMED          |
    When I retrieve the purchase order details
    Then I should see the PO number "PO-2024-001"
    And I should see the supplier "Tech Supplies Inc"
    And I should see the status "CONFIRMED"
    And I should see all purchase order items

  Scenario: List purchase orders by status
    Given the following purchase orders exist:
      | PO Number | Status      |
      | PO-2024-001 | DRAFT     |
      | PO-2024-002 | CONFIRMED |
      | PO-2024-003 | RECEIVED  |
      | PO-2024-004 | DRAFT     |
    When I filter purchase orders by status "DRAFT"
    Then I should get 2 purchase orders
    And the purchase orders should include "PO-2024-001"
    And the purchase orders should include "PO-2024-004"

  Scenario: List purchase orders by supplier
    Given the following purchase orders exist:
      | PO Number | Supplier          |
      | PO-2024-001 | Tech Supplies Inc |
      | PO-2024-002 | Tech Supplies Inc |
      | PO-2024-003 | Fashion Wholesale |
    When I filter purchase orders by supplier "Tech Supplies Inc"
    Then I should get 2 purchase orders
    And the purchase orders should include "PO-2024-001"
    And the purchase orders should include "PO-2024-002"

  Scenario: Calculate purchase order total
    When I create a purchase order with the following items:
      | SKU      | Quantity | Unit Price |
      | PROD-001 | 50       | 12.50      |
      | PROD-002 | 100      | 4.00       |
    Then the purchase order total should be calculated as:
      | Item 1 Subtotal | 625.00  |
      | Item 2 Subtotal | 400.00  |
      | PO Total        | 1025.00 |

  Scenario: Track goods receipt
    Given a purchase order exists with status "CONFIRMED"
    When I create a goods receipt for the purchase order
    Then a goods receipt should be created
    And the goods receipt should be linked to the purchase order
    And the received date should be recorded

  Scenario: Update purchase order expected date
    Given a purchase order exists with expected date "2024-02-15"
    When I update the expected date to "2024-02-20"
    Then the expected date should be updated to "2024-02-20"

  Scenario: Cannot receive more than ordered
    Given a purchase order exists with:
      | SKU      | Quantity |
      | PROD-001 | 50       |
    When I attempt to receive 60 units of "PROD-001"
    Then the operation should fail
    And I should receive an error message "Cannot receive more than ordered quantity"

  Scenario: Generate purchase order report
    Given the following purchase orders exist:
      | PO Number | Status    | Total   |
      | PO-2024-001 | RECEIVED | 1000.00 |
      | PO-2024-002 | CONFIRMED | 500.00 |
      | PO-2024-003 | DRAFT    | 750.00  |
    When I generate a purchase order report
    Then the report should show:
      | Metric              | Value   |
      | Total POs           | 3       |
      | Total Spend         | 2250.00 |
      | Average PO Value    | 750.00  |
      | Received POs        | 1       |
      | Pending POs         | 2       |
