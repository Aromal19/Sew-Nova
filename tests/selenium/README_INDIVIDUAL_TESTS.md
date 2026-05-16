# SewNova Individual Selenium Tests

This directory contains 4 separate Python test files for testing different aspects of the SewNova admin functionality.

## 📁 Test Files

### 1. `test_1_admin_login.py`
- **Purpose**: Tests admin login functionality
- **URL**: `http://localhost:5173/login`
- **Credentials**: `admin@gmail.com` / `admin@123`
- **Features**: Login form validation, redirect verification

### 2. `test_2_add_design.py`
- **Purpose**: Tests design creation workflow
- **URL**: `http://localhost:5173/admin/designs` → Click +Add Design button
- **Features**: Form filling, image upload, submission validation

### 3. `test_3_design_listing.py`
- **Purpose**: Tests design listing and management
- **URL**: `http://localhost:5173/admin/designs`
- **Features**: Search, filter, edit operations

### 4. `test_4_profile_editing.py`
- **Purpose**: Tests admin profile editing
- **URL**: `http://localhost:5173/admin/settings`
- **Features**: Profile form updates, password change

## 🚀 How to Run Tests

### Run Individual Tests
```bash
# Run specific test by number
python tests/selenium/run_individual_test.py 1  # Admin Login
python tests/selenium/run_individual_test.py 2  # Add Design
python tests/selenium/run_individual_test.py 3  # Design Listing
python tests/selenium/run_individual_test.py 4  # Profile Editing

# Or run directly
python tests/selenium/test_1_admin_login.py
python tests/selenium/test_2_add_design.py
python tests/selenium/test_3_design_listing.py
python tests/selenium/test_4_profile_editing.py
```

### Run All Tests
```bash
# Run all tests sequentially
python tests/selenium/run_all_tests.py
```

## 📋 Prerequisites

1. **SewNova Frontend Running**: Make sure your frontend is running on `http://localhost:5173`
2. **Chrome Browser**: Chrome browser must be installed
3. **ChromeDriver**: Automatically managed by selenium-webdriver
4. **Python Dependencies**: 
   ```bash
   pip install selenium
   ```

## 📸 Screenshots

All tests automatically capture screenshots and save them in the `screenshots/` directory:
- `login_page.png` - Login page
- `login_success.png` - Successful login
- `designs_listing_page.png` - Designs listing page
- `add_design_clicked.png` - After clicking +Add Design
- `design_form_filled.png` - Design form with data
- `profile_settings_page.png` - Profile settings page
- And more...

## 🔧 Configuration

Each test file contains these configurable variables:
```python
BASE_URL = "http://localhost:5173"
USERNAME = "admin@gmail.com"
PASSWORD = "admin@123"
```

## 📊 Test Results

Each test provides:
- ✅ **PASS** - Test completed successfully
- ❌ **FAIL** - Test failed with error details
- 📸 **Screenshots** - Visual evidence of test execution
- 📝 **Logs** - Detailed step-by-step execution logs

## 🐛 Troubleshooting

### Common Issues:
1. **Frontend not running**: Start your SewNova frontend first
2. **Chrome not found**: Install Chrome browser
3. **Timeout errors**: Increase wait times in test files
4. **Element not found**: Check if selectors match your UI

### Debug Mode:
To see browser actions (non-headless mode), comment out the headless option:
```python
# chrome_options.add_argument("--headless")  # Comment this line
```

## 🎯 Test Coverage

- ✅ **Admin Authentication**: Login/logout functionality
- ✅ **Design Management**: Create, list, edit designs
- ✅ **Profile Management**: Update admin profile and settings
- ✅ **UI Interactions**: Button clicks, form filling, navigation
- ✅ **Error Handling**: Timeout handling, element detection
- ✅ **Visual Verification**: Screenshot capture for each step

## 📈 Benefits of Individual Tests

1. **Focused Testing**: Test specific functionality in isolation
2. **Faster Debugging**: Identify issues quickly
3. **Modular Development**: Add new tests easily
4. **CI/CD Integration**: Run specific tests in pipelines
5. **Parallel Execution**: Run tests simultaneously (with different ports)
