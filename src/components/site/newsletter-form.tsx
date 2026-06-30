"use client";

import { useState } from "react";

/**
 * Newsletter signup — placeholder. No backend is wired yet, so the form
 * validates locally and confirms inline. Replace `onSubmit` with a POST to
 * your list provider when ready. Intentionally does not transmit anywhere.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setDone(true);
  }

  if (done) {
    return (
      <p className="footer-news__done" role="status">
        Thanks — you&apos;re on the list. We&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form className="footer-news" onSubmit={handleSubmit} noValidate>
      <label htmlFor="footer-newsletter" className="footer-news__label">
        Product updates
      </label>
      <div className="footer-news__row">
        <input
          id="footer-newsletter"
          type="email"
          className="input footer-news__input"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
          aria-invalid={error ? "true" : undefined}
        />
        <button type="submit" className="btn btn--primary btn--sm">
          Subscribe
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </form>
  );
}
