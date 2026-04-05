


export default function DataCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl flex flex-col gap-1 bg-white shadow-sm"
      style={{ 
        borderLeft: `4px solid ${accent}`,
        padding: "24px 28px" 
      }}
    >
      <p className="text-xs uppercase tracking-widest" style={{ color: "#6A994E" }}>
        {label}
      </p>
      <p className="text-xl font-semibold" style={{ color: "#386641" }}>
        {value}
      </p>
      {sub && (
        <p className="text-sm" style={{ color: "#6A994E" }}>
          {sub}
        </p>
      )}
    </div>
  );
}