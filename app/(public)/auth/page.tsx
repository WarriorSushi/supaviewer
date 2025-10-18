import { AuthModal } from '@/components/auth/auth-modal'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          <AuthModal />
        </div>
      </div>
    </div>
  )
}
