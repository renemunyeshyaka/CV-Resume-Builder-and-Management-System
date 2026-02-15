import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div style={{
      maxWidth: '900px',
      margin: '40px auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
      lineHeight: '1.8'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem' }}>Terms of Service</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
          Last updated: February 15, 2026
        </p>
      </div>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          1. Acceptance of Terms
        </h2>
        <p>
          By accessing and using the CV/Resume Builder and Management System ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          2. License
        </h2>
        <p>
          We grant you a limited, non-exclusive, non-transferable license to use the Service for personal, non-commercial purposes. You may not:
        </p>
        <ul>
          <li>Reproduce, distribute, or transmit content without permission</li>
          <li>Use the Service for any illegal or unauthorized purpose</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with or disrupt the Service or its servers</li>
          <li>Remove, obscure, or alter any proprietary notices</li>
          <li>Use automated tools to access or scrape data</li>
          <li>Sell, rent, or lease access to the Service</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          3. User Accounts
        </h2>
        <h3>3.1 Account Registration</h3>
        <p>
          When you create an account, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your password and account information.
        </p>

        <h3>3.2 Account Responsibility</h3>
        <p>
          You are responsible for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breaches of security.
        </p>

        <h3>3.3 Account Termination</h3>
        <p>
          We reserve the right to terminate or suspend your account at any time for violations of these Terms or for any reason at our discretion.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          4. Content Ownership
        </h2>
        <p>
          You retain all rights to the content you create (CVs, profile information, signatures, etc.). By using our Service, you grant us a license to use, store, and process your content solely to provide the Service to you.
        </p>
        <p>
          We do not claim ownership of your personal documents or CV content. You are responsible for ensuring your content does not violate any laws or third-party rights.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          5. Intellectual Property Rights
        </h2>
        <p>
          The Service, including its design, features, functionality, and content (excluding user-generated content), is owned by the Company and protected by copyright, trademark, and other intellectual property laws. You may not:
        </p>
        <ul>
          <li>Modify or create derivative works</li>
          <li>Reverse engineer or decompile</li>
          <li>Reproduce for commercial purposes</li>
          <li>Remove copyright or proprietary notices</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          6. Prohibited Activities
        </h2>
        <p>You agree not to use the Service for:</p>
        <ul>
          <li>Illegal activities or violating any laws</li>
          <li>Harassment, abuse, or threats toward other users</li>
          <li>Uploading malware or harmful code</li>
          <li>Spamming or unsolicited communications</li>
          <li>Impersonation of others</li>
          <li>Creating false or misleading documents</li>
          <li>Privacy violations of other users</li>
          <li>Circumventing security measures</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          7. Service Availability
        </h2>
        <p>
          We strive to provide continuous service but do not guarantee uninterrupted or error-free operation. We may schedule maintenance, updates, or suspend the Service at any time without notice.
        </p>
        <p>
          We are not liable for any interruptions, data loss, or damages resulting from service unavailability.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          8. Disclaimers
        </h2>
        <p>
          THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>
          We do not guarantee that the Service will meet your requirements or that it will be error-free.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          9. Limitation of Liability
        </h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
        </p>
        <p>
          Our total liability shall not exceed the amount you paid for the Service in the past 12 months.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          10. Indemnification
        </h2>
        <p>
          You agree to indemnify and hold harmless the Company from any claims, damages, or costs (including legal fees) arising from your violation of these Terms, misuse of the Service, or infringement of any rights.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          11. Third-Party Links and Services
        </h2>
        <p>
          The Service may contain links to third-party websites and services. We are not responsible for their content, accuracy, or practices. Your use of third-party services is governed by their terms and conditions.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          12. Modifications to Terms
        </h2>
        <p>
          We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms. We will notify you of significant changes.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          13. Termination
        </h2>
        <p>
          Either party may terminate the agreement at any time. Upon termination, your right to use the Service ceases immediately. We may retain your data in accordance with our Privacy Policy.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          14. Governing Law
        </h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of Rwanda, without regard to its conflict of law provisions.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          15. Contact Information
        </h2>
        <p>
          For questions about these Terms of Service, please contact us at:
        </p>
        <ul>
          <li><strong>Email:</strong> support@cvbuilder.com</li>
          <li><strong>Phone:</strong> +250 788 620 201</li>
          <li><strong>Address:</strong> Kigali, Rwanda</li>
        </ul>
      </section>

      <section style={{ 
        background: '#f0f4ff',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '30px',
        marginBottom: '30px'
      }}>
        <p style={{ margin: 0 }}>
          By using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
        </p>
      </section>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link href="/register" style={{
          display: 'inline-block',
          background: '#667eea',
          color: '#fff',
          padding: '12px 30px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 'bold',
          marginRight: '10px'
        }}>
          Back to Register
        </Link>
        <Link href="/" style={{
          display: 'inline-block',
          background: '#764ba2',
          color: '#fff',
          padding: '12px 30px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 'bold'
        }}>
          Home
        </Link>
      </div>
    </div>
  );
}
