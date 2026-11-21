#!/usr/bin/env python3
"""Baixa as fontes pixel de Daniel Linssen (m5x7 CC0; m3x6 e m6x11 grátis com crédito) para assets/fonts/."""
import re, json, os, urllib.request, urllib.parse, http.cookiejar
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'fonts'); os.makedirs(OUT, exist_ok=True)
for slug, nome in [('m5x7', 'm5x7.ttf'), ('m3x6', 'm3x6.ttf'), ('m6x11', 'm6x11.ttf')]:
    page = f'https://managore.itch.io/{slug}'
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar())); op.addheaders = [('User-Agent', 'Mozilla/5.0')]
    html = op.open(page).read().decode('utf8', 'ignore'); csrf = re.search(r'name="csrf_token" value="([^"]+)"', html).group(1)
    ups = list(dict.fromkeys(re.findall(r'data-upload_id="(\d+)"', html)))
    if not ups:
        dl = json.loads(op.open(urllib.request.Request(page + '/download_url', data=urllib.parse.urlencode({'csrf_token': csrf}).encode(), headers={'X-Requested-With': 'XMLHttpRequest'})).read())['url']
        dp = op.open(dl).read().decode('utf8', 'ignore'); csrf = re.search(r'name="csrf_token" value="([^"]+)"', dp).group(1); ups = list(dict.fromkeys(re.findall(r'data-upload_id="(\d+)"', dp)))
    q = urllib.parse.urlencode({'source': 'view_game', 'as_props': 1, 'after_download_lightbox': 'true'})
    r = json.loads(op.open(urllib.request.Request(f'{page}/file/{ups[0]}?{q}', data=urllib.parse.urlencode({'csrf_token': csrf}).encode(), headers={'X-Requested-With': 'XMLHttpRequest'})).read())
    open(os.path.join(OUT, nome), 'wb').write(op.open(r['url']).read()); print(nome)
