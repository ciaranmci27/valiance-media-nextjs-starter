'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  /** When true, renders children directly without tooltip functionality */
  disabled?: boolean;
}

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  className,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = React.useState(position);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl?.offsetWidth || 0;
    const tooltipHeight = tooltipEl?.offsetHeight || 0;
    const padding = 8;
    const viewportPadding = 8;

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const positions = {
      top: {
        top: triggerRect.top - tooltipHeight - padding,
        left: triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2,
      },
      bottom: {
        top: triggerRect.bottom + padding,
        left: triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2,
      },
      left: {
        top: triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2,
        left: triggerRect.left - tooltipWidth - padding,
      },
      right: {
        top: triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2,
        left: triggerRect.right + padding,
      },
    };

    const fitsInViewport = (pos: 'top' | 'bottom' | 'left' | 'right') => {
      const c = positions[pos];
      switch (pos) {
        case 'top':
          return c.top >= viewportPadding;
        case 'bottom':
          return c.top + tooltipHeight <= viewport.height - viewportPadding;
        case 'left':
          return c.left >= viewportPadding;
        case 'right':
          return c.left + tooltipWidth <= viewport.width - viewportPadding;
      }
    };

    let bestPosition = position;

    if (!fitsInViewport(position)) {
      const opposites: Record<string, 'top' | 'bottom' | 'left' | 'right'> = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
      };

      if (fitsInViewport(opposites[position])) {
        bestPosition = opposites[position];
      } else {
        const allPositions: ('top' | 'bottom' | 'left' | 'right')[] = ['bottom', 'top', 'right', 'left'];
        for (const pos of allPositions) {
          if (fitsInViewport(pos)) {
            bestPosition = pos;
            break;
          }
        }
      }
    }

    let { top, left } = positions[bestPosition];

    if (bestPosition === 'top' || bestPosition === 'bottom') {
      left = Math.max(viewportPadding, Math.min(left, viewport.width - tooltipWidth - viewportPadding));
    }

    if (bestPosition === 'left' || bestPosition === 'right') {
      top = Math.max(viewportPadding, Math.min(top, viewport.height - tooltipHeight - viewportPadding));
    }

    setActualPosition(bestPosition);
    setCoords({ top, left });
  }, [position]);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setShouldRender(true);
      requestAnimationFrame(() => {
        calculatePosition();
        setIsVisible(true);
      });
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    setTimeout(() => setShouldRender(false), 150);
  };

  React.useEffect(() => {
    if (!shouldRender) return;

    const handleReposition = () => calculatePosition();
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);

    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [shouldRender, calculatePosition]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    setActualPosition(position);
  }, [position]);

  // Hide tooltip when disabled changes to true
  React.useEffect(() => {
    if (disabled) {
      hideTooltip();
    }
  }, [disabled]);

  const tooltipContent =
    shouldRender && mounted && !disabled ? (
      <div
        ref={tooltipRef}
        role="tooltip"
        className="admin-tooltip-portal"
        style={{
          top: coords.top,
          left: coords.left,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        }}
      >
        <div className="admin-tooltip-content">{content}</div>
      </div>
    ) : null;

  return (
    <span
      ref={triggerRef}
      className={`relative inline-flex${className ? ` ${className}` : ''}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {mounted && tooltipContent && createPortal(tooltipContent, document.body)}
    </span>
  );
}
