#!/usr/bin/env python3
"""Pacotes e molduras de carta v2 — escala "grossa" da referência do usuário, desenhados do zero (sem IA).
Pacotes: 30x50 (1x na prateleira, 2x na abertura). Molduras: 36x50, exibidas em 2x (72x100) para casar o pixel
da moldura com o do MiniFolk, que entra em 2x na janela.
uso: python3 tools/arte/pacotes_cartas_v2.py
"""
import os, math
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'ui')
os.makedirs(OUT, exist_ok=True)
H = lambda s: tuple(int(s[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
INK = H('#1c1426')
RP = {
    'prata': [H('#4a4658'), H('#8a8698'), H('#b4b0c2'), H('#d8d6e2'), H('#f4f2fa')],
    'verde': [H('#145a24'), H('#1f7e34'), H('#2ea544'), H('#46c258'), H('#d6f4d0')],
    'azul': [H('#123c8c'), H('#1c56c0'), H('#2c78ec'), H('#4c98fa'), H('#d4e6ff')],
    'roxo': [H('#3a1a68'), H('#5a2c96'), H('#7438b8'), H('#8e54d4'), H('#d8c4f4')],
    'ouro': [H('#7a4a0c'), H('#b07812'), H('#e8a81c'), H('#f8cc38'), H('#fff0a0')],
    'pedra': [H('#4a4652'), H('#6e6a78'), H('#96929e'), H('#bcb8c4'), H('#e4e0ea')],
    'azulm': [H('#20408a'), H('#3062b0'), H('#4a84d0'), H('#6ea6ea'), H('#c4dcff')],
    'ardosia': [H('#2a3240'), H('#3c4656'), H('#566272'), H('#76828e'), H('#a4aeb8')],
    'aco': [H('#4a4e5c'), H('#7a8092'), H('#aab0c0'), H('#d6dae4'), H('#ffffff')],
    'madeira': [H('#3a2014'), H('#6a3c24'), H('#8a5434'), H('#a8704a'), H('#d09a6a')],
    'rubi': [H('#4a0a24'), H('#80143c'), H('#b8285a'), H('#e0507a'), H('#ffb0c8')],
    'papel': [H('#8a6a4a'), H('#b8987a'), H('#dcc4a4'), H('#f0dcc0'), H('#fff4e4')],
    'janela': [H('#160e1e'), H('#20152c'), H('#2a1c38'), H('#34244a'), H('#44325c')],
}


class C:
    def __init__(s, w, h): s.im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); s.p = s.im.load(); s.w, s.h = w, h
    def px(s, x, y, c):
        if 0 <= x < s.w and 0 <= y < s.h: s.p[x, y] = c
    def get(s, x, y): return s.p[x, y] if 0 <= x < s.w and 0 <= y < s.h else (0, 0, 0, 0)
    def rect(s, x, y, w, h, c):
        for j in range(y, y + h):
            for i in range(x, x + w): s.px(i, j, c)
    def outline(s, c=INK):
        pts = [(x, y) for y in range(s.h) for x in range(s.w) if s.p[x, y][3] == 0 and any(s.get(x + a, y + b)[3] and s.get(x + a, y + b) != c for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
        for x, y in pts: s.p[x, y] = c
    def paste(s, o, x, y):
        for j in range(o.h):
            for i in range(o.w):
                if o.p[i, j][3]: s.px(x + i, y + j, o.p[i, j])


# ---------------------------------------------------------------- emblemas
def escudo():
    o, sl, a, m = RP['ouro'], RP['ardosia'], RP['aco'], RP['madeira']
    L = C(18, 24); cx = 9; top = 4
    def half(y):
        t = y - top
        return 8 if t < 9 else round(8 * (1 - ((t - 9) / 11) ** 1.25))
    inside = lambda x, y: top <= y < top + 20 and cx - half(y) <= x < cx + half(y)
    for y in range(top, top + 20):
        for x in range(cx - half(y), cx + half(y)):
            d = min(x - (cx - half(y)), (cx + half(y) - 1) - x, y - top, (top + 19 - y) if half(y) < 3 else 9)
            if not all(inside(x + a_, y + b_) for a_, b_ in ((1, 0), (-1, 0), (0, 1), (0, -1))): col = o[2] if (x >= cx or y > top + 10) else o[3]
            elif not all(inside(x + a_ * 2, y + b_ * 2) for a_, b_ in ((1, 0), (-1, 0), (0, 1), (0, -1))): col = o[3] if x < cx else o[2]
            elif not all(inside(x + a_ * 3, y + b_ * 3) for a_, b_ in ((1, 0), (-1, 0), (0, 1), (0, -1))): col = o[1]
            else: col = sl[3] if x < cx else sl[1]
            L.px(x, y, col)
    for x in (1, 2, 15, 16): L.px(x, top - 1, o[3])  # pontas do topo
    for y in range(top + 1, top + 18): L.px(cx - 1, y, a[4]); L.px(cx, y, a[2])  # lâmina
    L.px(cx - 1, top + 18, a[2])
    for x in range(cx - 4, cx + 4): L.px(x, top, o[3]); L.px(x, top + 1, o[1])  # guarda
    L.px(cx - 4, top, o[4])
    for y in (1, 2, 3): L.px(cx - 1, y, m[3]); L.px(cx, y, m[2])  # cabo
    L.px(cx - 1, 0, o[4]); L.px(cx, 0, o[3])  # pomo
    L.outline(); return L


def arco():
    m, a, p = RP['madeira'], RP['aco'], RP['papel']
    L = C(26, 26)
    cx, cy, R = 3, 24, 21
    for k in range(400):  # arco de madeira: quarto de círculo, 3 px de espessura
        t = math.radians(-8 + 106 * k / 399)
        for dr, col in ((-1, m[1]), (0, m[2]), (1, m[3])):
            x = round(cx + (R + dr) * math.cos(t)); y = round(cy - (R + dr) * math.sin(t))
            L.px(x, y, col)
    for k in range(23):  # corda
        L.px(3 + k * 21 // 22 if False else round(3 + k * 21 / 22), round(3 + k * 21 / 22), p[2])
    for k in range(18):  # flecha diagonal
        x, y = 4 + k, 21 - k
        L.px(x, y, a[2]); L.px(x + 1, y, a[1])
    for (x, y) in ((20, 3), (21, 3), (22, 3), (22, 4), (22, 5), (21, 4), (20, 4), (21, 2), (23, 2), (23, 3), (22, 2)): L.px(x, y, a[4])  # ponta
    L.px(23, 1, a[4]); L.px(24, 1, a[4]); L.px(24, 2, a[3])
    for (x, y) in ((2, 21), (3, 21), (1, 22), (2, 22), (3, 23), (4, 23), (3, 24), (4, 24), (1, 20), (2, 20)): L.px(x, y, a[4])  # penas
    L.outline(); return L


COROA = [
    '..k.......kk.......k..',
    '.kOk.....kOOk.....kOk.',
    '.kOk.....kOOk.....kOk.',
    '.kOOk....kOOk....kOOk.',
    '.kOOOk..kOOOOk..kOOOk.',
    '.kOOOOkkOOOOOOkkOOOOk.',
    '.kOOOOOOOOggOOOOOOOOk.',
    '.kOOOOOOOggggOOOOOOOk.',
    '.kOOOOOOOOggOOOOOOOOk.',
    '.kOOOOOOOOOOOOOOOOOOk.',
    '.kddddddddddddddddddk.',
    '.kOOrOOOOOOOOOOOOrOOk.',
    '.kddddddddddddddddddk.',
    '..kkkkkkkkkkkkkkkkkk..',
]


def coroa():
    o, rx = RP['ouro'], RP['roxo']
    L = C(22, 14)
    for y, row in enumerate(COROA):
        for x, ch in enumerate(row):
            if ch == 'k': L.px(x, y, INK)
            elif ch == 'O': L.px(x, y, o[4] if (y <= 1 or (L.get(x, y - 1) == INK and x < 11)) else o[3] if x < 11 else o[2])
            elif ch == 'd': L.px(x, y, o[1])
            elif ch == 'g': L.px(x, y, rx[3] if (x < 11 and y < 8) else rx[1])
            elif ch == 'r': L.px(x, y, RP['rubi'][3])
    return L


# ---------------------------------------------------------------- pacote 30x50
def pacote(cor, emblema, faixas=False):
    W, Hh = 30, 50
    c = C(W, Hh); r = RP[cor]; pr = RP['prata']
    for y in range(6, 44):
        ins = 1 if y in (6, 43) else 0
        for x in range(ins, W - ins):
            col = r[3] if x < 2 else r[2] if x < W - 4 else r[1]
            if y in (6, 7): col = r[1] if x >= W - 4 else r[2]
            if y >= 41: col = r[1]
            c.px(x, y, col)
    for (x, y) in ((3, 12), (3, 11), (4, 10), (4, 9), (5, 9), (6, 8), (7, 8), (8, 8), (4, 11), (5, 10)): c.px(x, y, r[4])  # brilho em arco
    for (y0, top) in ((0, True), (44, False)):  # serrilhado de prata
        for k in range(6):
            y = y0 + k
            for x in range(W):
                if top and k == 0 and x % 3 == 2: continue
                if not top and k == 5 and x % 3 == 2: continue
                kk = k if top else 5 - k
                col = pr[3] if kk in (0, 1) else pr[4] if kk == 2 else pr[2] if kk == 3 else pr[1]
                if x >= W - 2: col = pr[1]
                c.px(x, y, col)
        sy = y0 + 5 if top else y0
        for x in range(W): c.px(x, sy, pr[0])
    if faixas:  # faixas douradas com borda em V e filete roxo, em cima e embaixo
        o = RP['ouro']
        for x in range(W):
            v = (15 - abs(x - 14.5)) // 4  # 0..3, mais fundo no meio
            yb = 10 + int(v)
            for y in range(6, yb): c.px(x, y, o[3] if x < W - 4 else o[2])
            pv = 10 + int((15 - abs(x - 1 - 14.5)) // 4) if x else yb
            for y in range(min(pv, yb), max(pv, yb) + 1): c.px(x, y, r[0]); c.px(x, y - 3, r[3])
            yt = 39 - int(v)
            for y in range(yt + 1, 44): c.px(x, y, o[2] if x < W - 4 else o[1])
            pt = 39 - int((15 - abs(x - 1 - 14.5)) // 4) if x else yt
            for y in range(min(pt, yt), max(pt, yt) + 1): c.px(x, y, r[0]); c.px(x, y + 3, r[3])
    e = emblema(); c.paste(e, (W - e.w) // 2, 25 - e.h // 2)
    c.outline(); return c.im


# ---------------------------------------------------------------- moldura 36x50 (exibida em 2x)
def moldura(ramp, gema=None, verso=False):
    W, Hh = 36, 50
    c = C(W, Hh); r = RP[ramp]
    rad = 3
    def dentro(x, y, inset=0, rr=rad):
        x0, y0, x1, y1 = inset, inset, W - 1 - inset, Hh - 1 - inset
        if not (x0 <= x <= x1 and y0 <= y <= y1): return False
        for cx_, cy_ in ((x0 + rr, y0 + rr), (x1 - rr, y0 + rr), (x0 + rr, y1 - rr), (x1 - rr, y1 - rr)):
            if (x < x0 + rr or x > x1 - rr) and (y < y0 + rr or y > y1 - rr):
                if abs(x - cx_) <= rr and abs(y - cy_) <= rr and (x - cx_) ** 2 + (y - cy_) ** 2 > rr * rr + 1: return False
        return True
    for y in range(Hh):
        for x in range(W):
            if not dentro(x, y): continue
            if not dentro(x, y, 1): col = r[2] if (y > Hh // 2 or x > W - 3) else r[3]
            elif not dentro(x, y, 2): col = r[3] if x < W - 3 and y < Hh - 3 else r[1]
            else: col = r[2]
            c.px(x, y, col)
    if verso:
        rx, o = RP['roxo'], RP['ouro']
        for y in range(3, Hh - 3):
            for x in range(3, W - 3): c.px(x, y, rx[1] if (x + y) % 6 else rx[0])
        for y in range(3, Hh - 3):
            for x in range(3, W - 3):
                if dentro(x, y, 3, 2) and not dentro(x, y, 4, 2): c.px(x, y, o[2] if y > Hh // 2 else o[3])
        for (x, y) in ((5, 5), (W - 6, 5), (5, Hh - 6), (W - 6, Hh - 6)):
            for dx, dy in ((0, 0), (1, 0), (0, 1), (-1, 0), (0, -1)): c.px(x + dx, y + dy, o[3])
        estrela(c, W // 2, Hh // 2, o)
        bolinha(c, W // 2, 2, 'ouro'); bolinha(c, W // 2, Hh - 3, 'ouro')
    else:
        j = RP['janela']
        for y in range(3, 33):  # janela com cantos arredondados
            for x in range(3, W - 3):
                if (x in (3, W - 4)) and (y in (3, 32)): continue
                c.px(x, y, j[2] if y > 4 else j[1])
        for x in range(4, W - 4): c.px(x, 3, j[0])
        for y in range(4, 32): c.px(3, y, j[0])
        p = RP['papel']
        for y in range(36, 45):  # plaquinha do nome: hexágono alongado
            ins = abs(y - 40) // 2
            for x in range(4 + ins, W - 4 - ins):
                c.px(x, y, p[4] if y == 37 else p[3] if y < 41 else p[2])
            c.px(4 + ins, y, r[0]); c.px(W - 5 - ins, y, r[0])
        for x in range(6, W - 6): c.px(x, 35, r[0]); c.px(x, 45, r[0])
        cor_orn = gema or ramp
        bolinha(c, W // 2, 1, cor_orn, grande=True)
        bolinha(c, 1, 18, cor_orn, grande=True); bolinha(c, W - 2, 18, cor_orn, grande=True)
        bolinha(c, W // 2, Hh - 2, cor_orn, grande=True)
        if gema:
            for (x, y) in ((3, 3), (W - 4, 3), (3, Hh - 4), (W - 4, Hh - 4)): bolinha(c, x, y, gema, grande=True)
        else:
            for (x, y, fx, fy) in ((4, 4, 1, 1), (W - 5, 4, -1, 1), (4, 31, 1, -1), (W - 5, 31, -1, -1)):
                for d in range(3): c.px(x + d * fx, y, r[3]); c.px(x, y + d * fy, r[3])
    c.outline()
    return c.im


def bolinha(c, cx, cy, ramp, grande=False):
    r = RP[ramp]; R = 2 if grande else 1
    for dy in range(-R, R + 1):
        for dx in range(-R, R + 1):
            if dx * dx + dy * dy > R * R + (1 if grande else 0): continue
            col = r[4] if (dx < 0 and dy < 0) or (dx == 0 and dy < 0 and not grande) else r[3] if dx + dy <= 0 else r[1]
            c.px(cx + dx, cy + dy, col)


def estrela(c, cx, cy, o):
    pts = set()
    for dy in range(-9, 10):
        w = int(round((1 - abs(dy) / 9) ** 2.4 * 7))
        for dx in range(-w, w + 1): pts.add((dx, dy))
    for dx in range(-9, 10):
        h = int(round((1 - abs(dx) / 9) ** 2.4 * 7))
        for dy in range(-h, h + 1): pts.add((dx, dy))
    for dx, dy in pts: c.px(cx + dx, cy + dy, o[4] if (dx < 0 and dy < 0 and -dx - dy < 5) else o[3] if (dx <= 0 or dy <= 0) else o[2])
    for dx, dy in pts:
        for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            if (dx + a, dy + b) not in pts: c.px(cx + dx + a, cy + dy + b, o[1])


if __name__ == '__main__':
    pacs = {'pacote_feira': pacote('verde', escudo), 'pacote_povo': pacote('azul', arco), 'pacote_colecionador': pacote('roxo', coroa, faixas=True)}
    molds = {'carta_comum': moldura('pedra'), 'carta_rara': moldura('azulm', gema='azulm'), 'carta_lendaria': moldura('ouro', gema='rubi'), 'carta_verso': moldura('roxo', verso=True)}
    for n, im in {**pacs, **molds}.items(): im.save(os.path.join(OUT, n + '.png'))
    S = 6; bg = H('#2a2236')
    sheet = Image.new('RGBA', ((4 * 40 + 8) * S, (50 + 50 + 16) * S), bg)
    for i, im in enumerate(pacs.values()): sheet.alpha_composite(im.resize((im.width * S, im.height * S), Image.NEAREST), ((6 + i * 38) * S, 4 * S))
    for i, im in enumerate(molds.values()): sheet.alpha_composite(im.resize((im.width * S, im.height * S), Image.NEAREST), ((6 + i * 40) * S, 60 * S))
    sheet.save(os.path.join(OUT, '_prancha_4x.png'))
    print('ok')
