Feature: Product Management
  As an inventory manager
  I want to manage products in the system
  So that I can maintain an accurate product catalog

  Background:
    Given the system is initialized
    And I am logged in as an admin user

  Scenario: Create a new product
    When I create a product with the following details:
      | Field       | Value                          |
      | SKU         | PROD-001                       |
      | Name        | Wireless Mouse                 |
      | Description | Ergonomic wireless mouse       |
      | Category    | Electronics                    |
      | Price       | 29.99                          |
      | Cost        | 12.50                          |
      | Supplier    | Tech Supplies Inc              |
      | Reorder Level | 10                           |
    Then the product should be created successfully
    And the product should have SKU "PROD-001"
    And the product should be marked as active

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
