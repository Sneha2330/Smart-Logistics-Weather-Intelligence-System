"use client";

export default function SectionCard({ id, title, children, className = "" }) {
  return (
    <section
      id={id}
      className={`rounded-2xl border bg-white p-6 shadow-sm ${className}`}
    >
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}