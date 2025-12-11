# Receipt Generation Setup

## 1. Environment Variables Required

Add the following variables to your `.env` file:

```env
# Store Details (for Tax Invoice/Receipt Generation)
GST_NUMBER=29EVQPS7668K1Z5
STORE_ADDRESS=No-22/4, Ground Floor, Near Icon Hotel Mahadevapura, bangalore -48,Anandpura TC Palya main road Bangalore-560016
STORE_OWNER_MOBILE=9743598240
STORE_OWNER_EMAIL=purushotham170@gmail.com
STORE_STATE_ADDRESS=29-Karnataka
```

## 2. Company Logo Setup

### Add Your Logo:
1. Save your company logo as `logo.png`
2. Copy it to the `assets` folder in the project root
3. Path: `/assets/logo.png`
4. Restart the backend server

### Logo Requirements:
- **File name**: Must be `logo.png`
- **Format**: PNG (recommended) or JPG
- **Recommended size**: 300x300 pixels or similar square ratio
- **Position**: Top right corner of the invoice (auto-sized to 80x80)

**Note**: If logo file is not found, the receipt will generate without it (no error).

---

## 3. Receipt Format

The receipt generation now matches the exact format of your Tax Invoice with:

### Header Section:
- **Company Logo**: Top right corner (80x80 pixels) - from `/assets/logo.png`
- **Company Name**: Revathi Enterprises (bold, large font)
- **Store Address**: From `STORE_ADDRESS` env variable
- **Phone Number**: From `STORE_OWNER_MOBILE` env variable
- **Email**: From `STORE_OWNER_EMAIL` env variable
- **GSTIN**: From `GST_NUMBER` env variable
- **State**: From `STORE_STATE_ADDRESS` env variable
- **Horizontal divider line**

### Tax Invoice Title:
- Centered, bold, purple-colored heading

### Bill To Section:
- Customer name (uppercase)
- Contact number

### Invoice Details (Right Side):
- Invoice No. (auto-generated based on date + random number)
- Date (DD-MM-YYYY format)
- Time (12-hour format with AM/PM)

### Product Table:
- Purple header with columns: #, Item name, HSN/SAC, Quantity, Price/unit, GST, Amount
- Item name includes product title and IMEI/SKU number
- Total row with bold text

### GST Calculation:
- **Sub Total**: Price before GST (Total / 1.18)
- **SGST@9.0%**: 9% of sub total
- **CGST@9.0%**: 9% of sub total
- **Total**: Selling price (includes 18% GST)
- **Received**: Same as total
- **Balance**: ₹ 0.00

### Footer Section:
- **Amount in Words**: Auto-converted from total amount
- **Terms and Conditions**: "Thank you for doing business with us."
- **Authorized Signatory**: Placeholder for signature
- **For**: Revathi Enterprises

## API Endpoints

### Download Receipt
```
GET /sales/:id/receipt
```
Downloads the PDF receipt for a sale.

### Email Receipt
```
POST /sales/:id/receipt/email
Body: { "email": "customer@example.com" }
```
Sends the PDF receipt to the specified email address.

## Features

1. ✅ Professional Tax Invoice format
2. ✅ Company logo on top right corner
3. ✅ Automatic GST calculation (18% = 9% SGST + 9% CGST)
4. ✅ Invoice number auto-generation
5. ✅ Amount in words conversion (supports Indian numbering: Lakhs, Crores)
6. ✅ All store details from environment variables
7. ✅ Customer details from sale record
8. ✅ Purple-themed headers matching your design
9. ✅ Fixed column alignment (no overlapping amounts)
10. ✅ PDF generation with proper formatting
11. ✅ Email delivery with attachment

## Testing

1. **Add environment variables** to your `.env` file
2. **Add company logo** to `/assets/logo.png` (optional)
3. **Restart the backend** server
4. **Create a sale** or use an existing sale
5. **Test download**: Navigate to sale detail page and click "Print Receipt"
6. **Test email**: Click "Email Receipt" and enter customer email

## Troubleshooting

### Issue: Amount text is overlapping
**Solution**: ✅ Fixed with improved column positioning and right-aligned amounts

### Issue: Amount in words not showing correctly
**Solution**: ✅ Fixed with proper Indian numbering system (supports up to Crores)

### Issue: Logo not appearing
**Solution**: 
- Ensure logo file is named `logo.png` (not `logo.jpg` or other)
- Check file location: `/assets/logo.png` (in project root)
- Restart backend server after adding logo
- Check logs for logo loading errors

### Issue: GST calculation seems wrong
**Solution**: 
- GST is calculated backwards from selling price
- Formula: Sub Total = Selling Price / 1.18
- SGST = Sub Total × 9%
- CGST = Sub Total × 9%
- Total = Selling Price (already includes 18% GST)

## Sample Output

The generated PDF will match the exact format shown in your tax invoice image with:
- Company header with all details
- Purple "Tax Invoice" title
- Customer billing information
- Product details with IMEI/SKU
- GST breakdown (SGST + CGST)
- Total amounts
- Terms and conditions
- Signature section

