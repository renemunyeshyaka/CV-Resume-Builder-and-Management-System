import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
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
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem' }}>Privacy Policy</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
          Last updated: February 15, 2026
        </p>
      </div>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          1. Introduction
        </h2>
        <p>
          Welcome to CV/Resume Builder and Management System ("we," "our," or "the Company"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          2. Information We Collect
        </h2>
        <h3>2.1 Personal Information</h3>
        <p>We collect information you voluntarily provide, including:</p>
        <ul>
          <li>Name, email address, and password</li>
          <li>Phone number and location</li>
          <li>Profile information and professional background</li>
          <li>CV/Resume content and documents</li>
          <li>Profile pictures and signatures</li>
          <li>Communication records with support</li>
        </ul>

        <h3>2.2 Automatically Collected Information</h3>
        <p>We automatically collect certain information when you use our services:</p>
        <ul>
          <li>IP address and browser type</li>
          <li>Device information and operating system</li>
          <li>Pages visited and time spent on our platform</li>
          <li>Cookies and tracking technologies</li>
          <li>Log data and usage analytics</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          3. How We Use Your Information
        </h2>
        <p>We use the collected information for the following purposes:</p>
        <ul>
          <li>Creating and maintaining your account</li>
          <li>Providing, improving, and personalizing our services</li>
          <li>Processing transactions and sending related information</li>
          <li>Sending promotional emails and updates (with your consent)</li>
          <li>Responding to your inquiries and customer support</li>
          <li>Complying with legal obligations and preventing fraud</li>
          <li>Analyzing usage patterns to improve user experience</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          4. Data Security
        </h2>
        <p>
          We implement industry-standard security measures to protect your personal information. This includes:
        </p>
        <ul>
          <li>Encryption of data in transit (SSL/TLS)</li>
          <li>Secure authentication mechanisms</li>
          <li>Regular security audits and updates</li>
          <li>Limited access to personal data on a need-to-know basis</li>
          <li>Secure storage of signatures and sensitive documents</li>
        </ul>
        <p>
          However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security of your data.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          5. Sharing Your Information
        </h2>
        <p>
          We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
        </p>
        <ul>
          <li>With your explicit consent</li>
          <li>With service providers who assist us in operating our website and services</li>
          <li>When required by law or to protect our legal rights</li>
          <li>In case of business merger, acquisition, or sale of assets</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          6. Cookies and Tracking Technologies
        </h2>
        <p>
          We use cookies and similar tracking technologies to enhance your experience. You can control cookie settings through your browser. However, disabling cookies may affect some features of our platform.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          7. Your Rights
        </h2>
        <p>
          Depending on your location, you may have the right to:
        </p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your data</li>
          <li>Opt-out of marketing communications</li>
          <li>Data portability</li>
          <li>Withdraw consent at any time</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          8. Data Retention
        </h2>
        <p>
          We retain your personal information for as long as your account is active or as needed to provide our services. You can request deletion of your account and associated data at any time. Some information may be retained for legal or security purposes.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          9. Third-Party Links
        </h2>
        <p>
          Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. Please review their privacy policies before providing any personal information.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          10. Contact Us
        </h2>
        <p>
          If you have questions about this Privacy Policy or our privacy practices, please contact us at:
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
          We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last updated" date above.
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
