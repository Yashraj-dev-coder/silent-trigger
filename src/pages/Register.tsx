import { Link, useNavigate } from 'react-router-dom';
import { Siren, ArrowRight, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm: z.string().min(6, 'Confirm your password'),
}).refine((data) => data.password === data.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

type FormData = z.infer<typeof schema>;

export function Register() {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const { error } = await signUp(data.email, data.password, data.name, data.phone);
    if (error) {
      toast('error', 'Registration failed', error);
      return;
    }
    // Auto-login after registration (email is auto-confirmed via edge function)
    const { error: loginError } = await signIn(data.email, data.password);
    if (loginError) {
      toast('success', 'Account created', 'Please sign in with your credentials.');
      navigate('/login');
      return;
    }
    toast('success', 'Welcome to Silent Trigger', 'Your account is ready.');
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
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm text-navy-300 mb-6">Sign up to start using Silent Trigger</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Jane Doe"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="+91 98765 43210"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirm?.message}
              {...register('confirm')}
            />
            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              Create Account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-300">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-info-400 hover:text-info-300">
              Sign in
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
