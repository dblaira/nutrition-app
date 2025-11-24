import { login, signup } from "./actions";

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string };
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8 rounded-2xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-display font-bold text-white">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to track your nutrition</p>
                </div>

                <form className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            name="email"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="pt-4 space-y-3">
                        <button
                            formAction={login}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            formAction={signup}
                            className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold py-3 rounded-xl transition-colors"
                        >
                            Sign Up
                        </button>
                    </div>

                    {searchParams?.message && (
                        <p className="text-center text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">
                            {searchParams.message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
