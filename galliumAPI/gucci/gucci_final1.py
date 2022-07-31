import undetected_chromedriver as uc
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from time import sleep
from ClickerLogger import ClickerLogger

# TODO 
# Blocking checkout bug

class Clicker:

    def __init__(self, products, checkout_info, cc_info, logger):
        self.products = products
        self.checkout_info = self.checkout_info_to_list(checkout_info)
        self.cc_info = self.cc_info_to_list(cc_info)
        self.driver = self.initialize_chromedriver()
        self.action_chains = ActionChains(self.driver) 
        self.logger = logger
    
    def initialize_chromedriver(self):
        options = uc.ChromeOptions()
        options.binary_location = "C:/Program Files/Google/Chrome/Application/chrome.exe"
        options.add_argument(
            '--load-extension=/home/ec2-user/chrome_extensions/canvas_spoofer/, /home/ec2-user/chrome_extensions/audio_spoofer/, /home/ec2-user/chrome_extensions/webgl_spoofer/, /home/ec2-user/chrome_extensions/font_spoofer/, /home/ec2-user/chrome_extensions/spoofer/, /home/ec2-user/chrome_extensions/hCaptchaSolver/')
        options.add_argument('--load-extension=/home/ec2-user/chrome_extensions/font_spoofer/')
        options.add_argument('--load-extension=/home/ec2-user/chrome_extensions/spoofer/')

        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_argument("--headless")
        return uc.Chrome(options=options)
    
    def checkout_info_to_list(self, checkout_info):
        return list(checkout_info.values())[:]

    def cc_info_to_list(self, cc_info):
        return list(cc_info.values())[:]

    def start_clicker(self):
        pass

    def add_item_to_cart(self):
        pass

    def checkout(self):
        pass

class Gucci(Clicker):

    def __init__(self, products, checkout_info, cc_info, logger):
        super(Gucci, self).__init__(products, checkout_info, cc_info, logger)
        self.service_name = 'gucci'
        self.version = '1.0.0'
        self.wait_time = 15
    
    def start_clicker(self):
        for i, item in enumerate(self.products):
            accept_cookies = i == 0
            try:
                self.add_item_to_cart(item['sku'], item['size_id'], accept_cookies)
                sleep(3)
            except Exception as error:
                self.logger.log_error(error, self.service_name, self.version)
                return

    def add_item_to_cart(self, SKU, size_id, accept_cookies):

        gucci_search_url = "https://www.gucci.com/us/en/st/newsearchpage?searchString="
        print("hi")
        self.driver.get(gucci_search_url + SKU)
        print("got here")
        wait_time = 500

        if accept_cookies:
            cookie_confirm_button_ID = "onetrust-accept-btn-handler"
            self.driver.execute_script("arguments[0].click();", WebDriverWait(self.driver, wait_time).until(EC.element_to_be_clickable((By.ID, cookie_confirm_button_ID))))

        product_cell_image_class = "ProductCard_productImg"
        self.driver.execute_script("arguments[0].click();", WebDriverWait(self.driver, wait_time).until(EC.element_to_be_clickable((By.CLASS_NAME, product_cell_image_class))))

        select_attribute = "select[name='size']"
        select = Select(WebDriverWait(self.driver, wait_time).until(EC.element_to_be_clickable((By.CSS_SELECTOR, select_attribute))))
        select.select_by_value(size_id)

        add_to_cart_attribute = "button[data-default-label='Add to Shopping Bag']"
        WebDriverWait(self.driver, wait_time).until(EC.element_to_be_clickable((By.CSS_SELECTOR, add_to_cart_attribute))).click()
    
    def checkout(self):
        self.driver.get("https://www.gucci.com/us/en/checkout/single")
        email_input_id = "email-input"

        WebDriverWait(self.driver, self.wait_time).until(EC.presence_of_element_located((By.ID, email_input_id))).send_keys("meftimie@olin.edu")

        continue_button_attribute = "button[data-testid='confirm-button']"
        self.driver.execute_script("arguments[0].click();", WebDriverWait(self.driver, self.wait_time).until(EC.element_to_be_clickable((By.CSS_SELECTOR, continue_button_attribute))))

        first_name_input_id = 'shipping_name'
        WebDriverWait(self.driver, self.wait_time).until(EC.element_to_be_clickable((By.ID, first_name_input_id))).click()
        for i in range(len(self.checkout_info)):
            sleep(0.1)
            if i == 3:
                actions = self.action_chains.send_keys(Keys.TAB)
            if i == 6:
                actions = self.action_chains.send_keys(Keys.TAB).send_keys(Keys.TAB)
                actions.perform()
            actions = self.action_chains.send_keys(self.checkout_info[i]).send_keys(Keys.TAB)
            actions.perform()
        continue_payment_button_xpath = '//*[@id="shipping-address-order"]/div[3]/div[1]/button[1]'
        WebDriverWait(self.driver, self.wait_time).until(EC.element_to_be_clickable((By.XPATH, continue_payment_button_xpath))).click()

        credit_card_button = 'a[data-payment-method="credit-card"]'
        WebDriverWait(self.driver, self.wait_time).until(EC.element_to_be_clickable((By.CSS_SELECTOR, credit_card_button))).click()

        actions = self.action_chains.send_keys(Keys.TAB).send_keys(Keys.TAB)
        actions.perform()
        
        for i in range(len(self.cc_info)):
            sleep(0.1)
            actions = self.action_chains.send_keys(self.cc_info[i]).send_keys(Keys.TAB)
            actions.perform()
        sleep(100)

def main():

    products = [{'sku': '691100XKCF44645', 'size_id': '810345914'}]
    checkout_info = {'first_name': 'Marc', 'last_name': 'Eftimie', 'address_line': '570 Emerald Bay', 'city': 'Laguna Beach', 'state': 'California', 'zip_code': '92651', 'phone_number': '9493633118'}
    cc_info = {'credit_card_number': '1234', 'security_code': '123', 'name_on_card': 'John Smith', 'expiration_month': '01', 'expiration_year': '2025'}
    logger = ClickerLogger()
    gucci_clicker = Gucci(products, checkout_info, cc_info, logger)
    gucci_clicker.start_clicker()
    gucci_clicker.checkout()


if __name__ == "__main__":
    main()