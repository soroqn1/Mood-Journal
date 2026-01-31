"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6 selection:bg-primary/30">
            <div className="w-full max-w-[320px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {mode === 'login' ? 'Sign in' : 'Create account'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        to continue to Mood Journal
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase px-1">Email</label>
                        <Input
                            placeholder="Enter your email..."
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="h-10 bg-transparent border-border focus:ring-1 focus:ring-ring transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase px-1">Password</label>
                        <Input
                            type="password"
                            placeholder="Enter your password..."
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="h-10 bg-transparent border-border focus:ring-1 focus:ring-ring transition-all"
                        />
                    </div>

                    <Button
                        className="w-full h-10 mt-2 bg-foreground text-background hover:bg-foreground/90 font-medium transition-all"
                        onClick={handleAuth}
                    >
                        {mode === 'login' ? 'Continue' : 'Sign up'}
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border"></span>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-background px-2 text-muted-foreground font-semibold tracking-wider">or</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="w-full h-10 border-border hover:bg-accent text-sm font-medium transition-all"
                    onClick={handleAnonymous}
                >
                    Try as Guest
                </Button>

                <div className="text-center">
                    <button
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium underline underline-offset-4"
                    >
                        {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
}