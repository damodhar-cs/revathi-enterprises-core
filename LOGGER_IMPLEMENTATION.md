# Logger Service Implementation

## Overview

A centralized logging service has been implemented throughout the application to provide structured, detailed logging for all business logic operations and errors.

## Files Created

### 1. `src/common/logger/logger.service.ts`
Centralized logger service with structured logging capabilities:

**Features:**
- Structured log data with context, errors, and metadata
- Support for different log levels (log, error, warn, debug)
- Method entry/exit logging
- HTTP request/response logging
- Error stack trace logging
- Metadata attachment for debugging

**Methods:**
- `log(data: LogData)` - Log general information
- `error(data: LogData)` - Log errors with full details and stack traces
- `warn(data: LogData)` - Log warnings
- `debug(data: LogData)` - Log debug information
- `logMethodEntry(context, methodName, params)` - Log when entering a method
- `logMethodExit(context, methodName, result)` - Log when exiting a method
- `logRequest(context, method, url, body)` - Log HTTP requests
- `logResponse(context, method, url, statusCode, responseTime)` - Log HTTP responses

### 2. `src/common/logger/logger.module.ts`
Global logger module exported for use across the application

**Configuration:**
- `@Global()` decorator makes it available everywhere
- No need to import in every module

## Implementation

### Updated Files

#### 1. `src/app.module.ts`
- Added `LoggerModule` to imports
- Makes logger service available globally

#### 2. `src/mail/mail.service.ts`
**Added Logging:**
- ✅ Constructor injection of `LoggerService`
- ✅ Gmail SMTP configuration success/failure logging
- ✅ Method entry logging for `sendEmail()`
- ✅ Method entry logging for `sendSalesExportEmail()`
- ✅ Method exit logging on successful email send
- ✅ Structured error logging in catch blocks with stack traces

#### 3. `src/sales/sales.service.ts`
**Added Logging:**
- ✅ Constructor injection of `LoggerService`
- ✅ Method entry logging for `create()`
- ✅ Method exit logging for `create()`
- ✅ Error logging in `create()` catch block
- ✅ Method entry logging for `findAll()`
- ✅ Method exit logging for `findAll()`
- ✅ Error logging in `findAll()` catch block
- ✅ Method entry logging for `exportSalesToExcel()`
- ✅ Sales data fetched logging with record count
- ✅ Method exit logging for `exportSalesToExcel()`
- ✅ Error logging in `exportSalesToExcel()` catch block with metadata

#### 4. `src/sales/sales.controller.ts`
**Added Logging:**
- ✅ Constructor injection of `LoggerService`
- ✅ Request logging for `/sales/export` endpoint
- ✅ Response logging on successful export
- ✅ Error logging in catch block with full context

## Log Format

### Standard Error Log Format

```typescript
this.loggerService.error({
  message: "error while exporting sales data",
  context: "SalesService",
  error: {
    stack: error?.stack,
    message: error?.message,
  },
  metadata: {
    recipientEmail,
    filters,
  },
});
```

### Method Entry Log

```typescript
this.loggerService.logMethodEntry("SalesService", "exportSalesToExcel", {
  recipientEmail,
  filters,
});
```

### Method Exit Log

```typescript
this.loggerService.logMethodExit("SalesService", "exportSalesToExcel", {
  success: true,
  recipientEmail,
  totalRecords: salesData.count,
  fileName,
});
```

### Request Log

```typescript
this.loggerService.logRequest(
  "SalesController",
  "POST",
  "/sales/export",
  exportSalesDto
);
```

### Response Log

```typescript
this.loggerService.logResponse(
  "SalesController",
  "POST",
  "/sales/export",
  HttpStatus.OK
);
```

## Example Console Output

### Successful Export Flow

