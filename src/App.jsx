import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { initGoogleClient, onAuthStateChanged, isSignedIn, getCurrentUser } from "./googleClient";
import Auth from "./Auth";
import ChildView from "./components/views/ChildView";
import ParentView from "./components/views/ParentView";

// --- Main App with Routing ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize Google API client
        await initGoogleClient();

        // Check if user is already signed in
        if (isSignedIn()) {
          const currentUser = getCurrentUser();
          setUser(currentUser);
        }

        // Listen for auth state changes
        onAuthStateChanged((newUser) => {
          setUser(newUser);
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-theme-50 to-theme-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🧸</div>
          <p className="text-slate-600">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  // Create session object compatible with existing components
  const session = {
    user: {
      id: user.getBasicProfile().getId(),
      email: user.getBasicProfile().getEmail(),
      user_metadata: {
        name: user.getBasicProfile().getName(),
      },
    },
  };

  return (
    <Routes>
      <Route path="/" element={<ChildView session={session} />} />
      <Route path="/szulo" element={<ParentView session={session} />} />
    </Routes>
  );
}
