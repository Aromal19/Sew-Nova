const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs');
const path = require('path');

/**
 * Selenium Test Setup Script
 * This script sets up the testing environment for Selenium tests
 */

async function setupSeleniumEnvironment() {
  console.log('🚀 Setting up Selenium testing environment...');

  try {
    // Check if Chrome is available
    const chromeOptions = new chrome.Options();
    chromeOptions.addArguments('--headless');
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');
    chromeOptions.addArguments('--disable-gpu');
    chromeOptions.addArguments('--window-size=1920,1080');

    console.log('✅ Chrome options configured');

    // Check if Firefox is available
    const firefoxOptions = new firefox.Options();
    firefoxOptions.addArguments('--headless');

    console.log('✅ Firefox options configured');

    // Test Chrome driver
    try {
      const chromeDriver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();
      
      await chromeDriver.get('https://www.google.com');
      await chromeDriver.quit();
      console.log('✅ Chrome driver test successful');
    } catch (error) {
      console.log('⚠️ Chrome driver test failed:', error.message);
    }

    // Test Firefox driver
    try {
      const firefoxDriver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(firefoxOptions)
        .build();
      
      await firefoxDriver.get('https://www.google.com');
      await firefoxDriver.quit();
      console.log('✅ Firefox driver test successful');
    } catch (error) {
      console.log('⚠️ Firefox driver test failed:', error.message);
    }

    // Create test configuration file
    const testConfig = {
      baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      apiUrl: process.env.API_URL || 'http://localhost:3001',
      browser: process.env.BROWSER || 'chrome',
      headless: process.env.HEADLESS !== 'false',
      timeout: 10000,
      screenshotPath: './test-screenshots',
      reportPath: './test-reports'
    };

    // Create directories
    fs.mkdirSync(testConfig.screenshotPath, { recursive: true });
    fs.mkdirSync(testConfig.reportPath, { recursive: true });

    // Write configuration file
    fs.writeFileSync(
      path.join(__dirname, 'selenium.config.json'),
      JSON.stringify(testConfig, null, 2)
    );

    console.log('✅ Selenium configuration created');
    console.log('✅ Test directories created');
    console.log('🎉 Selenium environment setup complete!');

  } catch (error) {
    console.error('❌ Selenium setup failed:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupSeleniumEnvironment();
}

module.exports = { setupSeleniumEnvironment };
