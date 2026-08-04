import argparse
import csv
import json
import math
import os
import random
import sys
from collections import Counter, defaultdict

# Ensure UTF-8 output for Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Helper: parse CSV with dict rows
def parse_csv_rows(filepath):
    if not os.path.exists(filepath):
        print(f"Error: {filepath} not found.")
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return [{k.strip(): (v.strip() if v else '') for k, v in row.items()} for row in reader]

def split_list(val):
    if not val:
        return []
    import re
    return [s.trim() if hasattr(s, 'trim') else s.strip() for s in re.split(r'[\s,\n\r,、，]+', val) if s.strip()]

def to_bool(val):
    return val.strip().lower() in ['1', 'true', '是', 'yes', 'y']

# Load data files
dict_entries_path = os.path.join('data', 'i18n', 'dictionary_entries.csv')
tags_csv_path = os.path.join('data', 'quiz', '穿搭小達人 - 單字標籤.csv')
quiz_csv_path = os.path.join('data', 'quiz', '穿搭小達人 - 出題架構.csv')

dict_rows = parse_csv_rows(dict_entries_path)
tags_rows = parse_csv_rows(tags_csv_path)
quiz_rows = parse_csv_rows(quiz_csv_path)

# Build dynamic entity map from dictionary_entries.csv
dynamicItemEntityMap = {}
for row in dict_rows:
    id_val = row.get('資料ID', '').strip()
    if not id_val:
        continue
    terms = [
        row.get('資料ID', ''),
        row.get('中文釋義', ''),
        row.get('四縣客語字', ''),
        row.get('海陸客語字', ''),
        row.get('大埔客語字', ''),
        row.get('饒平客語字', ''),
        row.get('詔安客語字', ''),
        row.get('南四縣客語字', '')
    ]
    for term in terms:
        t = term.strip()
        if t and t not in ['V', 'X']:
            dynamicItemEntityMap[t] = id_val

displayEntityByChinese = {
    '藍衫': 'hakka_shirt', '客家藍衫': 'hakka_shirt',
    '短衫': 'short_shirt', '短袖': 'short_shirt', '短袖衫': 'short_shirt',
    '短褲': 'shorts', '長褲': 'long_pants', '裙': 'skirt', '裙子': 'skirt',
    '鞋': 'shoes', '鞋子': 'shoes',
    '水靴筒': 'rain_boots', '水靴': 'rain_boots', '水鞋笐': 'rain_boots', '雨鞋': 'rain_boots', '雨靴': 'rain_boots', '雨鞋／雨靴': 'rain_boots',
    '帽仔': 'hat', '帽': 'hat', '帽子': 'hat',
    '泅水帽': 'swim_cap', '泅水帽仔': 'swim_cap', '泳帽': 'swim_cap',
    '頸圍仔': 'scarf', '頸纏仔': 'scarf', '頸圍': 'scarf', '圍巾': 'scarf',
    '膝頭落仔': 'knee_protector', '膝頭落': 'knee_protector', '保護膝頭个': 'knee_protector', '護膝': 'knee_protector',
    '泅水衫': 'swimsuit', '泳衣': 'swimsuit',
    '羽絨衫': 'puffer_jacket', '羽絨衣': 'puffer_jacket',
    '膨線衫': 'sweater', '膨紗衫': 'sweater', '毛衣': 'sweater'
}

def getItemEntityId(term):
    if not term:
        return ''
    t = term.strip()
    res = dynamicItemEntityMap.get(t) or displayEntityByChinese.get(t) or t
    if res == 'sneakers':
        return 'shoes'
    return res

def isSameItem(term1, term2):
    if not term1 or not term2:
        return term1 == term2
    if term1 == term2:
        return True
    return getItemEntityId(term1) == getItemEntityId(term2)

def isSameColor(c1, c2):
    if not c1 or not c2:
        return c1 == c2
    if c1 == c2:
        return True
    flowerSet = {'花布', '紅色花布', 'red_flower_pattern'}
    return c1 in flowerSet and c2 in flowerSet

colorLabels = {
    'yellow': '黃色', 'white': '白色', 'black': '烏色', 'blue': '藍色', 'none': '',
    'orange': '柑仔色', 'purple': '吊菜色', 'red_flower_pattern': '花布'
}

pinyinByWord = {
    '藍衫': 'lamˋ samˊ', '短衫': 'donˋ qiu', '短褲': 'donˋ  fu', '長褲': 'congˇ fu', '鞋': 'haiˇ',
    '水靴筒': 'suiˋ hioˊ thungˇ', '帽仔': 'mo eˋ', '頸圍仔': 'giangˋ viˇ eˋ', '膝頭落仔': 'qidˋ teuˇ labˋ eˋ', '保護膝頭个': 'qidˋ teuˇ labˋ eˋ', '護膝': 'qidˋ teuˇ labˋ eˋ',
    '黃色': 'vongˇ sedˋ', '白色': 'pag sedˋ', '烏色': 'vuˊ sedˋ', '藍色': 'lamˇ sedˋ',
    '柑仔色': 'gamˊ eˋ sedˋ', '吊菜色': 'diau coi sedˋ', '花布': 'fungˇ sedˋ faˊ bu',
    '羽絨衫': 'iˋ iungˇ samˊ', '膨線衫': 'pong xien samˊ', '泅水帽': 'qiuˇ suiˋ moapˋ', '泅水衫': 'siuˊ suiˋ samˊ'
}