```
[Nest] 12345  - 15/11/2025, 4:00:00 pm   LOG [SalesController] 📨 POST /sales/export
[Nest] 12345  - 15/11/2025, 4:00:00 pm   DEBUG [SalesController] Request body: {
  "recipientEmail": "user@example.com",
  "branch": "Main Branch"
}
[Nest] 12345  - 15/11/2025, 4:00:00 pm   LOG [SalesService] → exportSalesToExcel called
[Nest] 12345  - 15/11/2025, 4:00:00 pm   DEBUG [SalesService] Parameters: {
  "recipientEmail": "user@example.com",
  "filters": { "branch": "Main Branch" }
}
[Nest] 12345  - 15/11/2025, 4:00:00 pm   LOG [SalesService] → findAll called
[Nest] 12345  - 15/11/2025, 4:00:00 pm   LOG [SalesService] ← findAll completed
[Nest] 12345  - 15/11/2025, 4:00:00 pm   LOG [SalesService] Sales data fetched for export
[Nest] 12345  - 15/11/2025, 4:00:00 pm   LOG [MailService] → sendSalesExportEmail called
[Nest] 12345  - 15/11/2025, 4:00:01 pm   LOG [MailService] Email sent successfully: <message-id@gmail.com>
[Nest] 12345  - 15/11/2025, 4:00:01 pm   LOG [MailService] ← sendSalesExportEmail completed
[Nest] 12345  - 15/11/2025, 4:00:01 pm   LOG [SalesService] ← exportSalesToExcel completed
[Nest] 12345  - 15/11/2025, 4:00:01 pm   LOG [SalesController] 📤 POST /sales/export → 200
```

### Error Flow

```
[Nest] 12345  - 15/11/2025, 4:00:00 pm   LOG [SalesController] 📨 POST /sales/export
[Nest] 12345  - 15/11/2025, 4:00:00 pm   LOG [SalesService] → exportSalesToExcel called
[Nest] 12345  - 15/11/2025, 4:00:00 pm   LOG [SalesService] → findAll called
[Nest] 12345  - 15/11/2025, 4:00:00 pm   LOG [SalesService] ← findAll completed
[Nest] 12345  - 15/11/2025, 4:00:00 pm   LOG [SalesService] Sales data fetched for export
[Nest] 12345  - 15/11/2025, 4:00:00 pm   LOG [MailService] → sendSalesExportEmail called
[Nest] 12345  - 15/11/2025, 4:00:00 pm   LOG [MailService] → sendEmail called
[Nest] 12345  - 15/11/2025, 4:00:01 pm   ERROR [MailService] Failed to send email | Error: Invalid login
[Nest] 12345  - 15/11/2025, 4:00:01 pm   ERROR [MailService] Error name: Error
[Nest] 12345  - 15/11/2025, 4:00:01 pm   ERROR [MailService] Error message: Invalid login: 535-5.7.8 Username and Password not accepted
[Nest] 12345  - 15/11/2025, 4:00:01 pm   ERROR [MailService] Stack trace:
Error: Invalid login: 535-5.7.8 Username and Password not accepted
    at SMTPConnection._formatError (/path/to/file.js:809:19)
    at SMTPConnection._actionAUTHComplete (/path/to/file.js:1595:34)
    ...
[Nest] 12345  - 15/11/2025, 4:00:01 pm   ERROR [MailService] Additional info: {
  "to": "user@example.com",
  "subject": "Sales Export Report"
}
[Nest] 12345  - 15/11/2025, 4:00:01 pm   ERROR [SalesService] error while exporting sales data | Error: Failed to send email
[Nest] 12345  - 15/11/2025, 4:00:01 pm   ERROR [SalesService] Error name: Error
[Nest] 12345  - 15/11/2025, 4:00:01 pm   ERROR [SalesService] Error message: Failed to send email: Invalid login
[Nest] 12345  - 15/11/2025, 4:00:01 pm   ERROR [SalesService] Stack trace:
Error: Failed to send email: Invalid login
    at MailService.sendEmail (/path/to/mail.service.ts:152:13)
    at MailService.sendSalesExportEmail (/path/to/mail.service.ts:196:7)
    ...
[Nest] 12345  - 15/11/2025, 4:00:01 pm   ERROR [SalesService] Additional info: {
  "recipientEmail": "user@example.com",
  "filters": { "branch": "Main Branch" }
}
[Nest] 12345  - 15/11/2025, 4:00:01 pm   ERROR [SalesController] Error in exportSales endpoint | Error: Failed to export sales to Excel
[Nest] 12345  - 15/11/2025, 4:00:01 pm   ERROR [SalesController] Error name: Error
[Nest] 12345  - 15/11/2025, 4:00:01 pm   ERROR [SalesController] Error message: Failed to export sales to Excel: Failed to send email
[Nest] 12345  - 15/11/2025, 4:00:01 pm   ERROR [SalesController] Stack trace:
...full stack trace...
```

