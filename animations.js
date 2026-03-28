// animations.js - v1.0.0 (UX Polish)

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
const ToastContext = React.createContext(null);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return React.createElement(ToastContext.Provider, { value: { addToast, removeToast } },
    children,
    React.createElement(ToastContainer, { toasts, removeToast })
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return React.createElement('div', { className: 'toast-container' },
    toasts.map(toast => 
      React.createElement(Toast, { key: toast.id, toast, onClose: () => removeToast(toast.id) })
    )
  );
};

const Toast = ({ toast, onClose }) => {
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    watchlist: '♡',
    watched: '✓'
  };

  return React.createElement('div', { 
    className: `toast toast-${toast.type}`,
    onClick: onClose
  },
    React.createElement('span', { className: 'toast-icon' }, icons[toast.type] || icons.success),
    React.createElement('span', { className: 'toast-message' }, toast.message)
  );
};

const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ============================================
// CONFETTI CELEBRATION
// ============================================
const Confetti = ({ active, onComplete }) => {
  const [particles, setParticles] = React.useState([]);

  React.useEffect(() => {
    if (!active) return;

    const colors = ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#fff'];
    const newParticles = [];

    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        duration: Math.random() * 1 + 2
      });
    }

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return React.createElement('div', { className: 'confetti-container' },
    particles.map(p => 
      React.createElement('div', {
        key: p.id,
        className: 'confetti-particle',
        style: {
          left: `${p.x}%`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
          backgroundColor: p.color,
          width: `${p.size}px`,
          height: `${p.size}px`
        }
      })
    )
  );
};

// ============================================
// SWIPE GESTURE HOOK
// ============================================
const useSwipeGesture = (onSwipeLeft, onSwipeRight, onSwipeUp, options = {}) => {
  const { threshold = 50, enabled = true } = options;
  const touchStart = React.useRef({ x: 0, y: 0 });
  const touchEnd = React.useRef({ x: 0, y: 0 });

  const onTouchStart = React.useCallback((e) => {
    if (!enabled) return;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  }, [enabled]);

  const onTouchMove = React.useCallback((e) => {
    if (!enabled) return;
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  }, [enabled]);

  const onTouchEnd = React.useCallback(() => {
    if (!enabled) return;
    
    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = touchStart.current.y - touchEnd.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Horizontal swipe
    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      if (deltaX > 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    }
    // Vertical swipe (up only)
    else if (absDeltaY > absDeltaX && absDeltaY > threshold && deltaY > 0) {
      onSwipeUp?.();
    }

    // Reset
    touchStart.current = { x: 0, y: 0 };
    touchEnd.current = { x: 0, y: 0 };
  }, [enabled, threshold, onSwipeLeft, onSwipeRight, onSwipeUp]);

  return { onTouchStart, onTouchMove, onTouchEnd };
};

// ============================================
// DICE ROLL ANIMATION COMPONENT
// ============================================
const DiceRollAnimation = ({ isRolling }) => {
  if (!isRolling) return null;

  return React.createElement('div', { className: 'dice-roll-container' },
    React.createElement('div', { className: 'dice-roll' },
      React.createElement('div', { className: 'dice' },
        [1, 2, 3, 4, 5, 6].map(face => 
          React.createElement('div', { key: face, className: `dice-face dice-face-${face}` },
            [...Array(face)].map((_, i) => 
              React.createElement('span', { key: i, className: 'dice-dot' })
            )
          )
        )
      )
    ),
    React.createElement('p', { className: 'dice-text' }, 'Finding your next watch...')
  );
};

// ============================================
// ANIMATED COUNTER
// ============================================
const AnimatedCounter = ({ value, duration = 500 }) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const previousValue = React.useRef(0);

  React.useEffect(() => {
    const startValue = previousValue.current;
    const endValue = parseFloat(value) || 0;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeOut;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return React.createElement('span', null, displayValue.toFixed(1));
};

// ============================================
// ANIMATED HEART (for watchlist)
// ============================================
const AnimatedHeart = ({ filled, onClick, size = 24 }) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick?.();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return React.createElement('button', {
    onClick: handleClick,
    className: `animated-heart ${filled ? 'filled' : ''} ${isAnimating ? 'pulse' : ''}`,
    'aria-label': filled ? 'Remove from watchlist' : 'Add to watchlist'
  },
    React.createElement('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: filled ? 'currentColor' : 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      width: size,
      height: size
    },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z'
      })
    )
  );
};

// ============================================
// ANIMATED CHECKMARK (for watched)
// ============================================
const AnimatedCheckmark = ({ checked, onClick, size = 24 }) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick?.();
    setTimeout(() => setIsAnimating(false), 400);
  };

  return React.createElement('button', {
    onClick: handleClick,
    className: `animated-checkmark ${checked ? 'checked' : ''} ${isAnimating ? 'pop' : ''}`,
    'aria-label': checked ? 'Mark as unwatched' : 'Mark as watched'
  },
    React.createElement('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2.5,
      width: size,
      height: size,
      className: 'checkmark-svg'
    },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M4.5 12.75l6 6 9-13.5',
        className: 'checkmark-path'
      })
    )
  );
};

// ============================================
// RIPPLE BUTTON EFFECT
// ============================================
const RippleButton = ({ children, onClick, className, disabled, ...props }) => {
  const [ripples, setRipples] = React.useState([]);

  const handleClick = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { id, x, y }]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);

    onClick?.(e);
  };

  return React.createElement('button', {
    onClick: handleClick,
    className: `ripple-button ${className || ''}`,
    disabled,
    ...props
  },
    children,
    ripples.map(ripple => 
      React.createElement('span', {
        key: ripple.id,
        className: 'ripple',
        style: { left: ripple.x, top: ripple.y }
      })
    )
  );
};

// ============================================
// CARD FLIP REVEAL
// ============================================
const CardReveal = ({ children, isRevealing, onRevealComplete }) => {
  const [showContent, setShowContent] = React.useState(false);

  React.useEffect(() => {
    if (isRevealing) {
      setShowContent(false);
      const timer = setTimeout(() => {
        setShowContent(true);
        onRevealComplete?.();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isRevealing, onRevealComplete]);

  return React.createElement('div', { 
    className: `card-reveal ${isRevealing ? 'revealing' : ''} ${showContent ? 'revealed' : ''}`
  },
    React.createElement('div', { className: 'card-reveal-inner' },
      React.createElement('div', { className: 'card-reveal-front' },
        React.createElement('div', { className: 'card-reveal-pattern' },
          React.createElement('span', { className: 'card-reveal-icon' }, '🎬')
        )
      ),
      React.createElement('div', { className: 'card-reveal-back' }, children)
    )
  );
};

// ============================================
// SHAKE ANIMATION WRAPPER
// ============================================
const ShakeWrapper = ({ children, trigger }) => {
  const [isShaking, setIsShaking] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return React.createElement('div', { 
    className: isShaking ? 'shake-animation' : ''
  }, children);
};

// ============================================
// FLOATING ACTION HINT (for mobile swipe)
// ============================================
const SwipeHint = ({ show, onDismiss }) => {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!show) return null;

  return React.createElement('div', { className: 'swipe-hint', onClick: onDismiss },
    React.createElement('div', { className: 'swipe-hint-content' },
      React.createElement('div', { className: 'swipe-hint-arrows' },
        React.createElement('span', { className: 'swipe-arrow left' }, '←'),
        React.createElement('span', { className: 'swipe-arrow right' }, '→')
      ),
      React.createElement('p', null, 'Swipe for more movies')
    )
  );
};