import json

whitelist = {
    3: [155, 154, 153, 152, 151, 120, 108, 69, 68, 65, 64, 63, 62, 61, 60, 53, 38, 37, 7],
    1: [136, 135, 131, 130, 52],
    4: [139, 138, 88, 2]
}

input_file = r'c:\Users\rodol\Downloads\cargos.txt'

with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

charges = data['fleets_additional_charges']

found_ids = []
for c in charges:
    cid = c.get('id')
    cat = c.get('additional_charge_category_id')
    found_ids.append((cid, cat))

print("Total IDs in file:", len(found_ids))
for cat, ids in whitelist.items():
    print(f"\nChecking Category {cat}:")
    for tid in ids:
        match = [f for f in found_ids if f[0] == tid]
        if match:
            print(f"ID {tid}: FOUND (Category in file: {match[0][1]})")
        else:
            print(f"ID {tid}: NOT FOUND")
