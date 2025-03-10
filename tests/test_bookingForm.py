import os
import time
import platform

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Starta WebDriver
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)

# Skapa ActionChains
actions = ActionChains(driver)

# Identifiera operativsystemet
if platform.system() == "Darwin":  # MacOS
    base_url = "http://127.0.0.1:5501/index.html"
else:  # Windows (och ev. Linux)
    base_url = "http://127.0.0.1:5500/index.html"

# Använd rätt URL i Selenium
driver.get(base_url)

# Vänta tills sidan har laddats
wait = WebDriverWait(driver, 10)

# ---------- FUNKTIONER FÖR ATT GÖRA TESTET MÄNSKLIGARE ----------
def wait_and_click(xpath, wait_time=1):
    """Flytta musen till knappen och klicka"""
    button = wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))
    actions.move_to_element(button).click().perform()
    time.sleep(wait_time)  # Liten paus för att se klicket

def slow_typing(element, text, delay=0.2):
    """Skriver in text långsamt"""
    for char in text:
        element.send_keys(char)
        time.sleep(delay)

# -------- Klicka på knappen "Boka Service" --------
try:
    wait_and_click("//*[@id='app']/div/div/div[1]/a[1]")
    print("✅ Klickade på knappen 'Boka Service'")
except Exception as e:
    print("❌ Misslyckades att klicka på knappen 'Boka Service' -", e)

# -------- TEST 1: Fyll i formuläret och skicka bokning --------
try:
    car_reg_input = wait.until(EC.presence_of_element_located((By.ID, "carRegistration")))
    slow_typing(car_reg_input, "ABC123")  # Skriver långsamt

    wait_and_click("//button[contains(text(), 'Nästa')]")

    service_select = wait.until(EC.presence_of_element_located((By.ID, "serviceType")))
    service_select.send_keys("Oljebyte")

    wait_and_click("//button[contains(text(), 'Nästa')]")

    wait.until(EC.visibility_of_element_located((By.ID, "week-calendar")))

    available_dates = driver.find_elements(By.XPATH, "//td[not(contains(@class, 'bg-danger'))]")
    if available_dates:
        actions.move_to_element(available_dates[0]).click().perform()
        time.sleep(1)

    available_times = driver.find_elements(By.XPATH, "//td[not(contains(@class, 'bg-danger'))]")
    if available_times:
        actions.move_to_element(available_times[0]).click().perform()
        time.sleep(1)

    wait_and_click("//button[contains(text(), 'Nästa')]")

    name_input = driver.find_element(By.ID, "Namn")
    phone_input = driver.find_element(By.ID, "Telnr")
    email_input = driver.find_element(By.ID, "email")

    slow_typing(name_input, "Test Person")
    slow_typing(phone_input, "0701234567")
    slow_typing(email_input, "test@example.com")

    # Vänta tills knappen är aktiverad och klickbar
    confirm_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Bekräfta')]")))

    # Klicka på knappen
    confirm_button.click()

    confirmation_modal = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "modal-content")))
    time.sleep(3)
    assert "Bokningsbekräftelse" in confirmation_modal.text
    print("✅ Test 1: Bokning genomförd och bekräftelsemodal visas")

    # Hämta stäng-knappen i modalens footer
    close_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Stäng')]")))

    # Klicka på stäng-knappen
    close_button.click()

    # Vänta tills modalen försvinner för att verifiera att den stängts
    wait.until(EC.invisibility_of_element_located((By.CLASS_NAME, "modal-content")))

    print("✅ Test 1: Modal stängd via 'Stäng'-knappen")

except Exception as e:
    print("❌ Test 1: Misslyckades -", e)

# -------- TEST 2: Kontrollera att bokade tider blockeras --------


try:
    driver.refresh()
    time.sleep(2)

    wait_and_click("//*[@id='app']/div/div/div[1]/a[1]")

    # Fyll i registreringsnummer igen
    car_reg_input = wait.until(EC.presence_of_element_located((By.ID, "carRegistration")))
    slow_typing(car_reg_input, "ABC123")

    wait_and_click("//button[contains(text(), 'Nästa')]")

    # Välj tjänst
    service_select = wait.until(EC.presence_of_element_located((By.ID, "serviceType")))
    service_select.send_keys("Oljebyte")
    wait_and_click("//button[contains(text(), 'Nästa')]")

    # Vänta tills kalendern syns
    wait.until(EC.visibility_of_element_located((By.ID, "week-calendar")))

    # Hämta alla bokade tider (blockerade med bg-danger)
    booked_time_elements = driver.find_elements(By.XPATH, "//td[contains(@class, 'bg-danger')]")

    # Kontrollera om det finns några bokade tider
    if booked_time_elements:
        print("✅ Test 2: Bokade tider blockeras korrekt")
    else:
        print("❌ Test 2: Inga bokade tider hittades!")

except Exception as e:
    print("❌ Test 2: Misslyckades -", e)

# -------- TEST 3: Valideringsfel när fält lämnas tomma --------

try:

    driver.refresh()
    time.sleep(2)

    wait_and_click("//button[contains(text(), 'Nästa')]")

    error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "alert-danger")))
    assert "Registreringsnummer är obligatoriskt." in error_message.text
    print("✅ Test 3: Valideringsfel fungerar korrekt")

except Exception as e:
    print("❌ Test 3: Misslyckades -", e)

# Stäng WebDriver
driver.quit()
