import re

file_path = r'D:\Kuliah\LIDM\assets\files\gen_sumatif.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Hilangkan teks awalan
content = content.replace('(Pilihan Ganda Kompleks) ', '')
content = content.replace('(Pilihan Benar Salah) ', '')

# 2. Hilangkan juga kalimat instruksi bawaan di akhir pertanyaan (agar tidak dobel dengan label)
content = content.replace(' Pilih semua pernyataan yang benar:', '')
content = content.replace(' Pilihlah pernyataan yang benar!', '')

# 3. Ubah label HTML
old_label = """<span x-show="soals[currentIndex].type !== 'pg'" class="inline-block mt-2 text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">Pilih semua jawaban yang benar (Checkbox)</span>"""

new_labels = """<span x-show="soals[currentIndex].type === 'pgk'" class="inline-block mt-2 text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">Mana sajakah hasil yang sesuai?</span>
                        <span x-show="soals[currentIndex].type === 'bs'" class="inline-block mt-2 text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">Pilihlah pernyataan yang benar!</span>"""

content = content.replace(old_label, new_labels)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
