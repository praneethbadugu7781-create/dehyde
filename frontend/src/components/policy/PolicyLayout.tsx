import { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export function PolicyLayout({ title, children }: Props) {
  return (
    <div className="pt-32 pb-section">
      <div className="luxury-container max-w-2xl">
        <p className="text-[10px] uppercase tracking-editorial text-muted">Legal</p>
        <h1 className="editorial-heading mt-4 text-5xl">{title}</h1>
        <div className="mt-12 max-w-none space-y-6 text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </div>
  );
}