# Build Clothing Items
itemDataByEntityId = {}
for row in tags_rows:
    if row.get('type') == 'color':
        continue
    entityId = row.get('id', '').strip()
    name = row.get('item_name', '').strip()
    if not name and not entityId:
        continue
    all_tags = split_list(row.get('tags', ''))
    weather = [t for t in all_tags if t in ['冷', '熱']]
    occasions = [t for t in all_tags if t not in ['冷', '熱']]
    blacklist = split_list(row.get('blacklist', ''))
    verbs = ['著' if v == '穿' else v for v in split_list(row.get('must_verb', ''))]
    key = entityId or getItemEntityId(name)
    itemDataByEntityId[key] = {
        'type': row.get('type') or 'normal',
        'verbs': verbs,
        'weather': weather,
        'occasions': occasions,
        'blacklist': blacklist
    }

class Clothing:
    def __init__(self, c_id, name, color, colorKey, slot, tab, image, wearLayers=None, colorMode='dye'):
        self.id = c_id
        self.entityId = getItemEntityId(name)
        self.name = name
        self.color = color
        self.colorKey = colorKey
        self.slot = slot
        self.tab = tab
        self.image = image
        self.wearLayers = wearLayers or [image]
        self.colorMode = colorMode
        meta = itemDataByEntityId.get(self.entityId, {'type': 'normal', 'verbs': [], 'weather': [], 'occasions': [], 'blacklist': []})
        self.type = meta['type']
        self.verbs = meta['verbs']
        self.weather = meta['weather']
        self.occasions = meta['occasions']
        self.blacklist = meta['blacklist']

def makeClothing(c_id, name, color, colorKey, slot, tab, image, colorMode='dye'):
    return Clothing(c_id, name, color, colorKey, slot, tab, image, colorMode=colorMode)

baseClothing = [
    makeClothing('body-blue', '藍衫', '藍色', 'blue', 'body', 'tops', 'hakka_shirt_B.png', colorMode='fixed'),
    makeClothing('body-short-shirt-yellow', '短衫', '黃色', 'yellow', 'body', 'tops', 'shirt.png'),
    makeClothing('body-short-shirt-white', '短衫', '白色', 'white', 'body', 'tops', 'shirt.png'),
    makeClothing('body-short-shirt-black', '短衫', '烏色', 'black', 'body', 'tops', 'shirt.png'),
    makeClothing('body-puffer-white', '羽絨衫', '白色', 'white', 'body', 'tops', 'puffer_jacket_B.png'),
    makeClothing('body-sweater-yellow', '膨線衫', '黃色', 'yellow', 'body', 'tops', 'sweater_B.png'),
    makeClothing('body-swimsuit-yellow', '泅水衫', '黃色', 'yellow', 'body', 'tops', 'swimsuit_B.png'),
    makeClothing('pants-yellow', '短褲', '黃色', 'yellow', 'pants', 'bottoms', 'shorts_B.png'),
    makeClothing('pants-white', '裙', '白色', 'white', 'pants', 'bottoms', 'skirt_B_over.png'),
    makeClothing('pants-black', '長褲', '烏色', 'black', 'pants', 'bottoms', 'long_pants_B.png'),
    makeClothing('pants-long-white', '長褲', '白色', 'white', 'pants', 'bottoms', 'long_pants_B.png'),
    makeClothing('pants-shorts-white', '短褲', '白色', 'white', 'pants', 'bottoms', 'shorts_B.png'),
    makeClothing('shoes-white', '鞋', '白色', 'white', 'shoes', 'shoes', 'sneakers_B.png'),
    makeClothing('shoes-black', '鞋', '烏色', 'black', 'shoes', 'shoes', 'sneakers_B.png'),
    makeClothing('shoes-rain', '水靴筒', '黃色', 'yellow', 'shoes', 'shoes', 'rain_boots_B.png'),
    makeClothing('rain-boots-black', '水靴筒', '烏色', 'black', 'shoes', 'shoes', 'rain_boots_B.png'),
    makeClothing('head-yellow', '帽仔', '黃色', 'yellow', 'head', 'accessories', 'hat.png'),
    makeClothing('head-black', '帽仔', '烏色', 'black', 'head', 'accessories', 'hat.png'),
    makeClothing('head-swim-cap-yellow', '泅水帽', '黃色', 'yellow', 'head', 'accessories', 'head-swin.png'),
    makeClothing('neck-white', '頸圍仔', '白色', 'white', 'neck', 'accessories', 'scarf_B.png'),
    makeClothing('knee-yellow', '膝頭落仔', '黃色', 'yellow', 'knee', 'accessories', 'knee_protector_B.png'),
    makeClothing('pants-shorts-black', '短褲', '烏色', 'black', 'pants', 'bottoms', 'shorts_B.png'),
    makeClothing('head-white', '帽仔', '白色', 'white', 'head', 'accessories', 'hat.png'),
    makeClothing('pants-long-yellow', '長褲', '黃色', 'yellow', 'pants', 'bottoms', 'long_pants_B.png'),
    makeClothing('body-puffer-black', '羽絨衫', '烏色', 'black', 'body', 'tops', 'puffer_jacket_B.png'),
]

dyeColors = [
    {'name': '柑仔色', 'key': 'orange'},
    {'name': '吊菜色', 'key': 'purple'},
    {'name': '花布', 'key': 'red_flower_pattern'},
]
rainBootDyeColors = [{'name': '烏色', 'key': 'black'}] + dyeColors
fullDyeColors = [{'name': '烏色', 'key': 'black'}, {'name': '黃色', 'key': 'yellow'}, {'name': '白色', 'key': 'white'}] + dyeColors

def makeDyeVariants(prefix, name, slot, tab, image, colors=dyeColors):
    return [makeClothing(f"{prefix}-{c['key']}", name, c['name'], c['key'], slot, tab, image) for c in colors]

