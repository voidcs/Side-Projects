import requests
from bs4 import BeautifulSoup
import gspread
import datetime
import re

gc = gspread.service_account(filename='creds.json')
sh = gc.open('Decal_Grades').sheet1


rows = sh.get_all_values()
res = []
for i in range(3, len(rows)):
    student = rows[i][0].lower()    # Current student codeforces name
    def hash_id(student_id: str) -> int:
        if not (student_id.isdigit()):
            raise ValueError("Student ID should be a 10-digit number.")
        
        prime = 99991  # A prime number close to 10^5
        return int(student_id) % prime
    x = hash_id(student)
    res.append(x)
    sh.update_cell(i+1, 1, x)
    # if len(rows[i][3]) == 0:
    #     s = "no"
    # else:
    #     s = "yes"
    # sh.update_cell(i+1, 4, s)

print(len(res))
print(res)