import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function TermsOfService() {
  const { t } = useTranslation();
  const licenseItems = t('termsOfService.license.list', { returnObjects: true });
  const ipItems = t('termsOfService.intellectualProperty.list', { returnObjects: true });
  const prohibitedItems = t('termsOfService.prohibited.list', { returnObjects: true });
  const renderList = (items) => Array.isArray(items)
    ? items.map((item, index) => <li key={index}>{item}</li>)
    : null;

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
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem' }}>{t('termsOfService.title')}</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
          {t('termsOfService.lastUpdated')}
        </p>
      </div>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.acceptance.title')}
        </h2>
        <p>
          {t('termsOfService.acceptance.body')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.license.title')}
        </h2>
        <p>
          {t('termsOfService.license.body')}
        </p>
        <ul>{renderList(licenseItems)}</ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.accounts.title')}
        </h2>
        <h3>{t('termsOfService.accounts.registrationTitle')}</h3>
        <p>
          {t('termsOfService.accounts.registrationBody')}
        </p>

        <h3>{t('termsOfService.accounts.responsibilityTitle')}</h3>
        <p>
          {t('termsOfService.accounts.responsibilityBody')}
        </p>

        <h3>{t('termsOfService.accounts.terminationTitle')}</h3>
        <p>
          {t('termsOfService.accounts.terminationBody')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.contentOwnership.title')}
        </h2>
        <p>
          {t('termsOfService.contentOwnership.body')}
        </p>
        <p>
          {t('termsOfService.contentOwnership.body2')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.intellectualProperty.title')}
        </h2>
        <p>
          {t('termsOfService.intellectualProperty.body')}
        </p>
        <ul>{renderList(ipItems)}</ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.prohibited.title')}
        </h2>
        <p>{t('termsOfService.prohibited.body')}</p>
        <ul>{renderList(prohibitedItems)}</ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.availability.title')}
        </h2>
        <p>
          {t('termsOfService.availability.body')}
        </p>
        <p>
          {t('termsOfService.availability.body2')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.disclaimers.title')}
        </h2>
        <p>
          {t('termsOfService.disclaimers.body')}
        </p>
        <p>
          {t('termsOfService.disclaimers.body2')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.liability.title')}
        </h2>
        <p>
          {t('termsOfService.liability.body')}
        </p>
        <p>
          {t('termsOfService.liability.body2')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.indemnification.title')}
        </h2>
        <p>
          {t('termsOfService.indemnification.body')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.thirdParty.title')}
        </h2>
        <p>
          {t('termsOfService.thirdParty.body')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.modifications.title')}
        </h2>
        <p>
          {t('termsOfService.modifications.body')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.termination.title')}
        </h2>
        <p>
          {t('termsOfService.termination.body')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.governingLaw.title')}
        </h2>
        <p>
          {t('termsOfService.governingLaw.body')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('termsOfService.contact.title')}
        </h2>
        <p>
          {t('termsOfService.contact.body')}
        </p>
        <ul>
          <li><strong>{t('termsOfService.contact.emailLabel')}</strong> {t('termsOfService.contact.email')}</li>
          <li><strong>{t('termsOfService.contact.phoneLabel')}</strong> {t('termsOfService.contact.phone')}</li>
          <li><strong>{t('termsOfService.contact.addressLabel')}</strong> {t('termsOfService.contact.address')}</li>
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
          {t('termsOfService.acceptNotice')}
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
          {t('termsOfService.backToRegister')}
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
          {t('termsOfService.home')}
        </Link>
      </div>
    </div>
  );
}
