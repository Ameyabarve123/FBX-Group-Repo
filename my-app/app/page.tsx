import Navbar from '../components/navbar';

const gradientButtonStyle: React.CSSProperties = {
  border: '2px solid transparent',
  background: 'linear-gradient(#0b081c) padding-box, linear-gradient(45deg, #629fcc, #c975b9) border-box',
  filter:
    'drop-shadow(1rem 0rem 1.4rem rgba(187,60,164,0.2)) drop-shadow(-1rem 0rem 1.5rem rgba(11,113,187,0.125))',
};

const gradientTextStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #ffffff, #d3dfe9, #91bee3, #6277e0)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

function GradientButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-[var(--font-montserrat),Arial,sans-serif] px-4 py-2 text-sm cursor-pointer rounded-full text-white"
      style={gradientButtonStyle}
    >
      {children}
    </a>
  );
}

function SectionRow({
  title,
  text,
  imgSrc,
  mirrored = false,
}: {
  title: string;
  text: string;
  imgSrc: string;
  mirrored?: boolean;
}) {
  const textCol = (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center h-[50vh] max-[768px]:p-0">
      <div className="font-[var(--font-montserrat),Arial,sans-serif] font-bold text-[2.4rem] leading-[110%] tracking-[-0.03em] text-white inline-block overflow-visible py-1">
        {title}
      </div>
      <p className="font-[var(--font-montserrat),Arial,sans-serif] font-medium text-base leading-[120%] text-white mt-2 max-w-[75%]">
        {text}
      </p>
      <div className="flex gap-2 justify-center mt-4">
        <GradientButton href="https://example.com">Learn More</GradientButton>
      </div>
    </div>
  );

  const imgCol = (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center h-auto max-[768px]:p-0">
      <img src={imgSrc} alt="Hero Image" className="max-h-[55vh] max-w-full max-[768px]:max-h-[40vh]" />
    </div>
  );

  return (
    <div
      className={`w-full h-auto flex items-center justify-center px-4 mb-6 flex-row max-[768px]:mb-16 ${
        mirrored ? 'max-[768px]:flex-col' : 'max-[768px]:flex-col-reverse'
      }`}
      style={{ backgroundColor: '#0b081c' }}
    >
      {mirrored ? (
        <>
          {imgCol}
          {textCol}
        </>
      ) : (
        <>
          {textCol}
          {imgCol}
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center font-sans overflow-visible bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/background-static2.png')" }}
    >
      <Navbar />

      {/* ── Hero Main ── */}
      <div
        className="w-full h-auto flex items-center justify-center flex-row px-4 max-[768px]:flex-col"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, #0e5c7b00, #0e5c7b00, #0e5c7b00, #0e5c7b00, #13173e, #0b081c)',
        }}
      >
        {/* Left column */}
        <div
          className="flex-1 flex flex-col items-center justify-center p-4 text-center"
          style={{ height: '90vh' }}
        >
          <a
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-[var(--font-montserrat),Arial,sans-serif] px-4 py-2 text-sm cursor-pointer rounded-full border-2 border-white/50 bg-white/10 text-white"
          >
            Visit the FBX Shop
          </a>

          <img
            src="fbx_logo.png"
            alt="Hero Image"
            className="max-h-[55vh] max-w-full max-[768px]:max-h-[40vh]"
          />

          <div
            className="font-[var(--font-montserrat),Arial,sans-serif] font-bold text-[2.4rem] leading-[90%] tracking-[-0.03em] inline-block overflow-visible p-1"
            style={gradientTextStyle}
          >
            The ultimate kick-starter to becoming a roboticist
          </div>


          <div className="flex flex-row gap-4 justify-center mt-4 overflow-visible">
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-[var(--font-montserrat),Arial,sans-serif] px-4 py-2 text-sm cursor-pointer rounded-full border-2 border-transparent bg-white text-black"
            >
              Learn More
            </a>
            <GradientButton href="https://example.com">View Guide</GradientButton>
          </div>
        </div>

        {/* Right column */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center h-auto">
          <img
            src="rover1.png"
            alt="Hero Image"
            className="max-h-[55vh] max-w-full max-[768px]:max-h-[40vh]"
          />
        </div>

        <div className="h-20" />
      </div>

      {/* ── Rest of Page ── */}
      <div
        className="w-full flex flex-col items-center overflow-visible gap-4"
        style={{ backgroundColor: '#0b081c' }}
      >
        <SectionRow
          title="Build Assembly Skills"
          text="Build Assembly Skills and Learn the Anatomy of A Robot"
          imgSrc="rover2.png"
        />
        <SectionRow
          title="Step-by-Step Learning"
          text="All Taught Through Online Step-By-Step Guides and Video Tutorials"
          imgSrc="rover3.png"
          mirrored
        />
        <SectionRow
          title="Test Your Skills"
          text="Test Your Robotics Skills in Capstones and Challenges"
          imgSrc="rover3.png"
        />
        <SectionRow
          title="Learn to Code"
          text="Learn to Code in the World of Robotics Autonomous and Driver Control"
          imgSrc="fbx_logo.png"
          mirrored
        />

        <div className="h-20" />

        {/* ── Spotlight Stack ── */}
        <>
          <style>{`
            @media (max-width: 48rem) {
              .spotlight-stack {
                width: 80%;
                background-image: none !important;
                background-color: #0a071e !important;
                filter: drop-shadow(0rem 0rem 1rem rgba(255,255,255,0.125)) !important;
                border: 0.01rem solid rgba(255,255,255,0.25) !important;
                margin-top: 0 !important;
              }
              .spotlight-card {
                filter: drop-shadow(0rem 0rem 1rem rgba(255,255,255,0.125)) !important;
                border: 0.01rem solid rgba(255,255,255,0.25) !important;
              }
              .spotlight-card-container {
                flex-direction: column;
              }
            }
            @media (max-width: 40rem) {
              .spotlight-stack {
                width: 90%;
              }
            }
          `}</style>

          <div
            className="spotlight-stack font-[var(--font-montserrat),Arial,sans-serif]
                       flex w-[60%] flex-col gap-[2.4rem] mt-6 overflow-visible
                       justify-center items-center text-center
                       py-[2.4rem] px-0 rounded-lg"
            style={{
              backgroundImage: 'linear-gradient(to bottom, #17172f, #0a071e, #161737)',
              backgroundColor: 'rgba(240,240,240,0.24)',
              filter:
                'drop-shadow(0rem -0.05rem 0.05rem rgb(139,139,151)) drop-shadow(0rem 0rem 1rem rgba(255,255,255,0.125))',
            }}
          >
            <div
              className="font-[var(--font-montserrat),Arial,sans-serif] font-bold text-[2.4rem] leading-[90%] tracking-[-0.03em] inline-block overflow-visible p-1"
              style={gradientTextStyle}
            >
              We Prioritize Access
            </div>
            <p className="font-[var(--font-montserrat),Arial,sans-serif] font-medium text-base leading-[120%] text-white mt-2 max-w-[75%]">
              Our team strives to democratize experiential engineering education.
            </p>

            <div className="spotlight-card-container flex flex-row gap-6 justify-center p-4">
              <div
                className="spotlight-card flex flex-col gap-2 p-[1.2rem] rounded-lg items-center text-center"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.24)',
                  backgroundImage: 'linear-gradient(to bottom, #17172f, #0a071e)',
                  filter:
                    'drop-shadow(0rem -0.05rem 0.05rem rgba(139,139,151,0.5)) drop-shadow(0rem 0rem 1rem rgba(255,255,255,0.125))',
                }}
              >
                <div className="font-[var(--font-montserrat),Arial,sans-serif] font-medium text-[1.6rem] leading-[110%] tracking-[-0.03em] text-white inline-block overflow-visible p-[0.2rem]">
                  Open-Source to the Core
                </div>
                <p className="font-[var(--font-montserrat),Arial,sans-serif] font-medium text-[0.9rem] leading-[200%] text-white w-full">
                  The FBX Rover is an open-source robotics platform built using an ESP-32 microcontroller, allowing students to access and modify its underlying code and hardware.
                </p>
              </div>

              <div
                className="spotlight-card flex flex-col gap-2 p-[1.2rem] rounded-lg items-center text-center"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.24)',
                  backgroundImage: 'linear-gradient(to bottom, #17172f, #0a071e)',
                  filter:
                    'drop-shadow(0rem -0.05rem 0.05rem rgba(139,139,151,0.5)) drop-shadow(0rem 0rem 1rem rgba(255,255,255,0.125))',
                }}
              >
                <div className="font-[var(--font-montserrat),Arial,sans-serif] font-medium text-[1.6rem] leading-[110%] tracking-[-0.03em] text-white inline-block overflow-visible p-[0.2rem]">
                  Making STEM Accessible
                </div>
                <p className="font-[var(--font-montserrat),Arial,sans-serif] font-medium text-[0.9rem] leading-[200%] text-white w-full">
                  We partner with non-profits to introduce robotics and 3D printing to students, helping expand access to hands-on STEM learning opportunities.
                </p>
              </div>
            </div>
          </div>
        </>

        <div className="h-20" />

        {/* ── Partners ── */}
        <div className="flex w-[60%] flex-col gap-4 mt-8 overflow-visible justify-center items-center text-center p-6">
          <div
            className="font-[var(--font-montserrat),Arial,sans-serif] font-bold text-[2.4rem] leading-[90%] tracking-[-0.03em] inline-block overflow-visible p-1"
            style={gradientTextStyle}
          >
            Our Partners
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="flex gap-2 justify-center mt-4">
          <GradientButton href="https://example.com">Get Started</GradientButton>
        </div>

        <div className="h-20" />
      </div>
    </main>
  );
}
