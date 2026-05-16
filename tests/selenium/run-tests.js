const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Selenium Test Runner
 * This script runs Selenium tests with proper configuration
 */

async function runSeleniumTests() {
  console.log('🚀 Starting Selenium test execution...');

  try {
    // Load configuration
    const configPath = path.join(__dirname, 'selenium.config.json');
    let config = {};
    
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    // Set environment variables
    process.env.FRONTEND_URL = config.baseUrl || 'http://localhost:3000';
    process.env.API_URL = config.apiUrl || 'http://localhost:3001';
    process.env.BROWSER = config.browser || 'chrome';
    process.env.HEADLESS = config.headless !== false ? 'true' : 'false';

    console.log('📋 Test Configuration:');
    console.log(`  Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`  API URL: ${process.env.API_URL}`);
    console.log(`  Browser: ${process.env.BROWSER}`);
    console.log(`  Headless: ${process.env.HEADLESS}`);

    // Run Selenium tests
    console.log('🧪 Running Selenium tests...');
    
    const testCommand = `npx jest tests/selenium/frontendTests.js --verbose --detectOpenHandles --forceExit`;
    
    execSync(testCommand, {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });

    console.log('✅ Selenium tests completed successfully!');

  } catch (error) {
    console.error('❌ Selenium test execution failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runSeleniumTests();
}

module.exports = { runSeleniumTests };
