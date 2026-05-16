#!/usr/bin/env python3
"""
SewNova Selenium Test 1: Admin Login Functionality
Tests admin login at http://localhost:5173/login
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

def test_admin_login():
    print("\n=== Test Case 1: Admin Login Functionality ===")
    driver.get(f"{BASE_URL}/login")
    time.sleep(2)
    take_screenshot("login_page")

    try:
        # Wait for login form to load
        wait = WebDriverWait(driver, 10)
        
        # Find and fill email field
        email_field = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 
            "input[name='email'], input[type='email'], input[placeholder*='email'], input[id='email']")))
        email_field.clear()
        email_field.send_keys(USERNAME)
        print(f"   • Entered email: {USERNAME}")

        # Find and fill password field
        password_field = driver.find_element(By.CSS_SELECTOR, 
            "input[name='password'], input[type='password'], input[placeholder*='password'], input[id='password']")
        password_field.clear()
        password_field.send_keys(PASSWORD)
        print(f"   • Entered password: {'*' * len(PASSWORD)}")

        # Click login button
        login_button = driver.find_element(By.CSS_SELECTOR, 
            "button[type='submit'], .login-btn, .btn-login, [data-testid='login-btn']")
        login_button.click()
        time.sleep(3)
        print("   • Clicked login button")
        take_screenshot("login_submitted")

        # Check for successful login (redirect to dashboard or success message)
        current_url = driver.current_url
        if "dashboard" in current_url or "admin" in current_url or "home" in current_url:
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

if __name__ == "__main__":
    print("\n🚀 Starting SewNova Test 1: Admin Login...\n")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"👤 Username: {USERNAME}")
    print(f"🔒 Password: {'*' * len(PASSWORD)}")
    
    try:
        result = test_admin_login()
        
        print("\n=== 🧾 Test Summary ===")
        status = "PASS ✅" if result else "FAIL ❌"
        print(f"Admin Login{' ' * 15} : {status}")
        
        print(f"\n📊 Results: {'1/1' if result else '0/1'} tests passed")
        print(f"📸 Screenshots saved in: screenshots/")
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
    finally:
        print("\n=== Test Execution Complete ===")
        driver.quit()
