import { Navigate, Outlet } from "react-router-dom";
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from "react";
import { supabase } from "@/Client";

function Privateroute() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Added loading state

    useEffect(() => {
        async function fetchSession() {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false); // Stop loading after fetching user

            const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
            });

            return () => {
                authListener.subscription.unsubscribe(); // Corrected cleanup function
            };
        }

        fetchSession();
    }, []);

    if (loading) return null; // Prevent unnecessary redirection before user state is determined

    return user ? <Outlet /> : <Navigate to="/signup" />;
}

export default Privateroute;
