import { useState, type FormEvent, type ReactNode } from 'react';
import { BellRing, Shield, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { authService } from '../lib/authService';
import { setAuthState, type AuthState } from '../lib/auth';

type AuthScreenProps = {
  onAuthSuccess: (state: AuthState) => void;
};

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupNickname, setSignupNickname] = useState('');

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await authService.login({
        email: loginEmail,
        password: loginPassword,
      });

      const state: AuthState = { ...token, email: loginEmail };
      setAuthState(state);
      onAuthSuccess(state);
      toast.success('로그인 완료');
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      toast.error('로그인 실패', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signupEmail || !signupPassword || !signupNickname) {
      toast.error('이메일, 비밀번호, 닉네임을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.signup({
        email: signupEmail,
        password: signupPassword,
        nickname: signupNickname,
      });

      const token = await authService.login({
        email: signupEmail,
        password: signupPassword,
      });

      const state: AuthState = { ...token, email: signupEmail };
      setAuthState(state);
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : '회원가입에 실패했습니다.';
      toast.error('회원가입 실패', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-[#0c1728] via-[#0a1f33] to-[#071520] px-6 py-12">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-16 -top-10 h-48 w-48 rounded-full bg-cyan-500/20 blur-[100px]" />
        <div className="absolute bottom-10 right-0 h-60 w-60 rounded-full bg-emerald-500/15 blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.04),transparent_25%)]" />
      </div>

      <div className="relative w-full max-w-md space-y-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
          <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as 'login' | 'signup')}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-white/5 p-1">
              <TabsTrigger value="login" className="rounded-full">
                로그인
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full">
                회원가입
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form
                onSubmit={handleLogin}
                className="flex flex-col"
                style={{ gap: '32px' }}
              >
                <Field
                  label="이메일"
                  input={
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={event => setLoginEmail(event.target.value)}
                      autoComplete="email"
                      className="h-12 rounded-xl bg-white/5 px-4"
                    />
                  }
                />

                <Field
                  label="비밀번호"
                  input={
                    <Input
                      type="password"
                      placeholder="비밀번호"
                      value={loginPassword}
                      onChange={event => setLoginPassword(event.target.value)}
                      autoComplete="current-password"
                      className="h-12 rounded-xl bg-white/5 px-4"
                    />
                  }
                />

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl text-base"
                  style={{ marginTop: '8px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '로그인 중...' : '로그인'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form
                onSubmit={handleSignup}
                className="flex flex-col"
                style={{ gap: '32px' }}
              >
                <Field
                  label="이메일"
                  input={
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={event => setSignupEmail(event.target.value)}
                      autoComplete="email"
                      className="h-12 rounded-xl bg-white/5 px-4"
                    />
                  }
                />

                <Field
                  label="비밀번호"
                  hint="8자 이상 추천"
                  input={
                    <Input
                      type="password"
                      placeholder="8자 이상"
                      value={signupPassword}
                      onChange={event => setSignupPassword(event.target.value)}
                      autoComplete="new-password"
                      className="h-12 rounded-xl bg-white/5 px-4"
                    />
                  }
                />

                <Field
                  label="닉네임"
                  input={
                    <Input
                      type="text"
                      placeholder="표시할 이름"
                      value={signupNickname}
                      onChange={event => setSignupNickname(event.target.value)}
                      autoComplete="nickname"
                      className="h-12 rounded-xl bg-white/5 px-4"
                    />
                  }
                />

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl text-base"
                  style={{ marginTop: '8px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '가입 중...' : '회원가입'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex items-center gap-3 pt-10 text-white/90">
          <img
            src="/cine-catch-logo-dark.png"
            alt="Cine Catch"
            className="h-10 w-auto"
          />
          <div
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: '"SF Pro Display", "Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}
          >
            Cine Catch
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">
      {icon}
      <span>{children}</span>
    </span>
  );
}

function Field({
  label,
  hint,
  input,
}: {
  label: string;
  hint?: string;
  input: ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm">
      <div className="flex items-center justify-between text-muted-foreground">
        <span>{label}</span>
        {hint ? <span className="text-xs">{hint}</span> : null}
      </div>
      {input}
    </label>
  );
}
