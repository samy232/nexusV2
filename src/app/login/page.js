"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div style={{ 
      height: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "radial-gradient(circle at center, #111 0%, #050505 100%)"
    }}>
      <div className="glass animate-fade-in" style={{ padding: "3rem", width: "400px", display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "900", 
            background: "linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-2px"
          }}>
            NEXUS
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Welcome back, trader.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Email</label>
            <input 
              type="email" 
              required
              className="glass"
              style={{ padding: "1rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--card-border)", color: "white", outline: "none" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Password</label>
            <input 
              type="password" 
              required
              className="glass"
              style={{ padding: "1rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--card-border)", color: "white", outline: "none" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ color: "var(--accent-danger)", fontSize: "0.875rem", textAlign: "center" }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: "1rem",
              borderRadius: "8px",
              border: "none",
              background: "var(--accent-primary)",
              color: "black",
              fontWeight: "800",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              marginTop: "1rem",
              transition: "transform 0.2s"
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          Don't have an account? <Link href="/register" style={{ color: "var(--accent-primary)", fontWeight: "600" }}>Register</Link>
        </div>
      </div>
    </div>
  );
}