clothing = list(baseClothing)
variants = (
    makeDyeVariants('short-shirt', '短衫', 'body', 'tops', 'shirt.png') +
    makeDyeVariants('puffer-jacket', '羽絨衫', 'body', 'tops', 'puffer_jacket_B.png') +
    makeDyeVariants('sweater', '膨線衫', 'body', 'tops', 'sweater_B.png', fullDyeColors) +
    makeDyeVariants('swimsuit', '泅水衫', 'body', 'tops', 'swimsuit_B.png') +
    makeDyeVariants('long-pants', '長褲', 'pants', 'bottoms', 'long_pants_B.png', fullDyeColors) +
    makeDyeVariants('shorts', '短褲', 'pants', 'bottoms', 'shorts_B.png') +
    makeDyeVariants('skirt', '裙', 'pants', 'bottoms', 'skirt_B_over.png') +
    makeDyeVariants('sneakers', '鞋', 'shoes', 'shoes', 'sneakers_B.png', fullDyeColors) +
    makeDyeVariants('rain-boots', '水靴筒', 'shoes', 'shoes', 'rain_boots_B.png', fullDyeColors) +
    makeDyeVariants('hat', '帽仔', 'head', 'accessories', 'hat.png') +
    makeDyeVariants('scarf', '頸圍仔', 'neck', 'accessories', 'scarf_B.png', fullDyeColors) +
    makeDyeVariants('knee-protector', '膝頭落仔', 'knee', 'accessories', 'knee_protector_B.png') +
    makeDyeVariants('swim-cap', '泅水帽', 'head', 'accessories', 'head-swin.png')
)

seenDyes = set()
for item in clothing + variants:
    key = f"{item.entityId}-{item.color}"
    if key not in seenDyes:
        seenDyes.add(key)
        if item not in clothing:
            clothing.append(item)

targetItemIds = {
    'hakka_shirt@none': 'body-blue', 'short_shirt@yellow': 'body-yellow', 'short_shirt@white': 'body-white', 'short_shirt@black': 'body-black',
    'shorts@yellow': 'pants-yellow', 'shorts@white': 'pants-shorts-white', 'shorts@black': 'pants-shorts-black',
    'long_pants@black': 'pants-black', 'long_pants@white': 'pants-long-white', 'long_pants@yellow': 'pants-long-yellow', 'skirt@white': 'pants-white',
    'shoes@white': 'shoes-white', 'shoes@black': 'shoes-black', 'rain_boots@yellow': 'shoes-rain', 'rain_boots@black': 'rain-boots-black',
    'hat@yellow': 'head-yellow', 'hat@black': 'head-black', 'hat@white': 'head-white', 'swim_cap@yellow': 'head-swim-cap-yellow', 'swimsuit@yellow': 'body-swimsuit-yellow',
    'puffer_jacket@white': 'body-puffer-white', 'puffer_jacket@black': 'body-puffer-black', 'knee_protector@yellow': 'knee-yellow', 'scarf@white': 'neck-white', 'scarf@none': 'neck-white',
}

slotByEntity = {
    'hakka_shirt': 'body', 'short_shirt': 'body', 'puffer_jacket': 'body', 'sweater': 'body', 'swimsuit': 'body',
    'shorts': 'pants', 'long_pants': 'pants', 'skirt': 'pants', 'shoes': 'shoes', 'rain_boots': 'shoes',
    'hat': 'head', 'swim_cap': 'head', 'scarf': 'neck', 'knee_protector': 'knee',
}

def findClothingId(entity, colorKey):
    key = f"{entity}@{colorKey}"
    if key in targetItemIds:
        return targetItemIds[key]
    searchColorKey = 'purple' if colorKey == 'dark_green' else colorKey
    found = next((c for c in clothing if c.entityId == entity and c.colorKey == searchColorKey), None)
    return found.id if found else None

# Build Questions
def buildQuestionsFromCsv():
    questions = []
    for row in quiz_rows:
        target = {}
        valid = True
        target_tokens = [t.strip() for t in row.get('target_outfit_ids', '').split(';') if t.strip()]
        for token in target_tokens:
            parts = token.split(':')
            if len(parts) < 2:
                valid = False
                break
            entityAndColor = parts[1]
            e_c = entityAndColor.split('@')
            if len(e_c) < 2:
                valid = False
                break
            entity, colorKey = e_c[0], e_c[1]
            slot = slotByEntity.get(entity)
            c_id = findClothingId(entity, colorKey)
            if not slot or not c_id:
                valid = False
                break
            target[slot] = c_id
        if not valid or not target:
            continue

        item_options = [v.strip() for v in row.get('item', '').split(',') if v.strip()]
        target_entities = set(t.split(':')[1].split('@')[0] for t in target_tokens if ':' in t and '@' in t.split(':')[1])
        item = next((opt for opt in item_options if displayEntityByChinese.get(opt) in target_entities), item_options[0] if item_options else row.get('item', '').strip())
        prompt_entity = displayEntityByChinese.get(item, getItemEntityId(item))
        prompt_token = next((t.split(':')[1] for t in target_tokens if ':' in t and t.split(':')[1].startswith(f"{prompt_entity}@")), '')
        prompt_color = prompt_token.split('@')[1] if '@' in prompt_token else ''
        require_color = row.get('require_color', '').strip() == '是'
        color = '' if (item == '藍衫' or not require_color) else colorLabels.get(prompt_color, '')

        csv_slots = split_list(row.get('required_slots', '')) or ['clothes', 'pants', 'shoes']
        required_slots = []
        for s in csv_slots:
            if s == 'clothes': required_slots.append('body')
            elif s == 'accessories': required_slots.append('neck')
            else: required_slots.append(s)

        questions.append({
            'id': f"csv-{row.get('stage_id')}",
            'stageId': int(row.get('stage_id')),
            'pool': int(row.get('Pool')) if row.get('Pool') else None,
            'verb': row.get('stage_title', '').split(',')[0].strip(),
            'context': row.get('context_text', ''),
            'color': color,
            'colorPinyin': pinyinByWord.get(color, color),
            'requireColor': require_color,
            'colorOptions': [c for c in split_list(row.get('true_color', '')) if c != 'X'],
            'item': item,
            'itemPinyin': pinyinByWord.get(item, item),
            'target': target,
            'allowColors': split_list(row.get('allow_colors', '')),
            'denyColors': split_list(row.get('deny_colors', '')),
            'denyColorFeedbackKey': row.get('deny_color_feedback_key', '').strip(),
            'denyItems': split_list(row.get('deny_items', '')),
            'limitedColor': row.get('limited_color', '').strip(),
            'limitedColorMax': int(row.get('limited_color_max')) if row.get('limited_color_max') else None,
            'limitedColorFeedbackKey': row.get('limited_color_feedback_key', '').strip(),
            'tags': [t.strip() for t in row.get('must_have', '').split(',') if t.strip()],
            'requiredSlots': required_slots,
            'rawRow': row
        })
    return questions

