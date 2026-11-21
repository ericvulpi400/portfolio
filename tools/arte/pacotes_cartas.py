#!/usr/bin/env python3
"""Pixel art dos pacotes e das molduras de carta, desenhada do zero na resolução real (sem IA).
Design inspirado nas referências do usuário (Higgsfield), redesenhado pixel a pixel na paleta do jogo.
Saída: assets/ui/pacote_*.png (36x56), assets/ui/carta_*.png (72x100) e uma prancha 4x para revisão.
uso: python3 tools/arte/pacotes_cartas.py
"""
import os
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'ui')
os.makedirs(OUT, exist_ok=True)
H = lambda s: tuple(int(s[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
# rampas (escuro -> claro), as mesmas de docs/DIRECAO_DE_ARTE.md
INK = H('#1a1420')
RP = {
    'prata': [H('#3d3a48'), H('#6e6a7a'), H('#9c98a8'), H('#c8c4d2'), H('#f0eef6')],
    'verde': [H('#123a1c'), H('#1f6a2e'), H('#2f9a40'), H('#4cc45a'), H('#9cf0a0')],
    'azul': [H('#10285a'), H('#1c4c9a'), H('#2c72d8'), H('#5aa2f4'), H('#b6dcff')],
    'roxo': [H('#26123e'), H('#40206a'), H('#5e3496'), H('#8458c0'), H('#bca0ea')],
    'ouro': [H('#4a2a08'), H('#8a5a12'), H('#d09a22'), H('#f2c840'), H('#fff0a0')],
    'pedra': [H('#2a2830'), H('#4c4a56'), H('#76727e'), H('#a4a0ac'), H('#d4d0da')],
    'madeira': [H('#2b1a12'), H('#5a3820'), H('#8a5a32'), H('#b37d45'), H('#e0b070')],
    'aco': [H('#2a2c36'), H('#545868'), H('#8a90a2'), H('#c0c6d4'), H('#f4f6fc')],
    'rubi': [H('#3a0a18'), H('#7a1430'), H('#c02848'), H('#ea5a70'), H('#ffb0c0')],
    'papel': [H('#5c4a32'), H('#8f7a56'), H('#c9b58a'), H('#e8dbb4'), H('#fbf3d8')],
    'noite': [H('#120e18'), H('#1e1828'), H('#2a2236'), H('#3a3048'), H('#52465e')],
}


class Canvas:
    def __init__(s, w, h): s.im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); s.p = s.im.load(); s.w, s.h = w, h
    def px(s, x, y, c):
        if 0 <= x < s.w and 0 <= y < s.h: s.p[x, y] = c
    def rect(s, x, y, w, h, c):
        for j in range(y, y + h):
            for i in range(x, x + w): s.px(i, j, c)
    def get(s, x, y): return s.p[x, y] if 0 <= x < s.w and 0 <= y < s.h else (0, 0, 0, 0)
    def outline(s, c=INK):  # contorno externo de 1 px em volta de tudo que é opaco
        pts = [(x, y) for y in range(s.h) for x in range(s.w) if s.p[x, y][3] == 0 and any(s.get(x + dx, y + dy)[3] and s.get(x + dx, y + dy) != c for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
        for x, y in pts: s.p[x, y] = c
    def stamp(s, bmp, x, y, pal):
        for j, row in enumerate(bmp):
            for i, ch in enumerate(row):
                if ch in pal: s.px(x + i, y + j, pal[ch])


# ---------------------------------------------------------------- pacotes
def pacote(cor, emblema, faixas=False):
    W, Hh = 36, 56
    c = Canvas(W, Hh); r = RP[cor]; pr = RP['prata']
    # corpo: levemente abaulado (34 de largura no meio, 32 nas pontas)
    for y in range(7, 49):
        bulge = 1 if 14 <= y <= 42 else 0
        x0, x1 = 2 - bulge, 33 + bulge
        for x in range(x0, x1 + 1):
            t = (x - x0) / (x1 - x0)
            col = r[3] if t < 0.12 else r[2] if t < 0.78 else r[1]
            c.px(x, y, col)
    # sombra das dobras perto das pontas
    for x in range(2, 34): c.px(x, 7, r[1]); c.px(x, 48, r[0])
    # brilho em arco no canto superior esquerdo
    for x, y in [(5, 13), (5, 12), (6, 11), (7, 10), (8, 10), (9, 10), (10, 10), (5, 14), (5, 15), (6, 12), (6, 13), (7, 11), (8, 11), (6, 14)]: c.px(x, y, r[4])
    # vinco vertical sutil
    for y in range(9, 47, 2): c.px(30, y, r[1])
    # serrilhado de prata em cima e embaixo
    for (y0, top) in ((0, True), (49, False)):
        for y in range(y0, y0 + 7):
            for x in range(1, 35):
                k = y - y0 if top else (y0 + 6 - y)
                if k == 0 and (x // 2) % 2 == 1: continue  # dentes
                col = pr[4] if (top and k == 1) else pr[3] if k <= 2 else pr[2] if k <= 4 else pr[1]
                if not top: col = pr[3] if k <= 1 else pr[2] if k <= 3 else pr[1]
                c.px(x, y, col)
        for x in range(1, 35): c.px(x, y0 + (6 if top else 0), pr[0])  # linha da costura
    if faixas:  # faixas onduladas douradas (pacote de colecionador)
        o = RP['ouro']
        for (yb, d) in ((11, 1), (42, -1)):
            for x in range(2, 34):
                yy = yb + (1 if (x // 6) % 2 else 0) * d
                c.px(x, yy, o[1]); c.px(x, yy + d, o[3]); c.px(x, yy + 2 * d, o[2])
    emblema(c, 18, 28)
    c.outline(INK)
    return c.im


EM_ESCUDO = [
    '....kkkkkkkk....',
    '..kkooooooookk..',
    '.koOOOOOOOOOOok.',
    '.koOddddssddOok.',
    '.koOddddsSddOok.',
    '.koOddkkkkkkOok.',
    '.koOddkhhhhkOok.',
    '.koOdddksSkdOok.',
    '..koOddksSkdOok.',
    '..koOddksSkOok..',
    '...koOdksSkOok..',
    '...kkoOksSkok...',
    '....kkoOkSkk....',
    '......kkkkk.....',
]
EM_ARCO = [
    '...........kkk...',
    '..kkk.....kwwk...',
    '.kbbbkk..kwwk....',
    '..kkbbbk.kak.....',
    '.....kbbkka......',
    '......kbkak......',
    '.......kakbk.....',
    '......kak.kbk....',
    '.....kak...kbk...',
    '....kak.....kbk..',
    '...kak......kbk..',
    '.kkfk.......kbk..',
    'kfffk......kbbk..',
    '.kfk.....kkbbk...',
    '..k......kbbk....',
    '..........kk.....',
]
EM_COROA = [
    '........kk........',
    '.......kook.......',
    'kk.....kOOk.....kk',
    'kok...kOOOOk...kok',
    'kOOk.kOOrrOOk.kOOk',
    'kOOOkOOOrrOOOkOOOk',
    'kOOOOOOOOOOOOOOOOk',
    'kOOOOOOOOOOOOOOOdk',
    '.kOOOOOOOOOOOOOdk.',
    '.kddddddddddddddk.',
    '.kOrOOOrOOOOrOOdk.',
    '.kkkkkkkkkkkkkkkk.',
]


def _layer(w, h):
    return Canvas(w, h)


def _paste(c, sub, x, y):
    for j in range(sub.h):
        for i in range(sub.w):
            if sub.p[i, j][3]: c.px(x + i, y + j, sub.p[i, j])


def em_escudo(c, cx, cy):
    o, a, n, m = RP['ouro'], RP['aco'], RP['noite'], RP['madeira']
    L = _layer(24, 26)
    for y in range(26):  # escudo: topo reto, laterais curvando até a ponta
        t = y / 25
        half = 11 if t < 0.45 else int(11 * (1 - ((t - 0.45) / 0.55) ** 1.6))
        for x in range(12 - half, 12 + half):
            edge = min(x - (12 - half), (12 + half - 1) - x, y)
            col = o[3] if edge == 0 else o[2] if edge == 1 else (n[3] if x < 12 else n[2])
            if edge == 0 and (x > 12 or y > 16): col = o[2]
            L.px(x, y, col)
    for y in range(2, 22): L.px(11, y, a[4] if y < 16 else a[3]); L.px(12, y, a[3]); L.px(13, y, a[2])  # lâmina
    for x in range(7, 18): L.px(x, 6, o[3]); L.px(x, 7, o[1])  # guarda
    for y in range(1, 6): L.px(12, y, m[3])  # cabo
    L.px(12, 0, o[4]); L.px(11, 0, o[3]); L.px(13, 0, o[2])  # pomo
    L.outline(INK); _paste(c, L, cx - 12, cy - 13)


def em_arco(c, cx, cy):
    m, a, w = RP['madeira'], RP['aco'], RP['papel']
    L = _layer(26, 26)
    import math
    for k in range(0, 200):  # arco de madeira (meia-lua) na diagonal
        t = -1.1 + 2.2 * k / 199
        x = 13 + 11 * math.cos(t + math.pi * 0.75); y = 13 - 11 * math.sin(t + math.pi * 0.75)
        L.px(round(x), round(y), m[3]); L.px(round(x) + 1, round(y) + 1, m[2])
    for k in range(0, 17): L.px(5 + k // 1 if False else 5 + k, 4 + k, w[2])  # corda
    for k in range(0, 22): L.px(3 + k, 22 - k, a[3] if k < 19 else a[4])  # flecha
    for d in range(3): L.px(22 - d, 2 + 0, a[4]); L.px(23, 1 + d, a[4])  # ponta
    L.px(24, 1, a[4]); L.px(21, 3, a[4]); L.px(22, 3, a[4])
    for d in range(3): L.px(2 + d, 21, RP['rubi'][3]); L.px(4, 23 - d, RP['rubi'][3])  # penas
    L.outline(INK); _paste(c, L, cx - 13, cy - 13)


def em_coroa(c, cx, cy):
    o, rx = RP['ouro'], RP['roxo']
    L = _layer(26, 20)
    peaks = [(3, 3), (13, 1), (23, 3)]
    for x in range(1, 25):
        d = min(abs(x - px) for px, _ in peaks)
        yv = min(py + abs(x - px) * 1.3 for px, py in peaks)
        y0 = int(min(yv, 9))
        for y in range(y0, 15):
            L.px(x, y, o[4] if y == y0 else o[3] if x < 13 else o[2])
    for px, py in peaks:  # bolinhas nas pontas
        for dx, dy in ((0, -2), (-1, -1), (0, -1), (1, -1)): L.px(px + dx, py + dy, o[4])
    for x in range(1, 25): L.px(x, 15, o[1]); L.px(x, 16, o[2]); L.px(x, 17, o[1])
    for gx in (6, 13, 20):
        L.px(gx, 11, rx[3]); L.px(gx, 12, rx[2]); L.px(gx - 1, 12, rx[2]); L.px(gx + 1, 12, rx[1]); L.px(gx, 13, rx[1])
    L.outline(INK); _paste(c, L, cx - 13, cy - 10)


# ---------------------------------------------------------------- molduras de carta
def moldura(nome, ramp, gema=None, verso=False):
    W, Hh = 72, 100
    c = Canvas(W, Hh); r = RP[ramp]
    # borda de 4 px com relevo: luz em cima/esquerda, sombra embaixo/direita, cantos chanfrados de 2 px
    for y in range(Hh):
        for x in range(W):
            if (x < 2 and y < 2 - x) or (x > W - 3 and y < x - (W - 3)) or (x < 2 and y > Hh - 3 + x) or (x > W - 3 and y > Hh - 3 + (W - 1 - x)): continue
            d = min(x, y, W - 1 - x, Hh - 1 - y)
            if d < 5:
                light = (x < y and x < W - 1 - x) or (y <= x and y < Hh - 1 - y and y < W - 1 - x)
                col = [r[1], r[3] if light else r[1], r[2], r[2] if light else r[1], r[0]][d]
                c.px(x, y, col)
    if verso:
        rx = RP['roxo']; o = RP['ouro']
        c.rect(5, 5, W - 10, Hh - 10, rx[2])
        for y in range(5, Hh - 5):  # padrão diagonal discreto
            for x in range(5, W - 5):
                if (x + y) % 8 == 0: c.px(x, y, rx[1])
        for x in range(9, W - 9): c.px(x, 9, o[2]); c.px(x, Hh - 10, o[2])
        for y in range(9, Hh - 9): c.px(9, y, o[2]); c.px(W - 10, y, o[2])
        estrela(c, W // 2, Hh // 2)
        for (x, y) in ((11, 11), (W - 15, 11), (11, Hh - 15), (W - 15, Hh - 15)): canto(c, x, y)
        losango(c, W // 2, 4, 'ouro'); losango(c, W // 2, Hh - 5, 'ouro')
    else:
        # janela da arte e plaquinha do nome
        c.rect(5, 5, W - 10, Hh - 10, r[1])
        c.rect(6, 8, W - 12, 64, RP['noite'][2])
        for x in range(6, W - 6): c.px(x, 8, RP['noite'][0]); c.px(x, 71, r[3])
        for y in range(8, 72): c.px(6, y, RP['noite'][0]); c.px(W - 7, y, r[3])
        p = RP['papel']
        for y in range(77, 93):
            ins = 3 if y in (77, 92) else 1 if y in (78, 91) else 0
            for x in range(10 + ins, W - 10 - ins): c.px(x, y, p[3] if y < 85 else p[2])
            c.px(10 + ins, y, p[1]); c.px(W - 11 - ins, y, p[1])
        for x in range(13, W - 13): c.px(x, 77, p[1]); c.px(x, 92, p[0]); c.px(x, 78, p[4])
        # ornamentos: botão no topo, laterais e cantos
        losango(c, W // 2, 3, gema or ramp, grande=True)
        for y in (40,): botao(c, 2, y, gema or ramp); botao(c, W - 3, y, gema or ramp)
        if gema:
            losango(c, W // 2, Hh - 4, gema, grande=True)
            for (x, y) in ((4, 4), (W - 5, 4), (4, Hh - 5), (W - 5, Hh - 5)): pedra(c, x, y, gema)
            for y in (40,): pedra(c, 2, y, gema); pedra(c, W - 3, y, gema)
        else:
            for (x, y, fx, fy) in ((7, 9, 1, 1), (W - 8, 9, -1, 1), (7, 70, 1, -1), (W - 8, 70, -1, -1)):
                for d in range(5): c.px(x + d * fx, y, r[3]); c.px(x, y + d * fy, r[3])
                c.px(x + fx, y + fy, r[4])
        botao(c, W // 2, Hh - 3, ramp)
    c.outline(INK)
    return c.im


def losango(c, cx, cy, ramp, grande=False):
    r = RP[ramp]; R = 3 if grande else 2
    for dy in range(-R, R + 1):
        w = R - abs(dy)
        for dx in range(-w, w + 1):
            col = r[4] if (dx < 0 and dy < 0) else r[3] if dy <= 0 else r[2] if dx <= 0 else r[1]
            c.px(cx + dx, cy + dy, col)
    for dy in range(-R - 1, R + 2):
        w = R + 1 - abs(dy)
        for dx in (-w, w): c.px(cx + dx, cy + dy, INK)
    c.px(cx, cy - R - 1, INK); c.px(cx, cy + R + 1, INK)


def botao(c, cx, cy, ramp):
    r = RP[ramp]
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            if abs(dx) + abs(dy) > 3: continue
            c.px(cx + dx, cy + dy, r[4] if dx + dy < -1 else r[3] if dx + dy < 1 else r[1])


def pedra(c, cx, cy, ramp):
    r = RP[ramp]
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            if abs(dx) == 2 and abs(dy) == 2: continue
            c.px(cx + dx, cy + dy, r[3] if dx + dy < 0 else r[2] if dx + dy < 2 else r[1])
    c.px(cx - 1, cy - 1, r[4]); c.px(cx, cy - 1, r[4])
    for dy in range(-3, 4):
        for dx in range(-3, 4):
            if (abs(dx) == 3 or abs(dy) == 3) and not (abs(dx) == 3 and abs(dy) == 3) and abs(dx) + abs(dy) <= 5: c.px(cx + dx, cy + dy, INK)


def espiral(c, x, y, r, flip):
    pts = [(0, 0), (1, 0), (2, 0), (2, 1), (2, 2), (1, 2), (0, 2), (0, 3), (0, 4), (1, 5), (2, 5)]
    for dx, dy in pts: c.px(x + (-dx if flip else dx), y + dy, r[3])


def canto(c, x, y):
    o = RP['ouro']
    for dx, dy in ((0, 0), (1, 0), (2, 0), (3, 0), (0, 1), (0, 2), (0, 3), (1, 1)): c.px(x + dx, y + dy, o[3])


def estrela(c, cx, cy):
    o = RP['ouro']
    R, K = 18, 1.6
    pts = set()
    for dy in range(-R, R + 1):
        w = int((1 - abs(dy) / R) ** K * R * 0.75)
        for dx in range(-w, w + 1): pts.add((dx, dy))
    for dx in range(-R, R + 1):
        h = int((1 - abs(dx) / R) ** K * R * 0.75)
        for dy in range(-h, h + 1): pts.add((dx, dy))
    for dx, dy in pts:
        col = o[4] if (dx <= 0 and dy <= 0 and abs(dx) + abs(dy) < 6) else o[3] if (dx <= 0 or dy <= 0) else o[2]
        c.px(cx + dx, cy + dy, col)
    for dx, dy in pts:
        for ex, ey in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            if (dx + ex, dy + ey) not in pts: c.px(cx + dx + ex, cy + dy + ey, o[0])


if __name__ == '__main__':
    pacs = {'pacote_feira': pacote('verde', em_escudo), 'pacote_povo': pacote('azul', em_arco), 'pacote_colecionador': pacote('roxo', em_coroa, faixas=True)}
    cartas = {'carta_comum': moldura('comum', 'pedra'), 'carta_rara': moldura('rara', 'azul', gema='azul'), 'carta_lendaria': moldura('lendaria', 'ouro', gema='rubi'), 'carta_verso': moldura('verso', 'roxo', verso=True)}
    for n, im in {**pacs, **cartas}.items(): im.save(os.path.join(OUT, n + '.png'))
    # prancha 4x para revisão
    S = 4; bg = H('#2a2236')
    sheet = Image.new('RGBA', (4 * (72 + 12) * S + 12 * S, (56 + 100 + 30) * S), bg)
    for i, im in enumerate(pacs.values()):
        sheet.alpha_composite(im.resize((im.width * S, im.height * S), Image.NEAREST), ((12 + i * 60) * S, 8 * S))
    for i, im in enumerate(cartas.values()):
        sheet.alpha_composite(im.resize((im.width * S, im.height * S), Image.NEAREST), ((12 + i * 84) * S, 76 * S))
    sheet.save(os.path.join(OUT, '_prancha_4x.png'))
    print('ok', len(pacs) + len(cartas), 'sprites')
