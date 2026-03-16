import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import { Clock, LogOut } from "lucide-react";

const PUBLIC_ROUTES = ["/", "/login", "/cadastro", "/esqueci-senha", "/redefinir-senha"];

export function InactivityWarningDialog() {
  const { session, signOut } = useAuth();
  const location = useLocation();
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
  const isAuthenticated = !!session && !isPublicRoute;

  const { showWarning, secondsLeft, resetTimers } = useInactivityTimeout(isAuthenticated);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  useEffect(() => {
    const handleLogout = () => {
      signOut();
    };
    window.addEventListener("inactivity-logout", handleLogout);
    return () => window.removeEventListener("inactivity-logout", handleLogout);
  }, [signOut]);

  const handleContinue = () => {
    resetTimers();
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-destructive" />
            Sessão prestes a expirar
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Você está inativo há algum tempo. Por segurança, sua sessão será
              encerrada automaticamente em:
            </p>
            <p className="text-2xl font-bold text-center text-foreground tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
            <p>Deseja continuar logado?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
          <Button onClick={handleContinue}>Continuar logado</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
