export function FooterLeft({ desc }: { desc: string }) {
  return (
    <div className="footer-left">
      <div className="desc">{desc}</div>
      <div className="keyrow">
        <span className="keycap">F</span>
        <span>Confirm</span>
      </div>
    </div>
  )
}
