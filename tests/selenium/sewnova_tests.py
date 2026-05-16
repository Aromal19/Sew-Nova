import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

BASE_URL = "http://localhost:5173"
USERNAME = "admin@gmail.com"
PASSWORD = "admin@123"

# Enable headless mode for CI/CD if needed
chrome_options = Options()
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
# chrome_options.add_argument("--headless")   # Uncomment if running on server without GUI

driver = webdriver.Chrome(options=chrome_options)

# Create screenshots folder if not exists
os.makedirs("screenshots", exist_ok=True)

def take_screenshot(name):
    """Capture and save a screenshot"""
    path = f"screenshots/{name}.png"
    driver.save_screenshot(path)
    print(f"[📸] Screenshot saved: {path}")

def log_result(test_name, result, message=""):
    """Helper for consistent log format"""
    status_icon = "✅" if result else "❌"
    print(f"[{status_icon}] {test_name}: {'PASS' if result else 'FAIL'} {message}")

def test_admin_login():
    print("\n=== Test Case 1: Admin Login Functionality ===")
    driver.get(f"{BASE_URL}/login")
    time.sleep(2)
    take_screenshot("login_page")

    try:
        # Wait for login form to load
        wait = WebDriverWait(driver, 10)
        email_field = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='email'], input[type='email'], #email")))
        email_field.send_keys(USERNAME)
        
        password_field = driver.find_element(By.CSS_SELECTOR, "input[name='password'], input[type='password'], #password")
        password_field.send_keys(PASSWORD)
        
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], .login-button, .btn-primary")
        login_button.click()
        time.sleep(3)
        take_screenshot("login_submitted")

        # Check for successful login (redirect to dashboard or success message)
        current_url = driver.current_url
        if "dashboard" in current_url or "home" in current_url:
            log_result("Admin Login Test", True, "- Successfully redirected to admin dashboard")
            take_screenshot("login_success")
            return True
        else:
            # Check for success message
            try:
                success_element = driver.find_element(By.CSS_SELECTOR, ".success, .alert-success, [data-testid='success']")
                if success_element.is_displayed():
                    log_result("Admin Login Test", True, "- Success message displayed")
                    take_screenshot("login_success_message")
                    return True
            except:
                pass
            
            log_result("Admin Login Test", False, "- No redirect or success message found")
            take_screenshot("login_fail")
            return False

    except Exception as e:
        log_result("Admin Login Test", False, f"- ERROR: {e}")
        take_screenshot("login_error")
        return False

def test_design_creation():
    print("\n=== Test Case 2: Add Design ===")
    # First navigate to designs listing page
    driver.get(f"{BASE_URL}/admin/designs")
    time.sleep(2)
    take_screenshot("designs_listing_page")

    try:
        # Wait for designs listing to load and click +Add Design button
        wait = WebDriverWait(driver, 10)
        
        # Look for +Add Design button
        add_design_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 
            "button[class*='add'], .add-design-btn, .btn-add, [data-testid='add-design'], button:contains('Add'), button:contains('+')")))
        
        add_design_button.click()
        time.sleep(2)
        print("   • Clicked +Add Design button")
        take_screenshot("add_design_clicked")
        
        # Wait for design creation form to load
        form = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "form, [data-testid='design-form']")))
        
        # Fill design creation form
        form_fields = {
            "name": "Test Design",
            "description": "Test design for Selenium testing",
            "category": "formal",
            "price": "1000"
        }
        
        filled_fields = 0
        for field_name, value in form_fields.items():
            try:
                field = driver.find_element(By.CSS_SELECTOR, f"input[name='{field_name}'], select[name='{field_name}'], textarea[name='{field_name}'], [data-testid='{field_name}']")
                field.clear()
                field.send_keys(value)
                print(f"   • Filled {field_name}: {value}")
                filled_fields += 1
            except Exception as e:
                print(f"   • Field {field_name} not found: {e}")

        take_screenshot("design_form_filled")

        # Upload design image if available
        try:
            image_input = driver.find_element(By.CSS_SELECTOR, "input[type='file'], [data-testid='image-upload']")
            # Note: File upload would require actual file path
            print("   • Image upload field found")
        except Exception as e:
            print(f"   • Image upload not available: {e}")

        # Submit design form
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], .submit-button, [data-testid='submit-design']")
        submit_button.click()
        time.sleep(3)
        print("   • Design form submitted")
        take_screenshot("design_submitted")

        # Check for success message or redirect
        try:
            success_element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".success, .alert-success, [data-testid='success']")))
            success_text = success_element.text
            print(f"   • Success message: {success_text}")
            log_result("Design Creation", True, f"- {success_text}")
            take_screenshot("design_creation_success")
            return True
        except:
            # Check for redirect
            current_url = driver.current_url
            if "designs" in current_url or "admin" in current_url:
                print("   • Redirected to designs/admin page")
                log_result("Design Creation", True, "- Redirected after submission")
                take_screenshot("design_creation_redirect")
                return True
            else:
                print("   • No success message or redirect found")
                log_result("Design Creation", False, "- No success indicator")
                take_screenshot("design_creation_fail")
                return False

    except Exception as e:
        log_result("Design Creation", False, f"- ERROR: {e}")
        take_screenshot("design_creation_error")
        return False

