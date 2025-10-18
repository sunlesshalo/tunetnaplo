import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import ChildView from "./components/views/ChildView";
import ParentView from "./components/views/ParentView";

// --- Main App with Routing ---
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Check current session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setSession(session);
        setLoading(false);
        return;
      }

      // Auto-login if credentials are configured via environment
      const autoEmail = import.meta.env.VITE_AUTO_LOGIN_EMAIL;
      const autoPassword = import.meta.env.VITE_AUTO_LOGIN_PASSWORD;

      if (autoEmail && autoPassword && autoEmail !== 'your-email@example.com') {
        console.log('🔐 Auto-logging in...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: autoEmail,
          password: autoPassword,
        });

        if (error) {
          console.error('Auto-login failed:', error.message);
        } else {
          setSession(data.session);
        }
      }

      setLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🧸</div>
          <p className="text-slate-600">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <Routes>
      <Route path="/" element={<ChildView session={session} />} />
      <Route path="/szulo" element={<ParentView session={session} />} />
    </Routes>
  );
}
