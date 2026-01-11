# Settings Page - Design Specification

## Overview
The Settings page provides a comprehensive interface for users to configure application preferences, account settings, business operations, inventory management, order processing, and system administration. The page uses a tabbed interface with role-based access control to show relevant settings to each user type.

---

## Page Layout

### Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header (AppHeader)                                          │
├─────────────────────────────────────────────────────────────┤
│ Sidebar │ Settings Content Area                             │
│         │ ┌─────────────────────────────────────────────┐   │
│         │ │ Page Title & Description                    │   │
│         │ ├─────────────────────────────────────────────┤   │
│         │ │ Tab Navigation                              │   │
│         │ │ [User Preferences] [Account] [Business]...  │   │
│         │ ├─────────────────────────────────────────────┤   │
│         │ │                                             │   │
│         │ │ Active Tab Content                          │   │
│         │ │ (Forms, Tables, Configuration Panels)       │   │
│         │ │                                             │   │
│         │ │                                             │   │
│         │ ├─────────────────────────────────────────────┤   │
│         │ │ Action Buttons                              │   │
│         │ │ [Cancel] [Reset to Defaults] [Save Changes] │   │
│         │ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab Structure & Access Control

### Tab Visibility by Role

| Tab | ADMIN | MANAGER | STAFF | VIEWER |
|-----|-------|---------|-------|--------|
| User Preferences | ✓ | ✓ | ✓ | ✓ |
| Account Settings | ✓ | ✓ | ✓ | ✓ |
| Business Settings | ✓ | ✗ | ✗ | ✗ |
| Inventory Settings | ✓ | ✓ | Limited | ✗ |
| Order Settings | ✓ | ✓ | Limited | ✗ |
| System Settings | ✓ | ✗ | ✗ | ✗ |

---

## 1. User Preferences Tab

### Purpose
Allow users to customize their personal application experience.

### Sections

