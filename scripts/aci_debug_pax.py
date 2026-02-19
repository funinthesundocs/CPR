#!/usr/bin/env python3
"""Debug v3: Trace exact element tag/path holding '2 total' text and timing."""
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datetime import datetime, timedelta

TOMORROW = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--no-sandbox")
opts.add_argument("--disable-dev-shm-usage")
opts.add_argument("--disable-gpu")
opts.add_argument("--window-size=1400,900")
opts.add_argument("--disable-blink-features=AutomationControlled")
opts.add_experimental_option("excludeSwitches", ["enable-automation"])
opts.add_experimental_option("useAutomationExtension", False)
opts.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
driver = webdriver.Chrome(options=opts)
driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"})

# Login
driver.get("https://fareharbor.com/alohacircleisland/login")
WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//input[@type='password']")))
driver.find_elements(By.XPATH, "//input")[0].send_keys("nikola")
driver.find_element(By.XPATH, "//input[@type='password']").send_keys("Nikola12345!")
driver.find_element(By.XPATH, "//button[@type='submit']").click()
WebDriverWait(driver, 15).until(lambda d: "login" not in d.current_url)
try:
    WebDriverWait(driver, 5).until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(translate(text(),'CANCEL','cancel'),'cancel')]"))).click()
except: pass

# Navigate to manifest
driver.get(f"https://fareharbor.com/alohacircleisland/dashboard/manifest/date/{TOMORROW}/availabilities/")

# Poll every second for up to 20 seconds — track when 'X total' appears
print("\n=== POLLING EVERY SECOND FOR 'X total' ===")
for i in range(20):
    result = driver.execute_script("""
        return Array.from(document.querySelectorAll('td'))
            .map(el => (el.innerText||'').trim())
            .filter(t => /^\\d+\\s+total$/i.test(t));
    """)
    print(f"  t={i}s: td matches = {result}")
    if result:
        break
    time.sleep(1)

print("\n=== FINAL: ALL ELEMENTS CONTAINING 'total' ===")
hits = driver.execute_script("""
    return Array.from(document.querySelectorAll('*'))
        .filter(el => /^\\d+\\s+total$/i.test((el.innerText||'').trim()))
        .map(el => ({
            tag: el.tagName,
            text: el.innerText.trim(),
            hasChildren: el.children.length,
            classes: el.className.toString().substring(0, 80)
        }));
""")
for h in hits:
    print(h)

driver.quit()
