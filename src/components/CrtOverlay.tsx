/**
 * Full-screen CRT broadcast overlays.
 *
 * Cafe_Mama_2 ditches the TV casing entirely — the picture now fills the whole
 * screen — but we keep the tube's tells: scanlines, drifting roll-bar and TV
 * static, plus a soft vignette so the edges fall off like real glass.
 *
 * All layers are fixed + pointer-events:none so they never block clicks.
 */
export default function CrtOverlay() {
  return (
    <>
      <div className="screen-box crt-scanlines" aria-hidden />
      <div className="screen-box crt-static" aria-hidden />
      <div className="screen-box crt-rollwrap" aria-hidden>
        <div className="crt-rollbar" />
      </div>
      {/* Soft tube vignette around the full-screen picture */}
      <div
        aria-hidden
        className="screen-box"
        style={{
          zIndex: 82,
          boxShadow: "inset 0 0 26vw rgba(0,0,0,0.4)",
        }}
      />
    </>
  );
}
