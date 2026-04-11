/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  // Email sending disabled - MailerLite handles all emails
  e.next();
}, "pdf_downloads");