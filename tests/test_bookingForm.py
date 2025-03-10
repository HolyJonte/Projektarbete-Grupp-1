import os
import time
import platform

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Starta WebDriver
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)

# Identifiera operativsystemet
if platform.system() == "Darwin":  # MacOS
    base_url = "http://127.0.0.1:5501/index.html"
else:  # Windows (och ev. Linux)
    base_url = "http://127.0.0.1:5500/index.html"

# Använd rätt URL i Selenium
driver.get(base_url)



# Vänta tills sidan har laddats
wait = WebDriverWait(driver, 10)

# -------- TEST 1: Valideringsfel när fält lämnas tomma --------
try:
    next_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Nästa')]")))
    next_button.click()

    error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "alert-danger")))
    assert "Registreringsnummer är obligatoriskt." in error_message.text
    print("✅ Test 1: Valideringsfel fungerar korrekt")

except Exception as e:
    print("❌ Test 1: Misslyckades -", e)

# -------- TEST 2: Fyll i formuläret och skicka bokning --------
try:
    car_reg_input = wait.until(EC.presence_of_element_located((By.ID, "carRegistration")))
    car_reg_input.send_keys("ABC123")

    next_button.click()

    service_select = wait.until(EC.presence_of_element_located((By.ID, "serviceType")))
    service_select.send_keys("Oljebyte")

    next_button.click()

    wait.until(EC.visibility_of_element_located((By.ID, "week-calendar")))

    available_dates = driver.find_elements(By.XPATH, "//td[not(contains(@class, 'bg-danger'))]")
    if available_dates:
        available_dates[0].click()

    available_times = driver.find_elements(By.XPATH, "//td[not(contains(@class, 'bg-danger'))]")
    if available_times:
        available_times[0].click()

    next_button.click()

    name_input = driver.find_element(By.ID, "Namn")
    phone_input = driver.find_element(By.ID, "Telnr")
    email_input = driver.find_element(By.ID, "email")

    name_input.send_keys("Test Person")
    phone_input.send_keys("0701234567")
    email_input.send_keys("test@example.com")

    confirm_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Bekräfta')]")
    confirm_button.click()

    confirmation_modal = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "modal-content")))
    assert "Bokningsbekräftelse" in confirmation_modal.text
    print("✅ Test 2: Bokning genomförd och bekräftelsemodal visas")

except Exception as e:
    print("❌ Test 2: Misslyckades -", e)

# -------- TEST 3: Kontrollera att bokade tider blockeras --------
try:
    driver.refresh()
    time.sleep(2)

    car_reg_input = wait.until(EC.presence_of_element_located((By.ID, "carRegistration")))
    car_reg_input.send_keys("ABC123")

    next_button.click()
    service_select.send_keys("Oljebyte")
    next_button.click()

    booked_time_elements = driver.find_elements(By.XPATH, "//td[contains(@class, 'bg-danger')]")
    if booked_time_elements:
        print("✅ Test 3: Bokade tider blockeras korrekt")
    else:
        print("❌ Test 3: Inga bokade tider hittades!")

except Exception as e:
    print("❌ Test 3: Misslyckades -", e)

# Stäng WebDriver
driver.quit()
