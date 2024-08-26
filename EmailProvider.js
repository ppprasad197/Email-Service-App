// src/EmailProvider.js
import './App.css'
export class MockEmailProvider {
    async send(to, subject, body) {
      // Simulate a random failure for demonstration purposes
      if (Math.random() < 0.2) {
        throw new Error("Simulated provider failure");
      }
      console.log(`Email sent to ${to} with subject "${subject}" and body "${body}"`);
    }
  }
  