#### 1.1 Theme Settings
```
┌─────────────────────────────────────────────────────────┐
│ Theme                                                   │
├─────────────────────────────────��───────────────────────┤
│ Choose your preferred color theme                       │
│                                                         │
│ ○ Light Mode    ● Dark Mode    ○ Auto (System)        │
│                                                         │
│ Preview:                                                │
│ ┌─────────────────────────────────────────────────┐   │
│ │ [Theme Preview Component]                       │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Fields:**
- Theme Selection: Radio buttons (Light, Dark, Auto)
- Live Preview: Shows current theme appearance

**Behavior:**
- Changes apply immediately to preview
- Saved theme persists across sessions
- Auto mode follows system preferences

#### 1.2 Language & Localization
```
┌─────────────────────────────────────────────────────────┐
│ Language & Regional Settings                            │
├─────────────────────────────────────────────────────────┤
│ Language:        [English ▼]                           │
│ Date Format:     [MM/DD/YYYY ▼]                        │
│ Time Format:     [12-hour ▼]                           │
│ Timezone:        [UTC-5 (Eastern Time) ▼]              │
│ Number Format:   [1,234.56 ▼]                          │
└─────────────────────────────────────────────────────────┘
```

**Fields:**
- Language: Dropdown (English, Spanish, French, German, etc.)
- Date Format: Dropdown (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- Time Format: Dropdown (12-hour, 24-hour)
- Timezone: Dropdown with search
- Number Format: Dropdown (1,234.56 vs 1.234,56)

#### 1.3 Notification Preferences
```
┌─────────────────────────────────────────────────────────┐
│ Notifications                                           │
├────────────────────────────────��────────────────────────┤
│ Email Notifications                                     │
│ ☑ Enable email notifications                           │
│   ☑ Low stock alerts                                   │
│   ☑ Order updates                                      │
│   ☑ System announcements                               │
│   ☐ Weekly summary reports                             │
│                                                         │
│ In-App Notifications                                    │
│ ☑ Enable in-app notifications                          │
│ ☑ Show desktop notifications                           │
│                                                         │
│ Notification Frequency:  [Real-time ▼]                 │
└─────────────────────────────────────────────────────────┘
```

**Fields:**
- Email Notifications: Master toggle + individual checkboxes
- In-App Notifications: Toggle switches
- Frequency: Dropdown (Real-time, Hourly digest, Daily digest)

#### 1.4 Dashboard Preferences
```
┌──────────────────────────────────��──────────────────────┐
│ Dashboard Customization                                 │
├─────────────────────────────────────────────────────────┤
│ Default Landing Page:  [Dashboard ▼]                   │
│                                                         │
│ Visible Widgets:                                        │
│ ☑ Sales Overview                                       │
│ ☑ Low Stock Alerts                                     │
│ ☑ Recent Orders                                        │
│ ☑ Top Products                                         │
│ ☐ Revenue Chart                                        │
│                                                         │
│ Items per page:  [25 ▼]                                │
└─────────────────────────────────────────────────────────┘
```

**Fields:**
- Default Landing Page: Dropdown (Dashboard, Products, Orders, etc.)
- Visible Widgets: Checkboxes for each widget
- Items per page: Dropdown (10, 25, 50, 100)

---

## 2. Account Settings Tab

### Purpose
Manage personal account information and security settings.

### Sections

#### 2.1 Profile Information
```
┌─────────────────────────────────────────────────────────┐
│ Profile Information                                     │
├─────────────────────────────────────────────────────────┤
│ Profile Picture                                         │
│ ┌─────────┐                                            │
│ │   JD    │  [Upload Picture] [Remove]                 │
│ └─────────┘                                            │
│                                                         │
│ First Name:  [John                    ]                │
│ Last Name:   [Doe                     ]                │
│ Email:       [john.doe@company.com    ]                │
│              ⓘ Email changes require verification      │
│ Phone:       [+1 (555) 123-4567       ]                │
│ Job Title:   [Inventory Manager       ]                │
└────────────────────────��────────────────────────────────┘
```

**Fields:**
- Profile Picture: Image upload with preview (max 2MB, JPG/PNG)
- First Name: Text input (required, max 50 chars)
- Last Name: Text input (required, max 50 chars)
- Email: Email input (required, triggers verification)
- Phone: Phone input with format validation
- Job Title: Text input (optional, max 100 chars)

**Validation:**
- Email format validation
- Phone number format validation
- Image size and type validation

#### 2.2 Password & Security
```
┌─────────────────────────────────────────────────────────┐
│ Password & Security                                     │
├─────────────────────────────────────────────────────────┤
│ Change Password                                         │
│ Current Password:  [••••••••••        ]                │
│ New Password:      [••••••••••        ]                │
│                    Password strength: ████░░░░ Strong   │
│ Confirm Password:  [••••••••��•        ]                │
│                                                         │
│ [Change Password]                                       │
│                                                         │
│ Two-Factor Authentication                               │
│ Status: ✗ Disabled                                     │
│ [Enable 2FA]                                           │
│                                                         │
│ Active Sessions                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🖥️ Windows PC - Chrome                          │   │
│ │ 192.168.1.100 • Active now (Current)            │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 📱 iPhone - Safari                              │   │
│ │ 192.168.1.105 • 2 hours ago      [Logout]      │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [Logout from all other devices]                        │
└─────────────────────────────────────────────────────────┘
```

**Fields:**
- Current Password: Password input (required)
- New Password: Password input with strength indicator
- Confirm Password: Password input with match validation
- 2FA Status: Display with enable/disable button
- Active Sessions: List with device info and logout option

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

#### 2.3 API Keys (Optional)
```
┌─────────────────────────────────────────────────────────┐
│ API Keys                                                │
├─────────────────────────────────────────────────────────┤
│ Manage API keys for integrations                        │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Production Key                                  │   │
�� │ sk_live_••••••••••••••••1234                   │   │
│ │ Created: Jan 15, 2024 • Last used: 2 hours ago │   │
│ │ [Regenerate] [Delete]                          │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [+ Generate New API Key]                               │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Business Settings Tab (Admin Only)

### Purpose
Configure company-wide business settings and operational parameters.

### Sections

#### 3.1 Company Information
```
┌─────────────────────────────────────────────────────────┐
│ Company Information                                     │
├─────────────────────────────────────────────────────────┤
│ Company Logo                                            │
│ ┌─────────┐                                            │
│ │  LOGO   │  [Upload Logo] [Remove]                    │
│ └─────────┘                                            │
│                                                         │
│ Company Name:  [Acme Corporation              ]        │
│ Legal Name:    [Acme Corp. Inc.               ]        │
│ Tax ID:        [12-3456789                    ]        │
│                                                         │
│ Address:       [123 Main Street               ]        │
│ City:          [New York                      ]        │
│ State:         [NY ▼]                                  │
│ ZIP Code:      [10001                         ]        │
│ Country:       [United States ▼]                       │
│                                                         │
│ Phone:         [+1 (555) 987-6543            ]        │
│ Email:         [info@acmecorp.com            ]        │
│ Website:       [www.acmecorp.com             ]        │
└─────────────────────────────────────────────────────────┘
```

