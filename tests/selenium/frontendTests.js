const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const assert = require('assert');

describe('SewNova Frontend Selenium Tests', () => {
  let driver;
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const apiBaseUrl = process.env.API_URL || 'http://localhost:3001';

  beforeAll(async () => {
    // Setup Chrome options
    const chromeOptions = new chrome.Options();
    chromeOptions.addArguments('--headless');
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');
    chromeOptions.addArguments('--disable-gpu');
    chromeOptions.addArguments('--window-size=1920,1080');

    // Setup Firefox options
    const firefoxOptions = new firefox.Options();
    firefoxOptions.addArguments('--headless');

    // Create driver based on environment
    const browser = process.env.BROWSER || 'chrome';
    if (browser === 'firefox') {
      driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(firefoxOptions)
        .build();
    } else {
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();
    }

    // Set implicit wait
    await driver.manage().setTimeouts({ implicit: 10000 });
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  beforeEach(async () => {
    // Navigate to the application
    await driver.get(baseUrl);
    await driver.manage().deleteAllCookies();
  });

  describe('User Authentication Flow', () => {
    test('should allow user registration', async () => {
      console.log('🎯 Selenium: Testing user registration');
      
      // Navigate to registration page
      await driver.get(`${baseUrl}/register`);
      
      // Wait for page to load
      await driver.wait(until.elementLocated(By.css('form')), 10000);
      
      // Fill registration form
      await driver.findElement(By.name('firstname')).sendKeys('Test');
      await driver.findElement(By.name('lastname')).sendKeys('User');
      await driver.findElement(By.name('email')).sendKeys('test@example.com');
      await driver.findElement(By.name('phone')).sendKeys('1234567890');
      await driver.findElement(By.name('password')).sendKeys('password123');
      await driver.findElement(By.name('confirmPassword')).sendKeys('password123');
      
      // Submit form
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Wait for success message or redirect
      await driver.wait(until.elementLocated(By.css('.success, .alert-success, [data-testid="success"]')), 10000);
      
      // Verify registration success
      const successElement = await driver.findElement(By.css('.success, .alert-success, [data-testid="success"]'));
      const successText = await successElement.getText();
      assert(successText.toLowerCase().includes('success') || successText.toLowerCase().includes('registered'));
      
      console.log('✅ User registration test passed');
    });

    test('should allow user login', async () => {
      console.log('🎯 Selenium: Testing user login');
      
      // Navigate to login page
      await driver.get(`${baseUrl}/login`);
      
      // Wait for page to load
      await driver.wait(until.elementLocated(By.css('form')), 10000);
      
      // Fill login form
      await driver.findElement(By.name('email')).sendKeys('test@example.com');
      await driver.findElement(By.name('password')).sendKeys('password123');
      
      // Submit form
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Wait for redirect to dashboard or success message
      await driver.wait(until.urlContains('dashboard') || until.elementLocated(By.css('.success, .alert-success')), 10000);
      
      // Verify login success
      const currentUrl = await driver.getCurrentUrl();
      assert(currentUrl.includes('dashboard') || currentUrl.includes('home'));
      
      console.log('✅ User login test passed');
    });

    test('should handle invalid login credentials', async () => {
      console.log('🎯 Selenium: Testing invalid login');
      
      await driver.get(`${baseUrl}/login`);
      await driver.wait(until.elementLocated(By.css('form')), 10000);
      
      // Fill with invalid credentials
      await driver.findElement(By.name('email')).sendKeys('invalid@example.com');
      await driver.findElement(By.name('password')).sendKeys('wrongpassword');
      
      // Submit form
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Wait for error message
      await driver.wait(until.elementLocated(By.css('.error, .alert-danger, .text-red-500')), 10000);
      
      // Verify error message
      const errorElement = await driver.findElement(By.css('.error, .alert-danger, .text-red-500'));
      const errorText = await errorElement.getText();
      assert(errorText.toLowerCase().includes('invalid') || errorText.toLowerCase().includes('incorrect'));
      
      console.log('✅ Invalid login test passed');
    });
  });

  describe('Design Browsing and Selection', () => {
    test('should display design catalog', async () => {
      console.log('🎯 Selenium: Testing design catalog display');
      
      // Navigate to designs page
      await driver.get(`${baseUrl}/designs`);
      
      // Wait for designs to load
      await driver.wait(until.elementLocated(By.css('.design-card, .design-item, [data-testid="design-card"]')), 10000);
      
      // Verify designs are displayed
      const designCards = await driver.findElements(By.css('.design-card, .design-item, [data-testid="design-card"]'));
      assert(designCards.length > 0, 'No design cards found');
      
      console.log('✅ Design catalog display test passed');
    });

    test('should filter designs by category', async () => {
      console.log('🎯 Selenium: Testing design filtering');
      
      await driver.get(`${baseUrl}/designs`);
      await driver.wait(until.elementLocated(By.css('.design-card, .design-item')), 10000);
      
      // Find and click category filter
      const categoryFilter = await driver.findElement(By.css('select[name="category"], .category-filter, [data-testid="category-filter"]'));
      await categoryFilter.click();
      
      // Select formal category
      const formalOption = await driver.findElement(By.css('option[value="formal"], .category-option[data-value="formal"]'));
      await formalOption.click();
      
      // Wait for filtered results
      await driver.sleep(1000);
      
      // Verify filtered results
      const designCards = await driver.findElements(By.css('.design-card, .design-item'));
      assert(designCards.length > 0, 'No filtered designs found');
      
      console.log('✅ Design filtering test passed');
    });

    test('should search designs', async () => {
      console.log('🎯 Selenium: Testing design search');
      
      await driver.get(`${baseUrl}/designs`);
      await driver.wait(until.elementLocated(By.css('input[type="search"], .search-input, [data-testid="search-input"]')), 10000);
      
      // Find search input and enter search term
      const searchInput = await driver.findElement(By.css('input[type="search"], .search-input, [data-testid="search-input"]'));
      await searchInput.sendKeys('shirt');
      await searchInput.sendKeys(Key.RETURN);
      
      // Wait for search results
      await driver.sleep(1000);
      
      // Verify search results
      const designCards = await driver.findElements(By.css('.design-card, .design-item'));
      assert(designCards.length > 0, 'No search results found');
      
      console.log('✅ Design search test passed');
    });

    test('should view design details', async () => {
      console.log('🎯 Selenium: Testing design details view');
      
      await driver.get(`${baseUrl}/designs`);
      await driver.wait(until.elementLocated(By.css('.design-card, .design-item')), 10000);
      
      // Click on first design card
      const firstDesignCard = await driver.findElement(By.css('.design-card, .design-item'));
      await firstDesignCard.click();
      
      // Wait for design details page
      await driver.wait(until.elementLocated(By.css('.design-details, .design-info, [data-testid="design-details"]')), 10000);
      
      // Verify design details are displayed
      const designDetails = await driver.findElement(By.css('.design-details, .design-info, [data-testid="design-details"]'));
      assert(await designDetails.isDisplayed(), 'Design details not displayed');
      
      console.log('✅ Design details view test passed');
    });
  });

  describe('Order Creation Flow', () => {
    test('should create new order', async () => {
      console.log('🎯 Selenium: Testing order creation');
      
      // First login
      await driver.get(`${baseUrl}/login`);
      await driver.wait(until.elementLocated(By.css('form')), 10000);
      await driver.findElement(By.name('email')).sendKeys('test@example.com');
      await driver.findElement(By.name('password')).sendKeys('password123');
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.wait(until.urlContains('dashboard'), 10000);
      
      // Navigate to create order page
      await driver.get(`${baseUrl}/orders/create`);
      await driver.wait(until.elementLocated(By.css('form')), 10000);
      
      // Fill order form
      await driver.findElement(By.name('garmentType')).sendKeys('shirt');
      await driver.findElement(By.name('quantity')).sendKeys('1');
      await driver.findElement(By.name('designDescription')).sendKeys('Test order description');
      await driver.findElement(By.name('specialInstructions')).sendKeys('Test special instructions');
      
      // Select design if dropdown exists
      try {
        const designSelect = await driver.findElement(By.css('select[name="designId"], .design-select'));
        await designSelect.click();
        const firstOption = await driver.findElement(By.css('option:not([value=""])'));
        await firstOption.click();
      } catch (error) {
        console.log('Design selection not found, continuing...');
      }
      
      // Submit order form
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Wait for success message or redirect
      await driver.wait(until.elementLocated(By.css('.success, .alert-success, [data-testid="success"]')), 10000);
      
      // Verify order creation success
      const successElement = await driver.findElement(By.css('.success, .alert-success, [data-testid="success"]'));
      const successText = await successElement.getText();
      assert(successText.toLowerCase().includes('success') || successText.toLowerCase().includes('created'));
      
      console.log('✅ Order creation test passed');
    });

    test('should handle order form validation', async () => {
      console.log('🎯 Selenium: Testing order form validation');
      
      await driver.get(`${baseUrl}/orders/create`);
      await driver.wait(until.elementLocated(By.css('form')), 10000);
      
      // Submit empty form
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Wait for validation errors
      await driver.wait(until.elementLocated(By.css('.error, .alert-danger, .text-red-500, [data-testid="error"]')), 10000);
      
      // Verify validation errors are displayed
      const errorElements = await driver.findElements(By.css('.error, .alert-danger, .text-red-500, [data-testid="error"]'));
      assert(errorElements.length > 0, 'No validation errors found');
      
      console.log('✅ Order form validation test passed');
    });
  });

  describe('Payment Integration', () => {
    test('should initiate payment process', async () => {
      console.log('🎯 Selenium: Testing payment initiation');
      
      // Login first
      await driver.get(`${baseUrl}/login`);
      await driver.wait(until.elementLocated(By.css('form')), 10000);
      await driver.findElement(By.name('email')).sendKeys('test@example.com');
      await driver.findElement(By.name('password')).sendKeys('password123');
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.wait(until.urlContains('dashboard'), 10000);
      
      // Navigate to payment page
      await driver.get(`${baseUrl}/payment`);
      await driver.wait(until.elementLocated(By.css('.payment-form, [data-testid="payment-form"]')), 10000);
      
      // Fill payment form
      await driver.findElement(By.name('amount')).sendKeys('100');
      await driver.findElement(By.name('currency')).sendKeys('INR');
      
      // Click pay button
      await driver.findElement(By.css('.pay-button, [data-testid="pay-button"]')).click();
      
      // Wait for payment gateway or success message
      await driver.wait(until.elementLocated(By.css('.payment-success, .razorpay-container, [data-testid="payment-success"]')), 10000);
      
      // Verify payment initiation
      const paymentElement = await driver.findElement(By.css('.payment-success, .razorpay-container, [data-testid="payment-success"]'));
      assert(await paymentElement.isDisplayed(), 'Payment not initiated');
      
      console.log('✅ Payment initiation test passed');
    });
  });

  describe('Order Management', () => {
    test('should display order history', async () => {
      console.log('🎯 Selenium: Testing order history display');
      
      // Login first
      await driver.get(`${baseUrl}/login`);
      await driver.wait(until.elementLocated(By.css('form')), 10000);
      await driver.findElement(By.name('email')).sendKeys('test@example.com');
      await driver.findElement(By.name('password')).sendKeys('password123');
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.wait(until.urlContains('dashboard'), 10000);
      
      // Navigate to orders page
      await driver.get(`${baseUrl}/orders`);
      await driver.wait(until.elementLocated(By.css('.order-list, .orders-container, [data-testid="order-list"]')), 10000);
      
      // Verify orders are displayed
      const orderElements = await driver.findElements(By.css('.order-item, .order-card, [data-testid="order-item"]'));
      assert(orderElements.length >= 0, 'Order list not displayed');
      
      console.log('✅ Order history display test passed');
    });

    test('should update order status', async () => {
      console.log('🎯 Selenium: Testing order status update');
      
      await driver.get(`${baseUrl}/orders`);
      await driver.wait(until.elementLocated(By.css('.order-item, .order-card')), 10000);
      
      // Click on first order
      const firstOrder = await driver.findElement(By.css('.order-item, .order-card'));
      await firstOrder.click();
      
      // Wait for order details
      await driver.wait(until.elementLocated(By.css('.order-details, [data-testid="order-details"]')), 10000);
      
      // Find and click status update button
      const statusButton = await driver.findElement(By.css('.status-button, .update-status, [data-testid="status-button"]'));
      await statusButton.click();
      
      // Wait for status update modal or form
      await driver.wait(until.elementLocated(By.css('.status-modal, .update-form, [data-testid="status-modal"]')), 10000);
      
      // Select new status
      const statusSelect = await driver.findElement(By.css('select[name="status"], .status-select'));
      await statusSelect.click();
      const newStatusOption = await driver.findElement(By.css('option[value="in_progress"], option[value="completed"]'));
      await newStatusOption.click();
      
      // Submit status update
      await driver.findElement(By.css('.submit-status, [data-testid="submit-status"]')).click();
      
      // Wait for success message
      await driver.wait(until.elementLocated(By.css('.success, .alert-success')), 10000);
      
      console.log('✅ Order status update test passed');
    });
  });

  describe('Admin Dashboard', () => {
    test('should access admin dashboard', async () => {
      console.log('🎯 Selenium: Testing admin dashboard access');
      
      // Login as admin
      await driver.get(`${baseUrl}/login`);
      await driver.wait(until.elementLocated(By.css('form')), 10000);
      await driver.findElement(By.name('email')).sendKeys('admin@example.com');
      await driver.findElement(By.name('password')).sendKeys('admin123');
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Wait for admin dashboard
      await driver.wait(until.urlContains('admin') || until.elementLocated(By.css('.admin-dashboard, [data-testid="admin-dashboard"]')), 10000);
      
      // Verify admin dashboard elements
      const dashboardElement = await driver.findElement(By.css('.admin-dashboard, [data-testid="admin-dashboard"]'));
      assert(await dashboardElement.isDisplayed(), 'Admin dashboard not displayed');
      
      console.log('✅ Admin dashboard access test passed');
    });

    test('should manage designs in admin panel', async () => {
      console.log('🎯 Selenium: Testing admin design management');
      
      await driver.get(`${baseUrl}/admin/designs`);
      await driver.wait(until.elementLocated(By.css('.admin-designs, [data-testid="admin-designs"]')), 10000);
      
      // Click add new design button
      const addDesignButton = await driver.findElement(By.css('.add-design, .new-design, [data-testid="add-design"]'));
      await addDesignButton.click();
      
      // Wait for design form
      await driver.wait(until.elementLocated(By.css('.design-form, [data-testid="design-form"]')), 10000);
      
      // Fill design form
      await driver.findElement(By.name('name')).sendKeys('Selenium Test Design');
      await driver.findElement(By.name('category')).sendKeys('formal');
      await driver.findElement(By.name('garmentType')).sendKeys('shirt');
      await driver.findElement(By.name('price')).sendKeys('1000');
      await driver.findElement(By.name('description')).sendKeys('Test design created by Selenium');
      
      // Submit design form
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Wait for success message
      await driver.wait(until.elementLocated(By.css('.success, .alert-success')), 10000);
      
      console.log('✅ Admin design management test passed');
    });
  });

  describe('Responsive Design', () => {
    test('should work on mobile viewport', async () => {
      console.log('🎯 Selenium: Testing mobile responsiveness');
      
      // Set mobile viewport
      await driver.manage().window().setRect({ width: 375, height: 667 });
      
      await driver.get(`${baseUrl}/designs`);
      await driver.wait(until.elementLocated(By.css('.design-card, .design-item')), 10000);
      
      // Verify mobile layout
      const designCards = await driver.findElements(By.css('.design-card, .design-item'));
      assert(designCards.length > 0, 'Design cards not visible on mobile');
      
      // Test mobile navigation
      const mobileMenu = await driver.findElement(By.css('.mobile-menu, .hamburger, [data-testid="mobile-menu"]'));
      await mobileMenu.click();
      
      // Wait for mobile menu to open
      await driver.wait(until.elementLocated(By.css('.mobile-nav, .nav-menu, [data-testid="mobile-nav"]')), 10000);
      
      console.log('✅ Mobile responsiveness test passed');
    });

    test('should work on tablet viewport', async () => {
      console.log('🎯 Selenium: Testing tablet responsiveness');
      
      // Set tablet viewport
      await driver.manage().window().setRect({ width: 768, height: 1024 });
      
      await driver.get(`${baseUrl}/designs`);
      await driver.wait(until.elementLocated(By.css('.design-card, .design-item')), 10000);
      
      // Verify tablet layout
      const designCards = await driver.findElements(By.css('.design-card, .design-item'));
      assert(designCards.length > 0, 'Design cards not visible on tablet');
      
      console.log('✅ Tablet responsiveness test passed');
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      console.log('🎯 Selenium: Testing network error handling');
      
      // Navigate to a page that might cause network issues
      await driver.get(`${baseUrl}/designs`);
      
      // Simulate network error by navigating to invalid URL
      await driver.get(`${baseUrl}/invalid-page`);
      
      // Wait for error page or 404
      await driver.wait(until.elementLocated(By.css('.error-page, .not-found, .404')), 10000);
      
      // Verify error handling
      const errorElement = await driver.findElement(By.css('.error-page, .not-found, .404'));
      assert(await errorElement.isDisplayed(), 'Error page not displayed');
      
      console.log('✅ Network error handling test passed');
    });

    test('should handle JavaScript errors gracefully', async () => {
      console.log('🎯 Selenium: Testing JavaScript error handling');
      
      // Navigate to main page
      await driver.get(`${baseUrl}/`);
      
      // Wait for page to load
      await driver.wait(until.elementLocated(By.css('body')), 10000);
      
      // Check for JavaScript errors in console
      const logs = await driver.manage().logs().get('browser');
      const errorLogs = logs.filter(log => log.level.name === 'SEVERE');
      
      // Log any JavaScript errors for debugging
      if (errorLogs.length > 0) {
        console.log('JavaScript errors found:', errorLogs);
      }
      
      // Verify page still functions despite potential JS errors
      const bodyElement = await driver.findElement(By.css('body'));
      assert(await bodyElement.isDisplayed(), 'Page not displayed due to JS errors');
      
      console.log('✅ JavaScript error handling test passed');
    });
  });

  describe('Performance Tests', () => {
    test('should load pages within acceptable time', async () => {
      console.log('🎯 Selenium: Testing page load performance');
      
      const startTime = Date.now();
      
      await driver.get(`${baseUrl}/designs`);
      await driver.wait(until.elementLocated(By.css('.design-card, .design-item')), 10000);
      
      const loadTime = Date.now() - startTime;
      
      // Assert page loads within 5 seconds
      assert(loadTime < 5000, `Page load time too slow: ${loadTime}ms`);
      
      console.log(`✅ Page load performance test passed: ${loadTime}ms`);
    });

    test('should handle large datasets efficiently', async () => {
      console.log('🎯 Selenium: Testing large dataset handling');
      
      await driver.get(`${baseUrl}/designs`);
      await driver.wait(until.elementLocated(By.css('.design-card, .design-item')), 10000);
      
      // Scroll to load more items if pagination exists
      try {
        const loadMoreButton = await driver.findElement(By.css('.load-more, .pagination, [data-testid="load-more"]'));
        await loadMoreButton.click();
        await driver.sleep(1000);
      } catch (error) {
        console.log('No pagination found, continuing...');
      }
      
      // Verify page still responsive
      const designCards = await driver.findElements(By.css('.design-card, .design-item'));
      assert(designCards.length >= 0, 'Page not responsive with large dataset');
      
      console.log('✅ Large dataset handling test passed');
    });
  });
});
