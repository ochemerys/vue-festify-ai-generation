Feature: System Settings
  As an administrator
  I want to configure system-level settings
  So that I can manage users, security, and system operations

  Background:
    Given I am logged in as an administrator
    And I am on the Settings page

  Scenario: View system settings
    When I navigate to the "System Settings" section
    Then I should see user management options
    And I should see role and permission settings
    And I should see backup and export options
    And I should see integration settings
    And I should see audit log settings

  Scenario: View all system users
    Given I am in the "System Settings" section
    When I navigate to the "User Management" tab
    Then I should see a list of all users
    And each user should show name, email, role, and status
    And I should see active and inactive user counts

  Scenario: Create new user account
    Given I am in the "System Settings" section
    When I navigate to the "User Management" tab
    And I click "Add User"
    And I enter email "newuser@inventory.local"
    And I enter first name "New"
    And I enter last name "User"
    And I select role "STAFF"
    And I click "Create User"
    Then the new user should be created
    And I should see a success message "User created successfully"
    And the user should receive a welcome email

  Scenario: Edit existing user
    Given I am in the "System Settings" section
    And a user "staff@inventory.local" exists
    When I navigate to the "User Management" tab
    And I click "Edit" on the user
    And I change the role to "MANAGER"
    And I click "Save Changes"
    Then the user role should be updated
    And I should see a success message "User updated successfully"

  Scenario: Deactivate user account
    Given I am in the "System Settings" section
    And an active user "oldstaff@inventory.local" exists
    When I navigate to the "User Management" tab
    And I click "Deactivate" on the user
    And I confirm the deactivation
    Then the user should be deactivated
    And the user should not be able to login
    And I should see a success message "User deactivated successfully"

  Scenario: Reactivate user account
    Given I am in the "System Settings" section
    And an inactive user "oldstaff@inventory.local" exists
    When I navigate to the "User Management" tab
    And I click "Reactivate" on the user
    And I confirm the reactivation
    Then the user should be reactivated
    And the user should be able to login again
    And I should see a success message "User reactivated successfully"

  Scenario: Delete user account
    Given I am in the "System Settings" section
    And a user "tempuser@inventory.local" exists with no associated data
    When I navigate to the "User Management" tab
    And I click "Delete" on the user
    And I confirm the deletion
    Then the user should be permanently deleted
    And I should see a success message "User deleted successfully"

  Scenario: Cannot delete user with associated data
    Given I am in the "System Settings" section
    And a user "activemanager@inventory.local" has created orders
    When I navigate to the "User Management" tab
    And I click "Delete" on the user
    Then I should see an error message "Cannot delete user with associated data"
    And the user should remain in the system

  Scenario: Configure role permissions
    Given I am in the "System Settings" section
    When I navigate to the "Roles & Permissions" tab
    And I select role "MANAGER"
    And I enable permission "Approve orders"
    And I enable permission "Manage inventory"
    And I disable permission "Delete products"
    And I click "Save Permissions"
    Then the role permissions should be updated
    And managers should have the new permissions

  Scenario: Create custom role
    Given I am in the "System Settings" section
    When I navigate to the "Roles & Permissions" tab
    And I click "Create Custom Role"
    And I enter role name "Warehouse Supervisor"
    And I select permissions for the role
    And I click "Create Role"
    Then the custom role should be created
    And it should be available for user assignment

  Scenario: Configure automatic backup schedule
    Given I am in the "System Settings" section
    When I navigate to the "Backup & Export" tab
    And I enable automatic backups
    And I set backup frequency to "Daily"
    And I set backup time to "02:00 AM"
    And I set retention period to "30" days
    And I click "Save Changes"
    Then automatic backups should be scheduled
    And I should see a success message "Backup schedule configured"

  Scenario: Perform manual backup
    Given I am in the "System Settings" section
    When I navigate to the "Backup & Export" tab
    And I click "Create Backup Now"
    And I confirm the backup
    Then a backup should be created
    And I should see a success message "Backup created successfully"
    And the backup should appear in the backup list

  Scenario: Download backup file
    Given I am in the "System Settings" section
    And a backup file exists
    When I navigate to the "Backup & Export" tab
    And I click "Download" on a backup file
    Then the backup file should be downloaded
    And it should be in the correct format

  Scenario: Restore from backup
    Given I am in the "System Settings" section
    And a backup file exists
    When I navigate to the "Backup & Export" tab
    And I click "Restore" on a backup file
    And I confirm the restoration
    Then the system should be restored from backup
    And I should see a success message "System restored successfully"

  Scenario: Export data to CSV
    Given I am in the "System Settings" section
    When I navigate to the "Backup & Export" tab
    And I select "Products" for export
    And I select export format "CSV"
    And I click "Export"
    Then the data should be exported to CSV
    And the file should be downloaded

  Scenario: Export data to JSON
    Given I am in the "System Settings" section
    When I navigate to the "Backup & Export" tab
    And I select "Orders" for export
    And I select export format "JSON"
    And I click "Export"
    Then the data should be exported to JSON
    And the file should be downloaded

  Scenario: Configure third-party integration
    Given I am in the "System Settings" section
    When I navigate to the "Integrations" tab
    And I click "Add Integration"
    And I select integration type "QuickBooks"
    And I enter API credentials
    And I enable data sync
    And I click "Save Integration"
    Then the integration should be configured
    And data should sync with QuickBooks

  Scenario: Test integration connection
    Given I am in the "System Settings" section
    And an integration is configured
    When I navigate to the "Integrations" tab
    And I click "Test Connection" on the integration
    Then the connection should be tested
    And I should see the connection status

  Scenario: Disable integration
    Given I am in the "System Settings" section
    And an active integration exists
    When I navigate to the "Integrations" tab
    And I click "Disable" on the integration
    And I confirm the action
    Then the integration should be disabled
    And data sync should stop

  Scenario: View audit logs
    Given I am in the "System Settings" section
    When I navigate to the "Audit Logs" tab
    Then I should see a list of system activities
    And each log should show timestamp, user, action, and details
    And I should be able to filter logs by date range
    And I should be able to filter logs by user
    And I should be able to filter logs by action type

  Scenario: Export audit logs
    Given I am in the "System Settings" section
    When I navigate to the "Audit Logs" tab
    And I select date range "Last 30 days"
    And I click "Export Logs"
    Then the audit logs should be exported
    And the file should be downloaded

  Scenario: Configure audit log retention
    Given I am in the "System Settings" section
    When I navigate to the "Audit Logs" tab
    And I set log retention period to "90" days
    And I click "Save Changes"
    Then the retention period should be set
    And logs older than 90 days should be automatically deleted

  Scenario: Configure session timeout
    Given I am in the "System Settings" section
    When I navigate to the "Security" tab
    And I set session timeout to "30" minutes
    And I click "Save Changes"
    Then the session timeout should be set
    And users should be logged out after 30 minutes of inactivity

  Scenario: Enable IP whitelist
    Given I am in the "System Settings" section
    When I navigate to the "Security" tab
    And I enable IP whitelist
    And I add IP address "192.168.1.100"
    And I add IP range "10.0.0.0/24"
    And I click "Save Changes"
    Then IP whitelist should be enabled
    And only whitelisted IPs should be able to access the system

  Scenario: Configure password policy
    Given I am in the "System Settings" section
    When I navigate to the "Security" tab
    And I set minimum password length to "12"
    And I require uppercase letters
    And I require numbers
    And I require special characters
    And I set password expiration to "90" days
    And I click "Save Changes"
    Then the password policy should be updated
    And new passwords must meet these requirements

  Scenario: Enable login attempt limiting
    Given I am in the "System Settings" section
    When I navigate to the "Security" tab
    And I enable login attempt limiting
    And I set maximum attempts to "5"
    And I set lockout duration to "30" minutes
    And I click "Save Changes"
    Then login limiting should be enabled
    And accounts should lock after 5 failed attempts

  Scenario: Non-admin cannot access system settings
    Given I am logged in as a "MANAGER" user
    When I navigate to the Settings page
    Then I should not see the "System Settings" section
    And I should see an access denied message if I try to access it directly

  Scenario: Validation error for invalid email format
    Given I am in the "System Settings" section
    When I try to create a user with email "invalid-email"
    And I click "Create User"
    Then I should see an error message "Please enter a valid email address"
    And the user should not be created

  Scenario: Validation error for duplicate email
    Given I am in the "System Settings" section
    And a user with email "existing@inventory.local" exists
    When I try to create a user with email "existing@inventory.local"
    And I click "Create User"
    Then I should see an error message "Email already exists"
    And the user should not be created
