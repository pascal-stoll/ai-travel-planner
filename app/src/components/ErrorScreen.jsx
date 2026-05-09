import './ErrorScreen.css';

const WarningIcon = () => (
  <svg className="error-screen__icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M24 6L42 40H6L24 6Z" stroke="#F47B20" strokeWidth="2.5" strokeLinejoin="round" />
    <line x1="24" y1="18" x2="24" y2="28" stroke="#F47B20" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="24" cy="34" r="1.5" fill="#F47B20" />
  </svg>
);

const ErrorScreen = ({ onRetry, onEdit }) => {
  return (
    <div className="error-screen" role="alert">
      <div className="error-screen__content">
        <WarningIcon />
        <h2 className="error-screen__title">Something went wrong</h2>
        <p className="error-screen__message">
          The AI took too long to respond or the reply was invalid.
          Please check your connection and try again.
        </p>
        <div className="error-screen__actions">
          {onRetry && (
            <button className="btn btn--primary" onClick={onRetry}>
              Retry
            </button>
          )}
          {onEdit && (
            <button className="btn btn--ghost" onClick={onEdit}>
              Edit Parameters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
