import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import { LoggerService } from "../common/logger/logger.service";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
  }>;
}

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly loggerService: LoggerService) {
    this.initialize();
  }

  private initialize(): void {
    // Check if Gmail credentials are configured
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      this.logger.warn(
        "⚠️  Gmail SMTP not configured! Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env file"
      );
      this.logger.warn(
        "📖 See GMAIL_SMTP_SETUP.md for detailed setup instructions"
      );
    }

    if (
      gmailUser === "your-email@gmail.com" ||
      gmailPassword === "your-app-password" ||
      gmailPassword === "your-16-character-app-password"
    ) {
      this.logger.warn(
        "⚠️  Gmail SMTP using placeholder values! Please update .env with real credentials"
      );
    }

    // Configure Gmail SMTP transporter
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser || "your-email@gmail.com",
        pass: gmailPassword || "your-app-password",
      },
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error("❌ Email service configuration error:");
        this.logger.error(error.message);
        this.logger.error("");
        this.logger.error("🔧 Troubleshooting Steps:");
        this.logger.error(
          "1. Ensure 2-Step Verification is enabled on your Google account"
        );
        this.logger.error(
          "2. Generate an App Password at: https://myaccount.google.com/apppasswords"
        );
        this.logger.error(
          "3. Update .env file with your email and app password (remove all spaces)"
        );
        this.logger.error("4. Restart the server after updating .env");
        this.logger.error("");
        this.logger.error(
          "📖 See GMAIL_SMTP_SETUP.md for detailed instructions"
        );

        this.loggerService.error({
          message: "Gmail SMTP configuration failed",
          context: "MailService",
          error: {
            stack: error.stack,
            message: error.message,
            name: error.name,
          },
          metadata: {
            gmailUser: gmailUser || "not-set",
            hasPassword: !!gmailPassword,
          },
        });
      } else {
        this.logger.log("✅ Email service is ready to send messages");
        this.logger.log(`📧 Configured sender: ${gmailUser}`);

        this.loggerService.log({
          message: "Gmail SMTP configured successfully",
          context: "MailService",
          metadata: {
            sender: gmailUser,
          },
        });
      }
    });
  }

  /**
   * Send an email with optional attachments
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    this.loggerService.logMethodEntry("MailService", "sendEmail", {
      to: options.to,
      subject: options.subject,
      hasAttachments: !!options.attachments?.length,
    });

    try {
      const mailOptions = {
        from: process.env.GMAIL_USER || "your-email@gmail.com",
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully: ${info.messageId}`);

      this.loggerService.logMethodExit("MailService", "sendEmail", {
        messageId: info.messageId,
        accepted: info.accepted,
      });
    } catch (error) {
      this.loggerService.error({
        message: "Failed to send email",
        context: "MailService",
        error: {
          stack: error?.stack,
          message: error?.message,
          name: error?.name,
        },
        metadata: {
          to: options.to,
          subject: options.subject,
        },
      });

      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send sales export email with Excel attachment
   */
  async sendSalesExportEmail(
    recipientEmail: string,
    excelBuffer: Buffer,
    fileName: string,
    exportDetails: {
      totalRecords: number;
      filters?: string;
      exportDate: string;
    }
  ): Promise<void> {
    this.loggerService.logMethodEntry("MailService", "sendSalesExportEmail", {
      recipientEmail,
      fileName,
      fileSize: excelBuffer.length,
      totalRecords: exportDetails.totalRecords,
    });
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 0 0 5px 5px;
            }
            .details {
              background-color: white;
              padding: 15px;
              margin: 15px 0;
              border-left: 4px solid #4CAF50;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📊 Sales Export Report</h2>
            </div>
            <div class="content">
              <p>Dear User,</p>
              <p>Your sales data export has been generated successfully. Please find the attached Excel file with your requested sales data.</p>
              
              <div class="details">
                <h3>Export Details:</h3>
                <ul>
                  <li><strong>Total Records:</strong> ${exportDetails.totalRecords}</li>
                  <li><strong>Export Date:</strong> ${exportDetails.exportDate}</li>
                  ${exportDetails.filters ? `<li><strong>Applied Filters:</strong> ${exportDetails.filters}</li>` : ""}
                </ul>
              </div>

              <p><strong>Attached File:</strong> ${fileName}</p>
              
              <p>If you have any questions or need further assistance, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>Revathi Enterprises Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await this.sendEmail({
        to: recipientEmail,
        subject: "Sales Export Report - Revathi Enterprises",
        html: htmlContent,
        attachments: [
          {
            filename: fileName,
            content: excelBuffer,
          },
        ],
      });

      this.loggerService.logMethodExit(
        "MailService",
        "sendSalesExportEmail",
        {
          success: true,
          recipientEmail,
        }
      );
    } catch (error) {
      this.loggerService.error({
        message: "Failed to send sales export email",
        context: "MailService",
        error: {
          stack: error?.stack,
          message: error?.message,
        },
        metadata: {
          recipientEmail,
          fileName,
          exportDetails,
        },
      });

      throw error;
    }
  }
}
