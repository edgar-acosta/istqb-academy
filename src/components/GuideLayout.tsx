import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { MODULES, DOCUMENT } from "@/content";
import { Check, LogIn, LogOut, GraduationCap } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function GuideSidebarNav() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();

  const progressQuery = trpc.training.progress.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const completed = new Set(
    (progressQuery.data ?? []).map((p) => p.moduleId)
  );
  const pct = Math.round((completed.size / MODULES.length) * 100);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const go = (path: string) => {
    setOpenMobile(false);
    navigate(path);
  };

  return (
    <>
      <SidebarHeader className="px-4 pt-4 pb-2">
        <Link
          to="/"
          onClick={() => setOpenMobile(false)}
          className="flex items-start gap-2.5 group"
        >
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-sidebar-border bg-sidebar-accent text-sidebar-foreground">
            <GraduationCap className="h-4.5 w-4.5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-[15px] font-semibold leading-tight text-sidebar-primary">
              {DOCUMENT.title}
            </span>
            <span className="block text-xs text-sidebar-foreground/80 leading-snug mt-0.5">
              Guía de capacitación corporativa · v{DOCUMENT.version}
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-4">
        <SidebarMenu>
          {isAuthenticated && (
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive("/mi-aprendizaje")}
                onClick={() => go("/mi-aprendizaje")}
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9"
              >
                Mi aprendizaje
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={isActive("/contenido")}
              onClick={() => go("/contenido")}
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9"
            >
              Índice y control de documento
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <div className="px-2 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
              Módulos
            </div>
            <SidebarMenuSub>
              {MODULES.map((m) => (
                <SidebarMenuSubItem key={m.id}>
                  <SidebarMenuSubButton
                    isActive={isActive(`/modulo/${m.id}`)}
                    onClick={() => go(`/modulo/${m.id}`)}
                    className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 pr-2"
                  >
                    <span className="tabular-nums text-xs w-6 shrink-0 text-sidebar-foreground/60">
                      {String(m.id).padStart(2, "0")}
                    </span>
                    <span className="truncate">{m.title}</span>
                    {completed.has(m.id) && (
                      <Check
                        className="ml-auto h-3.5 w-3.5 shrink-0 text-sidebar-primary/80"
                        aria-label="Módulo completado"
                      />
                    )}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <div className="px-2 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
              Recursos
            </div>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={isActive("/evaluacion")}
                  onClick={() => go("/evaluacion")}
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9"
                >
                  Evaluación de conocimiento
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={isActive("/glosario")}
                  onClick={() => go("/glosario")}
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9"
                >
                  Glosario
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={isActive("/referencias")}
                  onClick={() => go("/referencias")}
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9"
                >
                  Referencias
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {isAuthenticated && user ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7 border border-sidebar-border">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs">
                  {(user.name ?? "U").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-sidebar-primary">
                  {user.name ?? "Usuario"}
                </p>
                <p className="text-[11px] text-sidebar-foreground/70 tabular-nums">
                  Progreso: {completed.size}/{MODULES.length} módulos ({pct}%)
                </p>
              </div>
              <button
                onClick={logout}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div
              className="h-1 w-full bg-sidebar-accent overflow-hidden"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-sidebar-primary transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => navigate("/login")}
          >
            <LogIn className="h-4 w-4" aria-hidden />
            Iniciar sesión para guardar progreso
          </Button>
        )}
      </SidebarFooter>
    </>
  );
}

function MobileTopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
      <SidebarTrigger className="h-10 w-10 -ml-1" aria-label="Abrir menú" />
      <div className="min-w-0">
        <p className="truncate font-serif text-sm font-semibold leading-tight">
          {DOCUMENT.title}
        </p>
        <p className="truncate text-[11px] text-muted-foreground leading-tight">
          {DOCUMENT.subtitle}
        </p>
      </div>
    </header>
  );
}

export default function GuideLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider className="min-h-100dvh">
      <Sidebar
        collapsible="offcanvas"
        className="border-r border-sidebar-border"
      >
        <GuideSidebarNav />
      </Sidebar>
      <SidebarInset>
        <MobileTopBar />
        <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 md:px-8 md:pt-12">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
