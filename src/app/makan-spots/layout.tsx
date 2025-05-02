"use client";

import { useRouter } from "next/navigation";

export default function MakanSpotsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  return (
    <div className="relative p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="fixed left-0 top-0 flex items-center gap-1 p-4 text-gray-600 hover:text-gray-700 hover:cursor-pointer text-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Go back
      </button>
      {children}
    </div>
  );
}
