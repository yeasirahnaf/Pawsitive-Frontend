'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Icon } from '@iconify/react';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            await login(email, password);
            // Check if we need to redirect to checkout
            const redirectInt = sessionStorage.getItem('redirect_after_login');
            if (redirectInt) {
                sessionStorage.removeItem('redirect_after_login');
                router.push(redirectInt);
            } else {
                router.push('/profile');
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="card w-full max-w-md bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                            <Icon icon="lucide:paw-print" className="text-primary" />
                            Welcome Back
                        </h1>
                        <p className="text-base-content/60 text-sm mt-1">Login to your Pawsitive account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        <label className="form-control w-full">
                            <div className="label"><span className="label-text font-medium">Email</span></div>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                className="input input-bordered w-full"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </label>

                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-medium">Password</span>
                                <span className="label-text-alt link link-hover text-base-content/60">Forgot password?</span>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </label>

                        {errorMsg && (
                            <div className="alert alert-error text-sm py-2">
                                <Icon icon="lucide:alert-circle" width={16} />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary mt-2" disabled={isLoading}>
                            {isLoading ? <span className="loading loading-spinner" /> : 'Login'}
                        </button>

                    </form>

                    <div className="divider text-sm text-base-content/40 my-6">OR</div>

                    <button className="btn btn-outline btn-block gap-3">
                        <Icon icon="logos:google-icon" width={18} />
                        Continue with Google
                    </button>

                    <p className="text-center text-sm mt-6">
                        Don&apos;t have an account? <Link href="/register" className="link link-primary font-bold">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
