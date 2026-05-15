import pdfplumber

pdf_path = r'D:\Kuliah\LIDM\assets\files\SOAL REVISI DIAGNOSTIK & UJIKOM.pdf'

with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        print(f"\n{'='*60}")
        print(f"PAGE {i+1}")
        print('='*60)
        
        # Extract words with color info
        words = page.extract_words(extra_attrs=['non_stroking_color', 'stroking_color'])
        
        # Group by approximate line position
        lines = {}
        for word in words:
            y = round(word['top'] / 5) * 5  # group by 5pt bands
            if y not in lines:
                lines[y] = []
            lines[y].append(word)
        
        for y in sorted(lines.keys()):
            line_words = sorted(lines[y], key=lambda w: w['x0'])
            line_text = ' '.join(w['text'] for w in line_words)
            
            # Check if any word has red color
            has_red = False
            for w in line_words:
                color = w.get('non_stroking_color')
                if color:
                    if isinstance(color, tuple):
                        # RGB: red dominant
                        if len(color) == 3 and color[0] > 0.5 and color[1] < 0.3 and color[2] < 0.3:
                            has_red = True
                        # CMYK: (0, 1, 1, 0) or similar = red
                        elif len(color) == 4 and color[1] > 0.7 and color[2] > 0.5 and color[0] < 0.2:
                            has_red = True
                    elif isinstance(color, (int, float)) and color < 0.3:
                        pass  # grayscale dark
            
            marker = ' [MERAH]' if has_red else ''
            print(f"{line_text}{marker}")
