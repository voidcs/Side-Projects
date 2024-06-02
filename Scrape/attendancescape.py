import requests
from bs4 import BeautifulSoup
import gspread
import datetime
import re

from bs4 import BeautifulSoup

# My local file path of the html of the spreadsheet since I can't directly scrape a google sheet
file_path = "C:/Users/James/AppData/Local/Temp/0a42a5de-05ce-43ab-9812-b81534546e4f_Untitled form (Responses) (2).zip.e4f/Form Responses 1.html"
column = "S"    # Just set this to whichever column you're updating lmfao bro
index = ord(column) - ord('A')
# Open and read the file
with open(file_path, 'r', encoding='utf-8') as file:
    contents = file.read()

# Parse the file content with BeautifulSoup
soup = BeautifulSoup(contents, 'html.parser')
pattern = r"[a-zA-Z0-9._%+-]+@berkeley\.edu"
emails = soup.find_all(string=re.compile(pattern))
gc = gspread.service_account(filename='creds.json')
sh = gc.open('Decal_Grades').sheet1
rows = sh.get_all_values()
print(emails)
for i in range(3, len(rows)):
    # A students email is in column 2
    if rows[i][2] in emails:
        sh.update_cell(i + 1, index + 1, 1)         # they're one indexed for some reason
    else:   
        sh.update_cell(i + 1, index + 1, 0)         # they're one indexed for some reason