from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os

# ====== CONFIGURATION ======
BASE_URL = "http://localhost:5173/login"  # change to your Vercel URL if hosted
ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "admin@123"
IMAGE_PATH = r"D:\SewNova\Tests\screenshots\sample.png"  # <-- your screenshot path

# ====== SELENIUM SETUP ======
options = Options()
options.add_argument("--start-maximized")
driver = webdriver.Chrome(options=options)

print("🚀 Starting SewNova Test 2: Design Upload...")

try:
    # === 1️⃣ Open Admin Login Page ===
    driver.get(BASE_URL)
    print("🌐 Opening SewNova Frontend...")

    # Wait for page to load and login button to appear
    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
    )

    # === 2️⃣ Enter Login Details ===
    print("🔐 Logging in as admin...")
    driver.find_element(By.XPATH, "//input[@type='email']").send_keys(ADMIN_EMAIL)
    driver.find_element(By.XPATH, "//input[@type='password']").send_keys(ADMIN_PASSWORD)
    driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]").click()

    # Wait for redirect
    WebDriverWait(driver, 15).until(
        EC.url_contains("/admin")
    )
    print("✅ Login successful!")

    # === 3️⃣ Navigate to Design Management ===
    print("📂 Opening Design Management page...")
    WebDriverWait(driver, 15).until(
        EC.element_to_be_clickable((By.XPATH, "//a[contains(., 'Design Management')]"))
    ).click()

    # Wait for page load
    time.sleep(3)

    # === 4️⃣ Click Add Design ===
    print("➕ Adding new design...")
    add_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Add Design')]"))
    )
    add_button.click()

    # === 5️⃣ Fill Design Form ===
    print("📝 Filling form details...")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Design Name']"))
    )

    driver.find_element(By.XPATH, "//input[@placeholder='Design Name']").send_keys("Test Design - Screenshot Upload")
    driver.find_element(By.XPATH, "//textarea[@placeholder='Description']").send_keys("Automated test upload using screenshot image.")
    driver.find_element(By.XPATH, "//input[@placeholder='Price']").send_keys("499")

    # Upload image
    print("🖼️ Uploading image...")
    image_input = driver.find_element(By.XPATH, "//input[@type='file']")
    image_input.send_keys(IMAGE_PATH)

    time.sleep(2)

    # === 6️⃣ Submit Design ===
    driver.find_element(By.XPATH, "//button[contains(., 'Submit')]").click()
    print("📤 Submitting design...")

    # Wait for confirmation
    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Design added successfully')]"))
    )

    print("✅ Design uploaded successfully!")

except Exception as e:
    print("❌ Test Failed:", e)

finally:
    time.sleep(3)
    driver.quit()
    print("🧹 Test completed. Browser closed.")
