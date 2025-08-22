"use client";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-2">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        {title}
      </h2>
      <p className="text-gray-600 leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
} 