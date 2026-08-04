import re

with open('public/bubble-explosion.svg', 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
def replace_ellipse(match):
    global count
    count += 1
    radii = [1.5, 2.5, 3.5]
    r = radii[count % 3]
    tag = match.group(0)
    tag = re.sub(r'rx="[^"]+"', f'rx="{r}"', tag)
    tag = re.sub(r'ry="[^"]+"', f'ry="{r}"', tag)
    return tag

new_content = re.sub(r'<ellipse[^>]+>', replace_ellipse, content)

with open('public/bubble-explosion.svg', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f'Successfully updated {count} ellipses in public/bubble-explosion.svg to 1.5~3.5px!')
