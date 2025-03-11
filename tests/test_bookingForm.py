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

# =============================================================================
# ---------- FUNKTIONER FÖR ATT GÖRA TESTET VISBART FÖR REDOVISNING ----------
# =============================================================================

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


# =============================================================================
# -------- TEST 1: Fyll i formuläret och skicka bokning --------
# =============================================================================
def test1():
    # -------- Klicka på knappen "Boka Service" --------
    try:
        wait_and_click("//*[@id='app']/div/div/div[1]/a[1]")
        print("✅ Klickade på knappen 'Boka Service'")
    except Exception as e:
        print("❌ Misslyckades att klicka på knappen 'Boka Service' -", e)

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
# =============================================================================
# -------- TEST 2: Kontrollera att bokade tider blockeras --------
# =============================================================================
def test2():
    driver.get(base_url)
    time.sleep(2)

    try:
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

        # Fortsätt boka en ny ledig tid
        print("🔄 Försöker boka en annan tillgänglig tid...")
        available_times = driver.find_elements(By.XPATH, "//td[not(contains(@class, 'bg-danger'))]")

        if available_times:
            actions.move_to_element(available_times[0]).click().perform()
            time.sleep(1)
            wait_and_click("//button[contains(text(), 'Nästa')]")

            # Klicka på bekräfta-knappen
            confirm_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Bekräfta')]")))
            confirm_button.click()

            # Vänta på bekräftelsemodal
            confirmation_modal = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "modal-content")))
            time.sleep(3)
            assert "Bokningsbekräftelse" in confirmation_modal.text
            print("✅ Ny bokning genomförd och bekräftelsemodal visas")

        else:
            print("❌ Ingen ny ledig tid att boka!")

    except Exception as e:
        print("❌ Test 2: Misslyckades -", e)

# =============================================================================
# -------- TEST 3: Felhantering av registreringsnummer --------
# =============================================================================
def test3():
    driver.get(base_url)
    time.sleep(2)

    try:
        
        # 🛑 **Test 3A: Fältet är tomt**
        try:
            wait_and_click("//*[@id='app']/div/div/div[1]/a[1]")
            wait_and_click("//button[contains(text(), 'Nästa')]")
            error_message = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "alert-danger")))
            assert "Registreringsnummer är obligatoriskt." in error_message.text
            print("✅ Test 3A: Felmeddelande visas när fältet är tomt")
        except Exception as e:
            print(f"❌ Test 3A misslyckades - Fel: {e}")
            return

        # 🛑 **Test 3B: Ogiltiga registreringsnummer**
        invalid_reg_numbers = ["123ABC", "A!C123", "ABCD123", "A23", "12345"]

        # Kontrollera att inputfältet existerar
        try:
            car_reg_input = wait.until(EC.presence_of_element_located((By.ID, "carRegistration")))
            print("✅ Hittade inputfältet")
        except Exception as e:
            print(f"❌ Kunde inte hitta inputfältet! Fel: {e}")
            return

        for reg in invalid_reg_numbers:
            try:
                # Rensa fältet HELT
                car_reg_input.send_keys(Keys.CONTROL + "a", Keys.DELETE)
                time.sleep(1)  # Ge sidan tid att registrera rensning

                # Skriv in regnummer
                slow_typing(car_reg_input, reg)
                time.sleep(1)

                # Klicka på "Nästa"
                wait_and_click("//button[contains(text(), 'Nästa')]")
                time.sleep(2)  # Vänta på felet

                # 🛑 **Vänta på att felmeddelandet dyker upp**
                try:
                    error_message = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "alert-danger")))
                    print(f"🔍 Faktiskt felmeddelande för '{reg}': {error_message.text}")
                    assert "Ogiltigt registreringsnummer." in error_message.text
                    print(f"✅ Test 3B: Ogiltigt reg.nr '{reg}' ger rätt felmeddelande")
                except Exception:
                    print(f"❌ Test 3B: Ingen felruta för '{reg}'! Testet misslyckas.")
                    assert False, f"Inget felmeddelande visades för ogiltigt registreringsnummer '{reg}'!"

            except Exception as e:
                print(f"❌ Misslyckades med '{reg}' - Fel: {e}")
                return

        # 🛑 **Test 3D: Kontrollera att vi gått vidare till nästa steg**
        time.sleep(1)
        assert "Tjänst" in driver.page_source
        print("✅ Test 3D: Korrekt registreringsnummer accepterades och vi gick vidare!")

    except Exception as e:
        print("❌ Test 3: Misslyckades -", e)

