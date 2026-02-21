import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, User, Phone } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const SignupPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      });

      if (error) {
        if (error.message.includes('registered')) {
          setError('User already exists. Please login.');
          return;
        }
        throw error;
      }

      navigate('/dashboard/student');

    } catch (err) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0b1736] p-4 relative overflow-hidden">

      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/20 via-[#0b1736] to-[#0b1736] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <GlassCard className="w-full max-w-md p-8 relative z-10 backdrop-blur-xl border-white/10 shadow-2xl shadow-blue-900/20">

        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500 mb-4 ring-1 ring-blue-500/30">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign up to get started as a student
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">


          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-lg bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>


          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-lg bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>


          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="1234567890"
                className="w-full rounded-lg bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-400 text-sm">
            Already have an account?
          </span>
          <Link
            to="/login"
            className="ml-1 text-blue-400 hover:text-blue-300 text-sm font-medium underline"
          >
            Login
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default SignupPage;