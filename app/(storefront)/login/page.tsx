"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, Mail, Lock, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

// Access env vars for debugging
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Zod Schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

const otpSchema = z.object({
  otp: z.string().min(6, { message: "OTP must be 6 digits" }).max(6),
});

// Unified Form Values
type AuthFormValues = {
  email: string;
  name?: string;
};

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Get redirect URL & View Mode
  const next = searchParams.get("next") || "/";
  const view = searchParams.get("view"); // 'login' or 'signup'
  const isSignup = view === "signup";

  // Forms
  // We use AuthFormValues to handle both login (no name) and signup (name) scenarios
  const emailForm = useForm<AuthFormValues>({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
    defaultValues: { email: "", name: "" },
    mode: "onChange",
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Reset form validation when switching modes
  useEffect(() => {
    emailForm.clearErrors();
  }, [isSignup, emailForm]);

  // Timer Effect
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Check auth state
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace(next);
      }
    };
    checkUser();
  }, [router, supabase, next]);

  // Auto-submit OTP
  const otpValue = otpForm.watch("otp");
  useEffect(() => {
    if (otpValue?.length === 6) {
      otpForm.handleSubmit(onVerifyOtp)();
    }
  }, [otpValue, otpForm, onVerifyOtp]);

  const onSendOtp = async (data: AuthFormValues) => {
    setLoading(true);
    const { email, name } = data;

    // Debug environment variables
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error("Missing Supabase Environment Variables!");
      toast.error("System Error: Missing configuration");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/v1/callback?next=${encodeURIComponent(next)}`,
          data: isSignup ? { full_name: name, name: name } : undefined,
        },
      });

      if (error) {
        console.error("Supabase Error:", error);
        toast.error(error.message);
      } else {
        const action = isSignup ? "Creating account" : "Logging in";
        toast.success("Code sent!", {
          description: `Check your email to finish ${action.toLowerCase()}.`,
        });
        setStep("otp");
        setResendTimer(60); // Start 60s cooldown
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = useCallback(
    async (data: OtpFormValues) => {
      setLoading(true);
      const { otp } = data;
      const { email, name } = emailForm.getValues();

      try {
        const { data: authData, error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: "email",
        });

        if (error) {
          toast.error(error.message);
          setLoading(false);
        } else {
          // If signup, enforce name save to profiles
          if (isSignup && name && authData.user) {
            try {
              const { error: profileError } = await supabase
                .from("profiles")
                .update({ name: name })
                .eq("id", authData.user.id);

              if (profileError) {
                console.error("Profile Update Error:", profileError);
                // Don't block login, but maybe warn?
              }
            } catch (e) {
              console.error("Profile update exception", e);
            }
          }

          toast.success(
            isSignup ? "Account created! Welcome." : "Welcome back!"
          );
          router.refresh();
          router.push(next);
        }
      } catch (err) {
        toast.error("Failed to verify code");
        setLoading(false);
      }
    },
    [supabase, emailForm, isSignup, router, next]
  );

  const onSocialLogin = async (provider: "google") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/v1/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate social login");
    }
  };

  // Dynamic Text
  const title = isSignup ? "Create an Account" : "Welcome Back";
  const subtitle = isSignup
    ? "Enter your details to get started"
    : "Enter your email to access your account";
  const buttonText = isSignup ? "Sign Up with Email" : "Continue with Email";
  const switchModeText = isSignup
    ? "Already have an account?"
    : "Don&apos;t have an account?";
  const switchModeLinkText = isSignup ? "Log in" : "Sign up";
  const switchModeUrl = isSignup ? "/login" : "/login?view=signup";

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Side - Image (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent z-10" />
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2000"
          alt="Fashion Editorial"
          fill
          priority
          className="object-cover object-center opacity-80"
        />
        <div className="absolute bottom-20 left-12 z-20 max-w-lg">
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter loading-none">
            {isSignup ? "JOIN THE\nREVOLUTION." : "DEFINE YOUR\nSTYLE."}
          </h1>
          <p className="text-white/80 text-lg font-light leading-relaxed">
            {isSignup
              ? "Identify as you. Shop as you. Be you. Join the most inclusive fashion community."
              : "Join the exclusive community of trendsetters. Early access to drops, curated collections, and personalized styling."}
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-8 relative">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 p-8">
          <div className="h-20 w-20 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <Link
              href="/"
              className="inline-block mb-8 hover:opacity-80 transition-opacity"
            >
              <span className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-primary via-purple-500 to-pink-500 hover:scale-105 transition-transform">
                FLASH
              </span>
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">
              {step === "email" ? title : "Check Your Inbox"}
            </h2>
            <p className="text-muted-foreground">
              {step === "email"
                ? subtitle
                : `We&apos;ve sent a 6-digit code to ${emailForm.getValues("email")}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <form
                  onSubmit={emailForm.handleSubmit(onSendOtp)}
                  className="space-y-4"
                >
                  {isSignup && (
                    <div className="space-y-2">
                      <div className="relative group">
                        <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          {...emailForm.register("name")}
                          type="text"
                          placeholder="Your Name"
                          className="pl-10 h-12 text-base bg-muted/30 border-muted focus:border-primary/50 transition-all font-medium"
                          disabled={loading}
                        />
                      </div>
                      {emailForm.formState.errors.name && (
                        <p className="text-sm text-red-500 font-medium pl-1">
                          {emailForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        {...emailForm.register("email")}
                        type="email"
                        placeholder="hello@example.com"
                        className="pl-10 h-12 text-base bg-muted/30 border-muted focus:border-primary/50 transition-all font-medium"
                        disabled={loading}
                      />
                    </div>
                    {emailForm.formState.errors.email && (
                      <p className="text-sm text-red-500 font-medium pl-1">
                        {emailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                    disabled={loading || resendTimer > 0}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : resendTimer > 0 ? (
                      <span className="flex items-center">
                        <Clock className="mr-2 h-5 w-5" />
                        Wait {resendTimer}s
                      </span>
                    ) : (
                      <span className="flex items-center">
                        {buttonText}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground font-medium tracking-wider">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-12 border-muted hover:bg-muted/30 hover:border-muted-foreground/30 transition-all"
                  onClick={() => onSocialLogin("google")}
                  disabled={loading}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    {switchModeText}{" "}
                  </span>
                  <Link
                    href={switchModeUrl}
                    className="font-bold text-primary hover:underline"
                  >
                    {switchModeLinkText}
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <form
                  onSubmit={otpForm.handleSubmit(onVerifyOtp)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        {...otpForm.register("otp")}
                        type="text"
                        placeholder="XXXXXX"
                        className="pl-10 h-12 text-base text-center tracking-[1em] font-mono bg-muted/30 border-muted focus:border-primary/50 transition-all font-bold uppercase"
                        maxLength={6}
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                    {otpForm.formState.errors.otp && (
                      <p className="text-sm text-red-500 font-medium pl-1">
                        {otpForm.formState.errors.otp.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      "Verify & Login"
                    )}
                  </Button>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={emailForm.handleSubmit(onSendOtp)}
                      disabled={resendTimer > 0 || loading}
                      className="w-full text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0
                        ? `Resend code in ${resendTimer}s`
                        : "Resend Code"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Entered wrong email? Be our guest, go back.
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="pt-8 text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our <br />
            <a href="#" className="underline hover:text-foreground">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
