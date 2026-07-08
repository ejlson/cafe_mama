// A thin rule that separates blocks. Spans the content column and overhangs
// each edge a little so it runs just past where the content starts.
// Default gap is the site-wide "small separator" token (~8px). Use mt-0 /
// mb-0 only when the rule is hugging a poster headline.
export default function FullRule({
  color,
  className = "mt-2",
}: {
  color: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      style={{ backgroundColor: color }}
      className={`relative left-1/2 h-px w-[calc(100%+2rem)] -translate-x-1/2 ${className}`}
    />
  );
}
