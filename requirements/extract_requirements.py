from pathlib import Path
from pypdf import PdfReader

reader = PdfReader(Path('TravelMind_Requirements_final_2.pdf'))
text = []
for i, page in enumerate(reader.pages, 1):
    p = page.extract_text() or ''
    text.append(f'--- PAGE {i} ---\n')
    text.append(p)
    text.append('\n\n')
Path('requirements_text.txt').write_text(''.join(text), encoding='utf-8')
print('done')
