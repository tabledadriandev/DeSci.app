#!/usr/bin/env python3
"""
Convert PNG to ICO format with multiple sizes
"""
from PIL import Image
import sys
import os

def convert_png_to_ico(input_path, output_path):
    """Convert PNG to ICO with multiple sizes"""
    try:
        # Open the PNG image
        img = Image.open(input_path)
        
        # ICO sizes (Windows standard)
        sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
        
        # Create list of images at different sizes
        images = []
        for size in sizes:
            # Resize maintaining aspect ratio
            resized = img.resize(size, Image.Resampling.LANCZOS)
            images.append(resized)
        
        # Save as ICO
        img.save(output_path, format='ICO', sizes=[(img.width, img.height) for img in images])
        print(f"Successfully converted {input_path} to {output_path}")
        return True
    except Exception as e:
        print(f"Error converting to ICO: {e}")
        return False

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    input_path = os.path.join(project_root, "public", "tabledadrianlogo.PNG")
    output_path = os.path.join(project_root, "public", "icon.ico")
    
    if not os.path.exists(input_path):
        print(f"Error: Logo file not found at {input_path}")
        sys.exit(1)
    
    if convert_png_to_ico(input_path, output_path):
        print("ICO file created successfully!")
        sys.exit(0)
    else:
        sys.exit(1)

