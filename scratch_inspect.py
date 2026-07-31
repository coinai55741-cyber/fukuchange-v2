import json, re

ts_code = open('src/gameData.ts', encoding='utf-8').read()
csv_data = open('data/quiz/穿搭小達人 - 出題架構.csv', encoding='utf-8').read()
csv_json = json.dumps(csv_data).replace('\\', '\\\\')

# Replace all imports ending in .csv?raw'
ts_code = re.sub(r"import\s+(\w+)\s+from\s+['\"][^'\"]+\.csv\?raw['\"]", r"const \1 = '';", ts_code)
ts_code = re.sub(r"const quizCsv = '';", f"const quizCsv = {csv_json};", ts_code)

open('scratch_test.ts', 'w', encoding='utf-8').write(ts_code)
print("scratch_test.ts created!")
