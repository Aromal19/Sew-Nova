#!/usr/bin/env python3
"""
SewNova Selenium Individual Test Runner
Run a specific test by number (1-4)
"""

import sys
import os

def show_usage():
    print("🚀 SewNova Individual Test Runner")
    print("\nUsage:")
    print("  python run_individual_test.py <test_number>")
    print("\nAvailable tests:")
    print("  1 - Admin Login")
    print("  2 - Add Design") 
    print("  3 - Design Listing")
    print("  4 - Profile Editing")
    print("\nExample:")
    print("  python run_individual_test.py 1")

def run_test(test_number):
    """Run a specific test by number"""
    test_files = {
        "1": ("tests/selenium/test_1_admin_login.py", "Admin Login"),
        "2": ("tests/selenium/test_2_add_to_cart.py", "Add to Cart"),
        "3": ("tests/selenium/test_3_view_profile.py", "View Profile"),
        "4": ("tests/selenium/test_4_edit_profile.py", "Edit Profile")
    }
    
    if test_number not in test_files:
        print(f"❌ Invalid test number: {test_number}")
        show_usage()
        return 1
    
    test_file, test_name = test_files[test_number]
    
    if not os.path.exists(test_file):
        print(f"❌ Test file not found: {test_file}")
        return 1
    
    print(f"🚀 Running {test_name}...")
    print(f"📁 Test file: {test_file}")
    print("\n" + "="*60)
    
    # Run the test
    import subprocess
    try:
        result = subprocess.run([sys.executable, test_file], timeout=120)
        return result.returncode
    except subprocess.TimeoutExpired:
        print(f"❌ {test_name} timed out after 120 seconds")
        return 1
    except Exception as e:
        print(f"❌ Error running {test_name}: {e}")
        return 1

def main():
    if len(sys.argv) != 2:
        show_usage()
        return 1
    
    test_number = sys.argv[1]
    return run_test(test_number)

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
