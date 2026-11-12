"""Rebuild staff-app-design.html from v3/ as one self-contained file.

Run from anywhere:  python3 design/mobile-redesign/bundle.py
The single file is generated. Edit v3/, then run this again.
"""
import base64, os, re
D = os.path.dirname(os.path.abspath(__file__)); V = os.path.join(D, 'v3')
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
mark = 'data:image/svg+xml;base64,' + b64(os.path.join(D, 'assets', 'mark.svg'))
css = open(os.path.join(V, 'style.css')).read() + '\n' + open(os.path.join(V, 'motion.css')).read()
css = re.sub(r'url\(\.\./assets/fonts/([\w-]+\.woff2)\)', lambda m: 'url(data:font/woff2;base64,' + b64(os.path.join(D, 'assets', 'fonts', m.group(1))) + ')', css)
js = ''.join(open(p).read() + '\n' for p in [os.path.join(D, 'assets', 'icons.js')] + [os.path.join(V, f) for f in ('i18n.js', 'data.js', 'views.js', 'app.js')])
js = js.replace('../assets/mark.svg', mark)
assert '../assets' not in css + js, 'an asset path was not inlined'
html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Hygene Ops staff app design</title>
<link rel="icon" href="{mark}">
<style>{css}</style>
</head>
<body>
<div id="stage"></div>
<script>{js.replace('</script>', '<\\/script>')}</script>
</body>
</html>
'''
out = os.path.join(D, 'staff-app-design.html')
open(out, 'w').write(html)
print(out, round(len(html) / 1024), 'KB')
