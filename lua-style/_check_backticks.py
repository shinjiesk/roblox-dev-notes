import pathlib

fp = pathlib.Path('/Users/shinji/Library/CloudStorage/GoogleDrive-shinji@esaki.studio/マイドライブ/Google Shinji/ClaudeCodeChat/lua-style/notion-Roblox-Lua-Style-Guide-AI.md')
lines = fp.read_text(encoding='utf-8').splitlines()

in_code_block = False
found = []

for i, line in enumerate(lines, 1):
    stripped = line.rstrip()
    if stripped.startswith('```'):
        in_code_block = not in_code_block
        continue
    if in_code_block:
        continue
    if '`' in line:
        found.append((i, line.rstrip()))

print(f'Lines with backticks outside code blocks: {len(found)}')
for num, text in found:
    print(f'  L{num}: {text}')
