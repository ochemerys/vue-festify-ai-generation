Feature: Product Management
  As an inventory manager
  I want to manage products in the system
  So that I can maintain an accurate product catalog

  Background:
    Given the system is initialized
    And I am logged in as an admin user

  Scenario: Create a new product with zero initial quantity
    When I create a product with the following details:
      | Field         | Value                          |
      | SKU           | PROD-001                       |
      | Name          | Wireless Mouse                 |
      | Description   | Ergonomic wireless mouse       |
      | Category      | Electronics                    |
      | Price         | 29.99                          |
      | Cost          | 12.50                          |
      | Supplier      | Tech Supplies Inc              |
      | Reorder Level | 10                             |
    Then the product should be created successfully
    And the product should have SKU "PROD-001"
    And the product should be marked as active
    And the product quantity on hand should be 0
    And the product should be in "defined" state
    And no inventory movement should exist for the product

  Scenario: Create product validates required fields
    When I attempt to create a product with missing required fields:
      | Field    | Value |
      | Name     |       |
      | SKU      |       |
      | Category |       |
    Then the operation should fail
    And I should receive validation errors for:
      | Field    | Error                      |
      | Name     | Product name is required   |
      | SKU      | SKU is required            |
      | Category | Category is required       |

  Scenario: Create product validates SKU format
    When I attempt to create a product with invalid SKU "prod@001"
    Then the operation should fail
    And I should receive an error message "SKU must contain only uppercase letters, numbers, and hyphens"

  Scenario: Create product validates price and cost
    When I attempt to create a product with the following details:
      | Field | Value  |
      | Price | -10.00 |
      | Cost  | 0      |
    Then the operation should fail
    And I should receive validation errors for:
      | Field | Error                           |
      | Price | Price must be greater than 0    |
      | Cost  | Cost must be greater than 0     |

  Scenario: Create product with minimum required fields
    When I create a product with only required fields:
      | Field         | Value              |
      | SKU           | PROD-MIN-001       |
      | Name          | Minimal Product    |
      | Category      | General            |
      | Price         | 10.00              |
      | Cost          | 5.00               |
      | Supplier      | Default Supplier   |
      | Reorder Level | 10                 |
    Then the product should be created successfully
    And the product description should be empty
    And the product quantity on hand should be 0
    And the product should be marked as active

  Scenario: Create product and verify it appears in product list
    Given no products exist in the system
    When I create a product with the following details:
      | Field    | Value           |
      | SKU      | PROD-LIST-001   |
      | Name     | Test Product    |
      | Category | Electronics     |
      | Price    | 25.00           |
      | Cost     | 12.00           |
      | Supplier | Test Supplier   |
    Then the product should be created successfully
    When I retrieve all active products
    Then I should get 1 product
    And the products should include "Test Product"
    And the product "Test Product" should have quantity 0

  Scenario: Update product details
    Given a product exists with SKU "PROD-001"
    When I update the product with:
      | Field | Value  |
      | Price | 34.99  |
      | Name  | Wireless Mouse Pro |
    Then the product should be updated successfully
    And the product price should be 34.99
    And the product name should be "Wireless Mouse Pro"

  Scenario: Retrieve product by SKU
    Given a product exists with SKU "PROD-001" and name "Wireless Mouse"
    When I search for product with SKU "PROD-001"
    Then I should find the product
    And the product name should be "Wireless Mouse"

  Scenario: List all active products
    Given the following products exist:
      | SKU      | Name              | Category     | Price |
      | PROD-001 | Wireless Mouse    | Electronics  | 29.99 |
      | PROD-002 | USB-C Cable       | Electronics  | 12.99 |
      | PROD-003 | Cotton T-Shirt    | Clothing     | 19.99 |
    When I retrieve all active products
    Then I should get 3 products
    And the products should include "Wireless Mouse"
    And the products should include "USB-C Cable"
    And the products should include "Cotton T-Shirt"

  Scenario: Filter products by category
    Given the following products exist:
      | SKU      | Name              | Category     | Price |
      | PROD-001 | Wireless Mouse    | Electronics  | 29.99 |
      | PROD-002 | USB-C Cable       | Electronics  | 12.99 |
      | PROD-003 | Cotton T-Shirt    | Clothing     | 19.99 |
    When I filter products by category "Electronics"
    Then I should get 2 products
    And the products should include "Wireless Mouse"
    And the products should include "USB-C Cable"

  Scenario: Filter products by price range
    Given the following products exist:
      | SKU      | Name              | Category     | Price |
      | PROD-001 | Wireless Mouse    | Electronics  | 29.99 |
      | PROD-002 | USB-C Cable       | Electronics  | 12.99 |
      | PROD-003 | Cotton T-Shirt    | Clothing     | 19.99 |
    When I filter products with price between 15 and 30
    Then I should get 2 products
    And the products should include "Wireless Mouse"
    And the products should include "Cotton T-Shirt"

  Scenario: Deactivate a product
    Given a product exists with SKU "PROD-001"
    When I deactivate the product
    Then the product should be marked as inactive
    And the product should not appear in active product listings

  Scenario: Cannot create duplicate SKU
    Given a product exists with SKU "PROD-001"
    When I attempt to create a product with SKU "PROD-001"
    Then the operation should fail
    And I should receive an error message "SKU already exists"

  Scenario: Search products by name
    Given the following products exist:
      | SKU      | Name              | Category     |
      | PROD-001 | Wireless Mouse    | Electronics  |
      | PROD-002 | Wired Mouse       | Electronics  |
      | PROD-003 | Cotton T-Shirt    | Clothing     |
    When I search for products with name containing "Mouse"
    Then I should get 2 products
    And the products should include "Wireless Mouse"
    And the products should include "Wired Mouse"
