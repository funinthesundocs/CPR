#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ACI Daily Manifest Automation - v3
Lean: CDP printToPDF, event-based waits, minimal imports.
"""

import sys
import base64
import requests
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# --- CONFIG ---
FH_USERNAME = "nikola"
FH_PASSWORD = "Nikola12345!"
FH_LOGIN_URL = "https://fareharbor.com/alohacircleisland/login"

TOMORROW = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
TOMORROW_DISPLAY = (datetime.now() + timedelta(days=1)).strftime("%m-%d-%Y")
FH_MANIFEST_URL = f"https://fareharbor.com/alohacircleisland/dashboard/manifest/date/{TOMORROW}/availabilities/"

AGENTMAIL_API_URL = "https://api.agentmail.to/inboxes/visupport@agentmail.to/messages/send"
AGENTMAIL_TOKEN = "am_us_e8dbc7465f1b28cdb6e63866abdf44b4245a8a834b40556aee8de931cbc7e24e"
EMAIL_TO = "funinthesundocs@gmail.com"
EMAIL_CC = "visupport@agentmail.to"
EMAIL_SUBJECT = f"ACI Manifest for {TOMORROW_DISPLAY}"
PDF_FILENAME = f"ACI Manifest for {TOMORROW_DISPLAY}.pdf"

EMAIL_BODY = """{pax}Pax Total

Manifest is attached

Thanks Rocky! Please let me know if you have any questions

Mahalo,
Matt Campbell"""


def make_driver():
    """Chrome with anti-detection flags — required for FareHarbor JS to load."""
    opts = Options()
    opts.add_argument("--headless=new")  # MUST be 'new' — old headless breaks FareHarbor
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1400,900")
    opts.add_argument("--disable-blink-features=AutomationControlled")
    opts.add_experimental_option("excludeSwitches", ["enable-automation"])
    opts.add_experimental_option("useAutomationExtension", False)
    opts.add_argument(
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    )
    driver = webdriver.Chrome(options=opts)
    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {"source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"},
    )
    return driver


def login(driver):
    print("Step 1: Logging in...")
    driver.get(FH_LOGIN_URL)
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, "//input[@type='password']"))
    )
    try:
        user = driver.find_element(By.XPATH, "//input[@name='email']")
    except:
        user = driver.find_elements(By.XPATH, "//input[@type='text']")[0]

    user.clear()
    user.send_keys(FH_USERNAME)
    driver.find_element(By.XPATH, "//input[@type='password']").send_keys(FH_PASSWORD)
    driver.find_element(By.XPATH, "//button[@type='submit']").click()

    # Wait for redirect away from login — no blind sleep
    WebDriverWait(driver, 15).until(lambda d: "login" not in d.current_url)

    # Dismiss 2FA if shown
    try:
        WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(translate(text(),'CANCEL','cancel'),'cancel')]")
            )
        ).click()
        print("  Dismissed 2FA.")
    except:
        pass

    print(f"  Logged in. URL: {driver.current_url}")


def navigate_to_manifest(driver):
    print(f"Step 2: Loading manifest for {TOMORROW}...")
    driver.get(FH_MANIFEST_URL)
    # PAX lives in th.ng-table-header — poll until it appears in the DOM
    try:
        WebDriverWait(driver, 20).until(lambda d: d.execute_script("""
            return Array.from(document.querySelectorAll('th'))
                .some(el => /^\\d+\\s+total$/i.test((el.innerText || '').trim()));
        """))
    except:
        pass  # Valid if no tours tomorrow (empty manifest)
    print(f"  Loaded: {driver.current_url}")


def click_print(driver):
    """Click the Print button to apply FareHarbor's print CSS layout."""
    print("Step 3: Applying print layout...")
    btn = driver.execute_script("""
        var btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.trim() === 'Print') || null;
    """)
    if btn:
        driver.execute_script("arguments[0].click();", btn)
        print("  Print layout applied.")
    else:
        print("  Print button not found — proceeding with default layout.")


def extract_pax(driver):
    """Sum 'X total' th.ng-table-header elements — FareHarbor's confirmed PAX format."""
    print("Step 4: Extracting PAX count...")
    # FareHarbor stores 'X total' in th.ng-table-header (confirmed via DOM debug)
    pax = driver.execute_script("""
        var total = 0;
        Array.from(document.querySelectorAll('th')).forEach(el => {
            var t = (el.innerText || '').trim();
            if (/^\\d+\\s+total$/i.test(t)) total += parseInt(t);
        });
        return total > 0 ? total : null;
    """)
    if pax:
        print(f"  PAX: {pax}")
        return str(pax)
    print("  WARNING: PAX not found.")
    return "?"


def generate_pdf(driver):
    """CDP Page.printToPDF — pixel-perfect, zero OS dialogs."""
    print("Step 5: Generating PDF...")
    pdf_data = driver.execute_cdp_cmd("Page.printToPDF", {
        "printBackground": True,
        "paperWidth": 8.5,
        "paperHeight": 11,
        "marginTop": 0.4,
        "marginBottom": 0.4,
        "marginLeft": 0.4,
        "marginRight": 0.4,
        "displayHeaderFooter": False,
    })
    pdf_bytes = base64.b64decode(pdf_data["data"])
    with open(PDF_FILENAME, "wb") as f:
        f.write(pdf_bytes)
    print(f"  Saved: {PDF_FILENAME} ({len(pdf_bytes):,} bytes)")
    return pdf_bytes


def send_email(pdf_bytes, pax):
    print("Step 6: Sending email...")
    resp = requests.post(
        AGENTMAIL_API_URL,
        json={
            "to": EMAIL_TO,
            "cc": EMAIL_CC,
            "subject": EMAIL_SUBJECT,
            "text": EMAIL_BODY.format(pax=pax),
            "attachments": [{
                "filename": PDF_FILENAME,
                "content": base64.b64encode(pdf_bytes).decode("utf-8"),
                "contentType": "application/pdf",
            }],
        },
        headers={"Authorization": f"Bearer {AGENTMAIL_TOKEN}"},
    )
    if resp.status_code in (200, 201, 202):
        print(f"  SUCCESS: {resp.text}")
    else:
        print(f"  ERROR {resp.status_code}: {resp.text}")
        sys.exit(1)


def main():
    print(f"{'='*50}\nACI Manifest — {TOMORROW_DISPLAY}\n{'='*50}")
    driver = make_driver()
    try:
        login(driver)
        navigate_to_manifest(driver)
        pax = extract_pax(driver)   # Extract PAX before Print transforms the DOM
        click_print(driver)
        pdf_bytes = generate_pdf(driver)
        send_email(pdf_bytes, pax)
        print(f"\nDONE [OK]  {TOMORROW_DISPLAY} | {pax} PAX | Sent to {EMAIL_TO}")
    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
        try:
            driver.save_screenshot("aci_error.png")
        except:
            pass
        sys.exit(1)
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
