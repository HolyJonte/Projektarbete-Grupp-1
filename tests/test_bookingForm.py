import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Starta WebDriver och installera ChromeDriver om det behövs
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)

# Skapa ActionChains (för att simulera musrörelser och klick i Selenium)
actions = ActionChains(driver)

# Base URL för bokningssidan, byt portnummer om det behövs
base_url = "http://127.0.0.1:5500/index.html"

# Öppna bokningssidan med tidigare inställd URL
driver.get(base_url)

# Vänta tills sidan har laddats (timeout 10 sekunder)
wait = WebDriverWait(driver, 10)

# =============================================================================
# ---------- FUNKTIONER FÖR ATT GÖRA TESTET LÅNGSAMMARE FÖR REDOVISNINGEN ----------
# =============================================================================

# Funktion för att vänta på en knapp och sedan klicka på den
def wait_and_click(xpath, wait_time=1):
    button = wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))
    actions.move_to_element(button).click().perform()
    time.sleep(wait_time)  # Liten paus för att se klicket

# Funktion för att skriva in text långsamt i ett formulärfält
def slow_typing(element, text, delay=0.2):
    for char in text:
        element.send_keys(char)
        time.sleep(delay) # Fördröjning mellan varje tecken


# =============================================================================
# -------- TEST 1: Fyll i formulären och gör en lyckad bokning --------
# =============================================================================
def test1():
    try:
        # Klicka på knappen "Boka Service"
        wait_and_click("//*[@id='app']/div/div/div[1]/a[1]")

        # Fyll i registreringsnummer
        car_reg_input = wait.until(EC.presence_of_element_located((By.ID, "carRegistration")))
        # Skriver långsamt in registreringsnumret
        slow_typing(car_reg_input, "ABC123")  

        # Klicka på "Nästa" knappen
        wait_and_click("//button[contains(text(), 'Nästa')]")

        # Väljer en tjänst i dropdown-menyn
        service_select = wait.until(EC.presence_of_element_located((By.ID, "serviceType")))
        service_select.send_keys("Oljebyte")

        # Klicka på "Nästa" knappen och vänta på att kalendern visas
        wait_and_click("//button[contains(text(), 'Nästa')]")
        wait.until(EC.visibility_of_element_located((By.ID, "week-calendar")))

        # Väljer första dagen på nuvarande vecka i kalendern
        available_dates = driver.find_elements(By.XPATH, "//td[not(contains(@class, 'bg-danger'))]")
        if available_dates:
            actions.move_to_element(available_dates[0]).click().perform()
            time.sleep(1)

        # Väljer första tiden på vald dag i kalendern
        available_times = driver.find_elements(By.XPATH, "//td[not(contains(@class, 'bg-danger'))]")
        if available_times:
            actions.move_to_element(available_times[0]).click().perform()
            time.sleep(1)

        # Gå till nästa steg
        wait_and_click("//button[contains(text(), 'Nästa')]")

        # Letar upp textformulär
        name_input = driver.find_element(By.ID, "Namn")
        phone_input = driver.find_element(By.ID, "Telnr")
        email_input = driver.find_element(By.ID, "email")

        # Använder funktionen för att skriva text långsamt för att fylla i kontaktuppgifter
        slow_typing(name_input, "Test Person")
        slow_typing(phone_input, "0701234567")
        slow_typing(email_input, "test@example.com")

        # Vänta tills bekräfta-knappen är aktiverad och klickbar och sedan klicka på den
        confirm_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Bekräfta')]")))
        confirm_button.click()

        # Vänta på bekräftelsemodal
        confirmation_modal = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "modal-content")))
        time.sleep(3)

        # Kontrollera att modalen innehåller texten "Bokningsbekräftelse"
        assert "Bokningsbekräftelse" in confirmation_modal.text

        # Hämta stäng-knappen i modalens footer och klickar på knappen
        close_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Stäng')]")))
        close_button.click()

        # Vänta tills modalen försvinner för att verifiera att den stängts
        wait.until(EC.invisibility_of_element_located((By.CLASS_NAME, "modal-content")))

        #  Skriv ut att testet lyckades
        print("✅ Test 1: Genomfördes korrekt!")

    # Om något går fel, skriv ut felmeddelandet
    except Exception as e:
        print("❌ Test 1: Misslyckades!", e)
