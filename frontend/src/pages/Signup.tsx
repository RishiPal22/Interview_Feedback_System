import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../Client";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { user, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Signup successful! Check your email for verification.");
      setUsername("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-6">
      <div className="w-full max-w-md bg-[#1e1e1e] text-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-purple-400 text-center mb-6">
          Create an Account
        </h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-400 text-sm text-center">{success}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full p-2 border border-purple-500 bg-[#2d2d2d] text-white rounded-md focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border border-purple-500 bg-[#2d2d2d] text-white rounded-md focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2 border border-purple-500 bg-[#2d2d2d] text-white rounded-md focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-md transition disabled:bg-gray-400"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/signin" className="text-purple-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
