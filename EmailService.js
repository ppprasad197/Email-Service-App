// src/EmailService.js
import './App.css';
class EmailService {
    constructor(primaryProvider, secondaryProvider, maxRetries = 5, initialDelay = 1000, rateLimitMs = 2000) {
      this.primaryProvider = primaryProvider;
      this.secondaryProvider = secondaryProvider;
      this.maxRetries = maxRetries;
      this.initialDelay = initialDelay;
      this.rateLimitMs = rateLimitMs;
      this.statusLog = [];
      this.sentEmailIds = new Set();
      this.lastSentTime = 0;
    }
  
    async sendEmail(id, to, subject, body) {
      if (this.sentEmailIds.has(id)) {
        return; // Prevent duplicate sends
      }
  
      const now = Date.now();
      const elapsed = now - this.lastSentTime;
  
      if (elapsed < this.rateLimitMs) {
        const waitTime = this.rateLimitMs - elapsed;
        await this.sleep(waitTime);
      }
  
      this.lastSentTime = Date.now();
  
      if (!to) {
        throw new Error("Email address cannot be empty.");
      }
  
      if (!this.validateEmail(to)) {
        throw new Error("Invalid email address.");
      }
  
      if (!body.trim()) {
        throw new Error("Email body cannot be empty.");
      }
  
      const status = this.createStatus(id, to, subject, body);
      this.updateStatusLog(status);
      this.sentEmailIds.add(id);
  
      try {
        await this.retryEmailSending(this.primaryProvider, status);
      } catch (error) {
        try {
          await this.retryEmailSending(this.secondaryProvider, status);
        } catch (secondaryError) {
          status.status = 'failed';
          this.updateStatusLog(status);
          throw secondaryError;
        }
      }
    }
  
    validateEmail(email) {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|hotmail\.com)$/;
      return emailPattern.test(email);
    }
  
    async retryEmailSending(provider, status, retryCount = 0) {
      status.status = 'sending';
      this.updateStatusLog(status);
  
      try {
        await provider.send(status.to, status.subject, status.body);
        status.status = 'sent';
        this.updateStatusLog(status);
      } catch (error) {
        if (retryCount < this.maxRetries) {
          const delay = this.initialDelay * Math.pow(2, retryCount);
          status.status = `failed (retrying in ${delay / 1000}s)`;
          this.updateStatusLog(status);
          await this.sleep(delay);
          return this.retryEmailSending(provider, status, retryCount + 1);
        } else {
          throw error;
        }
      }
    }
  
    createStatus(id, to, subject, body) {
      return {
        id,
        to,
        subject,
        body,
        status: 'pending',
        timestamp: new Date().toISOString()
      };
    }
  
    updateStatusLog(status) {
      const index = this.statusLog.findIndex(log => log.id === status.id);
      if (index > -1) {
        this.statusLog[index] = status;
      } else {
        this.statusLog.push(status);
      }
    }
  
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    getStatusLog() {
      return this.statusLog;
    }
  }
  
  export default EmailService;
  