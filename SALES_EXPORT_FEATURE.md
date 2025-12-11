# Sales Export Feature Documentation

## Overview

The Sales Export feature allows users to export sales data to an Excel file and receive it via email. The export respects all applied filters from the sales listing page, providing flexibility to export specific data sets.

## Features

1. **Filter-based Export**: Export respects current filters (branch, date range)
2. **Email Delivery**: Excel file is sent to specified email address
3. **Professional Excel Format**: Well-formatted Excel with headers, data, and summary
4. **Email Template**: Beautiful HTML email with export details
5. **User-friendly UI**: Modal dialog with export details and progress indicators

## User Flow

### 1. Navigate to Sales Page

- Go to the Sales page in the application
- View the sales listing with optional filters

### 2. Apply Filters (Optional)

- Click on "Filters" button
- Select branch, date range, or other filters
- Click "Apply" to apply the filters
- The listing updates to show filtered data

### 3. Export Sales Data

- Click on the green "Export" button (next to the Refresh button)
- A modal dialog appears showing:
  - Total records to be exported
  - Applied filters (if any)
  - Email input field

### 4. Enter Email and Export

- Enter the recipient email address
- Click "Export & Send" button
- Wait for the success message
- Check your email for the exported file

## Excel File Structure

### Sheet: "Sales Data"

#### Header Section
- Row 1: Title "Sales Export Report" (bold, size 16)
- Row 2: Generation timestamp
- Row 3: Applied filters (if any)

#### Data Section
Starting from Row 4 or 5 (depending on filters):

| Column | Description |
|--------|-------------|
| Receipt Number | Unique receipt identifier |
| Product Name | Name of the product |
| SKU | Stock Keeping Unit |
| Category | Product category |
| Brand | Product brand |
| Branch | Sales branch |
| Customer Name | Customer's full name |
| Customer Phone | Contact number |
| Customer Email | Email address |
| Customer Address | Full address |
| Customer City | City |
| Customer State | State |
| Customer Pincode | PIN code |
| Cost Price (₹) | Purchase/cost price |
| Selling Price (₹) | Actual selling price |
| Profit Margin (₹) | Profit earned |
| Payment Method | Payment type (Cash, UPI, etc.) |
| Sold By | Salesperson name |
| Color | Product color (if applicable) |
| RAM (GB) | RAM specification (if applicable) |
| Storage (GB) | Storage specification (if applicable) |
| Sale Date | Date and time of sale |
| Notes | Additional notes |

#### Summary Section
At the end of the data:
- Total Sales: Number of records
- Total Revenue: Sum of selling prices
- Total Profit: Sum of profit margins

### Formatting
- Header row: Bold white text on green background
- All cells: Bordered with thin lines
- Column widths: Auto-adjusted for readability
- Summary: Bold text for emphasis

## Email Details

### Email Structure

#### Subject
```
Sales Export Report - Revathi Enterprises
```

#### Body
Professional HTML email containing:
- Header with title and icon
- Welcome message
- Export details card:
  - Total records exported
  - Export date and time
  - Applied filters (if any)
- Attached file information
- Footer with automated message disclaimer

#### Attachment
- Excel file (.xlsx format)
- Filename format: `Sales_Export_YYYY-MM-DDTHH-MM-SS.xlsx`
- Contains all sales data with applied filters

### Email Sender
- From: Configured Gmail account (GMAIL_USER in .env)
- Reply-To: Same as sender

## API Endpoint

### POST `/api/sales/export`

Export sales data and send via email.

#### Request Body
```json
{
  "recipientEmail": "user@example.com",
  "branch": "Main Branch",      // optional
  "startDate": "2025-01-01",    // optional, ISO format
  "endDate": "2025-12-31"       // optional, ISO format
}
```

#### Response (Success)
```json
{
  "message": "Sales export has been sent to your email successfully",
  "recipientEmail": "user@example.com"
}
```

#### Response (Error)
```json
{
  "statusCode": 400,
  "message": "Failed to export sales to Excel: Error details",
  "error": "Bad Request"
}
```

#### Status Codes
- `200 OK`: Export successful
- `400 Bad Request`: Invalid input data
- `500 Internal Server Error`: Server error (email service, database, etc.)

## Frontend Implementation

### Components Modified

#### `SalesPage.tsx`
- Added export button with Download icon
- Added export modal dialog
- Added email input and validation
- Added loading states and success/error messages
- Integrated with export API

### State Management
```typescript
const [showExportModal, setShowExportModal] = useState(false)
const [recipientEmail, setRecipientEmail] = useState('')
const [isExporting, setIsExporting] = useState(false)
const [exportMessage, setExportMessage] = useState<{
  type: 'success' | 'error';
  text: string;
} | null>(null)
```

### Export Function
```typescript
const handleExport = async () => {
  // Validate email
  // Call export API with current filters
  // Show success/error message
  // Auto-close modal on success
}
```

## Backend Implementation

### New Files Created

1. **`src/mail/mail.service.ts`**
   - Email service using nodemailer
   - Gmail SMTP configuration
   - Send email with attachments
   - HTML email templates

2. **`src/mail/mail.module.ts`**
   - NestJS module for mail service
   - Exports MailService

