const gradientButtonStyle: React.CSSProperties = {
  border: '2px solid transparent',
  background: 'linear-gradient(#0b081c) padding-box, linear-gradient(45deg, #629fcc, #c975b9) border-box',
  filter:
    'drop-shadow(1rem 0rem 1.4rem rgba(187,60,164,0.2)) drop-shadow(-1rem 0rem 1.5rem rgba(11,113,187,0.125))',
};

const navLinkClass =
  'font-[var(--font-montserrat),Arial,sans-serif] text-white no-underline text-[0.8rem] px-4 py-2';

export default function Navbar() {
  return (
    <>
      <style>{`
        #menuToggle:checked ~ .mobile-menu {
          display: flex;
        }
      `}</style>

      <nav
        className="w-full flex flex-wrap gap-4 flex-row items-center justify-between
                   px-2 py-2 overflow-visible sticky top-0 z-[1000]"
        style={{ backgroundColor: '#0b081c' }}
      >
        {/* Logo */}
        <img src="fbx_logo.png" alt="FBX Logo" className="h-[2.4rem]" />

        {/* Desktop nav links */}
        <div className="font-[var(--font-montserrat),Arial,sans-serif] flex gap-4 justify-center flex-1 overflow-visible max-[768px]:hidden">
          <a href="https://example.com" target="_blank" rel="noopener noreferrer" className={navLinkClass}>About</a>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer" className={navLinkClass}>Learn</a>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer" className={navLinkClass}>Enterprise</a>
        </div>

        {/* Desktop action buttons */}
        <div className="flex gap-2 items-center overflow-visible max-[768px]:hidden">
          <a
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-[var(--font-montserrat),Arial,sans-serif] px-4 py-2 text-[0.8rem] cursor-pointer rounded-full border-2 border-transparent bg-white text-black no-underline"
          >
            Contact Us
          </a>
          <a
            href="/auth/login"
            // target="_blank"
            rel="noopener noreferrer"
            className="font-[var(--font-montserrat),Arial,sans-serif] px-4 py-2 text-[0.8rem] cursor-pointer rounded-full text-white no-underline"
            style={gradientButtonStyle}
          >
            Sign In
          </a>
        </div>

        {/* Hidden checkbox — must be a sibling of .mobile-menu */}
        <input type="checkbox" id="menuToggle" className="hidden" />

        {/* Hamburger label — mobile only */}
        <label
          htmlFor="menuToggle"
          className="hidden max-[768px]:flex flex-col gap-[0.3rem] bg-transparent border-none
                     cursor-pointer p-3 min-w-[2.75rem] min-h-[2.75rem]
                     items-center justify-center z-[1001] ml-auto"
          style={{ WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-[2px] bg-white rounded-sm" />
          <span className="block w-6 h-[2px] bg-white rounded-sm" />
          <span className="block w-6 h-[2px] bg-white rounded-sm" />
        </label>

        {/* Mobile dropdown — shown via CSS sibling selector */}
        <div
          className="mobile-menu hidden flex-col fixed left-0 right-0 gap-3 px-6 py-4 z-[999] rounded-b-[2rem] backdrop-blur-[1.5em]"
          style={{
            top: '3.4rem',
            backgroundImage: 'linear-gradient(0deg, rgba(11,8,28,0.75), #0b081c)',
          }}
        >
          <a href="https://example.com" target="_blank" rel="noopener noreferrer" className={navLinkClass}>About</a>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer" className={navLinkClass}>Learn</a>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer" className={navLinkClass}>Enterprise</a>
          <a
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-[var(--font-montserrat),Arial,sans-serif] px-4 py-2 text-[0.8rem] cursor-pointer rounded-full border-2 border-transparent bg-white text-navy no-underline"
          >
            Contact Us
          </a>
          <a
            href="/auth/login"
            target="_blank"
            rel="noopener noreferrer"
            className="font-[var(--font-montserrat),Arial,sans-serif] px-4 py-2 text-[0.8rem] cursor-pointer rounded-full text-white no-underline"
            style={gradientButtonStyle}
          >
            Sign In
          </a>
        </div>
      </nav>
    </>
  );
}
