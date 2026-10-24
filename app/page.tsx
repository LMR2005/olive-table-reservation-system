import Image from "next/image";
import Link from "next/link";
import NavBar from "@/componenets/NavBar";
import Menu from "@/componenets/menu";


export default function Home() {
  
  return (
    <div>
      <main className="bg-[#F7F3EA] text-[#203D32]">
        <NavBar/>

        <section className="relative flex min-h-[550px] items-center justify-center overflow-hidden md:min-h-[650px]">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://img.partyslate.com/companies-cover-image/55450/image-a85dc8c1-b99a-4f3e-a7a4-c6797e430394.jpg?tr=w-3840')",
            }}
          />

          {/* Black overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#122E25]/75 via-[#122E25]/70 to-[#122E25]/40" />

          {/* Optional subtle blur/glass behind content */}
          <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-28 text-center">
            <div className="max-w-4xl text-center text-white">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-[#D8BC8D] sm:text-sm">
                Seasonal Cuisine · Thoughtful Hospitality
              </p>

              <h1 className="mx-auto max-w-[850px] font-serif text-5xl leading-[1.12] tracking-[-0.025em] text-white sm:text-6xl lg:text-[76px]">
                A place to{" "}
                <span className="italic text-[#E0BE87]">savor</span>
                <br />
                the moment.
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/90 sm:text-base md:text-lg">
                Inspired by the beauty of simple ingredients, crafted with care, and best
                enjoyed together.
              </p>

              <div className="mt-8">
                <Link
                  href="/reservation"
                  className="inline-flex items-center justify-center border border-[#D9BA85] bg-[#D9BA85] px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#173B30] transition-all duration-300 hover:bg-transparent hover:text-[#D9BA85]"
                >
                  Reserve Your Table
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 md:grid-cols-2 md:px-10 md:py-32">
          <div className="relative min-h-[400px] overflow-hidden md:min-h-[580px]">
            <Image src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85" alt="Beautifully set restaurant dining table" fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="max-w-lg md:pl-8">
            <p className="mb-5 text-xs font-bold uppercase tracking-[.3em] text-[#A17B49]">Welcome to our table</p>
            <h2 className="font-serif text-4xl leading-tight md:text-6xl">Good food.<br /><em>Great company.</em></h2>
            <div className="my-7 h-px w-16 bg-[#B9945B]" />
            <p className="text-base leading-8 text-[#52645C]">At The Olive Table, every meal is an invitation to slow down. We bring fresh ingredients, honest flavors, and warm hospitality together to create something worth sharing.</p>
            <p className="mt-5 text-base leading-8 text-[#52645C]">From intimate dinners to memorable celebrations, there is always a seat for you.</p>
            <a href="#visit" className="mt-9 inline-flex border-b border-[#173B30] pb-2 text-xs font-bold uppercase tracking-[.2em]">Discover our story ↗</a>
          </div>
        </section>

        <section id="menu" className="bg-[#EAE6DB] px-6 py-24 md:px-10 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <p className="mb-4 text-xs font-bold uppercase tracking-[.3em] text-[#A17B49]">From our kitchen</p>
              <h2 className="font-serif text-4xl md:text-6xl">Crafted to be <em>remembered.</em></h2>
              <p className="mx-auto mt-5 max-w-lg leading-7 text-[#52645C]">A few favorites from our seasonal menu. Fresh flavors, beautiful ingredients, thoughtfully prepared.</p>
            </div>
            <Menu />
            <p className="mt-3 text-center text-xs text-[#69766D]">A taste of our menu · Explore more dishes using the arrows</p>
          </div>
        </section>

        <section id="reserve" className="bg-[#173B30] px-6 py-24 text-center text-white md:py-32">
          <div className="mx-auto max-w-3xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[.3em] text-[#D8BC8D]">A seat is waiting</p>
            <h2 className="font-serif text-5xl leading-tight md:text-7xl">Make room for <em>memories.</em></h2>
            <p className="mx-auto mt-7 max-w-xl leading-8 text-white/70">Gather your favorite people. Choose your date, time, and party size, and let us take care of the rest.</p>
            <a href="/reservation" className="mt-10 inline-block bg-[#D8BC8D] px-10 py-4 text-xs font-bold uppercase tracking-[.2em] text-[#173B30] transition hover:bg-white">Book Your Table ↗</a>
            <p className="mt-5 text-xs text-white/55">Reservation page to be built in the next milestone.</p>
          </div>
        </section>

        <section id="visit" className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:gap-24 md:px-10 md:py-28">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[.3em] text-[#A17B49]">Come on in</p>
            <h2 className="font-serif text-5xl">We'd love to <em>see you.</em></h2>
            <p className="mt-7 max-w-md leading-8 text-[#52645C]">Whether it's a spontaneous evening out or a special celebration, we look forward to welcoming you.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div><h3 className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[#9B7546]">Opening hours</h3><p className="font-serif text-2xl">Every day</p><p className="mt-2 text-[#52645C]">11:00 AM – 10:00 PM</p></div>
            <div><h3 className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[#9B7546]">Find us</h3><p className="font-serif text-2xl">The Olive Table</p><p className="mt-2 text-[#52645C]">Address and phone number to be provided by the restaurant.</p></div>
          </div>
        </section>

        <footer className="bg-[#102B23] px-6 py-9 text-white/70 md:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
            <Link href="/" className="font-serif text-2xl text-white">The Olive Table<span className="text-[#D8BC8D]">.</span></Link>
            <p className="text-xs">© 2026 The Olive Table. All rights reserved.</p>
            <a href="/reservation" className="text-xs uppercase tracking-[.2em] text-[#D8BC8D]">Reserve a table ↗</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
