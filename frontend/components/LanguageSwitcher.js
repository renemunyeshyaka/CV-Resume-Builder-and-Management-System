import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' }
  ];

  const currentLang = languages.find(lang => lang.code === i18n.language);

  const handleLanguageChange = async (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('preferred_language', langCode);
    setIsOpen(false);

    // Save to database if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ preferred_language: langCode })
        });
      } catch (err) {
        console.error('Failed to save language preference:', err);
      }
    }
  };

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  if (!mounted) {
    return null;
  }

  const styles = {
    container: {
      position: 'relative',
      display: 'inline-block'
    },
    button: {
      background: 'none',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      color: '#fff',
      padding: '8px 10px',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem',
      transition: 'all 0.3s',
      whiteSpace: 'nowrap',
      width: '40px',
      height: '40px'
    },
    buttonHover: {
      background: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.6)',
      transform: 'scale(1.1)'
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      background: 'rgba(30, 60, 114, 0.98)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      marginTop: '8px',
      zIndex: 1000,
      minWidth: '150px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    },
    dropdownItem: {
      padding: '12px 16px',
      color: '#fff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background 0.3s',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    dropdownItemHover: {
      background: 'rgba(255, 255, 255, 0.1)'
    },
    dropdownItemActive: {
      background: 'rgba(26, 188, 156, 0.2)',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.button}
        onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
        onMouseLeave={(e) => Object.assign(e.target.style, styles.button)}
        onClick={() => setIsOpen(!isOpen)}
        title={t('common.language')}
      >
        🌐
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          {languages.map((lang) => (
            <div
              key={lang.code}
              style={{
                ...styles.dropdownItem,
                ...(lang.code === i18n.language ? styles.dropdownItemActive : {})
              }}
              onMouseEnter={(e) => 
                Object.assign(e.target.style, styles.dropdownItemHover)
              }
              onMouseLeave={(e) => 
                Object.assign(e.target.style, 
                  lang.code === i18n.language 
                    ? { ...styles.dropdownItem, ...styles.dropdownItemActive }
                    : styles.dropdownItem
                )
              }
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
