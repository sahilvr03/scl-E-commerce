import { Suspense } from 'react';
import LoginForm from '../../components/loginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}