import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  AtSign,
  CircleDot,
  KeyRound,
  MailCheck,
  RefreshCw,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormInput } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { createTestCredentials } from "@/lib/utils";
import type { AuthResponse, StatusResponse } from "@/types/api";
import { useWorkbench } from "@/features/workbench/use-workbench";

const registerSchema = z.object({
  name: z.string().trim().min(4, "Минимум 4 символа").max(32, "Максимум 32 символа"),
  email: z.email("Введите корректный email").max(32, "Максимум 32 символа"),
  password: z.string().min(6, "Минимум 6 символов").max(32, "Максимум 32 символа"),
});

const loginSchema = registerSchema.pick({ email: true, password: true });

const confirmSchema = z.object({
  userId: z.uuid("Введите корректный UUID"),
  token: z.string().trim().min(1, "Вставьте verification token"),
});

type RegisterValues = z.infer<typeof registerSchema>;
type LoginValues = z.infer<typeof loginSchema>;
type ConfirmValues = z.infer<typeof confirmSchema>;

export function AuthFlow() {
  const [loginCredentials, setLoginCredentials] = useState(createTestCredentials);

  return (
    <div className="grid gap-4">
      <FlowIntro />
      <RegisterForm
        initialCredentials={loginCredentials}
        onCredentialsChange={setLoginCredentials}
      />
      <ConfirmForm />
      <LoginForm
        initialCredentials={loginCredentials}
        key={loginCredentials.email}
      />
    </div>
  );
}

function FlowIntro() {
  return (
    <Card className="overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-[#7557ff]/10 blur-3xl" />
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <span className="section-kicker flex items-center gap-2">
            <Sparkles size={11} /> Auth sequence / 01–03
          </span>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] sm:text-2xl">
            От нового пользователя до активной сессии
          </h2>
          <p className="mt-2 max-w-2xl text-xs leading-6 text-[var(--text-muted)]">
            Формы повторяют реальные контракты gateway. Каждый ответ сохраняется в
            журнале, а access token автоматически попадает в панель сессии.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
          <span className="step-dot active">1</span>
          <span className="h-px w-5 bg-white/10" />
          <span className="step-dot">2</span>
          <span className="h-px w-5 bg-white/10" />
          <span className="step-dot">3</span>
        </div>
      </div>
    </Card>
  );
}

function RegisterForm({
  initialCredentials,
  onCredentialsChange,
}: {
  initialCredentials: LoginValues;
  onCredentialsChange: (credentials: LoginValues) => void;
}) {
  const { apiRequest } = useWorkbench();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "Test User",
      ...initialCredentials,
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await apiRequest<StatusResponse>({
        method: "POST",
        path: "/auth/register",
        body: values,
      });
      onCredentialsChange({ email: values.email, password: values.password });
      toast.success("Аккаунт создан. Проверьте письмо для подтверждения.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  const generate = () => {
    const credentials = createTestCredentials();
    reset({ name: "Test User", ...credentials });
    onCredentialsChange(credentials);
    toast.info("Подготовлены новые тестовые данные");
  };

  return (
    <FlowCard
      description="Создаёт пользователя и отправляет событие подтверждения email в Kafka."
      icon={UserPlus}
      number="01"
      path="/auth/register"
      title="Создать аккаунт"
    >
      <form className="grid gap-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            error={errors.name?.message}
            label="Имя"
            name="name"
            register={register("name")}
          />
          <FormInput
            autoComplete="email"
            error={errors.email?.message}
            label="Email"
            name="email"
            register={register("email")}
            type="email"
          />
        </div>
        <FormInput
          autoComplete="new-password"
          error={errors.password?.message}
          label="Пароль"
          name="password"
          register={register("password")}
          type="password"
        />
        <div className="form-actions">
          <Button disabled={isSubmitting} type="submit" variant="accent">
            {isSubmitting ? <RefreshCw className="animate-spin" size={15} /> : <UserPlus size={15} />}
            Зарегистрировать
          </Button>
          <Button onClick={generate} type="button" variant="outline">
            Новые тестовые данные
          </Button>
        </div>
      </form>
    </FlowCard>
  );
}

