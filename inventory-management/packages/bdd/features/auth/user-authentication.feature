Feature: User Authentication and Authorization
  As a system administrator
  I want to manage user access and permissions
  So that I can ensure secure access to the inventory system

  Background:
    Given the system is initialized

  Scenario: User login with valid credentials
    Given a user exists with:
      | Email    | admin@inventory.local |
      | Password | SecurePassword123     |
      | Role     | ADMIN                 |
    When I login with email "admin@inventory.local" and password "SecurePassword123"
    Then I should be logged in successfully
    And I should receive an access token
    And the token should be valid for 24 hours

  Scenario: User login with invalid password
    Given a user exists with email "admin@inventory.local"
    When I attempt to login with email "admin@inventory.local" and password "WrongPassword"
    Then the login should fail
    And I should receive an error message "Invalid credentials"

  Scenario: User login with non-existent email
    When I attempt to login with email "nonexistent@inventory.local" and password "AnyPassword"
    Then the login should fail
    And I should receive an error message "User not found"

  Scenario: Admin user can access all features
    Given I am logged in as an admin user
    When I check my permissions
    Then I should have access to:
      | Feature                |
      | Product Management     |
      | Inventory Tracking     |
      | Order Management       |
      | Purchase Order Management |
      | User Management        |
      | Reports                |

  Scenario: Manager user has limited access
    Given I am logged in as a manager user
    When I check my permissions
    Then I should have access to:
      | Feature                |
      | Product Management     |
      | Inventory Tracking     |
      | Order Management       |
      | Purchase Order Management |
      | Reports                |
    And I should NOT have access to:
      | Feature        |
      | User Management |

  Scenario: Staff user has restricted access
    Given I am logged in as a staff user
    When I check my permissions
    Then I should have access to:
      | Feature            |
      | Inventory Tracking |
      | Order Management   |
    And I should NOT have access to:
      | Feature                |
      | Product Management     |
      | Purchase Order Management |
      | User Management        |

  Scenario: Viewer user has read-only access
    Given I am logged in as a viewer user
    When I check my permissions
    Then I should be able to view:
      | Feature            |
      | Products           |
      | Inventory Levels   |
      | Orders             |
      | Purchase Orders    |
    And I should NOT be able to:
      | Action |
      | Create |
      | Update |
      | Delete |

  Scenario: User logout
    Given I am logged in as an admin user
    When I logout
    Then I should be logged out successfully
    And my access token should be invalidated
    And I should not be able to access protected resources

  Scenario: Session timeout
    Given I am logged in as an admin user
    And my session has been idle for 30 minutes
    When I attempt to access a protected resource
    Then I should be logged out automatically
    And I should be redirected to the login page

  Scenario: Create new user
    Given I am logged in as an admin user
    When I create a new user with:
      | Field     | Value                |
      | Email     | newuser@inventory.local |
      | Password  | SecurePassword123    |
      | First Name| John                 |
      | Last Name | Doe                  |
      | Role      | STAFF                |
    Then the user should be created successfully
    And the user should be marked as active
    And the user should have the role "STAFF"

  Scenario: Update user role
    Given I am logged in as an admin user
    And a user exists with email "staff@inventory.local" and role "STAFF"
    When I update the user role to "MANAGER"
    Then the user role should be updated to "MANAGER"
    And the user should have access to manager features

  Scenario: Deactivate user
    Given I am logged in as an admin user
    And a user exists with email "staff@inventory.local"
    When I deactivate the user
    Then the user should be marked as inactive
    And the user should not be able to login

  Scenario: Reactivate user
    Given I am logged in as an admin user
    And an inactive user exists with email "staff@inventory.local"
    When I reactivate the user
    Then the user should be marked as active
    And the user should be able to login

  Scenario: List all users
    Given I am logged in as an admin user
    And the following users exist:
      | Email                    | Role    |
      | admin@inventory.local    | ADMIN   |
      | manager@inventory.local  | MANAGER |
      | staff@inventory.local    | STAFF   |
    When I retrieve all users
    Then I should get 3 users
    And the users should include "admin@inventory.local"
    And the users should include "manager@inventory.local"
    And the users should include "staff@inventory.local"

  Scenario: Cannot access protected resource without token
    When I attempt to access a protected resource without a token
    Then the request should fail
    And I should receive an error message "Unauthorized"

  Scenario: Cannot access protected resource with invalid token
    When I attempt to access a protected resource with an invalid token
    Then the request should fail
    And I should receive an error message "Invalid token"

  Scenario: Refresh access token
    Given I am logged in as an admin user
    And I have a refresh token
    When I refresh my access token
    Then I should receive a new access token
    And the new token should be valid
    And the old token should remain valid until expiration