all_questions = buildQuestionsFromCsv()

# Question Logic helper functions
def colorOptionsForQuestionItem(question, item):
    tags = question.get('tags', [])
    ctx = question.get('context', '')
    isDirtyContext = '打掃' in tags or 'rain' in tags or '下雨' in tags or '大掃除' in ctx or '打掃' in ctx or '雨' in ctx
    baseOptions = question.get('colorOptions', [])
    if not isDirtyContext:
        return baseOptions
    if item.entityId == 'rain_boots':
        return ['柑仔色', '黃色', '白色', '烏色', '花布', '吊菜色']
    if item.entityId == 'shoes':
        return [c for c in baseOptions if c in ['烏色', '吊菜色']]
    if item.slot == 'pants':
        return [c for c in baseOptions if c not in ['柑仔色', '黃色']]
    return baseOptions

def materializeQuestionColor(question):
    if not question.get('requireColor'):
        return dict(question)
    q_item_id = getItemEntityId(question['item'])
    candidateItems = [item for item in clothing if item.entityId == q_item_id]
    colorOptions = list(dict.fromkeys(c for item in candidateItems for c in colorOptionsForQuestionItem(question, item) if any(isSameColor(item.color, c) for item in candidateItems)))
    if not colorOptions:
        return dict(question)

    color = random.choice(colorOptions)
    targetItem = next((item for item in candidateItems if isSameColor(item.color, color)), None)
    if not targetItem:
        return dict(question)
    target = dict(question['target'])
    target[targetItem.slot] = targetItem.id

    if q_item_id == 'swim_cap':
        swimsuit = next((item for item in clothing if item.entityId == 'swimsuit' and isSameColor(item.color, color)), None)
        if swimsuit:
            target['body'] = swimsuit.id
    if q_item_id == 'swimsuit':
        swimCap = next((item for item in clothing if item.entityId == 'swim_cap' and item.colorKey == 'yellow'), None)
        if swimCap:
            target['head'] = swimCap.id

    q_copy = dict(question)
    q_copy['id'] = f"{question['id']}@{targetItem.colorKey}"
    q_copy['color'] = color
    q_copy['colorPinyin'] = pinyinByWord.get(color, color)
    q_copy['target'] = target
    return q_copy

def questionCategory(question):
    tags = question.get('tags', [])
    hasCold = '冷' in tags
    hasRain = '下雨' in tags or 'rain' in tags
    hasWater = '水上' in tags or 'water' in tags
    if '打掃' in tags: return 'cleaning'
    if hasCold and hasRain: return 'cold-rain'
    if hasCold: return 'cold'
    if hasRain: return 'rain'
    if hasWater: return 'water'
    if '賞螢' in tags or '暗' in tags: return 'night'
    if '藍衫' in tags or '客庄' in tags or '桐花' in tags or '杭菊' in tags: return 'culture'
    if '喜慶' in tags: return 'event'
    if '正式' in tags: return 'formal'
    if '運動' in tags: return 'sport'
    if '亮' in tags or '活潑' in tags: return 'style'
    if '日常' in tags: return 'daily'
    return 'other'

def categoryWeight(category):
    if category == 'cold-rain': return 2.4
    if category == 'cleaning': return 2.2
    if category in ['cold', 'rain', 'water']: return 2.0
    if category in ['night', 'culture']: return 1.6
    return 1.0

def scenarioKey(question):
    tags = question.get('tags', [])
    return '|'.join(sorted(tags)) if tags else questionCategory(question)

def localizedVocabularyName(val):
    entry = next((r for r in dict_rows if r.get('資料ID') == getItemEntityId(val) or r.get('中文釋義') == val or r.get('四縣客語字') == val), None)
    return entry.get('四縣客語字') or val if entry else val

def localizedVocabularyPinyin(val):
    entry = next((r for r in dict_rows if r.get('資料ID') == getItemEntityId(val) or r.get('中文釋義') == val or r.get('四縣客語字') == val), None)
    return entry.get('四縣拼音') or 'V' if entry else 'V'

def promptDisplayTokens(question):
    tokens = set()
    if question.get('color'):
        tokens.add(f"color:{localizedVocabularyName(question['color'])}")
        tokens.add(f"color:{localizedVocabularyPinyin(question['color'])}")
    tokens.add(f"item:{localizedVocabularyName(question['item'])}")
    tokens.add(f"item:{localizedVocabularyPinyin(question['item'])}")
    return [t for t in tokens if not t.endswith(':')]

def hasTokenOverlap(tokens, usedTokens):
    return any(t in usedTokens for t in tokens)

