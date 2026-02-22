import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const personalItems = t('privacyPolicy.infoCollect.personalList', { returnObjects: true });
  const autoItems = t('privacyPolicy.infoCollect.autoList', { returnObjects: true });
  const useItems = t('privacyPolicy.useInfo.list', { returnObjects: true });
  const securityItems = t('privacyPolicy.dataSecurity.list', { returnObjects: true });
  const shareItems = t('privacyPolicy.sharing.list', { returnObjects: true });
  const rightsItems = t('privacyPolicy.rights.list', { returnObjects: true });
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
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem' }}>{t('privacyPolicy.title')}</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
          {t('privacyPolicy.lastUpdated')}
        </p>
      </div>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('privacyPolicy.intro.title')}
        </h2>
        <p>
          {t('privacyPolicy.intro.body')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('privacyPolicy.infoCollect.title')}
        </h2>
        <h3>{t('privacyPolicy.infoCollect.personalTitle')}</h3>
        <p>{t('privacyPolicy.infoCollect.personalBody')}</p>
        <ul>{renderList(personalItems)}</ul>

        <h3>{t('privacyPolicy.infoCollect.autoTitle')}</h3>
        <p>{t('privacyPolicy.infoCollect.autoBody')}</p>
        <ul>{renderList(autoItems)}</ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('privacyPolicy.useInfo.title')}
        </h2>
        <p>{t('privacyPolicy.useInfo.body')}</p>
        <ul>{renderList(useItems)}</ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('privacyPolicy.dataSecurity.title')}
        </h2>
        <p>
          {t('privacyPolicy.dataSecurity.body')}
        </p>
        <ul>{renderList(securityItems)}</ul>
        <p>
          {t('privacyPolicy.dataSecurity.body2')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('privacyPolicy.sharing.title')}
        </h2>
        <p>
          {t('privacyPolicy.sharing.body')}
        </p>
        <ul>{renderList(shareItems)}</ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('privacyPolicy.cookies.title')}
        </h2>
        <p>
          {t('privacyPolicy.cookies.body')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('privacyPolicy.rights.title')}
        </h2>
        <p>
          {t('privacyPolicy.rights.body')}
        </p>
        <ul>{renderList(rightsItems)}</ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('privacyPolicy.retention.title')}
        </h2>
        <p>
          {t('privacyPolicy.retention.body')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('privacyPolicy.thirdParty.title')}
        </h2>
        <p>
          {t('privacyPolicy.thirdParty.body')}
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          {t('privacyPolicy.contact.title')}
        </h2>
        <p>
          {t('privacyPolicy.contact.body')}
        </p>
        <ul>
          <li><strong>{t('privacyPolicy.contact.emailLabel')}</strong> {t('privacyPolicy.contact.email')}</li>
          <li><strong>{t('privacyPolicy.contact.phoneLabel')}</strong> {t('privacyPolicy.contact.phone')}</li>
          <li><strong>{t('privacyPolicy.contact.addressLabel')}</strong> {t('privacyPolicy.contact.address')}</li>
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
          {t('privacyPolicy.updateNotice')}
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
          {t('privacyPolicy.backToRegister')}
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
          {t('privacyPolicy.home')}
        </Link>
      </div>
    </div>
  );
}