# =============================================================================
# -------- TEST 2: Kontrollera att bokade tider blockeras --------
# =============================================================================
def test2():
    # Öppna sidan och vänta 2 sekunder
    driver.get(base_url)
    time.sleep(2)

    try:
        # Återupprepar samma steg som i test 1 från fram till steg 3
        wait_and_click("//*[@id='app']/div/div/div[1]/a[1]")
        car_reg_input = wait.until(EC.presence_of_element_located((By.ID, "carRegistration")))
        slow_typing(car_reg_input, "ABC123")
        wait_and_click("//button[contains(text(), 'Nästa')]")
        service_select = wait.until(EC.presence_of_element_located((By.ID, "serviceType")))
        service_select.send_keys("Oljebyte")
        wait_and_click("//button[contains(text(), 'Nästa')]")

        # Vänta tills kalendern syns i steg 3
        wait.until(EC.visibility_of_element_located((By.ID, "week-calendar")))

        # Hämta alla bokade tider (blockerade med bg-danger)
        booked_time_elements = driver.find_elements(By.XPATH, "//td[contains(@class, 'bg-danger')]")

        # Fortsätt boka en ny tid
        available_times = driver.find_elements(By.XPATH, "//td[not(contains(@class, 'bg-danger'))]")

        if available_times:
            # välj första tid i kalendern (vilket är samma tid som bokades i test 1)
            actions.move_to_element(available_times[0]).click().perform()
            time.sleep(1)
            wait_and_click("//button[contains(text(), 'Nästa')]")

            # Klicka på bekräfta-knappen
            confirm_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Bekräfta')]")))
            confirm_button.click()

            # Vänta på bekräftelsemodal
            confirmation_modal = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "modal-content")))
            time.sleep(3)

            # Kontrollera att modalen innehåller texten "Bekräfta din bokning" och visar i så fall att testet misslyckades.
            assert "Bekräfta din bokning" in confirmation_modal.text
            print("❌ Testet Misslyckades!")

    # Detta meddelnade kommer att visas om det inte går att boka en tid
    except Exception as e:
        print("✅ Test 2: Genomfördes korrekt!", e)

# =============================================================================
# --------- TEST 3: Felhantering av registreringsnummer ---------
# =============================================================================
def test3():
    driver.get(base_url)
    time.sleep(2)

    try:
        # Test 3A: Försök att gå vidare utan att fylla i registreringsnummer
        try:
            wait_and_click("//*[@id='app']/div/div/div[1]/a[1]")
            wait_and_click("//button[contains(text(), 'Nästa')]")

            # Kontrollera att felmeddelandet visas och skriv ut att det genomfördes korrekt.
            error_message = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "alert-danger")))
            assert "Registreringsnummer är obligatoriskt." in error_message.text
            print("✅ Test 3A: Genomfördes korrekt!")

        # Om något går fel, skriv ut felmeddelandet
        except Exception as e:
            print(f"❌ Test 3A: Misslyckades! - Fel: {e}")
            return

        # Test 3B: Test av ogiltiga registreringsnummer
        invalid_reg_numbers = ["A!C123"]

        # Kontrollera att inputfältet existerar
        try:
            car_reg_input = wait.until(EC.presence_of_element_located((By.ID, "carRegistration")))
        except Exception as e:
            return

        # En for loop som testar varje ogiltigt registreringsnummer (vi använder dock bara 1 i detta fall)
        for reg in invalid_reg_numbers:
            try:
                # Rensa fältet och skriv in ogiltigt registreringsnummer
                car_reg_input.send_keys(Keys.CONTROL + "a", Keys.DELETE)
                time.sleep(1)  # Ge sidan tid att registrera rensning

                # Skriv in regnummer
                slow_typing(car_reg_input, reg)
                time.sleep(1)

                # Klicka på "Nästa"
                wait_and_click("//button[contains(text(), 'Nästa')]")

                # Vänta på att felmeddelandet dyker upp
                try:
                    error_message = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "alert-danger")))
                    assert "Ogiltigt registreringsnummer." in error_message.text
                except Exception:
                    assert False, f"Inget felmeddelande visades för ogiltigt registreringsnummer '{reg}'!"

            # Skriver ut att test 3B misslyckades om något går fel
            except Exception as e:
                print(f"❌ Test 3B: Misslyckades med '{reg}' - Fel: {e}")
                return

        # Skriver ut att hela Test 3 genomfördes korrekt
        print("✅ Test 3: Genomfördes korrekt!")

    # Skriver ut att hela Test 3 misslyckades om något går fel
    except Exception as e:
        print("❌ Test 3: Misslyckades! -", e)

