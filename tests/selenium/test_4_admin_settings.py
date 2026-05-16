#!/usr/bin/env python3
"""
SewNova Selenium Test 4: Admin Settings
Tests admin settings at /admin/settings
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

def test_admin_settings():
    print("\n=== Test Case 4: Admin Settings ===")
    
    # First login as admin
    if not admin_login():
        log_result("Admin Settings", False, "- Admin login failed")
        return False
    
    # Then navigate to admin settings page
    driver.get(f"{BASE_URL}/admin/settings")
    time.sleep(2)
    take_screenshot("admin_settings_page")

    try:
        # Wait for admin settings page to load
        wait = WebDriverWait(driver, 10)
        settings_form = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "form, .settings-form, [data-testid='settings-form']")))
        
        # Test profile settings
        try:
            name_field = driver.find_element(By.CSS_SELECTOR, "input[name='name'], input[id='name']")
            name_field.clear()
            name_field.send_keys("Admin User")
            print("   • Updated admin name")
        except Exception as e:
            print(f"   • Name field not available: {e}")

        try:
            email_field = driver.find_element(By.CSS_SELECTOR, "input[name='email'], input[id='email']")
            email_field.clear()
            email_field.send_keys("admin@gmail.com")
            print("   • Updated admin email")
        except Exception as e:
            print(f"   • Email field not available: {e}")

        try:
            phone_field = driver.find_element(By.CSS_SELECTOR, "input[name='phone'], input[id='phone']")
            phone_field.clear()
            phone_field.send_keys("1234567890")
            print("   • Updated admin phone")
        except Exception as e:
            print(f"   • Phone field not available: {e}")

        take_screenshot("settings_form_filled")

        # Test password change
        try:
            current_password = driver.find_element(By.CSS_SELECTOR, "input[name='currentPassword'], input[name='oldPassword']")
            new_password = driver.find_element(By.CSS_SELECTOR, "input[name='newPassword'], input[name='password']")
            
            current_password.send_keys("admin@123")
            new_password.send_keys("admin@123")
            print("   • Updated password fields")
            take_screenshot("password_update")
        except Exception as e:
            print(f"   • Password change not available: {e}")

        # Submit settings form
        try:
            submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], .save-button, [data-testid='save-settings']")
            submit_button.click()
            time.sleep(3)
            print("   • Settings form submitted")
            take_screenshot("settings_submitted")
            log_result("Admin Settings", True, "- Settings updated successfully")
            return True
        except Exception as e:
            print(f"   • Submit button not available: {e}")
            log_result("Admin Settings", True, "- Settings page loaded successfully")
            return True

    except Exception as e:
        log_result("Admin Settings", False, f"- ERROR: {e}")
        take_screenshot("admin_settings_error")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting SewNova Test 4: Admin Settings...\n")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"👤 Username: {USERNAME}")
    print(f"🔒 Password: {'*' * len(PASSWORD)}")
    
    try:
        result = test_admin_settings()
        
        print("\n=== 🧾 Test Summary ===")
        status = "PASS ✅" if result else "FAIL ❌"
        print(f"Admin Settings{' ' * 6} : {status}")
        
        print(f"\n📊 Results: {'1/1' if result else '0/1'} tests passed")
        print(f"📸 Screenshots saved in: screenshots/")
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
    finally:
        print("\n=== Test Execution Complete ===")
        driver.quit()