3. **`src/sales/dto/export-sales.dto.ts`**
   - DTO for export request validation
   - Email validation

### Modified Files

1. **`src/sales/sales.module.ts`**
   - Import MailModule

2. **`src/sales/sales.controller.ts`**
   - Added POST `/export` endpoint
   - Request validation

3. **`src/sales/sales.service.ts`**
   - Added `exportSalesToExcel()` method
   - Excel generation with ExcelJS
   - Integration with MailService

## Dependencies Added

### Backend
```json
{
  "nodemailer": "^6.9.7",
  "exceljs": "^4.4.0",
  "@types/nodemailer": "^6.4.14"
}
```

### Why These Packages?

1. **nodemailer**: Industry-standard email sending library for Node.js
   - Supports multiple transport methods
   - Built-in support for Gmail SMTP
   - Attachment handling
   - HTML email support

2. **exceljs**: Powerful Excel file generation library
   - Create complex Excel files
   - Cell formatting and styling
   - Multiple sheets support
   - Read and write Excel files

## Configuration

### Environment Variables

Required in `.env` file:

```env
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

See `GMAIL_SMTP_SETUP.md` for detailed setup instructions.

## Error Handling

### Frontend
- Email validation before submission
- Loading states during export
- Success/error message display
- Auto-close modal on success
- Disabled state for export button when no data

### Backend
- Input validation with class-validator
- Try-catch blocks for error handling
- Detailed error logging
- User-friendly error messages

## Testing Checklist

### Frontend
- [ ] Export button visible and enabled when sales data exists
- [ ] Export button disabled when no data
- [ ] Modal opens on button click
- [ ] Export details show correct information
- [ ] Email validation works
- [ ] Loading state shows during export
- [ ] Success message displays correctly
- [ ] Error message displays on failure
- [ ] Modal closes after successful export

### Backend
- [ ] Export endpoint accessible
- [ ] Email validation works
- [ ] Excel file generated correctly
- [ ] All columns present in Excel
- [ ] Data formatted properly
- [ ] Summary section calculated correctly
- [ ] Email sent successfully
- [ ] Attachment received
- [ ] Filters applied correctly
- [ ] Error handling works

### Integration
- [ ] Export with no filters works
- [ ] Export with branch filter works
- [ ] Export with date range works
- [ ] Export with multiple filters works
- [ ] Email received within 1 minute
- [ ] Excel file opens correctly
- [ ] Data matches frontend display

## Performance Considerations

1. **Large Datasets**: For exports with thousands of records:
   - Consider adding pagination or limiting export size
   - Use streaming for large Excel files
   - Implement background job queue

2. **Email Service**: Gmail has daily limits:
   - Regular Gmail: 500 emails/day
   - Google Workspace: 2,000 emails/day
   - Monitor usage to avoid hitting limits

3. **Memory Usage**: Excel generation uses memory:
   - Current implementation loads all data into memory
   - For very large exports, consider streaming

## Future Enhancements

1. **Export Options**
   - Allow users to select specific columns
   - Multiple sheet support (by branch, category, etc.)
   - PDF export option

2. **Email Features**
   - Multiple recipient support
   - CC/BCC options
   - Custom email message

3. **Scheduling**
   - Scheduled exports (daily, weekly, monthly)
   - Automated reports
   - Email to multiple stakeholders

4. **Export History**
   - Track export history
   - Download previous exports
   - Export templates

5. **Data Formats**
   - CSV export
   - JSON export
   - XML export

## Support and Maintenance

### Logging
- Email sending success/failure logged
- Excel generation errors logged
- Export requests tracked

### Monitoring
- Monitor email service status
- Track export success rate
- Monitor Gmail daily limits

### Updates
- Keep nodemailer updated for security
- Update exceljs for new features
- Review and update email templates

## Troubleshooting

### Export button not working
- Check if sales data is loaded
- Verify API endpoint is accessible
- Check browser console for errors

### Email not received
- Check spam folder
- Verify Gmail SMTP configuration
- Check server logs for errors
- Verify daily sending limits not exceeded

### Excel file corrupted
- Check Excel generation logic
- Verify all data fields are properly formatted
- Check for special characters in data

### Slow export
- Check database query performance
- Optimize Excel generation
- Consider reducing data size or adding pagination

## Security Considerations

1. **Email Validation**: Prevent email injection attacks
2. **Rate Limiting**: Prevent abuse of export endpoint
3. **Authentication**: Ensure only authorized users can export
4. **Data Access**: Verify user has permission to export data
5. **File Size Limits**: Prevent memory exhaustion
6. **Sensitive Data**: Ensure compliance with data protection regulations

## Compliance

### Data Protection
- GDPR: Ensure user consent for data export
- Data minimization: Export only necessary data
- Secure transmission: Email encryption (TLS)

### Audit Trail
- Log who exported data
- Track what data was exported
- Record when exports occurred

## Conclusion

The Sales Export feature provides a powerful way to extract and share sales data. With proper configuration and monitoring, it offers a reliable solution for data reporting and analysis.

For setup instructions, see `GMAIL_SMTP_SETUP.md`.
For general application information, see `README.md`.

