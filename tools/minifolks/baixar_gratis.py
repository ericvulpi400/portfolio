#!/usr/bin/env python3
"""Baixa os 4 packs GRATUITOS do MiniFolks (LYASeeK) do itch.io e extrai em assets/minifolks/.
Os packs pagos do bundle você copia à mão (são seus, comprados). Nada disso vai para o Git.
uso: python3 tools/minifolks/baixar_gratis.py   (precisa de `pip install py7zr`)
"""
import re, json, os, io, sys, urllib.request, urllib.parse, http.cookiejar
PACKS = {'humans': 'minifhumans', 'villagers': 'minifvillagers', 'villagers2': 'minifvillagers2', 'forest_animals': 'miniffanimals'}
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'minifolks'))
try:
    import py7zr
except ImportError:
    sys.exit('instale py7zr: pip install py7zr')
for folder, slug in PACKS.items():
    page = f'https://lyaseek.itch.io/{slug}'
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar())); op.addheaders = [('User-Agent', 'Mozilla/5.0')]
    html = op.open(page).read().decode('utf8', 'ignore')
    csrf = re.search(r'name="csrf_token" value="([^"]+)"', html).group(1)
    ups = list(dict.fromkeys(re.findall(r'data-upload_id="(\d+)"', html)))
    if not ups:  # página "pague quanto quiser": abre a página de download
        dl = json.loads(op.open(urllib.request.Request(page + '/download_url', data=urllib.parse.urlencode({'csrf_token': csrf}).encode(), headers={'X-Requested-With': 'XMLHttpRequest'})).read())['url']
        dp = op.open(dl).read().decode('utf8', 'ignore'); csrf = re.search(r'name="csrf_token" value="([^"]+)"', dp).group(1)
        ups = list(dict.fromkeys(re.findall(r'data-upload_id="(\d+)"', dp)))
    for uid in ups:
        q = urllib.parse.urlencode({'source': 'view_game', 'as_props': 1, 'after_download_lightbox': 'true'})
        r = json.loads(op.open(urllib.request.Request(f'{page}/file/{uid}?{q}', data=urllib.parse.urlencode({'csrf_token': csrf}).encode(), headers={'X-Requested-With': 'XMLHttpRequest'})).read())
        data = op.open(r['url']).read(); out = os.path.join(ROOT, folder, uid)
        os.makedirs(out, exist_ok=True); py7zr.SevenZipFile(io.BytesIO(data)).extractall(out); print(folder, uid, len(data), 'bytes')
print('agora rode: node tools/minifolks/build_manifest.mjs')
