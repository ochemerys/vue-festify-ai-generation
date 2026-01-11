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

  Scenario: Login page displays correctly
    Given I am on the login page
    When I view the page
    Then I should see:
      | Element              |
      | Email input field    |
      | Password input field |
      | Remember me checkbox |
      | Login button         |
      | Forgot password link |
      | Sign up link         |

  Scenario: Remember me functionality
    Given I am on the login page
    When I login with email "admin@inventory.local" and password "SecurePassword123"
    And I check the "Remember me" checkbox
    Then my email should be saved in local storage
    And on next visit to login page, my email should be pre-filled

  Scenario: Password visibility toggle
    Given I am on the login page
    When I enter password "SecurePassword123"
    And I click the password visibility toggle
    Then the password should be displayed as plain text
    When I click the toggle again
    Then the password should be masked

  Scenario: User Management page displays all users
    Given I am logged in as an admin user
    When I navigate to the User Management page
    Then I should see a table with all users
    And each user should display:
      | Field      |
      | Avatar     |
      | First Name |
      | Last Name  |
      | Email      |
      | Role       |
      | Status     |

  Scenario: User avatar displays initials
    Given I am logged in as an admin user
    When I view the User Management page
    Then each user avatar should display two initials
    And the initials should be from first and last name
    And the avatar should have a blue gradient background

  Scenario: Current user displayed in sidebar
    Given I am logged in as an admin user
    When I view the application
    Then the sidebar should display:
      | Element      |
      | User avatar  |
      | First name   |
      | Last name    |
      | Email        |
    And the avatar should show two initials

  Scenario: Current user displayed in top toolbar
    Given I am logged in as an admin user
    When I view the application
    Then the top toolbar should display:
      | Element      |
      | User avatar  |
      | Full name    |
    And the avatar should show two initials

  Scenario: User dropdown menu in toolbar
    Given I am logged in as an admin user
    When I click on the user avatar in the top toolbar
    Then I should see a dropdown menu with:
      | Option   |
      | Profile  |
      | Settings |
      | Logout   |

  Scenario: Navigate to user profile from dropdown
    Given I am logged in as an admin user
    When I click on the user avatar in the top toolbar
    And I click on "Profile"
    Then I should be navigated to the user profile page
    And the profile should display my current information

  Scenario: Navigate to user profile from sidebar
    Given I am logged in as an admin user
    When I click on the user item in the sidebar
    Then I should be navigated to the user profile page
    And the profile should display my current information

  Scenario: Create new user from User Management page
    Given I am logged in as an admin user
    When I navigate to the User Management page
    And I click the "New User" button
    Then I should be navigated to the Create User page
    And the form should display:
      | Field    |
      | Email    |
      | Password |
      | First Name |
      | Last Name  |
      | Role     |
      | Active   |

  Scenario: Edit user from User Management page
    Given I am logged in as an admin user
    When I navigate to the User Management page
    And I click on a user in the table
    Then I should be navigated to the Edit User page
    And the form should be pre-filled with the user's data
    And the password field should not be displayed

  Scenario: Search users in User Management page
    Given I am logged in as an admin user
    And the following users exist:
      | Email                    | First Name | Last Name |
      | admin@inventory.local    | System     | Admin     |
      | manager@inventory.local  | Marta      | Manager   |
      | staff@inventory.local    | Sam        | Staff     |
    When I navigate to the User Management page
    And I search for "Marta"
    Then I should see only the user "Marta Manager"

  Scenario: Filter users by role in User Management page
    Given I am logged in as an admin user
    And the following users exist:
      | Email                    | Role    |
      | admin@inventory.local    | ADMIN   |
      | manager@inventory.local  | MANAGER |
      | staff@inventory.local    | STAFF   |
    When I navigate to the User Management page
    And I filter by role "MANAGER"
    Then I should see only the user with role "MANAGER"

  Scenario: Update user role from User Management page
    Given I am logged in as an admin user
    And a user exists with email "staff@inventory.local" and role "STAFF"
    When I navigate to the User Management page
    And I change the role of "staff@inventory.local" to "MANAGER"
    Then the user role should be updated to "MANAGER"

  Scenario: Deactivate user from User Management page
    Given I am logged in as an admin user
    And a user exists with email "staff@inventory.local" with status "Active"
    When I navigate to the User Management page
    And I click the "Deactivate" button for "staff@inventory.local"
    Then the user status should change to "Inactive"

  Scenario: Reactivate user from User Management page
    Given I am logged in as an admin user
    And a user exists with email "staff@inventory.local" with status "Inactive"
    When I navigate to the User Management page
    And I click the "Reactivate" button for "staff@inventory.local"
    Then the user status should change to "Active"

  Scenario: Logout from user dropdown menu
    Given I am logged in as an admin user
    When I click on the user avatar in the top toolbar
    And I click on "Logout"
    Then I should be logged out successfully
    And I should be redirected to the login page
    And the sidebar and toolbar should no longer display user information

  Scenario: Route protection - redirect to login when not authenticated
    Given I am not logged in
    When I attempt to access the User Management page
    Then I should be redirected to the login page

  Scenario: Route protection - redirect to unauthorized when user is inactive
    Given I am logged in as an inactive user
    When I attempt to access a protected resource
    Then I should be redirected to the Unauthorized page
    And I should see a message about insufficient permissions

  Scenario: Notification badge in toolbar
    Given I am logged in as an admin user
    When I view the application
    Then the notification bell in the toolbar should display:
      | Element |
      | Bell icon |
      | Badge with count |
    And the badge should show the number of unread notifications

  # Sign Up Scenarios
  Scenario: Sign up page displays correctly
    Given I am on the sign up page
    When I view the page
    Then I should see:
      | Element                    |
      | First name input field     |
      | Last name input field      |
      | Email input field          |
      | Password input field       |
      | Confirm password field     |
      | Password visibility toggle |
      | Create account button      |
      | Login link                 |

  Scenario: Successful user sign up
    Given I am on the sign up page
    When I fill in the sign up form with:
      | Field            | Value                    |
      | First Name       | John                     |
      | Last Name        | Doe                      |
      | Email            | john.doe@inventory.local |
      | Password         | SecurePassword123        |
      | Confirm Password | SecurePassword123        |
    And I click the "Create account" button
    Then the user should be created successfully
    And I should be logged in automatically
    And I should be redirected to the dashboard
    And the new user should have role "VIEWER"
    And the new user should be marked as active

  Scenario: Sign up with existing email
    Given a user exists with email "existing@inventory.local"
    And I am on the sign up page
    When I fill in the sign up form with:
      | Field            | Value                    |
      | First Name       | Jane                     |
      | Last Name        | Smith                    |
      | Email            | existing@inventory.local |
      | Password         | SecurePassword123        |
      | Confirm Password | SecurePassword123        |
    And I click the "Create account" button
    Then the sign up should fail
    And I should see an error message "Email is already registered"

  Scenario: Sign up with missing first name
    Given I am on the sign up page
    When I fill in the sign up form with:
      | Field            | Value                    |
      | First Name       |                          |
      | Last Name        | Doe                      |
      | Email            | john.doe@inventory.local |
      | Password         | SecurePassword123        |
      | Confirm Password | SecurePassword123        |
    And I click the "Create account" button
    Then I should see a validation error "First name is required"

  Scenario: Sign up with missing last name
    Given I am on the sign up page
    When I fill in the sign up form with:
      | Field            | Value                    |
      | First Name       | John                     |
      | Last Name        |                          |
      | Email            | john.doe@inventory.local |
      | Password         | SecurePassword123        |
      | Confirm Password | SecurePassword123        |
    And I click the "Create account" button
    Then I should see a validation error "Last name is required"

  Scenario: Sign up with invalid email format
    Given I am on the sign up page
    When I fill in the sign up form with:
      | Field            | Value             |
      | First Name       | John              |
      | Last Name        | Doe               |
      | Email            | invalid-email     |
      | Password         | SecurePassword123 |
      | Confirm Password | SecurePassword123 |
    And I click the "Create account" button
    Then I should see a validation error "Invalid email format"

  Scenario: Sign up with weak password
    Given I am on the sign up page
    When I fill in the sign up form with:
      | Field            | Value                    |
      | First Name       | John                     |
      | Last Name        | Doe                      |
      | Email            | john.doe@inventory.local |
      | Password         | weak                     |
      | Confirm Password | weak                     |
    And I click the "Create account" button
    Then I should see a validation error "Password must be at least 8 characters"

  Scenario: Sign up with mismatched passwords
    Given I am on the sign up page
    When I fill in the sign up form with:
      | Field            | Value                    |
      | First Name       | John                     |
      | Last Name        | Doe                      |
      | Email            | john.doe@inventory.local |
      | Password         | SecurePassword123        |
      | Confirm Password | DifferentPassword456     |
    And I click the "Create account" button
    Then I should see a validation error "Passwords do not match"

  Scenario: Navigate to login from sign up page
    Given I am on the sign up page
    When I click the "Already have an account? Log in" link
    Then I should be navigated to the login page

  Scenario: Sign up password visibility toggle
    Given I am on the sign up page
    When I enter password "SecurePassword123"
    And I click the password visibility toggle
    Then both password fields should display as plain text
    When I click the toggle again
    Then both password fields should be masked

  # Forgot Password Scenarios
  Scenario: Forgot password page displays correctly
    Given I am on the forgot password page
    When I view the page
    Then I should see:
      | Element                |
      | Email input field      |
      | Email icon             |
      | Send reset link button |
      | Back to login link     |

  Scenario: Forgot password email input has proper spacing
    Given I am on the forgot password page
    When I view the email input field
    Then the email icon should not overlap the input text
    And there should be adequate space between text and left border
    And there should be adequate space between text and icon
    And the icon should be vertically centered

  Scenario: Request password reset with valid email
    Given a user exists with email "admin@inventory.local"
    And I am on the forgot password page
    When I enter email "admin@inventory.local"
    And I click the "Send reset link" button
    Then I should see a success message "Password reset link sent to your email"
    And a password reset email should be sent to "admin@inventory.local"

  Scenario: Request password reset with non-existent email
    Given I am on the forgot password page
    When I enter email "nonexistent@inventory.local"
    And I click the "Send reset link" button
    Then I should see a message "If the email exists, a reset link will be sent"
    And no error should be displayed to prevent email enumeration

  Scenario: Request password reset with invalid email format
    Given I am on the forgot password page
    When I enter email "invalid-email"
    And I click the "Send reset link" button
    Then I should see a validation error "Invalid email format"

  Scenario: Request password reset with empty email
    Given I am on the forgot password page
    When I leave the email field empty
    And I click the "Send reset link" button
    Then I should see a validation error "Email is required"

  Scenario: Navigate to login from forgot password page
    Given I am on the forgot password page
    When I click the "Back to login" link
    Then I should be navigated to the login page

  Scenario: Loading state during password reset request
    Given I am on the forgot password page
    When I enter email "admin@inventory.local"
    And I click the "Send reset link" button
    Then the button should display "Sending..."
    And the button should be disabled
    When the request completes
    Then the button should display "Send reset link"
    And the button should be enabled

  # Navigation between auth pages
  Scenario: Navigate from login to sign up
    Given I am on the login page
    When I click the "Sign up" link
    Then I should be navigated to the sign up page

  Scenario: Navigate from login to forgot password
    Given I am on the login page
    When I click the "Forgot password?" link
    Then I should be navigated to the forgot password page

  Scenario: Public access to auth pages
    Given I am not logged in
    When I navigate to the login page
    Then I should be able to access the page
    When I navigate to the sign up page
    Then I should be able to access the page
    When I navigate to the forgot password page
    Then I should be able to access the page

  Scenario: Auth pages redirect when already logged in
    Given I am logged in as an admin user
    When I attempt to navigate to the login page
    Then I should remain on the current page
    When I attempt to navigate to the sign up page
    Then I should remain on the current page
    When I attempt to navigate to the forgot password page
    Then I should remain on the current page
