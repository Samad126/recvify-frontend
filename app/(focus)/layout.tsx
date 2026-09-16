import { AuthGuard } from "@/components/app/auth-guard";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
