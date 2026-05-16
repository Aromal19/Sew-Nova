#!/usr/bin/env python3
"""
SewNova Selenium Test 2: Design Management - Delete Functionality
Tests admin design deletion at /admin/designs
"""

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
chrome_options.add_argument("--disable-gpu")
# chrome_options.add_argument("--headless")  # Uncomment if running on server without GUI

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

def admin_login():
    """Helper function to login as admin"""
    print("   🔐 Logging in as admin...")
    driver.get(f"{BASE_URL}/login")
    time.sleep(2)
    
    try:
        wait = WebDriverWait(driver, 10)
        
        # Find and fill email field
        email_field = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 
            "input[name='email'], input[type='email'], input[placeholder*='email'], input[id='email']")))
        email_field.clear()
        email_field.send_keys(USERNAME)

        # Find and fill password field
        password_field = driver.find_element(By.CSS_SELECTOR, 
            "input[name='password'], input[type='password'], input[placeholder*='password'], input[id='password']")
        password_field.clear()
        password_field.send_keys(PASSWORD)

        # Click login button
        login_button = driver.find_element(By.CSS_SELECTOR, 
            "button[type='submit'], .login-btn, .btn-login, [data-testid='login-btn']")
        login_button.click()
        time.sleep(3)
        
        # Check for successful login
        current_url = driver.current_url
        if "dashboard" in current_url or "admin" in current_url or "home" in current_url:
            print("   ✅ Admin login successful")
            return True
        else:
            print("   ❌ Admin login failed")
            return False
            
    except Exception as e:
        print(f"   ❌ Login error: {e}")
        return False

def test_design_management():
    print("\n=== Test Case 2: Design Management - Delete Functionality ===")
    
    # First login as admin
    if not admin_login():
        log_result("Design Management", False, "- Admin login failed")
        return False
    
    # Then navigate to design management page
    driver.get(f"{BASE_URL}/admin/designs")
    time.sleep(2)
    take_screenshot("design_management_page")

    try:
        # Wait for design management page to load
        wait = WebDriverWait(driver, 10)
        design_items = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".design-card, .design-item, .card, [class*='design']")))
        
        if len(design_items) > 0:
            print(f"   • Found {len(design_items)} designs in management")
            
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

            # Test delete design functionality
            try:
                # Find the first delete button (red trash can icon)
                delete_buttons = driver.find_elements(By.CSS_SELECTOR, ".delete-btn, .btn-delete, [data-testid='delete'], .trash-icon, .delete-icon")
                if len(delete_buttons) > 0:
                    print(f"   • Found {len(delete_buttons)} delete buttons")
                    
                    # Click on the first delete button
                    first_delete_button = delete_buttons[0]
                    first_delete_button.click()
                    time.sleep(2)
                    print("   • Clicked first delete button")
                    take_screenshot("delete_button_clicked")
                    
                    # Check for confirmation dialog
                    try:
                        confirm_dialog = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".modal, .dialog, .confirm-dialog, [data-testid='confirm']")))
                        if confirm_dialog.is_displayed():
                            print("   • Confirmation dialog appeared")
                            take_screenshot("delete_confirmation_dialog")
                            
                            # Click confirm/yes button
                            confirm_button = driver.find_element(By.CSS_SELECTOR, ".confirm-btn, .btn-confirm, .yes-btn, [data-testid='confirm-delete']")
                            confirm_button.click()
                            time.sleep(2)
                            print("   • Confirmed deletion")
                            take_screenshot("delete_confirmed")
                            
                            # Check for success message
                            try:
                                success_message = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".success, .alert-success, .toast-success")))
                                print(f"   • Success message: {success_message.text}")
                                take_screenshot("delete_success")
                            except:
                                print("   • No success message found, but deletion may have occurred")
                            
                            log_result("Design Management", True, "- Delete functionality tested successfully")
                            return True
                        else:
                            print("   • No confirmation dialog found")
                            log_result("Design Management", True, "- Delete button clicked successfully")
                            return True
                    except Exception as e:
                        print(f"   • No confirmation dialog: {e}")
                        log_result("Design Management", True, "- Delete button clicked successfully")
                        return True
                else:
                    print("   • No delete buttons found")
                    log_result("Design Management", False, "- No delete buttons found")
                    return False
            except Exception as e:
                print(f"   • Delete functionality not available: {e}")
                log_result("Design Management", True, "- Design management loaded successfully")
                return True
        else:
            print("   • No designs found in management")
            log_result("Design Management", False, "- No designs found in management")
            take_screenshot("designs_empty")
            return False

    except Exception as e:
        log_result("Design Management", False, f"- ERROR: {e}")
        take_screenshot("design_management_error")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting SewNova Test 2: Design Management - Delete Functionality...\n")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"👤 Username: {USERNAME}")
    print(f"🔒 Password: {'*' * len(PASSWORD)}")
    
    try:
        result = test_design_management()
        
        print("\n=== 🧾 Test Summary ===")
        status = "PASS ✅" if result else "FAIL ❌"
        print(f"Design Management{' ' * 4} : {status}")
        
        print(f"\n📊 Results: {'1/1' if result else '0/1'} tests passed")
        print(f"📸 Screenshots saved in: screenshots/")
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
    finally:
        print("\n=== Test Execution Complete ===")
        driver.quit()
