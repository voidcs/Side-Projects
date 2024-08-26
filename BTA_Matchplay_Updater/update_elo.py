from collections import defaultdict
import gspread
from oauth2client.service_account import ServiceAccountCredentials

scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]

credentials_path = "/Users/james/keys/bta-matchplay-b2847d95d7e3.json"
creds = ServiceAccountCredentials.from_json_keyfile_name(credentials_path, scope)

client = gspread.authorize(creds)

sheet_url = "https://docs.google.com/spreadsheets/d/1BiVMg6ESdtII0OjH7hNUyNj5fVcFW1IcoeZYDgCtY_8/edit?gid=0#gid=0"
sheet = client.open_by_url(sheet_url)

player_sheet = sheet.get_worksheet(1)
names_column = player_sheet.col_values(1)[1:]  # Skip the first row (header)
names = set(names_column)
print(names)
print("size: ", len(names))
match_sheet = sheet.get_worksheet(0)
player_elo = {}
for name in names:
    player_elo[name] = 1000

all_values = match_sheet.get_all_values()
stats = {}
for name in names:
    stats[name] = defaultdict(int)

K = 100
for row in all_values:
    player1 = row[0]
    player2 = row[4]
    if player1 not in names or player2 not in names:
        print("")
        continue
    if row[1] == "" or row[4] == "":
        continue
    setsWon = 0 # sets that the first player won
    if row[1] > row[5]:
        setsWon += 1
    if row[2] > row[6]:
        setsWon += 1
    if row[3] != "" and row[7] != "":
        if row[3] > row[7]:
            setsWon += 1
            stats[player1]["GamesWon"] += 1
            stats[player2]["GamesLost"] += 1
        else:
            stats[player2]["GamesWon"] += 1
            stats[player1]["GamesLost"] += 1

    stats[player1]["GamesWon"] += int(row[1]) + int(row[2])
    stats[player1]["GamesLost"] += int(row[5]) + int(row[6])
    stats[player2]["GamesLost"] += int(row[1]) + int(row[2])
    stats[player2]["GamesWon"] += int(row[5]) + int(row[6])

    stats[player1]["MP"] += 1
    stats[player2]["MP"] += 1
    if setsWon == 2:
        stats[player1]["W"] += 1
        stats[player2]['L'] += 1
        print(player1, "beat", player2)
    else:
        stats[player1]["L"] += 1
        stats[player2]['W'] += 1
        print(player1, "lost to", player2)
    stats[player1]["GameDiff"] = stats[player1]["GamesWon"] - stats[player1]["GamesLost"]
    stats[player2]["GameDiff"] = stats[player2]["GamesWon"] - stats[player2]["GamesLost"]
    player1_elo = player_elo[player1]
    player2_elo = player_elo[player2]
    expectedA = 1/(1 + 10**((player2_elo - player1_elo) / 400))
    expectedB = 1/(1 + 10**((player1_elo - player2_elo) / 400))
    player_elo[player1] = player1_elo + K * ((setsWon == 2) - expectedA)
    player_elo[player2] = player2_elo + K * ((setsWon != 2) - expectedB)
    print("new elos: ", player1, ":", player_elo[player1], player2, ":", player_elo[player2])

stats_sheet = sheet.get_worksheet(3)
all_values = stats_sheet.get_all_values()
for index, row in enumerate(all_values, start=1):  # start=1 to match Google Sheets row numbers
    name = row[1]
    if name in names and index == 14:
        stats_sheet.update_acell("C" + str(index), stats[name]["MP"])
        stats_sheet.update_acell("D" + str(index), stats[name]["W"])
        stats_sheet.update_acell("E" + str(index), stats[name]["L"])
        stats_sheet.update_acell("F" + str(index), stats[name]["GamesWon"])
        stats_sheet.update_acell("G" + str(index), stats[name]["GamesLost"])
        stats_sheet.update_acell("H" + str(index), stats[name]["GameDiff"])
        stats_sheet.update_acell("I" + str(index), 100 * stats[name]["GamesWon"] / (stats[name]["GamesWon"] + stats[name]["GamesLost"]))
        stats_sheet.update_acell("J" + str(index), 100 * stats[name]["W"] / stats[name]["MP"])
        stats_sheet.update_acell("K" + str(index), player_elo[name])
