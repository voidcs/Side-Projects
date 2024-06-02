import requests
from bs4 import BeautifulSoup
import gspread
import datetime
import re


week1 = {
    'required_cnt': 1,
    'link': 'https://codeforces.com/group/qxe6b2Ohth/contest/498671/standings/groupmates/true',
    'grade_col': 'W',
    'attendance_col': 'I'
}

week2 = {
    'required_cnt': 0,
    'link': 'https://codeforces.com/group/qxe6b2Ohth/contest/500385/standings/groupmates/true',
    'grade_col': 'X',
    'attendance_col': 'J'
}

week3 = {  
    'required_cnt': 2,
    'link': 'https://codeforces.com/group/qxe6b2Ohth/contest/426009/standings/groupmates/true',
    'grade_col': 'Y',
    'attendance_col': 'K',
}

week4 = {
    'required_cnt': 1,
    'link': 'https://codeforces.com/group/qxe6b2Ohth/contest/503249/standings/groupmates/true',
    'grade_col': 'Z',
    'attendance_col': 'L'
}

week5 = {
    'required_cnt': 1,
    'link': 'https://codeforces.com/group/qxe6b2Ohth/contest/504526/standings/groupmates/true',
    'grade_col': chr(ord('Z') + 1),
    'attendance_col': 'M'
}

week6 = {
    'required_cnt': 0,
    'link': 'https://codeforces.com/group/qxe6b2Ohth/contest/507379/standings/groupmates/true',
    'grade_col': chr(ord('Z') + 2),
    'attendance_col': 'N'
}

week7 = {
    'required_cnt': 1,
    'link': 'https://codeforces.com/group/qxe6b2Ohth/contest/508973/standings/groupmates/true',
    'grade_col': chr(ord('Z') + 3),
    'attendance_col': 'O'
}

week8 = {
    'required_cnt': 0,
    'link': 'https://codeforces.com/group/qxe6b2Ohth/contest/480168/standings/groupmates/true',
    'grade_col': chr(ord('Z') + 3),
    'attendance_col': 'P'
}

week9 = {
    'required_cnt': 0,
    'link': 'https://codeforces.com/group/qxe6b2Ohth/contest/512485/standings/groupmates/true',
    'grade_col': chr(ord('Z') + 4),
    'attendance_col': 'Q'
}

week10 = {
    'required_cnt': 0,
    'link': 'https://codeforces.com/group/qxe6b2Ohth/contest/515584/standings/groupmates/true',
    'grade_col': chr(ord('Z') + 5),
    'attendance_col': 'R'
}

week11 = {
    'required_cnt': 0,
    'link': 'https://codeforces.com/group/qxe6b2Ohth/contest/517100/standings/groupmates/true',
    'grade_col': chr(ord('Z') + 6),
    'attendance_col': 'S'
}

week12 = {
    'required_cnt': 0,
    'link': 'https://codeforces.com/group/C9Og9Xk7VC/contest/489493/standings/groupmates/true',
    'grade_col': chr(ord('Z') + 7),
    'attendance_col': 'S'
}

week = week11

def request():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
    }
    url = week['link']
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.content, 'html.parser')
    # with open("output.html", "w", encoding="utf-8") as file:
    #     file.write(str(soup))
    return soup

def parse(soup):
    # Naively gets the names, not too useful since I can't find number AC or anything else
    # students = soup.find_all(lambda tag: tag is not None and tag.has_attr("title") and tag.has_attr("href") and tag.has_attr("class"))
    # for i in range(len(students)):
    #     students[i] = students[i].text.strip()
    students = soup.find_all(lambda tag: tag is not None and tag.has_attr("participantid"))
    # students = soup.find_all("td", {"class": "contestant-cell"})
    res = {}
    for u in students:
        s = str(u)
        match = re.search('<a [^>]*?>(.*?)</a>', s)
        name = match.group(1)
        match = re.findall('<span[^>]*>(.*?)<\/span>', s)
        attempts = []
        for x in match:
            if '+' in x:
                attempts.append(2)
            elif '-' in x:
                attempts.append(1)
            elif '\xa0' in x:
                attempts.append(0)
        res[name.lower().strip()] = attempts
    return res

gc = gspread.service_account(filename='creds.json')
sh = gc.open('Decal_Grades').sheet1
data = request()
grades = parse(data)   # a map linking codeforces username to submission array

rows = sh.get_all_values()
index = ord(week['grade_col']) - ord('A')
attendance_index = ord(week['attendance_col']) - ord('A')
cnt = 0
for i in range(3, len(rows)):
    student = rows[i][3].lower().strip()    # Current student codeforces name
    current_score = rows[i][index]  # their current score, don't override it

    if student in grades:
        cnt += 1
        if week['required_cnt'] == 0:
            submissions = sum([x > 0 for x in grades[student]])
            if submissions > 0:
                score = 2
            else:
                score = 0
            sh.update_cell(i + 1, index + 1, max(int(current_score), score))         # they're one indexed for some reason


        if rows[i][attendance_index] == '1':
            score = int(sum(grades[student][:week['required_cnt']]) > 0) * 2       # if they attended, any submission from slice [0:required] gives credit
            if sum([x >= 2 for x in grades[student]]) >=  week['required_cnt']:    # if they solved enough problems, they get full credit
                score = 2
            if sum(grades[student][:week['required_cnt']]) > 0:                # if they made an attempt, give them a 1
                score = max(score, 1)
        else:
            if sum([x >= 2 for x in grades[student]]) >=  week['required_cnt']:    # if they solved enough problems, they get full credit
                score = 2
            elif sum(grades[student][:week['required_cnt']]) > 0:                # if they made an attempt, give them a 1
                score = 1
        sh.update_cell(i + 1, index + 1, max(int(current_score), score))         # they're one indexed for some reason