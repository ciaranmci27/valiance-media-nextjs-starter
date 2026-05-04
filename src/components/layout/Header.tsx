'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';

const DRAWER_ID = 'site-header-drawer';

interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

interface HeaderProps {
  navLinks?: NavLink[];
  showCTA?: boolean;
  ctaText?: string;
  ctaHref?: string;
  transparent?: boolean;
}

export function Header({
  navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' },
  ],
  showCTA = true,
  ctaText = 'Call to Action',
  ctaHref = '#download',
  transparent = true,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let lastState = !transparent || window.scrollY > 12;
    setScrolled(lastState);
    const update = () => {
      frame = 0;
      const next = !transparent || window.scrollY > 12;
      if (next !== lastState) {
        lastState = next;
        setScrolled(next);
      }
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [transparent]);

  // Drawer keyboard + focus management:
  // - Escape closes and returns focus to the hamburger
  // - Opening moves focus to the first link inside the drawer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    // Defer to allow the visibility transition to start
    const focusTimer = window.setTimeout(() => {
      const firstLink = drawerRef.current?.querySelector<HTMLElement>('a, button');
      firstLink?.focus();
    }, 50);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      <div className="site-header__inner">
        <Link href="/" className="site-header__logo" aria-label="Home">
          <Logo priority className="site-header__logo-img" />
        </Link>

        <nav className="site-header__nav" aria-label="Primary">
          {navLinks.map((link) => (
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="site-header__link"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="site-header__link"
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        <div className="site-header__actions">
          {showCTA && (
            <Link href={ctaHref} className="btn-pill site-header__cta">
              {ctaText}
            </Link>
          )}
          <button
            ref={hamburgerRef}
            type="button"
            className={`site-header__menu ${open ? 'site-header__menu--open' : ''}`}
            aria-expanded={open}
            aria-controls={DRAWER_ID}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="site-header__menu-line site-header__menu-line--top" />
            <span className="site-header__menu-line site-header__menu-line--mid" />
            <span className="site-header__menu-line site-header__menu-line--bot" />
          </button>
        </div>
      </div>

      <div
        ref={drawerRef}
        id={DRAWER_ID}
        className={`site-header__drawer ${open ? 'site-header__drawer--open' : ''}`}
        aria-hidden={!open}
      >
        {navLinks.map((link) => (
          link.external ? (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="site-header__drawer-link"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="site-header__drawer-link"
            >
              {link.label}
            </Link>
          )
        ))}
        {showCTA && (
          <Link href={ctaHref} onClick={close} className="btn-pill">
            {ctaText}
          </Link>
        )}
      </div>
    </header>
  );
}
