Feature: Order Management
  As a sales representative
  I want to manage customer orders
  So that I can fulfill customer requests efficiently

  Background:
    Given the system is initialized
    And I am logged in as a sales staff member
    And the following products exist:
      | SKU      | Name           | Price | Quantity |
      | PROD-001 | Wireless Mouse | 29.99 | 100      |
      | PROD-002 | USB-C Cable    | 12.99 | 50       |

  Scenario: Create a new order
    When I create an order with the following details:
      | Field              | Value                    |
      | Customer Name      | John Doe                 |
      | Customer Email     | john@example.com         |
      | Shipping Address   | 123 Main St, Springfield |
      | Notes              | Deliver before 5 PM      |
    And I add the following items to the order:
      | SKU      | Quantity | Unit Price |
      | PROD-001 | 2        | 29.99      |
      | PROD-002 | 1        | 12.99      |
    Then the order should be created successfully
    And the order status should be "PENDING"
    And the order total should be 72.97

  Scenario: Confirm order
    Given an order exists with status "PENDING"
    When I confirm the order
    Then the order status should be "CONFIRMED"
    And the inventory should be reserved for the order items

  Scenario: Ship order
    Given an order exists with status "CONFIRMED"
    When I ship the order
    Then the order status should be "SHIPPED"
    And the shipped date should be recorded
    And the inventory should be deducted from stock

  Scenario: Deliver order
    Given an order exists with status "SHIPPED"
    When I mark the order as delivered
    Then the order status should be "DELIVERED"
    And the delivered date should be recorded

  Scenario: Cancel order
    Given an order exists with status "PENDING"
    When I cancel the order
    Then the order status should be "CANCELLED"
    And the reserved inventory should be released

  Scenario: Return order
    Given an order exists with status "DELIVERED"
    When I process a return for the order
    Then the order status should be "RETURNED"
    And the inventory should be restored

  Scenario: View order details
    Given an order exists with:
      | Order Number | ORD-2024-001 |
      | Customer     | John Doe     |
      | Status       | CONFIRMED    |
    When I retrieve the order details
    Then I should see the order number "ORD-2024-001"
    And I should see the customer name "John Doe"
    And I should see the order status "CONFIRMED"
    And I should see all order items

  Scenario: List orders by status
    Given the following orders exist:
      | Order Number | Status      |
      | ORD-2024-001 | PENDING     |
      | ORD-2024-002 | CONFIRMED   |
      | ORD-2024-003 | SHIPPED     |
      | ORD-2024-004 | PENDING     |
    When I filter orders by status "PENDING"
    Then I should get 2 orders
    And the orders should include "ORD-2024-001"
    And the orders should include "ORD-2024-004"

  Scenario: Calculate order total
    When I create an order with the following items:
      | SKU      | Quantity | Unit Price |
      | PROD-001 | 2        | 29.99      |
      | PROD-002 | 3        | 12.99      |
    Then the order total should be calculated as:
      | Item 1 Subtotal | 59.98  |
      | Item 2 Subtotal | 38.97  |
      | Order Total     | 98.95  |

  Scenario: Cannot create order with insufficient inventory
    Given the product "Wireless Mouse" has 5 units available
    When I attempt to create an order with 10 units of "Wireless Mouse"
    Then the operation should fail
    And I should receive an error message "Insufficient inventory"

  Scenario: Add items to existing order
    Given an order exists with status "PENDING"
    When I add an item to the order:
      | SKU      | Quantity | Unit Price |
      | PROD-002 | 2        | 12.99      |
    Then the item should be added to the order
    And the order total should be recalculated

  Scenario: Remove items from order
    Given an order exists with 2 items
    When I remove 1 item from the order
    Then the order should have 1 item
    And the order total should be recalculated

  Scenario: Track order status changes
    Given an order exists with status "PENDING"
    When I confirm the order
    And I ship the order
    And I deliver the order
    Then the order status history should show:
      | Status      | Timestamp |
      | PENDING     | <initial> |
      | CONFIRMED   | <later>   |
      | SHIPPED     | <later>   |
      | DELIVERED   | <latest>  |

  Scenario: Generate order summary report
    Given the following orders exist:
      | Order Number | Status    | Total  |
      | ORD-2024-001 | DELIVERED | 100.00 |
      | ORD-2024-002 | DELIVERED | 50.00  |
      | ORD-2024-003 | PENDING   | 75.00  |
    When I generate an order summary report
    Then the report should show:
      | Metric              | Value |
      | Total Orders        | 3     |
      | Total Revenue       | 225.00|
      | Average Order Value | 75.00 |
      | Pending Orders      | 1     |
      | Delivered Orders    | 2     |