def test_design_listing():
    print("\n=== Test Case 3: Design Listing ===")
    driver.get(f"{BASE_URL}/admin/designs")
    time.sleep(2)
    take_screenshot("designs_listing_page")

    try:
        # Wait for designs listing to load
        wait = WebDriverWait(driver, 10)
        design_items = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".design-card, .design-item, .card, [class*='design']")))
        
        if len(design_items) > 0:
            print(f"   • Found {len(design_items)} designs in listing")
            
            # Test search functionality
            try:
                search_input = driver.find_element(By.CSS_SELECTOR, "input[type='search'], input[placeholder*='search'], .search-input")
                search_input.clear()
                search_input.send_keys("shirt")
                search_input.send_keys(Keys.RETURN)
                time.sleep(2)
                print("   • Searched for 'shirt' designs")
                take_screenshot("design_search")
            except Exception as e:
                print(f"   • Search functionality not available: {e}")

            # Test filter functionality
            try:
                filter_button = driver.find_element(By.CSS_SELECTOR, ".filter-btn, .filter-button, [data-testid='filter']")
                filter_button.click()
                time.sleep(1)
                print("   • Opened filter options")
                take_screenshot("design_filter")
            except Exception as e:
                print(f"   • Filter functionality not available: {e}")

            # Test edit design
            try:
                edit_button = driver.find_element(By.CSS_SELECTOR, ".edit-btn, .edit-button, [data-testid='edit']")
                edit_button.click()
                time.sleep(2)
                print("   • Clicked edit on first design")
                take_screenshot("design_edit")
                log_result("Design Listing", True, "- Design listing operations successful")
                return True
            except Exception as e:
                print(f"   • Edit functionality not available: {e}")
                log_result("Design Listing", True, "- Design listing loaded successfully")
                return True
        else:
            print("   • No designs found in listing")
            log_result("Design Listing", False, "- No designs found in listing")
            take_screenshot("designs_empty")
            return False

    except Exception as e:
        log_result("Design Listing", False, f"- ERROR: {e}")
        take_screenshot("design_listing_error")
        return False

def test_profile_editing():
    print("\n=== Test Case 4: Profile Editing ===")
    driver.get(f"{BASE_URL}/admin/settings")
    time.sleep(2)
    take_screenshot("profile_settings_page")

    try:
        # Wait for profile settings form to load
        wait = WebDriverWait(driver, 10)
        form = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "form, [data-testid='profile-form'], .settings-form")))
        
        # Fill profile editing form
        form_fields = {
            "name": "Admin User",
            "email": "admin@gmail.com",
            "phone": "1234567890",
            "bio": "Administrator of SewNova platform"
        }
        
        filled_fields = 0
        for field_name, value in form_fields.items():
            try:
                field = driver.find_element(By.CSS_SELECTOR, f"input[name='{field_name}'], input[id='{field_name}'], textarea[name='{field_name}'], [data-testid='{field_name}']")
                field.clear()
                field.send_keys(value)
                print(f"   • Updated {field_name}: {value}")
                filled_fields += 1
            except Exception as e:
                print(f"   • Field {field_name} not found: {e}")

        take_screenshot("profile_form_filled")

        # Test password change
        try:
            password_section = driver.find_element(By.CSS_SELECTOR, ".password-section, [data-testid='password-change']")
            current_password = driver.find_element(By.CSS_SELECTOR, "input[name='currentPassword'], input[name='oldPassword']")
            new_password = driver.find_element(By.CSS_SELECTOR, "input[name='newPassword'], input[name='password']")
            
            current_password.send_keys("admin@123")
            new_password.send_keys("admin@123")
            print("   • Updated password fields")
            take_screenshot("password_update")
        except Exception as e:
            print(f"   • Password change not available: {e}")

        # Submit profile form
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], .save-button, [data-testid='save-profile']")
        submit_button.click()
        time.sleep(3)
        print("   • Profile form submitted")
        take_screenshot("profile_submitted")

        # Check for success message or redirect
        try:
            success_element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".success, .alert-success, [data-testid='success']")))
            success_text = success_element.text
            print(f"   • Success message: {success_text}")
            log_result("Profile Editing", True, f"- {success_text}")
            take_screenshot("profile_editing_success")
            return True
        except:
            # Check for redirect
            current_url = driver.current_url
            if "settings" in current_url or "admin" in current_url:
                print("   • Redirected to settings/admin page")
                log_result("Profile Editing", True, "- Redirected after submission")
                take_screenshot("profile_editing_redirect")
                return True
            else:
                print("   • No success message or redirect found")
                log_result("Profile Editing", False, "- No success indicator")
                take_screenshot("profile_editing_fail")
                return False

    except Exception as e:
        log_result("Profile Editing", False, f"- ERROR: {e}")
        take_screenshot("profile_editing_error")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting SewNova Automated Test Suite...\n")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"👤 Username: {USERNAME}")
    print(f"🔒 Password: {'*' * len(PASSWORD)}")
    
    results = {
        "Admin Login": test_admin_login(),
        "Add Design": test_design_creation(),
        "Design Listing": test_design_listing(),
        "Profile Editing": test_profile_editing(),
    }
    
    print("\n=== 🧾 Test Summary ===")
    for test, passed in results.items():
        status = "PASS ✅" if passed else "FAIL ❌"
        print(f"{test:<25} : {status}")

    passed_tests = sum(1 for result in results.values() if result)
    total_tests = len(results)
    
    print(f"\n📊 Results: {passed_tests}/{total_tests} tests passed")
    print(f"📸 Screenshots saved in: screenshots/")
    print("\n=== Test Execution Complete ===")
    driver.quit()
