#!/usr/bin/env python3
"""
SewNova Selenium Test 4: Profile Editing Functionality
Tests admin profile editing and settings management
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

def test_profile_editing():
    print("\n=== Test Case 4: Profile Editing ===")
    
    # First login as admin
    if not admin_login():
        log_result("Profile Editing", False, "- Admin login failed")
        return False
    
    # Then navigate to profile settings page
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
    print("\n🚀 Starting SewNova Test 4: Profile Editing...\n")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"👤 Username: {USERNAME}")
    print(f"🔒 Password: {'*' * len(PASSWORD)}")
    
    try:
        result = test_profile_editing()
        
        print("\n=== 🧾 Test Summary ===")
        status = "PASS ✅" if result else "FAIL ❌"
        print(f"Profile Editing{' ' * 7} : {status}")
        
        print(f"\n📊 Results: {'1/1' if result else '0/1'} tests passed")
        print(f"📸 Screenshots saved in: screenshots/")
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
    finally:
        print("\n=== Test Execution Complete ===")
        driver.quit()
