import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import Hero from '@/components/Hero'
import Pricing from '@/components/Pricing'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-md bg-[#0a0a0f]/80">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold">InvoiceFlow</span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-200"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-400 hover:text-white text-sm transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-200"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </nav>

      <Hero />
      <Pricing userId={user?.id} />

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-gray-600 text-sm">
        <p>© 2025 InvoiceFlow. Stop chasing clients. Start getting paid.</p>
      </footer>
    </main>
  )
}
