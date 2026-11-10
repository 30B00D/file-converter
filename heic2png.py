"""Decode a HEIC/HEIF photo (first image) to PNG. Usage: python3 -I heic2png.py in.heic out.png"""
import sys
import pillow_heif
from PIL import Image

Image.MAX_IMAGE_PIXELS = 128_000_000  # same pixel cap as the ImageMagick policy
pillow_heif.register_heif_opener()
with Image.open(sys.argv[1], formats=["HEIF"]) as im:
    im.load()
    im.save(sys.argv[2], "PNG")