#### 3.2 Warehouse Locations
```
┌──���──────────────────────────────────────────────────────┐
│ Warehouse Locations                                     │
├─────────────────────────────────────────────────────────┤
│ [+ Add Location]                                        │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ⭐ Warehouse North (Default)                    │   │
│ │ Code: WH-N                                      │   │
│ │ 456 Industrial Blvd, Chicago, IL 60601         │   │
│ │ [Edit] [Remove Default] [Delete]               │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Warehouse South                                 │   │
│ │ Code: WH-S                                      │   │
│ │ 789 Commerce Dr, Atlanta, GA 30301             │   │
│ │ [Edit] [Set as Default] [Delete]               │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Add/Edit Location Modal:**
```
┌─────────────────────────────────────────────────────────┐
│ Add Warehouse Location                          [×]     │
├─────────────────────────────────────────────────────────┤
│ Location Name:  [                             ]        │
│ Location Code:  [                             ]        │
│ Address:        [                             ]        │
│ City:           [                             ]        │
│ State:          [Select State ▼]                       │
│ ZIP Code:       [                             ]        │
│                                                         │
│ ☐ Set as default location                              │
│                                                         │
│                              [Cancel] [Save Location]   │
└─────────────────────────────────────────────────────────┘
```

#### 3.3 Currency & Units
```
┌─────────────────────────────────────────────────────────┐
│ Currency & Measurement Units                            │
├─────────────────────────────────────────────────────────┤
│ Default Currency:      [USD - US Dollar ▼]             │
│ Currency Symbol:       [$]                              │
│ Decimal Places:        [2 ▼]                           │
│                                                         │
│ Measurement System:    ○ Imperial  ● Metric            │
│                                                         │
│ Weight Unit:           [Kilograms (kg) ▼]              │
│ Dimension Unit:        [Centimeters (cm) ▼]            │
│ Volume Unit:           [Liters (L) ▼]                  │
└───────────���─────────────────────────────────────────────┘
```

#### 3.4 Tax Configuration
```
┌─────────────────────────────────────────────────────────┐
│ Tax Configuration                                       │
├─────────────────────────────────────────────────────────┤
│ [+ Add Tax Rate]                                        │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ⭐ VAT (Default)                                │   │
│ │ Rate: 20.00%                                    │   │
│ │ [Edit] [Remove Default] [Delete]               │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Sales Tax                                       │   │
│ │ Rate: 8.50%                                     │   │
│ │ [Edit] [Set as Default] [Delete]               │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Tax Calculation:  ○ Inclusive  ● Exclusive             │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Inventory Settings Tab

### Purpose
Configure inventory management parameters and automation rules.

### Sections

#### 4.1 Stock Alerts
```
┌─────────────────────────────────────────────────────────┐
│ Stock Alert Configuration                               │
├─────────────────────────────────────────────────────────┤
│ Low Stock Threshold:   [10        ] units              │
│ Reorder Point:         [20        ] units              │
│ Critical Stock Level:  [5         ] units              │
│                                                         │
│ Alert Recipients:                                       │
│ ┌─────────────────────────────────────────────────┐   │
│ │ manager@inventory.local              [×]        │   │
│ │ warehouse@inventory.local            [×]        │   │
│ └─────────────────────────────────────────────────┘   │
│ [+ Add Recipient]                                      │
│                                                         │
│ Alert Frequency:  [Daily Digest ▼]                     │
│                                                         │
│ ☑ Send low stock alerts                                │
│ ☑ Send out of stock alerts                             │
│ ☑ Send reorder point alerts                            │
└────���───────────────────────────────────────��────────────┘
```