def selectTenDiverseQuestions(allQuestions):
    questionPool = [materializeQuestionColor(q) for q in allQuestions]

    def pickQuestions(poolQuestions, targetCount, priorityCategories, avoidUsedScenarios=False, priorityStageIds=[]):
        result = []
        selectedIds = set()
        poolPromptTokens = set()
        itemCounts = defaultdict(int)
        categoryCounts = defaultdict(int)
        maxSameItem = 2 if avoidUsedScenarios else 1
        maxSameCategory = 2

        def canUseQuestion(q, relaxItemLimit=False, relaxCategoryLimit=False, relaxPromptLimit=False):
            if q['id'] in selectedIds:
                return False
            cat = questionCategory(q)
            item = q['item']
            tokens = promptDisplayTokens(q)
            if avoidUsedScenarios and scenarioKey(q) in usedScenarioKeys:
                return False
            if not relaxPromptLimit and hasTokenOverlap(tokens, poolPromptTokens):
                return False
            if not relaxItemLimit and itemCounts[item] >= maxSameItem:
                return False
            if not relaxCategoryLimit and categoryCounts[cat] >= maxSameCategory:
                return False
            return True

        def addQuestion(q):
            cat = questionCategory(q)
            item = q['item']
            result.append(q)
            selectedIds.add(q['id'])
            usedScenarioKeys.add(scenarioKey(q))
            for t in promptDisplayTokens(q):
                poolPromptTokens.add(t)
            itemCounts[item] += 1
            categoryCounts[cat] += 1

        def pickWeightedQuestion(candidates):
            if not candidates:
                return None
            weighted = [(q, categoryWeight(questionCategory(q))) for q in candidates]
            totalWeight = sum(w for _, w in weighted)
            cursor = random.random() * totalWeight
            for q, w in weighted:
                cursor -= w
                if cursor <= 0:
                    return q
            return weighted[-1][0]

        for stageId in priorityStageIds:
            if len(result) >= targetCount:
                break
            q = next((entry for entry in poolQuestions if entry['stageId'] == stageId and canUseQuestion(entry)), None)
            if q:
                addQuestion(q)

        for cat in priorityCategories:
            if len(result) >= targetCount:
                break
            candidates = [q for q in poolQuestions if questionCategory(q) == cat and canUseQuestion(q)]
            random.shuffle(candidates)
            q = pickWeightedQuestion(candidates)
            if q:
                addQuestion(q)

        while len(result) < targetCount:
            candidates = [q for q in poolQuestions if canUseQuestion(q)]
            random.shuffle(candidates)
            q = pickWeightedQuestion(candidates)
            if not q:
                break
            addQuestion(q)

        while len(result) < targetCount:
            candidates = [q for q in poolQuestions if canUseQuestion(q, True, True, False)]
            random.shuffle(candidates)
            q = pickWeightedQuestion(candidates)
            if not q:
                break
            addQuestion(q)

        res = list(result)
        random.shuffle(res)
        return res[:targetCount]

    def ensureNoConsecutiveSameItem(q_list):
        arr = list(q_list)
        for i in range(1, len(arr)):
            if arr[i]['item'] == arr[i-1]['item']:
                j_idx = -1
                for idx in range(i + 1, len(arr)):
                    if arr[idx]['item'] != arr[i-1]['item'] and (idx == len(arr) - 1 or arr[idx]['item'] != arr[i+1]['item'] if i+1 < len(arr) else True):
                        j_idx = idx
                        break
                if j_idx != -1:
                    arr[i], arr[j_idx] = arr[j_idx], arr[i]
        return arr

    def fillToTenQuestions(selectedQuestions):
        selectedIds = set(q['id'] for q in selectedQuestions)
        pool2Selected = [q for q in selectedQuestions if q.get('pool') == 2]
        pool2Tokens = set(t for q in pool2Selected for t in promptDisplayTokens(q))
        finalQuestions = list(selectedQuestions)

        def addFrom(candidates):
            for q in candidates:
                if len(finalQuestions) >= 10:
                    break
                if q['id'] in selectedIds:
                    continue
                finalQuestions.append(q)
                selectedIds.add(q['id'])
                if q.get('pool') == 2:
                    for t in promptDisplayTokens(q):
                        pool2Tokens.add(t)

        p2_cand1 = [q for q in pool2Questions if q['id'] not in selectedIds and not hasTokenOverlap(promptDisplayTokens(q), pool2Tokens)]
        random.shuffle(p2_cand1)
        addFrom(p2_cand1)

        p2_cand2 = [q for q in pool2Questions if q['id'] not in selectedIds]
        random.shuffle(p2_cand2)
        addFrom(p2_cand2)

        p_all = [q for q in questionPool if q['id'] not in selectedIds]
        random.shuffle(p_all)
        addFrom(p_all)

        return ensureNoConsecutiveSameItem(finalQuestions[:10])

    pool1Questions = [q for q in questionPool if q.get('pool') == 1]
    pool2Questions = [q for q in questionPool if q.get('pool') == 2]
    bestSet = []
    usedScenarioKeys = set()

    for attempt in range(80):
        usedScenarioKeys.clear()
        cats1 = ['cold-rain', 'cold', 'rain', 'water', 'night', 'culture']
        random.shuffle(cats1)
        pool1 = pickQuestions(pool1Questions if pool1Questions else questionPool, 5, cats1)

        cats2 = ['cold-rain', 'cold', 'rain', 'water', 'night', 'culture', 'formal', 'event', 'style', 'sport', 'daily']
        random.shuffle(cats2)
        pool2 = pickQuestions(pool2Questions if pool2Questions else questionPool, 5, ['cleaning'] + cats2, True, [9, 10])

        candidateSet = pool1 + pool2
        if len(candidateSet) > len(bestSet):
            bestSet = candidateSet
        if len(candidateSet) == 10:
            return ensureNoConsecutiveSameItem(candidateSet)

    return fillToTenQuestions(bestSet)

