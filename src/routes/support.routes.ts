import { Router } from "express";
import fs from "fs";
import path from "path";

const supportRouter = Router();

// Simple email regex validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

supportRouter.post("/", async (req, res): Promise<void> => {
  try {
    const { name, email, subject, category, message, website } = req.body;

    // Honeypot spam check (website field is hidden in the UI; if bots fill it, reject)
    if (website) {
      console.warn("Spam submission blocked via Honeypot check.");
      res.status(200).json({
        success: true,
        message: "Support ticket submitted successfully (spam check filter active).",
      });
      return;
    }

    // Input validations
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ success: false, message: "Name must be at least 2 characters long." });
      return;
    }

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      res.status(400).json({ success: false, message: "Please provide a valid email address." });
      return;
    }

    if (!subject || typeof subject !== "string" || subject.trim().length < 3) {
      res.status(400).json({ success: false, message: "Subject must be at least 3 characters long." });
      return;
    }

    if (!category || typeof category !== "string" || category.trim() === "") {
      res.status(400).json({ success: false, message: "Please select a valid category." });
      return;
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      res.status(400).json({ success: false, message: "Message must be at least 10 characters long." });
      return;
    }

    // Prevent email header injection by removing line breaks from name & subject
    const safeName = name.replace(/[\r\n]+/g, " ").trim();
    const safeSubject = subject.replace(/[\r\n]+/g, " ").trim();
    const safeEmail = email.replace(/[\r\n]+/g, " ").trim();

    // Generate unique support request ID
    const requestId = `SP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const submittedAt = new Date().toISOString();

    const apiKey = process.env.RESEND_API_KEY;
    const recipientEmail = process.env.EMAIL_TO || "support@studypilot.ai";
    const senderEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

    const emailSubject = `[StudyPilot AI Support] ${safeSubject}`;
    const emailHtml = `
      <h2>New StudyPilot AI Support Request</h2>
      <p><strong>Request ID:</strong> ${requestId}</p>
      <p><strong>Submitted At:</strong> ${submittedAt}</p>
      <hr />
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
    `;

    if (apiKey) {
      // Production Resend REST integration
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: senderEmail,
          to: recipientEmail,
          subject: emailSubject,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Resend API response error:", errText);
        res.status(502).json({
          success: false,
          message: "Could not send support request. Email dispatcher returned an error.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Thanks! Your message has been received. Our team will get back to you soon.",
        data: { requestId },
      });
    } else {
      // Mock mode logging
      console.log("\n================ [SUPPORT REQUEST MOCK MODE] ================");
      console.log(`Request ID: ${requestId}`);
      console.log(`Time: ${submittedAt}`);
      console.log(`From: ${safeName} (${safeEmail})`);
      console.log(`Category: ${category}`);
      console.log(`Subject: ${safeSubject}`);
      console.log(`Message:\n${message}`);
      console.log("=============================================================\n");

      // Write mock log entry to support_requests.log
      const logPath = path.resolve("support_requests.log");
      const logContent = `\n[${submittedAt}] Request ID: ${requestId}\nFrom: ${safeName} <${safeEmail}>\nCategory: ${category}\nSubject: ${safeSubject}\nMessage:\n${message}\n------------------------------------------\n`;
      fs.appendFileSync(logPath, logContent, "utf8");

      res.status(200).json({
        success: true,
        message: "Thanks! Your message has been received. Our team will get back to you soon.",
        data: { requestId, devMode: true },
      });
    }
  } catch (error: any) {
    console.error("Support API Route Error:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred while processing your support ticket.",
    });
  }
});

export default supportRouter;