#### 4.2 Product Defaults
```
┌─────────────────────────────────────────────────────────┐
│ Product Defaults                                        │
├─────────────────────────────────────────────────────────┤
│ Default Category:   [Electronics ▼]                    │
│ Default Supplier:   [Acme Suppliers Inc. ▼]            │
│ Default Location:   [Warehouse North ▼]                │
│ Default Unit:       [Each ▼]                           │
└─────────────────────────────────────────────────────────┘
```

#### 4.3 SKU Configuration
```
┌─────────────────────────────────────────────────────────┐
│ SKU Configuration                                       │
├──────────────────────────────────────────────���──────────┤
│ ☑ Enable automatic SKU generation                      │
│                                                         │
│ SKU Format:                                             │
│ ○ Simple sequential (PROD000001)                       │
│ ● Category-based (ELEC000001, FURN000001)             │
│ ○ Custom format                                        │
│                                                         │
│ Prefix:            [PROD      ]                        │
│ Number Length:     [6 ▼]                               │
│ Starting Number:   [1         ]                        │
│                                                         │
│ Preview: PROD000001                                     │
└─────────────────────────────────────────────────────────┘
```

#### 4.4 Barcode Settings
```
┌─────────────────────────────────────────────────────────┐
│ Barcode Settings                                        │
├───────────────────────────────���─────────────────────────┤
│ Barcode Format:     [EAN-13 ▼]                         │
│                                                         │
│ ☑ Enable barcode scanner integration                   │
│ Scanner Type:       [USB Scanner ▼]                    │
│                                                         │
│ ☑ Auto-generate barcodes for new products              │
│ ☑ Print barcode on product labels                      │
└─────────────────────────────────────────────────────────┘
```

#### 4.5 Advanced Tracking
```
┌─────────────────────────────────────────────────────────┐
│ Advanced Tracking Options                               │
├─────────────────────────────────────────────────────────┤
│ ☑ Enable batch/lot tracking                            │
│ ☑ Enable serial number tracking                        │
│ ☑ Enable expiration date tracking                      │
│   Expiration Warning: [30        ] days before         │
│                                                         │
│ Inventory Valuation Method:  [FIFO ▼]                  │
│ (First In, First Out)                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Order Settings Tab

### Purpose
Configure order processing workflows and automation.

### Sections

#### 5.1 Order Workflow
```
┌─────────────────────────────────────────────────────────┐
│ Order Approval Workflow                                 │
├─────────────────────────────────────────────────────────┤
│ ☑ Require approval for orders                          │
│                                                         │
│ Approval Threshold:  [$1,000.00   ]                    │
│                                                         │
│ ☑ Enable multi-level approval                          │
│                                                         │
│ Approval Levels:                                        │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Level 1: $500 - $5,000                          │   │
│ │ Approver Role: Manager                          │   │
│ │ [Edit] [Delete]                                 │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Level 2: $5,000+                                │   │
│ │ Approver Role: Admin                            │   │
│ │ [Edit] [Delete]                                 │   │
│ └─────────────────────────────────────────────────┘   │
│ [+ Add Approval Level]                                 │
│                                                         │
│ ☑ Auto-fulfill orders after approval                   │
└─────────────────────────────────────────────────────────┘
```

#### 5.2 Invoice Settings
```
┌───────────────────���─────────────────────────────────────┐
│ Invoice Configuration                                   │
├─────────────────────────────────────────────────────────┤
│ Invoice Numbering:                                      │
│ ○ Simple sequential (INV000001)                        │
│ ● Date-based (INV-2024-01-0001)                        │
│ ○ Custom format                                        │
│                                                         │
│ Prefix:            [INV       ]                        │
│ Number Length:     [6 ▼]                               │
│ Starting Number:   [1000      ]                        │
│                                                         │
│ Preview: INV-2024-01-1000                              │
│                                                         │
│ Default Payment Terms:  [Net 30 ▼]                     │
│                                                         │
│ Invoice Footer Text:                                    │
│ ┌──────────────────────────────���──────────────────┐   │
│ │ Thank you for your business!                    │   │
│ │ Payment is due within 30 days.                  │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