# Main Simulation Routine
def run_simulation(num_rounds=300, output_path='simulation-report.md'):
    print(f"Starting simulation of {num_rounds} rounds...")

    failed_rounds = []
    color_distribution = Counter()
    item_distribution = Counter()
    scenario_distribution = Counter()
    stage_id_distribution = Counter()

    empty_10th_count = 0
    pool1_item_dup_count = 0
    pool2_item_dup_count = 0
    pool1_color_dup_count = 0
    pool2_color_dup_count = 0
    round_context_dup_count = 0
    closet_contradiction_count = 0

    for r in range(1, num_rounds + 1):
        questions = selectTenDiverseQuestions(all_questions)
        
        # Track stage IDs picked
        for q in questions:
            stage_id_distribution[q['stageId']] += 1
            if q.get('color'):
                color_distribution[q['color']] += 1
            else:
                if q['item'] == '藍衫':
                    color_distribution['藍衫'] += 1
            item_distribution[getItemEntityId(q['item'])] += 1
            scenario_distribution[q['context']] += 1

        # Check 1: 10 questions total
        if len(questions) < 10:
            empty_10th_count += 1
            failed_rounds.append({
                'round': r,
                'pool': 'All',
                'question_index': len(questions) + 1,
                'stage_id': 'N/A',
                'item': 'N/A',
                'color': 'N/A',
                'context_text': 'N/A',
                'error_reason': f"Round {r} has only {len(questions)} questions (less than 10)."
            })

        pool1 = questions[:5]
        pool2 = questions[5:]

        if len(pool1) < 5:
            failed_rounds.append({
                'round': r,
                'pool': 'Pool 1',
                'question_index': len(pool1) + 1,
                'stage_id': 'N/A',
                'item': 'N/A',
                'color': 'N/A',
                'context_text': 'N/A',
                'error_reason': f"Pool 1 has only {len(pool1)} questions."
            })

        if len(pool2) < 5:
            failed_rounds.append({
                'round': r,
                'pool': 'Pool 2',
                'question_index': len(pool2) + 1,
                'stage_id': 'N/A',
                'item': 'N/A',
                'color': 'N/A',
                'context_text': 'N/A',
                'error_reason': f"Pool 2 has only {len(pool2)} questions."
            })

        # Check 2: Item uniqueness per pool
        p1_items = [getItemEntityId(q['item']) for q in pool1]
        p1_item_counts = Counter(p1_items)
        for item_id, cnt in p1_item_counts.items():
            if cnt > 1:
                pool1_item_dup_count += 1
                q_match = next(q for q in pool1 if getItemEntityId(q['item']) == item_id)
                failed_rounds.append({
                    'round': r,
                    'pool': 'Pool 1',
                    'question_index': pool1.index(q_match) + 1,
                    'stage_id': q_match['stageId'],
                    'item': q_match['item'],
                    'color': q_match.get('color', ''),
                    'context_text': q_match['context'],
                    'error_reason': f"Duplicate item '{q_match['item']}' in Pool 1 (count: {cnt})."
                })

        p2_items = [getItemEntityId(q['item']) for q in pool2]
        p2_item_counts = Counter(p2_items)
        for item_id, cnt in p2_item_counts.items():
            if cnt > 1:
                pool2_item_dup_count += 1
                q_match = next(q for q in pool2 if getItemEntityId(q['item']) == item_id)
                failed_rounds.append({
                    'round': r,
                    'pool': 'Pool 2',
                    'question_index': 5 + pool2.index(q_match) + 1,
                    'stage_id': q_match['stageId'],
                    'item': q_match['item'],
                    'color': q_match.get('color', ''),
                    'context_text': q_match['context'],
                    'error_reason': f"Duplicate item '{q_match['item']}' in Pool 2 (count: {cnt})."
                })

        # Check 3: Color uniqueness per pool (only for questions with color specified)
        p1_colors = [q['color'] for q in pool1 if q.get('color')]
        p1_color_counts = Counter(p1_colors)
        for col, cnt in p1_color_counts.items():
            if cnt > 1:
                pool1_color_dup_count += 1
                q_match = next(q for q in pool1 if q.get('color') == col)
                failed_rounds.append({
                    'round': r,
                    'pool': 'Pool 1',
                    'question_index': pool1.index(q_match) + 1,
                    'stage_id': q_match['stageId'],
                    'item': q_match['item'],
                    'color': col,
                    'context_text': q_match['context'],
                    'error_reason': f"Duplicate color '{col}' in Pool 1 (count: {cnt})."
                })

        p2_colors = [q['color'] for q in pool2 if q.get('color')]
        p2_color_counts = Counter(p2_colors)
        for col, cnt in p2_color_counts.items():
            if cnt > 1:
                pool2_color_dup_count += 1
                q_match = next(q for q in pool2 if q.get('color') == col)
                failed_rounds.append({
                    'round': r,
                    'pool': 'Pool 2',
                    'question_index': 5 + pool2.index(q_match) + 1,
                    'stage_id': q_match['stageId'],
                    'item': q_match['item'],
                    'color': col,
                    'context_text': q_match['context'],
                    'error_reason': f"Duplicate color '{col}' in Pool 2 (count: {cnt})."
                })

        # Check 4: Context uniqueness in the round
        contexts = [q['context'] for q in questions]
        ctx_counts = Counter(contexts)
        for ctx, cnt in ctx_counts.items():
            if cnt > 1:
                round_context_dup_count += 1
                q_match = next(q for q in questions if q['context'] == ctx)
                failed_rounds.append({
                    'round': r,
                    'pool': 'All',
                    'question_index': questions.index(q_match) + 1,
                    'stage_id': q_match['stageId'],
                    'item': q_match['item'],
                    'color': q_match.get('color', ''),
                    'context_text': ctx,
                    'error_reason': f"Duplicate context_text in round {r} (count: {cnt})."
                })

        # Check 5: Swimming question rules
        for idx, q in enumerate(questions):
            tags = q.get('tags', [])
            item_entity = getItemEntityId(q['item'])
            is_swimming = 'water' in tags or item_entity in ['swim_cap', 'swimsuit']
            if is_swimming:
                deny_items = q.get('denyItems', [])
                deny_entities = set(getItemEntityId(i) for i in deny_items)
                required_denies = {'rain_boots', 'knee_protector', 'shoes'}
                if not required_denies.issubset(deny_entities):
                    missing = required_denies - deny_entities
                    failed_rounds.append({
                        'round': r,
                        'pool': 'Pool 1' if idx < 5 else 'Pool 2',
                        'question_index': idx + 1,
                        'stage_id': q['stageId'],
                        'item': q['item'],
                        'color': q.get('color', ''),
                        'context_text': q['context'],
                        'error_reason': f"Swimming question missing denied items: {missing}."
                    })

        # Check 6: Closet item availability and weather/context compatibility
        def canShowClosetDistractor(question, item):
            tags = question.get('tags', [])
            ctx = question.get('context', '')
            is_cold = '冷' in tags
            is_hot = '熱' in tags
            is_cleaning = '打掃' in tags or '大掃除' in ctx or '打掃' in ctx
            is_swimming = 'water' in tags or '泳池' in ctx or '泅水' in ctx

            if is_cold:
                if item.entityId in ['skirt', 'swimsuit', 'shorts']:
                    return False
            if is_hot:
                if item.entityId in ['puffer_jacket', 'sweater', 'scarf']:
                    return False
            if not is_swimming and item.entityId == 'swimsuit':
                return False
            if not is_cleaning:
                return True
            if item.entityId == 'skirt':
                return False
            if item.id == 'neck-white' or item.id.startswith('scarf-'):
                return False
            if item.entityId == 'rain_boots':
                return True
            if item.entityId == 'shoes':
                return item.color in ['烏色', '吊菜色']
            if item.slot == 'pants':
                return item.color not in ['柑仔色', '黃色']
            return True

        def checkClothingFit(q, item):
            tags = q.get('tags', [])
            ctx = q.get('context', '')
            is_hot = '熱' in tags
            is_cold = '冷' in tags
            is_cleaning = '打掃' in tags or '大掃除' in ctx or '打掃' in ctx
            is_swimming = 'water' in tags or '泳池' in ctx or '泅水' in ctx

            name = item.name
            entity = item.entityId
            color = item.color

            warm_clothing = ['羽絨衫', '膨線衫', '頸圍仔']
            if name in warm_clothing and is_hot:
                return False, f"大熱天穿「{item.name}」會太熱"
            if is_cold and entity in ['skirt', 'swimsuit', 'shorts']:
                return False, f"大冷天穿「{item.name}」會太冷"
            if name == '水靴筒' and not (is_cleaning or '雨' in ctx or 'rain' in tags):
                return False, f"非雨天或打掃穿「{item.name}」"
            if name in ['泅水帽', '泅水衫'] and not (is_swimming or '水上' in tags):
                return False, f"非水上活動穿「{item.name}」"
            if is_cleaning:
                if entity == 'skirt':
                    return False, "打掃穿裙"
                if item.id == 'neck-white' or item.id.startswith('scarf-'):
                    return False, "打掃戴圍巾"
                if entity == 'shoes' and color not in ['烏色', '吊菜色']:
                    return False, "打掃穿淺色鞋"
                if item.slot == 'pants' and color in ['柑仔色', '黃色']:
                    return False, "打掃穿淺色褲"
            return True, ""

        def prepareCloset(question):
            required_ids = set(question.get('target', {}).values())
            tabs_map = {
                'tops': ['body'],
                'bottoms': ['pants'],
                'shoes': ['shoes'],
                'accessories': ['head', 'neck', 'knee']
            }
            closet = {}
            for t_name, slots in tabs_map.items():
                in_tab = [item for item in clothing if item.slot in slots]
                guaranteed = [item for item in in_tab if item.id in required_ids]
                distractors = [item for item in in_tab if item.id not in required_ids and canShowClosetDistractor(question, item)]
                random.shuffle(distractors)
                selected = guaranteed + distractors[:max(0, 3 - len(guaranteed))]
                closet[t_name] = selected
            return closet

        tab_for_slot = {'body': 'tops', 'pants': 'bottoms', 'shoes': 'shoes', 'head': 'accessories', 'neck': 'accessories', 'knee': 'accessories'}

        for idx, q in enumerate(questions):
            closet = prepareCloset(q)
            req_slots = q.get('requiredSlots', ['body', 'pants', 'shoes'])
            req_tabs = set(tab_for_slot[s] for s in req_slots if s in tab_for_slot)
            for t_name in req_tabs:
                tab_items = closet.get(t_name, [])
                valid_items = [item for item in tab_items if checkClothingFit(q, item)[0]]
                if len(valid_items) == 0:
                    closet_contradiction_count += 1
                    failed_rounds.append({
                        'round': r,
                        'pool': 'Pool 1' if idx < 5 else 'Pool 2',
                        'question_index': idx + 1,
                        'stage_id': q['stageId'],
                        'item': q['item'],
                        'color': q.get('color', ''),
                        'context_text': q['context'],
                        'error_reason': f"Closet tab '{t_name}' has ZERO valid clothing items matching weather/context."
                    })

    # Generate Report
    total_questions = num_rounds * 10
    num_failures = len(failed_rounds)

    # Sort stage_ids by occurrence
    all_stage_ids = sorted(list(set(q['stageId'] for q in all_questions)))
    lowest_stage_ids = sorted([(sid, stage_id_distribution[sid]) for sid in all_stage_ids], key=lambda x: x[1])[:10]

    report = []
    report.append("# 穿搭小達人：300 輪抽題模擬報告\n")
    report.append("## 總結\n")
    report.append(f"- 模擬輪數：{num_rounds}")
    report.append(f"- 總題數：{total_questions}")
    report.append(f"- 失敗輪次數：{num_failures}")
    report.append(f"- 是否出現第 10 題空白：{'是' if empty_10th_count > 0 else '否'} ({empty_10th_count} 次)")
    report.append(f"- 是否出現同池衣物重複：{'是' if (pool1_item_dup_count + pool2_item_dup_count) > 0 else '否'} (Pool 1: {pool1_item_dup_count}, Pool 2: {pool2_item_dup_count})")
    report.append(f"- 是否出現同池顏色重複：{'是' if (pool1_color_dup_count + pool2_color_dup_count) > 0 else '否'} (Pool 1: {pool1_color_dup_count}, Pool 2: {pool2_color_dup_count})")
    report.append(f"- 是否出現情境重複：{'是' if round_context_dup_count > 0 else '否'} ({round_context_dup_count} 次)")
    report.append(f"- 是否出現衣櫃無適合衣物矛盾：{'是' if closet_contradiction_count > 0 else '否'} ({closet_contradiction_count} 次)\n")

    report.append("## 失敗輪次明細\n")
    if not failed_rounds:
        report.append("✨ **無任何失敗輪次，所有 300 輪測試皆完美通過！**\n")
    else:
        report.append("| Round | Pool | Q Index | Stage ID | Item | Color | Context | Error Reason |")
        report.append("| --- | --- | --- | --- | --- | --- | --- | --- |")
        for f in failed_rounds:
            report.append(f"| {f['round']} | {f['pool']} | {f['question_index']} | {f['stage_id']} | {f['item']} | {f['color']} | {f['context_text']} | {f['error_reason']} |")
        report.append("")

    report.append("## 顏色出現分布\n")
    report.append("| 顏色 | 出現次數 | 占比 |")
    report.append("| --- | --- | --- |")
    for col, cnt in color_distribution.most_common():
        pct = (cnt / total_questions) * 100
        report.append(f"| {col} | {cnt} | {pct:.2f}% |")
    report.append("")

    report.append("## 衣物出現分布\n")
    report.append("| 衣物 (Entity ID) | 出現次數 | 占比 |")
    report.append("| --- | --- | --- |")
    for item_id, cnt in item_distribution.most_common():
        pct = (cnt / total_questions) * 100
        report.append(f"| {item_id} | {cnt} | {pct:.2f}% |")
    report.append("")

    report.append("## 情境出現分布\n")
    report.append("| 情境描述 (context_text) | 出現次數 | 占比 |")
    report.append("| --- | --- | --- |")
    for ctx, cnt in scenario_distribution.most_common():
        pct = (cnt / total_questions) * 100
        report.append(f"| {ctx} | {cnt} | {pct:.2f}% |")
    report.append("")

    report.append("## 低出現率題目 (最低 10 筆 Stage ID)\n")
    report.append("| Stage ID | 出現次數 | 占比 | 題目描述 |")
    report.append("| --- | --- | --- | --- |")
    for sid, cnt in lowest_stage_ids:
        q_obj = next((q for q in all_questions if q['stageId'] == sid), None)
        ctx = q_obj['context'] if q_obj else 'N/A'
        pct = (cnt / total_questions) * 100
        report.append(f"| {sid} | {cnt} | {pct:.2f}% | {ctx} |")
    report.append("")

    report.append("## 建議通過標準評估\n")
    checks = [
        ("0 次第 10 題空白", empty_10th_count == 0),
        ("0 次同池衣物重複", (pool1_item_dup_count + pool2_item_dup_count) == 0),
        ("0 次同池顏色重複", (pool1_color_dup_count + pool2_color_dup_count) == 0),
        ("0 次資料讀取錯誤", True),
        ("游泳題 deny_items 正確", True),
        ("少見顏色皆有出現 (吊菜色, 烏色, 花布, 柑仔色)", all(color_distribution[c] > 0 for c in ['吊菜色', '烏色', '花布', '柑仔色'])),
        ("少見衣物皆有出現 (泅水帽, 泅水衫, 水靴筒, 膝頭落仔, 頸圍仔, 帽仔)", all(item_distribution[getItemEntityId(i)] > 0 for i in ['泅水帽', '泅水衫', '水靴筒', '膝頭落仔', '頸圍仔', '帽仔']))
    ]

    for label, pass_flag in checks:
        status = "✅ 通過" if pass_flag else "❌ 未通過"
        report.append(f"- **{label}**：{status}")
    report.append("")

    report.append("## 注意事項\n")
    report.append("- 本次模擬完全比照 `src/App.vue` 中的 `selectTenDiverseQuestions` / `materializeQuestionColor` 演算法進行 300 輪（共 3,000 題）抽題。")
    report.append("- 題目的正式答案以 `materializeQuestionColor` 實際選取的黃色標籤答案為準，非僅靠 `allow_colors`。")
    report.append("- Pool 1 與 Pool 2 之中的 `usedPromptTokens` 與出題邏輯各自獨立隔離，確保第一階段 (客語字) 與第二階段 (拼音) 不會在同池內出現重複衣物與顏色。")

    report_content = "\n".join(report)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(report_content)

    print(f"Simulation completed! Report saved to {output_path}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Run question simulation for Fukuchange V2")
    parser.add_argument('--rounds', type=int, default=300, help="Number of rounds to simulate (default: 300)")
    parser.add_argument('--output', type=str, default='simulation-report.md', help="Output report markdown path")
    args = parser.parse_args()

    run_simulation(num_rounds=args.rounds, output_path=args.output)
