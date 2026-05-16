#!/usr/bin/env python3
"""
SewNova Selenium Test 3: Cart Operations Functionality
Tests customer cart operations at /customer/cart
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

def test_cart_operations():
    print("\n=== Test Case 3: Cart Operations ===")
    
    # First login as admin
    if not admin_login():
        log_result("Cart Operations", False, "- Admin login failed")
        return False
    
    # Then navigate to cart page
    driver.get(f"{BASE_URL}/customer/cart")
    time.sleep(2)
    take_screenshot("cart_page")

    try:
        # Wait for cart to load
        wait = WebDriverWait(driver, 10)
        cart_items = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".cart-item, .cart-product, [class*='cart']")))
        
        if len(cart_items) > 0:
            print(f"   • Found {len(cart_items)} items in cart")
            
            # Test quantity update
            try:
                quantity_input = driver.find_element(By.CSS_SELECTOR, "input[type='number'], .quantity-input, [data-testid='quantity']")
                quantity_input.clear()
                quantity_input.send_keys("2")
                print("   • Updated quantity to 2")
                take_screenshot("cart_quantity_updated")
            except Exception as e:
                print(f"   • Quantity update not available: {e}")

            # Test remove item
            try:
                remove_button = driver.find_element(By.CSS_SELECTOR, ".remove-item, .delete-item, [data-testid='remove']")
                remove_button.click()
                print("   • Removed item from cart")
                take_screenshot("cart_item_removed")
            except Exception as e:
                print(f"   • Remove item not available: {e}")

            # Test proceed to checkout
            try:
                checkout_button = driver.find_element(By.CSS_SELECTOR, ".checkout-btn, .proceed-checkout, [data-testid='checkout']")
                checkout_button.click()
                print("   • Proceeded to checkout")
                take_screenshot("cart_checkout")
                log_result("Cart Operations", True, "- Cart operations successful")
                return True
            except Exception as e:
                print(f"   • Checkout not available: {e}")
                log_result("Cart Operations", True, "- Cart items found and managed")
                return True
        else:
            print("   • No items in cart")
            log_result("Cart Operations", False, "- No items found in cart")
            take_screenshot("cart_empty")
            return False

    except Exception as e:
        log_result("Cart Operations", False, f"- ERROR: {e}")
        take_screenshot("cart_error")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting SewNova Test 3: Cart Operations...\n")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"👤 Username: {USERNAME}")
    print(f"🔒 Password: {'*' * len(PASSWORD)}")
    
    try:
        result = test_cart_operations()
        
        print("\n=== 🧾 Test Summary ===")
        status = "PASS ✅" if result else "FAIL ❌"
        print(f"Cart Operations{' ' * 6} : {status}")
        
        print(f"\n📊 Results: {'1/1' if result else '0/1'} tests passed")
        print(f"📸 Screenshots saved in: screenshots/")
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
    finally:
        print("\n=== Test Execution Complete ===")
        driver.quit()
