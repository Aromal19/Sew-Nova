#!/usr/bin/env python3
"""
SewNova Selenium Test Runner - All Tests
Runs all 4 individual test files
"""

import subprocess
import sys
import os
import time

def run_test(test_file, test_name):
    """Run a single test file and return the result"""
    print(f"\n{'='*60}")
    print(f"🚀 Running {test_name}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run([sys.executable, test_file], 
                              capture_output=True, text=True, timeout=120)
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
            
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print(f"❌ {test_name} timed out after 120 seconds")
        return False
    except Exception as e:
        print(f"❌ Error running {test_name}: {e}")
        return False

def main():
    print("\n🚀 Starting SewNova Complete Test Suite...\n")
    print("🌐 Base URL: http://localhost:5173")
    print("👤 Username: admin@gmail.com")
    print("🔒 Password: admin@123")
    print("\n📝 Note: Make sure your SewNova frontend is running on localhost:5173")
    
    # Define all tests
    tests = [
        ("tests/selenium/test_1_admin_login.py", "Test 1: Admin Login"),
        ("tests/selenium/test_2_add_to_cart.py", "Test 2: Add to Cart"),
        ("tests/selenium/test_3_view_profile.py", "Test 3: View Profile"),
        ("tests/selenium/test_4_edit_profile.py", "Test 4: Edit Profile")
    ]
    
    results = {}
    total_tests = len(tests)
    passed_tests = 0
    
    # Run each test
    for test_file, test_name in tests:
        if os.path.exists(test_file):
            success = run_test(test_file, test_name)
            results[test_name] = success
            if success:
                passed_tests += 1
        else:
            print(f"❌ Test file not found: {test_file}")
            results[test_name] = False
    
    # Print final summary
    print(f"\n{'='*60}")
    print("🧾 FINAL TEST SUMMARY")
    print(f"{'='*60}")
    
    for test_name, passed in results.items():
        status = "PASS ✅" if passed else "FAIL ❌"
        print(f"{test_name:<30} : {status}")
    
    print(f"\n📊 Overall Results: {passed_tests}/{total_tests} tests passed")
    print(f"📸 Screenshots saved in: screenshots/")
    
    if passed_tests == total_tests:
        print("\n🎉 All tests passed! SewNova admin functionality is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed. Please check the logs above.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