#### 5.3 Shipping Settings
```
┌─────────────────────────────────────────────────────────┐
│ Shipping Configuration                                  │
├─────────────────────────────────────────────────────────┤
│ Default Shipping Method:  [Standard Shipping ▼]        │
│                                                         │
│ Shipping Methods:                                       │
│ [+ Add Shipping Method]                                │
│                                                         │
│ ┌────────────��────────────────────────────────────┐   │
│ │ Standard Shipping                               │   │
│ │ Cost: $10.00 • Delivery: 5-7 days              │   │
│ │ [Edit] [Delete]                                 │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Express Overnight                               │   │
│ │ Cost: $25.00 • Delivery: 1 day                 │   │
│ │ [Edit] [Delete]                                 │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Carrier Integrations:                                   │
│ ☑ FedEx  ☑ UPS  ☐ USPS  ☐ DHL                        │
│ [Configure Integrations]                               │
└─────────────────────────────────────────────────────────┘
```

#### 5.4 Order Policies
```
┌─────────────────────────────────────────────────────────┐
│ Order Policies                                          │
├─────────────────────────────────────────────────────────┤
│ Minimum Order Value:  [$50.00     ]                    │
│                                                         │
│ ☑ Allow order cancellation                             │
│   Cancellation Window: [24        ] hours              │
│                                                         │
│ ☑ Allow backorders                                     │
│ ☑ Send backorder notifications                         │
│                                                         │
│ ☑ Allow returns                                        │
│   Return Window: [30        ] days                     │
│   ☑ Automatic refund processing                        │
└───────────────────────────���─────────────────────────────┘
```

---

## 6. System Settings Tab (Admin Only)

### Purpose
Manage system-level configurations, users, and security.

### Sections

#### 6.1 User Management
```
┌─────────────────────────────────────────────────────────┐
│ User Management                                         │
├─────────────────────────────────────────────────────────┤
│ [+ Add User]  [Import Users]  [Export Users]           │
│                                                         │
│ Search: [                    ] 🔍                      │
│ Filter by Role: [All Roles ▼]  Status: [All ▼]        │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Name          Email              Role    Status │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ John Doe      john@inv.local    ADMIN   Active │   │
│ │               [Edit] [Deactivate] [Delete]     │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Jane Smith    jane@inv.local    MANAGER Active │   │
│ │               [Edit] [Deactivate] [Delete]     │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Bob Wilson    bob@inv.local     STAFF   Active │   │
│ │               [Edit] [Deactivate] [Delete]     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Showing 3 of 15 users  [1] 2 3 >                       │
└─────────────────────────────────────────────────────────┘
```

**Add/Edit User Modal:**
```
┌─────────────────────────────────────────────────────────┐
│ Add New User                                    [×]     │
├─────────────────────────────────────────────────────────┤
│ First Name:  [                             ]           │
│ Last Name:   [                             ]           │
│ Email:       [                             ]           │
│ Role:        [Select Role ▼]                           │
│              ADMIN, MANAGER, STAFF, VIEWER              │
│                                                         │
│ ☑ Send welcome email with login instructions           │
│ ☑ Require password change on first login               │
│                                                         │
│                              [Cancel] [Create User]     │
└─────────────────────────────────────────────────────────┘
```

#### 6.2 Roles & Permissions
```
┌───────���─────────────────────────────────────────────────┐
│ Roles & Permissions                                     │
├─────────────────────────────────────────────────────────┤
│ Select Role: [MANAGER ▼]                               │
│                                                         │
│ Permissions:                                            │
│                                                         │
│ Products                                                │
│ ☑ View products      ☑ Create products                 │
│ ☑ Edit products      ☐ Delete products                 │
│                                                         │
│ Inventory                                               │
│ ☑ View inventory     ☑ Adjust inventory                │
│ ☑ Transfer stock     ☐ Delete inventory records        │
│                                                         │
│ Orders                                                  │
│ ☑ View orders        ☑ Create orders                   │
│ ☑ Edit orders        ☑ Approve orders                  │
│ ☐ Delete orders      ☑ Cancel orders                   │
│                                                         │
│ Reports                                                 │
│ ☑ View reports       ☑ Export reports                  │
│ ☐ Configure reports                                    │
│                                                         │
│ Settings                                                │
│ ☑ View settings      ☐ Edit business settings          │
│ ☐ Manage users       ☐ System administration           │
│                                                         │
│ [+ Create Custom Role]              [Save Permissions]  │
└─────────────────────────────────────────────────────────┘
```

