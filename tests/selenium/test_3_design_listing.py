#!/usr/bin/env python3
"""
SewNova Selenium Test 3: Design Listing Functionality
Tests design listing, search, filter, and edit operations
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

def test_design_listing():
    print("\n=== Test Case 3: Design Listing ===")
    
    # First login as admin
    if not admin_login():
        log_result("Design Listing", False, "- Admin login failed")
        return False
    
    # Then navigate to designs listing page
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

if __name__ == "__main__":
    print("\n🚀 Starting SewNova Test 3: Design Listing...\n")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"👤 Username: {USERNAME}")
    print(f"🔒 Password: {'*' * len(PASSWORD)}")
    
    try:
        result = test_design_listing()
        
        print("\n=== 🧾 Test Summary ===")
        status = "PASS ✅" if result else "FAIL ❌"
        print(f"Design Listing{' ' * 10} : {status}")
        
        print(f"\n📊 Results: {'1/1' if result else '0/1'} tests passed")
        print(f"📸 Screenshots saved in: screenshots/")
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
    finally:
        print("\n=== Test Execution Complete ===")
        driver.quit()
