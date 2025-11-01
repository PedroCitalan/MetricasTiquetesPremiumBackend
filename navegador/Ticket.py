from selenium import webdriver
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from pathlib import Path
import time
import sys
import os
import shutil

# Configurar WebDriver con WebDriver Manager
options = webdriver.EdgeOptions()
options.add_argument("--headless") # Hace la descarga de archivos de tiquetes de la página sin mostrar el navegador
driver = webdriver.Edge(service=EdgeService(), options=options)

# Directorio donde se descargan los tickets
download_path = str(Path.home() / "Downloads" / "WHD_Tickets.tsv")

# Directorio donde se descargan las encuestas
download_path2 = str(Path.home() / "Downloads" / "surveys.txt")

# El destino a donde se moverán los archivos para ser leídos en la página web
destination = str(Path.home() / "Documents")
Path.unlink(download_path, missing_ok=True)
Path.unlink(download_path2, missing_ok=True)

# Argumentos para mover los tickets al directorio de la página web
filename = os.path.basename(download_path)
dest = os.path.join(destination, filename)

# Argumentos para mover las encuestas al directorio de la página web
filename2 = os.path.basename(download_path2)
dest2 = os.path.join(destination, filename2)

# Si se encuentra el archivo stop.txt, se envía la señal para detener el script
def check_stop():
    return os.path.exists(os.path.join(os.path.dirname(__file__), 'stop.txt'))

# Ejecución principal del script
def ejecucion (user, passuser):
    # Abrir la página de inicio de sesión
    driver.get("https://whdca.premium.sv/helpdesk/WebObjects/Helpdesk.woa")
    if check_stop(): return

    # Esperar a que la página cargue completamente
    WebDriverWait(driver, 10)

    #Ingresar nombre de usuario
    username = driver.find_element(By.XPATH, "//input[@id='userName']")
    username.send_keys(user)
    if check_stop(): return

    #Ingresar contraseña
    password = driver.find_element(By.XPATH, "//input[@id='password']")
    password.send_keys(passuser)
    if check_stop(): return

    # Hacer clic en el botón de Log In
    login_button = driver.find_element(By.XPATH, "//div[@class='aquaSquareMiddle' and text()='Log In']")  # Ajustar si es necesario
    login_button.click()
    if check_stop(): return

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//div[@class='menubarButtonLabel' and contains(text(),'Reports')]" ))).click()
    if check_stop(): return

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, "Survey Results"))).click()
    if check_stop(): return

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//select/option[text()='Encuesta de Sistemas']"))).click()
    if check_stop(): return

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//select/option[text()='Sistemas GT']"))).click()
    if check_stop(): return

    fechaencuesta = driver.find_element(By.XPATH, "//input[@id='date_7_37_0_0_0_0_2_1_1_2_1_0_11']")
    fechaencuesta.send_keys(Keys.CONTROL + "a")
    fechaencuesta.send_keys(Keys.DELETE)
    fechaencuesta.send_keys("01/Dec/2024")
    if check_stop(): return

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//div[@class='aquaMiddle' and text()='Run Report']"))).click()
    if check_stop(): return

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//div[@class='squareButtonMiddle' and contains(text(),'Download TSV')]"))).click()
    if check_stop(): return

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//div[@class='menubarButtonLabel' and contains(text(),'Tickets')]" ))).click()
    if check_stop(): return

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, "Search Tickets"))).click()
    if check_stop(): return

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//td[contains(text(),'Advanced Search')]"))).click()
    if check_stop(): return

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//select/option[text()='prueba2']"))).click()
    if check_stop(): return

    time.sleep(5)
    if check_stop(): return

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//div[@class='aquaMiddle' and text()='Search']"))).click()
    if check_stop(): return

    time.sleep(10)
    if check_stop(): return

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//img[@id='actionsButton']"))).click()
    if check_stop(): return

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//div[@class='listActionCellLabel' and contains(text(),'Download TSV')]"))).click()
    if check_stop(): return

    time.sleep(450)
    shutil.move(download_path, dest)
    time.sleep(5)
    shutil.move(download_path2, dest2)
    quit()

# Ciclo para ejecutar el script
def main(user, passuser):
    try:
        while not check_stop():
            try:
                ejecucion(user, passuser)
            except Exception as e:
                print(f"Error durante el inicio de script")
                ejecucion(user, passuser)
    finally:
        driver.quit()
        print("Se detiene la ejecución del script")

# Verificar si los argumentos enviados del backend son correctos
if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(1)

    # Obtener los argumentos del backend
    user = sys.argv[1]
    passuser = sys.argv[2]
    main(user, passuser)