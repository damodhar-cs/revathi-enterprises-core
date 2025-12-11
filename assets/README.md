# Assets Folder

## Logo for Receipt/Invoice

Place your company logo in this folder as `logo.png` to include it in the Tax Invoice PDF.

### Requirements:
- **File name**: `logo.png`
- **Format**: PNG (recommended) or JPG
- **Recommended size**: 300x300 pixels (or similar square/rectangular ratio)
- **Max dimensions**: Will be automatically resized to 80x80 in the PDF

### How to Add:
1. Save your company logo as `logo.png`
2. Copy it to this folder: `/assets/logo.png`
3. Restart the backend server
4. Generate a new receipt - logo will appear on top right

### Position in Receipt:
- **Location**: Top right corner
- **Size**: 80x80 pixels
- **Alignment**: Right-aligned with company header

If the logo file is not found, the receipt will generate without it (no error will occur).