#### 6.3 Backup & Export
```
┌─────────────────────────────────────────────────────────┐
│ Backup & Data Export                                    │
├─────────────────────────────────────────────────────────���
│ Automatic Backups                                       │
│ ☑ Enable automatic backups                             │
│ Frequency:         [Daily ▼]                           │
│ Backup Time:       [02:00 AM ▼]                        │
│ Retention Period:  [30        ] days                   │
│                                                         │
│ [Create Backup Now]                                    │
│                                                         │
│ Recent Backups:                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ backup-2024-01-15-02-00.zip                     │   │
│ │ 45.2 MB • Jan 15, 2024 2:00 AM                 │   │
│ │ [Download] [Restore]                           │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ backup-2024-01-14-02-00.zip                     │   │
│ │ 44.8 MB • Jan 14, 2024 2:00 AM                 │   │
│ │ [Download] [Restore]                           │   │
│ └────────────────���────────────────────────────────┘   │
│                                                         │
│ Data Export                                             │
│ Export Type:  [Products ▼]                             │
│ Format:       [CSV ▼]                                  │
│ [Export Data]                                          │
└─────────────────────────────────────────────────────────┘
```

#### 6.4 Integrations
```
┌─────────────────────────────────────────────────────────┐
│ Third-Party Integrations                                │
├─────────────────────────────────────────────────────────┤
│ [+ Add Integration]                                     │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ �� QuickBooks                                   │   │
│ │ Status: ✓ Connected                             │   │
│ │ Last Sync: 2 hours ago                          │   │
│ │ [Configure] [Test Connection] [Disable]        │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ 🛒 Shopify                                      │   │
│ │ Status: ✗ Not Connected                         │   │
│ │ [Connect]                                       │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

#### 6.5 Audit Logs
```
┌─────────────────────────────────────────────────────────┐
│ Audit Logs                                              │
├─────────────────────────────────────────���───────────────┤
│ Date Range: [Last 30 days ▼]                           │
│ User:       [All Users ▼]                              │
│ Action:     [All Actions ▼]                            │
│ [Filter] [Export Logs]                                 │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Timestamp         User        Action            │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Jan 15, 10:30 AM  John Doe    Created product  │   │
│ │ Product: Laptop Model X                         │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Jan 15, 10:15 AM  Jane Smith  Approved order   │   │
│ │ Order: #ORD-1234                                │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Jan 15, 09:45 AM  Bob Wilson  Updated inventory│   │
│ │ Product: Widget A, Qty: +50                     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Log Retention: [90        ] days                       │
│ [Save Settings]                                        │
└─────────────────────────────────────────────────────────┘
```

#### 6.6 Security Settings
```
┌─────────────────────────────────────────────────────────┐
│ Security Settings                                       │
├─────────────────────────────────────────────────────────┤
│ Session Management                                      │
│ Session Timeout:  [30        ] minutes                 │
│                                                         │
│ Password Policy                                         │
│ Minimum Length:        [12 ▼]                          │
│ ☑ Require uppercase letters                            │
│ ☑ Require numbers                                      │
│ ☑ Require special characters                           │
│ Password Expiration:   [90        ] days               │
│                                                         │
│ Login Security                                          │
│ ☑ Enable login attempt limiting                        │
│   Max Attempts:        [5 ▼]                           │
│   Lockout Duration:    [30        ] minutes            │
│                                                         │
│ IP Whitelist                                            │
│ ☐ Enable IP whitelist                                  │
│ [Manage IP Addresses]                                  │
│                                                         │
│ [Save Security Settings]                               │
└─────────────────────────────────────────────────────────┘
```

---

## Action Buttons

### Button Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Cancel] [Reset to Defaults]          [Save Changes]   │
└─────────────────────────────────────────────────────────┘
```

### Button Specifications

**Cancel Button:**
- Style: Secondary (outlined)
- Color: Gray
- Action: Discard changes and revert to saved values
- Confirmation: Show modal if unsaved changes exist

**Reset to Defaults Button:**
- Style: Secondary (outlined)
- Color: Orange/Warning
- Action: Reset current tab to default values
- Confirmation: "Are you sure you want to reset to defaults?"

**Save Changes Button:**
- Style: Primary (filled)
- Color: Blue
- Action: Save all changes in current tab
- States: Normal, Loading (with spinner), Success, Error
- Keyboard: Enter key triggers save

---

## Responsive Behavior

### Desktop (≥1024px)
- Full tab navigation visible
- Two-column layout for forms where appropriate
- Side-by-side sections

