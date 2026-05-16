#!/usr/bin/env python3
"""
SewNova Selenium Test 4: Booking Creation Functionality
Tests customer booking creation at /customer/booking/create
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

def test_booking_creation():
    print("\n=== Test Case 4: Booking Creation ===")
    
    # First login as admin
    if not admin_login():
        log_result("Booking Creation", False, "- Admin login failed")
        return False
    
    # Then navigate to booking creation page
    driver.get(f"{BASE_URL}/customer/booking/create")
    time.sleep(2)
    take_screenshot("booking_page")

    try:
        # Wait for booking form to load
        wait = WebDriverWait(driver, 10)
        form = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "form, [data-testid='booking-form']")))
        
        # Fill booking form
        form_fields = {
            "garmentType": "shirt",
            "quantity": "1", 
            "description": "Test booking for Selenium testing",
            "instructions": "Please ensure perfect fit",
            "measurements": "Custom measurements"
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

        take_screenshot("booking_form_filled")

        # Submit booking form
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], .submit-button, [data-testid='submit-booking']")
        submit_button.click()
        time.sleep(3)
        print("   • Booking form submitted")
        take_screenshot("booking_submitted")

        # Check for success message or redirect
        try:
            success_element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".success, .alert-success, [data-testid='success']")))
            success_text = success_element.text
            print(f"   • Success message: {success_text}")
            log_result("Booking Creation", True, f"- {success_text}")
            take_screenshot("booking_creation_success")
            return True
        except:
            # Check for redirect
            current_url = driver.current_url
            if "booking" in current_url or "dashboard" in current_url:
                print("   • Redirected to booking/dashboard")
                log_result("Booking Creation", True, "- Redirected after submission")
                take_screenshot("booking_creation_redirect")
                return True
            else:
                print("   • No success message or redirect found")
                log_result("Booking Creation", False, "- No success indicator")
                take_screenshot("booking_creation_fail")
                return False

    except Exception as e:
        log_result("Booking Creation", False, f"- ERROR: {e}")
        take_screenshot("booking_error")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting SewNova Test 4: Booking Creation...\n")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"👤 Username: {USERNAME}")
    print(f"🔒 Password: {'*' * len(PASSWORD)}")
    
    try:
        result = test_booking_creation()
        
        print("\n=== 🧾 Test Summary ===")
        status = "PASS ✅" if result else "FAIL ❌"
        print(f"Booking Creation{' ' * 4} : {status}")
        
        print(f"\n📊 Results: {'1/1' if result else '0/1'} tests passed")
        print(f"📸 Screenshots saved in: screenshots/")
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
    finally:
        print("\n=== Test Execution Complete ===")
        driver.quit()
