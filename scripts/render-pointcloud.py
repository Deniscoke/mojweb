# -*- coding: utf-8 -*-
"""
Render a real point cloud (.ply) to a PNG.

Used to produce the Digital Space hero evidence from the RealityScan export.
Kept in the repo so the asset is reproducible and it is clear the image was
rendered from captured data rather than drawn.

  python scripts/render-pointcloud.py out.png 2000 35 -22
        args: output, width, yaw degrees, pitch degrees

Requires numpy + Pillow. Point SRC at the .ply you want to render.

This visualises the ACTUAL captured vertices from kasna.ply — it does not
synthesise or embellish anything. Points are projected orthographically and
splatted with a simple z-buffer so nearer points win.
"""
import numpy as np
from PIL import Image
import sys, os

SRC = r"C:/Users/Admin/Desktop/reality scan/kasna.ply"
OUT = sys.argv[1] if len(sys.argv) > 1 else "point_cloud.png"
W = int(sys.argv[2]) if len(sys.argv) > 2 else 1600
YAW = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
PITCH = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0

# ---- parse header -------------------------------------------------------
with open(SRC, 'rb') as f:
    header = b''
    while b'end_header' not in header:
        header += f.read(1024)
    hdr_end = header.index(b'end_header') + len(b'end_header\n')
    lines = header[:hdr_end].decode('ascii', 'ignore').splitlines()
    n_vert = 0
    props = []
    in_vertex = False
    for ln in lines:
        p = ln.split()
        if not p:
            continue
        if p[0] == 'element':
            in_vertex = (p[1] == 'vertex')
            if in_vertex:
                n_vert = int(p[2])
        elif p[0] == 'property' and in_vertex and p[1] != 'list':
            props.append((p[1], p[2]))

    print('vertices:', n_vert, 'props:', [p[1] for p in props])

    f.seek(hdr_end)
    dtype = np.dtype([(name, {'float': '<f4', 'uchar': 'u1', 'int': '<i4'}[t])
                      for t, name in props])
    data = np.fromfile(f, dtype=dtype, count=n_vert)

xyz = np.stack([data['x'], data['y'], data['z']], axis=1).astype(np.float32)

if 'red' in data.dtype.names:
    rgb = np.stack([data['red'], data['green'], data['blue']], axis=1).astype(np.float32)
    if rgb.max() <= 1.5:
        rgb *= 255.0
    rgb = np.clip(rgb, 0, 255).astype(np.uint8)
    print('colour range:', rgb.min(), rgb.max())
else:
    rgb = np.full((len(xyz), 3), 200, np.uint8)

# ---- trim outliers so the subject fills the frame -----------------------
lo = np.percentile(xyz, 0.5, axis=0)
hi = np.percentile(xyz, 99.5, axis=0)
keep = np.all((xyz >= lo) & (xyz <= hi), axis=1)
xyz, rgb = xyz[keep], rgb[keep]
print('after trim:', len(xyz))

xyz -= xyz.mean(axis=0)

# ---- orient: RealityScan exports Z-up; rotate to a viewing angle --------
def rot_x(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]], np.float32)

def rot_z(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]], np.float32)

# Z-up -> Y-up, then apply yaw/pitch
M = rot_x(np.radians(-90 + PITCH)) @ rot_z(np.radians(YAW))
p = xyz @ M.T

# ---- orthographic projection with z-buffer ------------------------------
x, y, z = p[:, 0], p[:, 1], p[:, 2]
span = max(x.max() - x.min(), y.max() - y.min())
scale = (W * 0.86) / span
H = W
px = ((x - x.mean()) * scale + W / 2).astype(np.int32)
py = ((-(y - y.mean())) * scale + H / 2).astype(np.int32)

inb = (px >= 0) & (px < W) & (py >= 0) & (py < H)
px, py, z, rgb = px[inb], py[inb], z[inb], rgb[inb]

order = np.argsort(-z)          # far first, near overwrites
px, py, rgb = px[order], py[order], rgb[order]

canvas = np.zeros((H, W, 3), np.uint8)
canvas[py, px] = rgb

# one-pixel dilate to close sampling gaps without inventing detail
filled = canvas.any(axis=2)
for dy, dx in ((0, 1), (1, 0), (1, 1)):
    shifted = np.zeros_like(canvas)
    shifted[dy:H, dx:W] = canvas[0:H - dy, 0:W - dx]
    gap = (~filled) & shifted.any(axis=2)
    canvas[gap] = shifted[gap]
    filled |= gap

Image.fromarray(canvas).save(OUT)
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
