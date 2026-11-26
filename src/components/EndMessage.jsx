// The live region is always in the page, so screen readers announce the message when it appears.
export default function EndMessage({ message, onDismiss }) {
  return (
    <div className={message ? "end-message" : "sr"} role="status" aria-live="polite">
      {message && (
        <>
          <span>{message}</span>
          <button type="button" onClick={onDismiss}>
            Dismiss
          </button>
        </>
      )}
    </div>
  );
}
