import json
import sys

input_file = r'c:\Users\rodol\Downloads\cargos.txt'

try:
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
except Exception as e:
    print(f"Error reading file: {e}")
    sys.exit(1)

charges = data['fleets_additional_charges']

whitelist = {
    3: [155, 154, 153, 152, 151, 120, 108, 69, 68, 65, 64, 63, 62, 61, 60, 53, 38, 37, 7],
    1: [136, 135, 131, 130, 52],
    4: [139, 138, 88, 2]
}

print("| Categoría | ID | Nombre | Brand 1 ($) | Brand 2 ($) | Brand 3 ($) |")
print("| :--- | :--- | :--- | :--- | :--- | :--- |")

# Sort by category and then by ID (descending as in user request)
flat_list = []
for c in charges:
    cat_id = c.get('additional_charge_category_id')
    c_id = c.get('id')
    if cat_id in whitelist and c_id in whitelist[cat_id]:
        flat_list.append(c)

# User's request order for Cat 3 is descending ID, Cat 1 is 136 down, Cat 4 is 139 down.
# Let's sort by category and then by index in user's list or just ID descending.
def get_sort_key(item):
    cat = item.get('additional_charge_category_id')
    cid = item.get('id')
    # Put category 3 first, then 1, then 4 as per request
    cat_order = {3: 0, 1: 1, 4: 2}
    return (cat_order.get(cat, 99), -cid)

flat_list.sort(key=get_sort_key)

for c in flat_list:
    cat_id = c.get('additional_charge_category_id')
    c_id = c.get('id')
    name = c.get('name')
    excluded = c.get('excluded_brands') or []
    prices = c.get('percent_amount') or {}
    
    brand_vals = []
    for b in ["1", "2", "3"]:
        if b in excluded:
            brand_vals.append("EXCLUIDO")
        else:
            p_obj = prices.get(b) or {}
            val = p_obj.get('amount')
            if val is None or val == "":
                brand_vals.append("---")
            else:
                brand_vals.append(val)
    
    print(f"| {cat_id} | {c_id} | {name} | {brand_vals[0]} | {brand_vals[1]} | {brand_vals[2]} |")
