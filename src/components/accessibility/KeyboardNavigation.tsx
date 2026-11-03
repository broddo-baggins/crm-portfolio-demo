import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { toast } from '@/hooks/use-toast';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
}

/**
 * Enhanced Keyboard Navigation Component
 * Implements comprehensive keyboard shortcuts and navigation patterns
 * Supports WCAG 2.1 AA+ keyboard accessibility requirements
 */
export const KeyboardNavigation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'h',
      altKey: true,
      description: t('keyboard.goHome', 'Go to Home'),
      action: () => navigate('/')
    },
    {
      key: 'd',
      altKey: true,
      description: t('keyboard.goDashboard', 'Go to Dashboard'),
      action: () => navigate('/dashboard')
    },
    {
      key: 'l',
      altKey: true,
      description: t('keyboard.goLeads', 'Go to Leads'),
      action: () => navigate('/leads')
    },
    {
      key: 'p',
      altKey: true,
      description: t('keyboard.goProjects', 'Go to Projects'),
      action: () => navigate('/projects')
    },
    {
      key: 's',
      altKey: true,
      description: t('keyboard.goSettings', 'Go to Settings'),
      action: () => navigate('/settings')
    },
    {
      key: '/',
      ctrlKey: true,
      description: t('keyboard.search', 'Global Search'),
      action: () => {
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    },
    {
      key: '?',
      shiftKey: true,
      description: t('keyboard.showShortcuts', 'Show Keyboard Shortcuts'),
      action: () => setShowShortcuts(prev => !prev)
    },
    {
      key: 'Escape',
      description: t('keyboard.closeModal', 'Close Modal/Menu'),
      action: () => {
        // Close any open modals or menus
        const closeButtons = document.querySelectorAll('[data-close-modal], [data-close-menu]');
        closeButtons.forEach(button => {
          if (button instanceof HTMLElement) {
            button.click();
          }
        });
        setShowShortcuts(false);
      }
    },
    {
      key: 'n',
      ctrlKey: true,
      description: t('keyboard.newItem', 'New Item (Context Dependent)'),
      action: () => {
        const newButtons = document.querySelectorAll('[data-new-item]');
        if (newButtons.length > 0 && newButtons[0] instanceof HTMLElement) {
          newButtons[0].click();
        }
      }
    },
    {
      key: 'Enter',
      ctrlKey: true,
      description: t('keyboard.submitForm', 'Submit Active Form'),
      action: () => {
        const activeForm = document.querySelector('form:focus-within');
        if (activeForm) {
          const submitButton = activeForm.querySelector('[type="submit"]') as HTMLButtonElement;
          if (submitButton) {
            submitButton.click();
          }
        }
      }
    }
  ];

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere with input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        // Allow Escape to blur input fields
        if (event.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.altKey === event.altKey
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
        
        // Announce the action to screen readers
        const announcement = `Keyboard shortcut activated: ${matchingShortcut.description}`;
        announceToScreenReader(announcement);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);

  // Screen reader announcement utility
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // Focus management utilities
  const focusNextElement = () => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    (focusableElements[nextIndex] as HTMLElement)?.focus();
  };

  const focusPreviousElement = () => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
    const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    (focusableElements[prevIndex] as HTMLElement)?.focus();
  };

  return (
    <>
      {/* Keyboard Shortcuts Help Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            className="bg-background border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-labelledby="shortcuts-title"
            aria-describedby="shortcuts-description"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="shortcuts-title" className="text-xl font-semibold">
                {t('keyboard.shortcutsTitle', 'Keyboard Shortcuts')}
              </h2>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label={t('keyboard.close', 'Close shortcuts')}
                data-close-modal
              >
                ✕
              </button>
            </div>
            
            <p id="shortcuts-description" className="text-muted-foreground mb-6">
              {t('keyboard.shortcutsDescription', 'Use these keyboard shortcuts to navigate the application more efficiently.')}
            </p>

            <div className="grid gap-4">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">{shortcut.description}</span>
                  <div className="flex gap-1">
                    {shortcut.ctrlKey && (
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl</kbd>
                    )}
                    {shortcut.altKey && (
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt</kbd>
                    )}
                    {shortcut.shiftKey && (
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift</kbd>
                    )}
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">
                      {shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase()}
                    </kbd>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-sm text-muted-foreground">
              <p className="mb-2">
                <strong>{t('keyboard.additionalTips', 'Additional Tips:')}</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('keyboard.tip1', 'Use Tab to navigate between interactive elements')}</li>
                <li>{t('keyboard.tip2', 'Use Shift+Tab to navigate backwards')}</li>
                <li>{t('keyboard.tip3', 'Use Enter or Space to activate buttons and links')}</li>
                <li>{t('keyboard.tip4', 'Use Arrow keys to navigate within menus and lists')}</li>
                <li>{t('keyboard.tip5', 'Use Escape to close modals and cancel actions')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Hidden screen reader instructions */}
      <div className="sr-only">
        <p>{t('keyboard.screenReaderInstructions', 'Press Shift+? to view available keyboard shortcuts')}</p>
      </div>
    </>
  );
};

/**
 * Hook for managing keyboard shortcuts in components
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.altKey === event.altKey
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

export default KeyboardNavigation; 