## Benefits

### 1. **Structured Logging**
- All logs follow a consistent format
- Easy to parse and analyze
- Includes context, errors, and metadata

### 2. **Complete Error Tracking**
- Full stack traces captured
- Error messages preserved
- Metadata for debugging

### 3. **Method Tracing**
- Track when methods are entered/exited
- See parameter values
- Monitor execution flow

### 4. **HTTP Request/Response Logging**
- Track API calls
- Monitor response times
- Debug request/response issues

### 5. **Centralized Management**
- Single point of configuration
- Easy to extend or modify
- Consistent across the application

## Future Enhancements

### 1. **Log Levels Configuration**
```typescript
// Based on environment
if (process.env.NODE_ENV === 'production') {
  // Only log errors and warnings
} else {
  // Log everything including debug
}
```

### 2. **External Log Aggregation**
- Integration with services like:
  - Datadog
  - New Relic
  - Elasticsearch/Logstash/Kibana (ELK)
  - CloudWatch (AWS)
  - Stackdriver (GCP)

### 3. **Log Rotation**
- File-based logging with rotation
- Archival of old logs
- Compression of historical logs

### 4. **Performance Monitoring**
- Method execution time tracking
- Database query performance
- API response times

### 5. **Alerts and Notifications**
- Real-time error notifications
- Slack/email integration for critical errors
- Dashboard for monitoring

## Usage Guidelines

### When to Log

#### ✅ Always Log:
- Entry to important business logic methods
- Errors in catch blocks
- API requests and responses
- Configuration successes/failures
- Data export operations
- Email sending operations

#### ⚠️ Consider Logging:
- Method exits with results
- Data transformation steps
- External service calls
- Database operations

#### ❌ Don't Log:
- Sensitive data (passwords, tokens, credit cards)
- Personal identifiable information (PII) without masking
- Large payloads that clutter logs
- Every single line of code execution

### Error Logging Best Practices

```typescript
catch (error) {
  // ✅ GOOD: Structured with context
  this.loggerService.error({
    message: "error while exporting sales data",
    context: "SalesService",
    error: {
      stack: error?.stack,
      message: error?.message,
    },
    metadata: {
      recipientEmail,
      filters,
    },
  });
  
  throw new Error(`Failed to export sales to Excel: ${error.message}`);
}

// ❌ BAD: No context or structure
catch (error) {
  console.error(error);
  throw error;
}
```

## Testing

### Verify Logging is Working

1. **Start the application:**
   ```bash
   npm run start:dev
   ```

2. **Check startup logs:**
   - Should see Gmail SMTP configuration logs
   - Should see "Email service is ready" if configured

3. **Test an export:**
   - Navigate to Sales page
   - Click Export button
   - Check console for structured logs

4. **Trigger an error:**
   - Use incorrect Gmail credentials
   - Try to export
   - Check console for detailed error logs

## Summary

✅ **Centralized LoggerService created**
✅ **Global LoggerModule implemented**
✅ **Mail service fully instrumented with logging**
✅ **Sales service fully instrumented with logging**
✅ **Sales controller fully instrumented with logging**
✅ **Structured error logging with stack traces**
✅ **Method entry/exit logging**
✅ **HTTP request/response logging**
✅ **Metadata attachment for debugging**

The logging system is now production-ready and provides comprehensive visibility into application operations and errors!

