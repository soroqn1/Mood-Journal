"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleAuth = async () => {
        const { error } = mode === 'login'
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password });

        if (error) alert(error.message);
        else router.push("/");
    };

    const handleAnonymous = async () => {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) alert(error.message);
        else router.push("/");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4 font-sans text-white">
            <Card className="p-8 w-full max-w-md bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            {mode === 'login' ? 'Welcome Back' : 'Get Started'}
                        </h1>
                        <p className="text-slate-400 text-sm">
                            {mode === 'login'
                                ? 'Sign in to keep track of your mood'
                                : 'Create an account to start your journal'}
                        </p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500 h-11"
                            />
                        </div>
                        <Button
                            className="w-full h-11 bg-blue-600 hover:bg-blue-500 transition-all font-semibold"
                            onClick={handleAuth}
                        >
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                        </Button>
                    </div>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-900 px-2 text-slate-500 font-medium">Or continue as guest</span>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        className="w-full h-12 bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 shadow-lg text-lg font-bold"
                        onClick={handleAnonymous}
                    >
                        Incognito Mode
                    </Button>

                    <div className="text-center pt-2">
                        <p className="text-sm text-slate-400">
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-blue-400 hover:text-blue-300 font-semibold underline-offset-4 hover:underline"
                            >
                                {mode === 'login' ? 'Join Now' : 'Sign In Instead'}
                            </button>
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}