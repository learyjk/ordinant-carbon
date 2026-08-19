#!/usr/bin/env python3
"""Generate favicon assets from ord-logo.png (hex mark only)."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "ord-logo.png"
ICON_CROP = (0, 0, 96, 148)
LIGHT_COLOR = (35, 31, 32, 255)
DARK_COLOR = (250, 247, 240, 255)  # matches site off-white, visible on dark tabs


def is_mark_pixel(r, g, b, a):
    return a > 10 and (r > 20 or g > 20 or b > 20)


def crop_icon():
    logo = Image.open(LOGO).convert("RGBA")
    return logo.crop(ICON_CROP)


def pad_square(image):
    w, h = image.size
    side = max(w, h)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    offset = ((side - w) // 2, (side - h) // 2)
    canvas.paste(image, offset, image)
    return canvas


def recolor(image, rgb):
    out = Image.new("RGBA", image.size, (0, 0, 0, 0))
    px_in = image.load()
    px_out = out.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = px_in[x, y]
            if is_mark_pixel(r, g, b, a):
                px_out[x, y] = (rgb[0], rgb[1], rgb[2], a)
    return out


def save_png(image, size, path):
    resized = image.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(path, format="PNG", optimize=True)


def main():
    icon = pad_square(crop_icon())
    light = icon
    dark = recolor(icon, DARK_COLOR)

    save_png(light, 16, ROOT / "favicon-16x16.png")
    save_png(light, 32, ROOT / "favicon-32x32.png")
    save_png(dark, 16, ROOT / "favicon-16x16-dark.png")
    save_png(dark, 32, ROOT / "favicon-32x32-dark.png")
    save_png(light, 180, ROOT / "apple-touch-icon.png")

    ico = light.resize((32, 32), Image.Resampling.LANCZOS)
    ico.save(ROOT / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32)])

    print("Wrote favicon-16x16.png, favicon-32x32.png")
    print("Wrote favicon-16x16-dark.png, favicon-32x32-dark.png")
    print("Wrote apple-touch-icon.png, favicon.ico")


if __name__ == "__main__":
    main()
