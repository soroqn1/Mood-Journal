"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (type: 'login' | 'signup') => {
        const { error } = type === 'login'
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password });

        if (error) alert(error.message);
        else router.push("/");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <Card className="p-8 w-full max-w-md space-y-4">
                <h1 className="text-2xl font-bold text-center">Mood Journal Auth</h1>
                <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <div className="flex gap-2">
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={() => handleLogin('login')}>
                            Login
                        </Button>
                        <Button variant="outline" onClick={() => handleLogin('signup')}>
                            Sign Up
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}