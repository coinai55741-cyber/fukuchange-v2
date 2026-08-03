import os
import sys
import pandas as pd

# Fix console encoding for Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)

excel_path = os.path.join(project_dir, 'data', 'i18n', 'dictionary_entries.xlsx')
csv_path = os.path.join(project_dir, 'data', 'i18n', 'dictionary_entries.csv')

if not os.path.exists(excel_path):
    print(f"Error: {excel_path} not found.")
    sys.exit(1)

try:
    print(f"Reading {excel_path}...")
    df = pd.read_excel(excel_path, sheet_name='詞典資料')
    
    # Save to CSV in UTF-8
    df.to_csv(csv_path, index=False, encoding='utf-8')
    print(f"Successfully exported {len(df)} rows to {csv_path}")

except Exception as e:
    print(f"Failed to convert Excel to CSV: {e}")
    sys.exit(1)