# =============================================================================
# -------- TEST 4: Felhantering av tjänstval --------
# =============================================================================
def test4():
    driver.get(base_url)
    time.sleep(2)

    try:
        # Klicka på "Boka Service" och fyll i registreringsnummer
        wait_and_click("//*[@id='app']/div/div/div[1]/a[1]")
        car_reg_input = wait.until(EC.presence_of_element_located((By.ID, "carRegistration")))
        slow_typing(car_reg_input, "ABC123")
        wait_and_click("//button[contains(text(), 'Nästa')]")

        # Försök gå vidare utan att välja en tjänst
        wait_and_click("//button[contains(text(), 'Nästa')]")

        # Vänta på felmeddelande
        error_message = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "alert-danger")))
        assert "Välj en tjänst." in error_message.text

        # Skriv ut att testet genomfördes korrekt
        print("✅ Test 4: Genomfördes korrekt!")

    # Skriver ut att testet misslyckades om något går fel
    except Exception as e:
        print("❌ Test 4: Misslyckades!", e)


# =============================================================================
# -------- TEST 5: Felhantering av kontaktuppgifter --------
# =============================================================================
def test5():
    driver.get(base_url)
    time.sleep(2)

    try:
        # Klicka på "Boka Service" och fyll i registreringsnummer
        wait_and_click("//*[@id='app']/div/div/div[1]/a[1]")
        car_reg_input = wait.until(EC.presence_of_element_located((By.ID, "carRegistration")))
        slow_typing(car_reg_input, "ABC123")
        wait_and_click("//button[contains(text(), 'Nästa')]")

        # Välj en tjänst
        service_select = wait.until(EC.presence_of_element_located((By.ID, "serviceType")))
        service_select.send_keys("Oljebyte")
        wait_and_click("//button[contains(text(), 'Nästa')]")

        # Väntar tills kalendern visas och letar då upp lediga daturm
        wait.until(EC.visibility_of_element_located((By.ID, "week-calendar")))
        available_dates = driver.find_elements(By.XPATH, "//td[not(contains(@class, 'bg-danger'))]")

        # Markerar andra dagen i kalendern
        if available_dates:
            actions.move_to_element(available_dates[1]).click().perform()
            time.sleep(1)

        # Letar upp lediga tider elementet och väjer andra lediga i kalendern
        available_times = driver.find_elements(By.XPATH, "//tbody/tr/td[not(contains(@class, 'bg-danger'))]")
        if available_times:
            actions.move_to_element(available_times[1]).click().perform()
            time.sleep(1)

        wait_and_click("//button[contains(text(), 'Nästa')]")

        # Försök bekräfta med tomma fält
        confirm_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Bekräfta')]")

        # Se om knappen är inaktiv
        if confirm_button.get_attribute("disabled"):
            print("✅ Test 5A: Felmeddelande visas korrekt vid tomma fält.")
        else:
            confirm_button.click()
            # Vänta på felmeddelande
            try:
                error_message = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "alert-danger")))
                assert "Alla fält måste fyllas i." in error_message.text
            except Exception as e:
                print(f"❌ Test 5A: Felmeddelande visades inte korrekt - {e}")

        # Hittar fälten och fyller i namn & telefon och en ogiltig e-post
        name_input = driver.find_element(By.ID, "Namn")
        phone_input = driver.find_element(By.ID, "Telnr")
        email_input = driver.find_element(By.ID, "email")
        slow_typing(name_input, "Test Person")
        slow_typing(phone_input, "0701234567")
        slow_typing(email_input, "testcom")

        # Se till att bekräfta-knappen går att klicka
        confirm_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Bekräfta')]")))
        confirm_button.click()

        # Vänta på felmeddelande för ogiltig e-post
        try:
            error_message = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "alert-danger")))
            assert "Ogiltig e-postadress." in error_message.text
            # Skriver ut att testet genomfördes korrekt
            print("✅ Test 5B: Felmeddelande visas korrekt vid ogiltig e-postadress")
        except Exception as e:
            print(f"❌ Test 5B: Felmeddelande för ogiltig e-post visades inte - {e}")

        # Skriver ut att hela Test 5 genomfördes korrekt
        print("✅ Test 5: Genomfördes korrekt!")
    # Skriv ut att testet misslyckades om något går fel
    except Exception as e:
        print("❌ Test 5: Misslyckade!", e)

# =============================================================================
# ---------- KÖR TESTERNA ----------
# =============================================================================

# Variabler för att välja vilka tester som ska köras
RUN_TEST_1 = True
RUN_TEST_2 = True
RUN_TEST_3 = True
RUN_TEST_4 = True
RUN_TEST_5 = True

# Kör testerna
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

    # Stänga ner webbläsaren
    time.sleep(1)
    driver.quit()

# Jonte gör en kommentar i en branch här