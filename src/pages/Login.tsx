import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Siren, ArrowRight, ArrowLeft, Loader2, User, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, seedDemoAccounts } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DEMO_ACCOUNTS } from '@/lib/constants';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const { error } = await signIn(data.email, data.password);
    if (error) {
      toast('error', 'Login failed', error);
      return;
    }
    toast('success', 'Welcome back', 'Login successful');
    navigate('/dashboard');
  };

  const fillDemo = (type: 'user' | 'responder') => {
    const acct = DEMO_ACCOUNTS[type];
    setValue('email', acct.email);
    setValue('password', acct.password);
  };

  const handleDemoLogin = async () => {
    setSeeding(true);
    await seedDemoAccounts();
    const { error } = await signIn(DEMO_ACCOUNTS.user.email, DEMO_ACCOUNTS.user.password);
    setSeeding(false);
    if (error) {
      toast('error', 'Demo login failed', error);
      return;
    }
    toast('success', 'Demo mode active', 'Logged in as demo user');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-info-950/10 via-navy-950 to-navy-950" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-info-500 to-info-700">
            <Siren className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Silent Trigger</span>
        </Link>

        <div className="glass-card p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-navy-300 mb-6">Sign in to your Silent Trigger account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-navy-800" />
            <span className="text-xs text-navy-400 uppercase tracking-wider">Demo Accounts</span>
            <div className="h-px flex-1 bg-navy-800" />
          </div>

          <div className="space-y-2">
            <button
              onClick={() => fillDemo('user')}
              className="flex w-full items-center gap-3 rounded-lg border border-navy-700 bg-navy-800/30 px-4 py-3 text-left hover:border-info-500/40 hover:bg-navy-800/50 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-info-500/20">
                <User className="h-4 w-4 text-info-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-100">Demo User</p>
                <p className="text-xs text-navy-400 truncate">{DEMO_ACCOUNTS.user.email}</p>
              </div>
              <span className="text-xs text-navy-400">Fill</span>
            </button>
            <button
              onClick={() => fillDemo('responder')}
              className="flex w-full items-center gap-3 rounded-lg border border-navy-700 bg-navy-800/30 px-4 py-3 text-left hover:border-info-500/40 hover:bg-navy-800/50 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-500/20">
                <Shield className="h-4 w-4 text-warning-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-100">Demo Responder</p>
                <p className="text-xs text-navy-400 truncate">{DEMO_ACCOUNTS.responder.email}</p>
              </div>
              <span className="text-xs text-navy-400">Fill</span>
            </button>
          </div>

          <Button variant="outline" size="md" className="w-full mt-3" onClick={handleDemoLogin} disabled={seeding}>
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ZapIcon />}
            {seeding ? 'Setting up demo...' : 'One-click Demo Login'}
          </Button>

          <p className="mt-6 text-center text-sm text-navy-300">
            New to Silent Trigger?{' '}
            <Link to="/register" className="font-semibold text-info-400 hover:text-info-300">
              Create an account
            </Link>
          </p>
        </div>

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-navy-400 hover:text-navy-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </div>
  );
}

function ZapIcon() {
  return <span className="text-sm">⚡</span>;
}
