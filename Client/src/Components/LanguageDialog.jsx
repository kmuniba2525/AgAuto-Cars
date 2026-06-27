import { useTranslation } from 'react-i18next';

const LanguageDialog = ({ onClose }) => {
  const { i18n, t, ready } = useTranslation();

  // Don't render until i18n is ready
  if (!ready) return null;

  const selectLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('selectedLanguage', lang);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <h2 style={styles.title}>{t('language_dialog.title')}</h2>
        <p style={styles.subtitle}>{t('language_dialog.subtitle')}</p>
        <div style={styles.btnGroup}>
          <button style={styles.btn} onClick={() => selectLanguage('en')}>
            🇬🇧 English
          </button>
          <button style={styles.btn} onClick={() => selectLanguage('pt')}>
            🇧🇷 Português
          </button>
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
  },
  dialog: {
    background: '#fff', borderRadius: '12px',
    padding: '40px', textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    minWidth: '300px',
  },
  title: { fontSize: '1.5rem', marginBottom: '8px', color: '#1a1a1a' },
  subtitle: { color: '#666', marginBottom: '28px' },
  btnGroup: { display: 'flex', gap: '16px', justifyContent: 'center' },
  btn: {
    padding: '12px 28px', fontSize: '1rem',
    border: '2px solid #333', borderRadius: '8px',
    cursor: 'pointer', backgroundColor: '#fff',
    fontWeight: '600', transition: 'all 0.2s',
  },
};

export default LanguageDialog;