Feature: Reporting and Analytics
  As a business analyst
  I want to generate reports and view analytics
  So that I can make informed business decisions

  Background:
    Given the system is initialized
    And I am logged in as a manager user

  Scenario: Generate inventory summary report
    Given the following products exist with inventory:
      | SKU      | Name           | Quantity | Value  |
      | PROD-001 | Wireless Mouse | 100      | 2999.00|
      | PROD-002 | USB-C Cable    | 50       | 649.50 |
      | PROD-003 | T-Shirt        | 200      | 3998.00|
    When I generate an inventory summary report
    Then the report should show:
      | Metric              | Value   |
      | Total Products      | 3       |
      | Total Quantity      | 350     |
      | Total Inventory Value | 7646.50 |
      | Average Value per Item | 21.85 |

  Scenario: Generate low stock report
    Given the following products exist:
      | SKU      | Name           | Current | Reorder |
      | PROD-001 | Wireless Mouse | 8       | 10      |
      | PROD-002 | USB-C Cable    | 0       | 20      |
      | PROD-003 | T-Shirt        | 150     | 50      |
    When I generate a low stock report
    Then the report should show 2 items with low stock:
      | SKU      | Current | Reorder | Status         |
      | PROD-001 | 8       | 10      | LOW_STOCK      |
      | PROD-002 | 0       | 20      | OUT_OF_STOCK   |

  Scenario: Generate sales report
    Given the following orders exist:
      | Order Number | Status    | Total  | Date       |
      | ORD-2024-001 | DELIVERED | 100.00 | 2024-01-01 |
      | ORD-2024-002 | DELIVERED | 150.00 | 2024-01-02 |
      | ORD-2024-003 | DELIVERED | 75.00  | 2024-01-03 |
      | ORD-2024-004 | PENDING   | 200.00 | 2024-01-04 |
    When I generate a sales report for January 2024
    Then the report should show:
      | Metric              | Value |
      | Total Orders        | 4     |
      | Completed Orders    | 3     |
      | Total Revenue       | 325.00|
      | Average Order Value | 81.25 |
      | Pending Revenue     | 200.00|

  Scenario: Generate inventory movement report
    Given the following transactions exist:
      | Type       | Quantity | Date       |
      | PURCHASE   | 100      | 2024-01-01 |
      | SALE       | 20       | 2024-01-02 |
      | SALE       | 15       | 2024-01-03 |
      | ADJUSTMENT | -5       | 2024-01-04 |
      | RETURN     | 10       | 2024-01-05 |
    When I generate an inventory movement report
    Then the report should show:
      | Metric           | Value |
      | Total Purchases  | 100   |
      | Total Sales      | 35    |
      | Total Adjustments| -5    |
      | Total Returns    | 10    |
      | Net Movement     | 70    |

  Scenario: Generate supplier performance report
    Given the following purchase orders exist:
      | Supplier          | Status    | Total   | Days to Deliver |
      | Tech Supplies Inc | RECEIVED  | 1000.00 | 5               |
      | Tech Supplies Inc | RECEIVED  | 500.00  | 4               |
      | Fashion Wholesale | RECEIVED  | 750.00  | 8               |
    When I generate a supplier performance report
    Then the report should show:
      | Supplier          | Total Orders | Total Spend | Avg Delivery Days |
      | Tech Supplies Inc | 2            | 1500.00     | 4.5               |
      | Fashion Wholesale | 1            | 750.00      | 8                 |

  Scenario: Generate product performance report
    Given the following products with sales data exist:
      | SKU      | Name           | Units Sold | Revenue |
      | PROD-001 | Wireless Mouse | 50         | 1499.50 |
      | PROD-002 | USB-C Cable    | 100        | 1299.00 |
      | PROD-003 | T-Shirt        | 30         | 599.70  |
    When I generate a product performance report
    Then the report should show:
      | SKU      | Units Sold | Revenue | Rank |
      | PROD-002 | 100        | 1299.00 | 1    |
      | PROD-001 | 50         | 1499.50 | 2    |
      | PROD-003 | 30         | 599.70  | 3    |

  Scenario: View dashboard with key metrics
    Given the system has the following data:
      | Metric                | Value |
      | Total Products        | 50    |
      | Low Stock Items       | 5     |
      | Out of Stock Items    | 2     |
      | Pending Orders        | 10    |
      | Total Inventory Value | 50000 |
    When I view the dashboard
    Then I should see:
      | Widget                | Value |
      | Total Products        | 50    |
      | Low Stock Alert       | 5     |
      | Out of Stock Alert    | 2     |
      | Pending Orders        | 10    |
      | Inventory Value       | 50000 |

  Scenario: Export report to CSV
    Given I have generated a sales report
    When I export the report to CSV format
    Then a CSV file should be generated
    And the file should contain all report data
    And the file should be downloadable

  Scenario: Export report to PDF
    Given I have generated an inventory summary report
    When I export the report to PDF format
    Then a PDF file should be generated
    And the PDF should include:
      | Element      |
      | Report Title |
      | Report Date  |
      | Data Tables  |
      | Summary      |

  Scenario: Schedule automated report
    When I schedule a daily inventory report
      | Frequency | Daily        |
      | Time      | 08:00 AM     |
      | Recipients| manager@inventory.local |
      | Format    | PDF          |
    Then the report should be scheduled successfully
    And the report should be sent daily at 08:00 AM
    And the recipient should receive the report via email

  Scenario: View report history
    Given I have generated multiple reports
    When I view the report history
    Then I should see a list of all generated reports
    And each report should show:
      | Field         |
      | Report Type   |
      | Generated Date|
      | Generated By  |
      | File Format   |

  Scenario: Filter report data by date range
    Given I have sales data from January to December 2024
    When I generate a sales report for Q1 2024 (Jan-Mar)
    Then the report should only include data from January to March
    And the report should show:
      | Metric              | Value |
      | Report Period       | Q1 2024 |
      | Total Orders        | 45    |
      | Total Revenue       | 5000.00 |

  Scenario: Compare period-over-period metrics
    Given I have sales data for January and February 2024
    When I generate a comparison report
    Then the report should show:
      | Metric              | January | February | Change |
      | Total Orders        | 30      | 35       | +16.7% |
      | Total Revenue       | 3000.00 | 3500.00  | +16.7% |
      | Average Order Value | 100.00  | 100.00   | 0%     |
