// app/admin/login/page.tsx

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/shared/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Login attempt started with:", email);
    setError(null);
    setLoading(true);

    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Configurazione Supabase mancante. Verifica le variabili d'ambiente su Vercel e fai il Redeploy.");
      }
      await signIn(email, password);
      console.log("Login successful, redirecting...");
      router.push("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Credenziali non valide.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-wood-dark min-h-screen flex items-center justify-center p-4">
      <div className="bg-cream rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <Logo size="lg" className="text-wood-dark" />
          <p className="text-wood-light font-body mt-2 text-sm">
            Accesso area operatore
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-wood-med uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-wood-pale/50 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-poke focus:ring-1 focus:ring-poke transition-shadow"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-wood-med uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-wood-pale/50 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-poke focus:ring-1 focus:ring-poke transition-shadow"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-body text-center">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-poke hover:bg-poke-dark text-white rounded-xl py-3 font-bold transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>
      </div>
    </div>
  );
}
