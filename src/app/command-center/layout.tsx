// Force dynamic rendering for this route (Convex queries need client-side context)
export const dynamic = "force-dynamic";

export default function CommandCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
