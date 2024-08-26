// src/App.js
import React, { useState } from "react";
import EmailService from "./EmailService";
import { MockEmailProvider } from "./EmailProvider";

function App() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");

  const primaryProvider = new MockEmailProvider();
  const secondaryProvider = new MockEmailProvider();
  const emailService = new EmailService(primaryProvider, secondaryProvider);

  const handleSendEmail = async () => {
    try {
      if (!to) {
        setStatus("Please provide an email address.");
        return;
      }

      if (!emailService.validateEmail(to)) {
        setStatus("Please provide a valid email address (e.g., name@gmail.com, name@yahoo.com, name@hotmail.com).");
        return;
      }

      if (!body.trim()) {
        setStatus("Please provide an email body.");
        return;
      }

      setStatus("Sending...");
      await emailService.sendEmail(
        `unique-id-${Date.now()}`, // Use a unique ID for each email
        to,
        subject,
        body
      );
      setStatus("Email sent successfully!");
    } catch (error) {
      setStatus(`Failed to send email: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <div className="email-container">
        <h1>Email Service</h1>
        <div>
          <input
            type="email"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div>
          <textarea
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          ></textarea>
        </div>
        <button onClick={handleSendEmail}>Send Email</button>
        <p>Status: {status}</p>
      </div>
    </div>
  );
}

export default App;