function ConfirmForm() {
  const { apiRequest } = useWorkbench();
  const params = new URLSearchParams(window.location.search);
  const [confirmationUrl, setConfirmationUrl] = useState(
    params.has("token") && params.has("userId") ? window.location.href : "",
  );
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: {
      token: params.get("token") ?? "",
      userId: params.get("userId") ?? "",
    },
  });

  const parseUrl = () => {
    try {
      const url = new URL(confirmationUrl, window.location.origin);
      const token = url.searchParams.get("token");
      const userId = url.searchParams.get("userId");
      if (!token || !userId) throw new Error("В ссылке нужны token и userId");
      setConfirmationUrl(url.href);
      setValue("token", token, { shouldValidate: true });
      setValue("userId", userId, { shouldValidate: true });
      toast.success("Данные подтверждения заполнены");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const submit = handleSubmit(async (values) => {
    try {
      await apiRequest<AuthResponse>({
        method: "POST",
        path: "/auth/confirm-email",
        body: values,
      });
      toast.success("Email подтверждён, сессия создана");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <FlowCard
      description="Принимает ссылку из письма и активирует пользователя."
      icon={MailCheck}
      number="02"
      path="/auth/confirm-email"
      title="Подтвердить email"
    >
      <div className="mb-4 grid gap-2">
        <Field
          hint={
            <button
              className="inline-flex items-center gap-1 text-[var(--signal)] hover:underline"
              onClick={parseUrl}
              type="button"
            >
              Разобрать ссылку <ArrowRight size={12} />
            </button>
          }
          label="Ссылка из письма"
        >
          <Input
            onChange={(event) => setConfirmationUrl(event.target.value)}
            placeholder="http://localhost:3000/?token=...&userId=..."
            value={confirmationUrl}
          />
        </Field>
      </div>
      <form className="grid gap-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            error={errors.userId?.message}
            label="User ID"
            name="userId"
            placeholder="UUID"
            register={register("userId")}
          />
          <FormInput
            error={errors.token?.message}
            label="Verification token"
            name="token"
            placeholder="Токен из ссылки"
            register={register("token")}
          />
        </div>
        <div className="form-actions">
          <Button disabled={isSubmitting} type="submit" variant="accent">
            {isSubmitting ? <RefreshCw className="animate-spin" size={15} /> : <MailCheck size={15} />}
            Подтвердить email
          </Button>
        </div>
      </form>
    </FlowCard>
  );
}

function LoginForm({ initialCredentials }: { initialCredentials: LoginValues }) {
  const { apiRequest } = useWorkbench();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: initialCredentials,
  });

  const submit = handleSubmit(async (values) => {
    try {
      await apiRequest<AuthResponse>({
        method: "POST",
        path: "/auth/login",
        body: values,
      });
      toast.success("Вход выполнен");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <FlowCard
      description="Получает access token; refresh token остаётся в HttpOnly cookie."
      icon={KeyRound}
      number="03"
      path="/auth/login"
      title="Войти"
    >
      <form className="grid gap-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            autoComplete="email"
            error={errors.email?.message}
            label="Email"
            name="email"
            register={register("email")}
            type="email"
          />
          <FormInput
            autoComplete="current-password"
            error={errors.password?.message}
            label="Пароль"
            name="password"
            register={register("password")}
            type="password"
          />
        </div>
        <div className="form-actions">
          <Button disabled={isSubmitting} type="submit" variant="accent">
            {isSubmitting ? <RefreshCw className="animate-spin" size={15} /> : <KeyRound size={15} />}
            Войти
          </Button>
        </div>
      </form>
    </FlowCard>
  );
}

function FlowCard({
  number,
  icon: Icon,
  title,
  description,
  path,
  children,
}: {
  number: string;
  icon: typeof AtSign;
  title: string;
  description: string;
  path: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ amount: 0.18, once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <Card className="flow-card overflow-hidden">
        <div className="pointer-events-none absolute -top-20 right-0 size-48 rounded-full bg-[#7758ff]/[0.07] blur-3xl" />
        <div className="grid gap-4 border-b border-white/[0.07] p-5 sm:grid-cols-[52px_1fr_auto] sm:p-6">
          <span className="relative grid size-12 place-items-center rounded-2xl border border-[#9988ff]/25 bg-[linear-gradient(145deg,rgba(121,93,255,.2),rgba(75,202,255,.08))] text-[#c4b9ff] shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_0_25px_rgba(114,85,255,.12)]">
            <Icon size={18} />
            <CircleDot className="absolute -right-1 -bottom-1 text-[#65e5b6]" fill="#65e5b6" size={8} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="section-kicker">Sequence {number}</span>
              <Badge tone="blue">POST</Badge>
            </div>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.025em]">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{description}</p>
          </div>
          <code className="self-start rounded-lg border border-white/[0.07] bg-black/20 px-2.5 py-1.5 text-[9px] text-white/35">
            {path}
          </code>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </Card>
    </motion.div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Неизвестная ошибка";
}
