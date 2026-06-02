import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@clerk/tanstack-react-start'

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm animate-fade-in-up">
        <SignUp
          appearance={{
            elements: {
              rootBox: { width: '100%' },
              card: {
                background: 'var(--color-surface)',
                border: '1px solid var(--color-outline-variant)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                borderRadius: '12px',
                color: 'var(--color-on-surface)',
              },
              headerTitle: {
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--color-on-surface)',
              },
              headerSubtitle: { color: 'var(--color-on-surface-variant)' },
              socialButtonsBlockButton: {
                background: 'var(--color-surface)',
                border: '1px solid var(--color-outline-variant)',
                color: 'var(--color-on-surface)',
                borderRadius: '10px',
              },
              formFieldLabel: { color: 'var(--color-on-surface-variant)' },
              formFieldInput: {
                background: 'var(--color-surface)',
                border: '1px solid var(--color-outline-variant)',
                color: 'var(--color-on-surface)',
                borderRadius: '10px',
              },
              formButtonPrimary: {
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                fontWeight: 500,
                borderRadius: '10px',
              },
              footerActionText: { color: 'var(--color-on-surface-variant)' },
              footerActionLink: { color: 'var(--color-primary)' },
              dividerLine: { background: 'var(--color-outline-variant)' },
              dividerText: { color: 'var(--color-on-surface-variant)' },
            },
          }}
          signInUrl="/auth/login"
        />
      </div>
    </div>
  )
}
