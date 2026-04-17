export default function PitchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-pitch-root style={{ minHeight: "100vh", background: "#000000" }}>
      {children}
    </div>
  );
}
