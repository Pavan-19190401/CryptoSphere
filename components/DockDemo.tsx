"use client";

import type { DockItem } from "./smoothui/components/dock";
import Dock from "./smoothui/components/dock";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

export const FitToWidth = ({ children }: { children: ReactNode }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const content = contentRef.current;
    if (!(host && content)) {
      return;
    }
    const update = () => {
      const available = host.clientWidth;
      const needed = content.scrollWidth;
      setScale(available > 0 && needed > available ? available / needed : 1);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex w-full justify-center overflow-hidden" ref={hostRef}>
      <div
        ref={contentRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "bottom center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default function DockDemo() {
  const [openApp, setOpenApp] = useState("Home");

  const items: DockItem[] = [
    {
      id: "home",
      label: "Home",
      active: true,
      href: "/index.html",
      icon: <span className="text-xl">🏠</span>,
      onSelect: () => setOpenApp("Home"),
    },
    {
      id: "charts",
      label: "Charts",
      active: false,
      href: "/pages/charts.html",
      icon: <span className="text-xl">📈</span>,
      onSelect: () => setOpenApp("Charts"),
    },
    {
      id: "search",
      label: "Search",
      active: false,
      href: "/pages/search.html",
      icon: <span className="text-xl">🔍</span>,
      onSelect: () => setOpenApp("Search"),
    },
    {
      id: "about",
      label: "Developer Profile",
      active: false,
      href: "/pages/about.html",
      icon: <span className="text-xl">👨‍💻</span>,
      onSelect: () => setOpenApp("Developer Profile"),
    },
    {
      id: "github",
      label: "GitHub @Pavan-19190401",
      href: "https://github.com/Pavan-19190401",
      icon: <span className="text-xl">🐙</span>,
      onSelect: () => setOpenApp("GitHub"),
    },
    {
      id: "linkedin",
      label: "LinkedIn Profile",
      href: "https://linkedin.com/in/manikanta-pavan-vennu1906",
      icon: <span className="text-xl">💼</span>,
      onSelect: () => setOpenApp("LinkedIn"),
    },
    {
      id: "email",
      label: "Email Manikanta",
      href: "mailto:manikantapavanv@gmail.com",
      icon: <span className="text-xl">✉️</span>,
      onSelect: () => setOpenApp("Email"),
    },
    {
      id: "phone",
      label: "+91 7396870319",
      href: "tel:+917396870319",
      icon: <span className="text-xl">📞</span>,
      onSelect: () => setOpenApp("Phone"),
    },
  ];

  return (
    <div className="relative h-[min(28rem,70dvh)] w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-white/10 border-b bg-white/10 py-1.5 pr-3 pl-4 text-[12px] text-white/90 backdrop-blur-md z-10">
        <span className="font-semibold tracking-tight">CryptoSphere • {openApp}</span>
        <span className="tabular-nums">Vennu Manikanta Pavan</span>
      </div>

      <div className="absolute inset-x-0 top-20 flex flex-col items-center gap-2 px-8 text-center text-white z-10">
        <h2 className="text-3xl font-bold tracking-tight">CryptoSphere Navigation Dock</h2>
        <p className="max-w-md text-sm text-white/70">
          Engineered by Vennu Manikanta Pavan. Hover over the tiles to experience the smooth raised-cosine falloff and dynamic cursor magnetism.
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-4 flex justify-center px-2 z-10">
        <FitToWidth>
          <Dock
            baseSize={42}
            distance={130}
            items={items}
            magnification={1.45}
          />
        </FitToWidth>
      </div>
    </div>
  );
}
