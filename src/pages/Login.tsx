import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  return "No se pudo completar la acción. Intenta de nuevo.";
}

export default function Login() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/");
    },
    onError: (e) => setError(getErrorMessage(e)),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/");
    },
    onError: (e) => setError(getErrorMessage(e)),
  });

  const pending = loginMutation.isPending || registerMutation.isPending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      loginMutation.mutate({ username, password });
    } else {
      registerMutation.mutate({
        username,
        password,
        name: name.trim() || undefined,
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "login"
              ? "Entra con tu usuario local para guardar tu progreso y tus intentos de evaluación."
              : "Crea tu cuenta para guardar tu progreso y tus intentos de evaluación."}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="p. ej. edgar.acosta"
                required
              />
            </div>
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre para mostrar (opcional)</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Edgar Acosta"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "login"
                    ? "Tu contraseña"
                    : "Mínimo 8 caracteres"
                }
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button className="w-full" size="lg" type="submit" disabled={pending}>
              {pending
                ? "Espera…"
                : mode === "login"
                  ? "Entrar"
                  : "Crear cuenta y entrar"}
            </Button>
          </form>
          <button
            type="button"
            className="mt-4 w-full text-center text-sm underline underline-offset-4"
            onClick={() => {
              setError("");
              setMode(mode === "login" ? "register" : "login");
            }}
          >
            {mode === "login"
              ? "¿No tienes cuenta? Crea una"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Tus datos se guardan en la base de datos configurada para esta aplicación.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
