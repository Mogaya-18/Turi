import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ProtectedRoute({ allowedRoles, children }) {
  const [status, setStatus] = useState("loading"); // "loading" | "authorized" | "unauthenticated" | "unauthorized"
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const verifyAccess = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (isMounted) setStatus("unauthenticated");
          return;
        }

        const user = session.user;

        // Match Login.jsx role resolution (profiles by ID -> email -> metadata)
        let { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile && user.email) {
          const { data: profileByEmail } = await supabase
            .from("profiles")
            .select("role")
            .ilike("email", user.email)
            .maybeSingle();
          profile = profileByEmail;
        }

        const rawRole = (
          profile?.role ||
          user.user_metadata?.role ||
          "patient"
        ).toLowerCase();
        const normalizedRole = rawRole === "administrator" ? "admin" : rawRole;

        if (isMounted) {
          setUserRole(normalizedRole);
          if (allowedRoles.includes(normalizedRole)) {
            setStatus("authorized");
          } else {
            setStatus("unauthorized");
          }
        }
      } catch {
        if (isMounted) setStatus("unauthenticated");
      }
    };

    verifyAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && isMounted) {
        setStatus("unauthenticated");
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [allowedRoles]);

  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          color: "#006d5b",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 600,
        }}
      >
        Verifying workspace access...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  // If a logged-in user manually types another role's URL, redirect them to their own workspace
  if (status === "unauthorized") {
    if (userRole === "doctor")
      return <Navigate to="/doctor/dashboard" replace />;
    if (userRole === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}