### Tablet (768px - 1023px)
- Full tab navigation visible
- Single-column layout
- Stacked sections

### Mobile (<768px)
- Tabs converted to dropdown selector
- Single-column layout
- Collapsible sections with accordions
- Sticky action buttons at bottom

---

## Color Scheme

### Light Mode
- Background: `#FFFFFF`
- Section Background: `#F8FAFC`
- Border: `#E2E8F0`
- Text Primary: `#1E293B`
- Text Secondary: `#64748B`
- Primary Button: `#3B82F6`
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`

### Dark Mode
- Background: `#0F172A`
- Section Background: `#1E293B`
- Border: `#334155`
- Text Primary: `#F1F5F9`
- Text Secondary: `#94A3B8`
- Primary Button: `#3B82F6`
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`

---

## Notifications & Feedback

### Success Messages
```
┌─────────────────────────────────────────────────────────┐
│ ✓ Settings saved successfully                    [×]    │
└─────────────────────────────────────────────────────────┘
```
- Position: Top-right corner
- Duration: 3 seconds
- Color: Green (#10B981)

### Error Messages
```
┌─────────────────────────────────────────────────────────┐
│ ✗ Failed to save settings. Please try again.    [×]    │
└─────────────────────────────────────────────────────────┘
```
- Position: Top-right corner
- Duration: 5 seconds
- Color: Red (#EF4444)

### Validation Errors
- Display inline below invalid field
- Red border on invalid input
- Icon indicator (⚠️)

---

## Accessibility

### ARIA Labels
- All form inputs have associated labels
- Tab navigation uses `role="tablist"` and `role="tab"`
- Buttons have descriptive `aria-label` attributes
- Error messages linked to inputs via `aria-describedby`

### Keyboard Navigation
- Tab key navigates through all interactive elements
- Enter/Space activates buttons and toggles
- Arrow keys navigate between tabs
- Escape closes modals and dropdowns

### Screen Reader Support
- Announce tab changes
- Announce success/error messages
- Describe form validation errors
- Label all form controls

---

## State Management

### Store Structure (Pinia)
```typescript
interface SettingsState {
  userPreferences: UserPreferences
  accountSettings: AccountSettings
  businessSettings: BusinessSettings
  inventorySettings: InventorySettings
  orderSettings: OrderSettings
  systemSettings: SystemSettings
  loading: boolean
  error: string | null
  unsavedChanges: boolean
}
```

### Actions
- `loadSettings()` - Load all settings from API
- `saveSettings(tab)` - Save settings for specific tab
- `resetToDefaults(tab)` - Reset tab to default values
- `updateSetting(key, value)` - Update single setting
- `validateSettings()` - Validate before save

---

## API Endpoints

```
GET    /api/settings/preferences
PUT    /api/settings/preferences
GET    /api/settings/account
PUT    /api/settings/account
GET    /api/settings/business
PUT    /api/settings/business
GET    /api/settings/inventory
PUT    /api/settings/inventory
GET    /api/settings/orders
PUT    /api/settings/orders
GET    /api/settings/system
PUT    /api/settings/system
POST   /api/settings/reset/:tab
```

---

## Implementation Notes

1. **Lazy Loading**: Load tab content only when tab is activated
2. **Auto-Save**: Consider auto-save for user preferences
3. **Validation**: Client-side validation before API call
4. **Confirmation**: Warn user about unsaved changes on navigation
5. **Permissions**: Check user role before rendering tabs
6. **Caching**: Cache settings to reduce API calls
7. **Optimistic Updates**: Update UI immediately, rollback on error

---

## Testing Considerations

- Test all form validations
- Test role-based access control
- Test save/cancel/reset functionality
- Test responsive layouts
- Test keyboard navigation
- Test screen reader compatibility
- Test error handling and recovery
- Test integration with other modules

---

## Future Enhancements

1. **Import/Export Settings**: Allow bulk settings management
2. **Settings Templates**: Pre-configured setting profiles
3. **Change History**: Track settings changes over time
4. **Settings Search**: Search across all settings
5. **Guided Setup**: Wizard for initial configuration
6. **Settings Comparison**: Compare settings across environments
7. **Bulk User Operations**: Import/export users via CSV
8. **Advanced Permissions**: Granular permission management
