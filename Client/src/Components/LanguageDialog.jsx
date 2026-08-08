import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  // { code: 'pt', label: 'Português', flag: '🇧🇷' }, // paused
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰' },
  { code: 'no', label: 'Norsk', flag: '🇳🇴' },
];

const LanguageDialog = ({ onClose }) => {
  const { i18n, t, ready } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Don't render until i18n is ready
  if (!ready) return null;

  const selectLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('selectedLanguage', lang);
    onClose();
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div style={styles.overlay}>
      <style>{`
        .lang-dialog-btn-group {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
        }
        .lang-dialog-btn {
          padding: 12px 28px;
          font-size: 1rem;
          border: 2px solid #333;
          border-radius: 8px;
          cursor: pointer;
          background-color: #fff;
          font-weight: 600;
          transition: all 0.2s;
          flex: 1 1 auto;
        }
        .lang-dialog-btn:hover {
          background-color: #f5f5f5;
        }
        .lang-dropdown-wrapper {
          display: none;
          position: relative;
          width: 100%;
        }
        .lang-dropdown-trigger {
          width: 100%;
          padding: 14px 18px;
          font-size: 1rem;
          font-weight: 600;
          border: 2px solid #333;
          border-radius: 10px;
          background: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
        }
        .lang-dropdown-trigger .chevron {
          transition: transform 0.2s;
          font-size: 0.8rem;
          color: #666;
        }
        .lang-dropdown-trigger .chevron.open {
          transform: rotate(180deg);
        }
        .lang-dropdown-list {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          overflow: hidden;
          z-index: 10;
        }
        .lang-dropdown-item {
          width: 100%;
          padding: 14px 18px;
          font-size: 1rem;
          font-weight: 500;
          background: #fff;
          border: none;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
        }
        .lang-dropdown-item:last-child {
          border-bottom: none;
        }
        .lang-dropdown-item:hover,
        .lang-dropdown-item:active {
          background-color: #f5f5f5;
        }
        @media (max-width: 480px) {
          .lang-dialog {
            padding: 28px 20px;
            min-width: 0;
            width: 90vw;
          }
          .lang-dialog-btn-group {
            display: none;
          }
          .lang-dropdown-wrapper {
            display: block;
          }
        }
      `}</style>
      <div style={styles.dialog} className="lang-dialog">
        <h2 style={styles.title}>{t('language_dialog.title')}</h2>
        <p style={styles.subtitle}>{t('language_dialog.subtitle')}</p>

        {/* Desktop: button grid */}
        <div className="lang-dialog-btn-group">
          {LANGUAGES.map(({ code, label, flag }) => (
            <button key={code} className="lang-dialog-btn" onClick={() => selectLanguage(code)}>
              {flag} {label}
            </button>
          ))}
        </div>

        {/* Mobile: elegant dropdown */}
        <div className="lang-dropdown-wrapper">
          <button
            className="lang-dropdown-trigger"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            <span>{currentLang.flag} {currentLang.label}</span>
            <span className={`chevron ${dropdownOpen ? 'open' : ''}`}>▼</span>
          </button>
          {dropdownOpen && (
            <div className="lang-dropdown-list">
              {LANGUAGES.map(({ code, label, flag }) => (
                <button
                  key={code}
                  className="lang-dropdown-item"
                  onClick={() => selectLanguage(code)}
                >
                  <span>{flag}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0,
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
    boxSizing: 'border-box',
  },
  dialog: {
    background: '#fff', borderRadius: '12px',
    padding: '40px', textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    minWidth: '300px',
    maxWidth: '480px',
    width: '100%',
    boxSizing: 'border-box',
  },
  title: { fontSize: '1.5rem', marginBottom: '8px', color: '#1a1a1a' },
  subtitle: { color: '#666', marginBottom: '28px' },
};

export default LanguageDialog;
