import json

input_file = r'c:\Users\rodol\Downloads\cargos.txt'
with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

for c in data['fleets_additional_charges']:
    print(f"ID: {c['id']}, Cat: {c['additional_charge_category_id']}, Name: {c['name']}")