# =============================================================================
# -------- TEST 4: Felhantering av tjänstval --------
# =============================================================================
def test4():
    driver.get(base_url)
    time.sleep(2)

    try:
        # 🛑 **Steg 1: Klicka på "Boka Service" och fyll i registreringsnummer**
        wait_and_click("//*[@id='app']/div/div/div[1]/a[1]")
        car_reg_input = wait.until(EC.presence_of_element_located((By.ID, "carRegistration")))
        slow_typing(car_reg_input, "ABC123")
        wait_and_click("//button[contains(text(), 'Nästa')]")

        # 🛑 **Steg 2: Försök gå vidare utan att välja en tjänst**
        wait_and_click("//button[contains(text(), 'Nästa')]")

        # Vänta på felmeddelande
        error_message = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "alert-danger")))
        assert "Välj en tjänst." in error_message.text
        print("✅ Test 4: Felmeddelande visas korrekt när ingen tjänst väljs")

    except Exception as e:
        print("❌ Test 4: Misslyckades -", e)

    finally:
        # **Ladda om sidan så nästa test startar korrekt**
        driver.refresh()
        time.sleep(2)

# =============================================================================
# -------- TEST 5: Felhantering av kontaktuppgifter --------
# =============================================================================
def test5():
    driver.get(base_url)
    time.sleep(2)

    try:
        # 🛑 **Steg 1: Klicka på "Boka Service" och fyll i registreringsnummer**
        wait_and_click("//*[@id='app']/div/div/div[1]/a[1]")
        car_reg_input = wait.until(EC.presence_of_element_located((By.ID, "carRegistration")))
        slow_typing(car_reg_input, "ABC123")
        wait_and_click("//button[contains(text(), 'Nästa')]")

        # 🛑 **Steg 2: Välj en tjänst**
        service_select = wait.until(EC.presence_of_element_located((By.ID, "serviceType")))
        service_select.send_keys("Oljebyte")
        wait_and_click("//button[contains(text(), 'Nästa')]")

        # 🛑 **Steg 3: Välj en ledig tid i kalendern**
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

        # 🛑 **Steg 4A: Försök bekräfta med tomma fält**
        wait_and_click("//button[contains(text(), 'Bekräfta')]")
        error_message = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "alert-danger")))
        assert "Alla fält måste fyllas i." in error_message.text
        print("✅ Test 5A: Felmeddelande visas korrekt vid tomma fält på Steg 4")

        # 🛑 **Steg 4B: Fyll i namn & telefon, men ange ogiltig e-post**
        name_input = wait.until(EC.presence_of_element_located((By.ID, "Namn")))
        phone_input = wait.until(EC.presence_of_element_located((By.ID, "Telnr")))
        email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))

        slow_typing(name_input, "Test Person")
        slow_typing(phone_input, "0701234567")
        slow_typing(email_input, "testmail.com")  # Ogiltig e-post

        wait_and_click("//button[contains(text(), 'Bekräfta')]")

        # Vänta på felmeddelande för ogiltig e-post
        error_message = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "alert-danger")))
        assert "Ogiltig e-postadress." in error_message.text
        print("✅ Test 5B: Felmeddelande visas korrekt vid ogiltig e-postadress")

    except Exception as e:
        print("❌ Test 5: Misslyckades -", e)

    finally:
        # **Ladda om sidan så nästa test startar korrekt**
        driver.refresh()
        time.sleep(2)

# =============================================================================
# ---------- KÖR TESTERNA ----------
# =============================================================================

RUN_TEST_1 = False
RUN_TEST_2 = False
RUN_TEST_3 = True
RUN_TEST_4 = False
RUN_TEST_5 = False


if __name__ == "__main__":
    if RUN_TEST_1:
        test1()

    if RUN_TEST_2:
        test2()

    if RUN_TEST_3:
        test3()

    if RUN_TEST_4:
        test4()

    if RUN_TEST_5:
        test5()

driver.quit()
