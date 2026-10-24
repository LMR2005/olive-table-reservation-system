"use client"

import { useRef } from "react";
import Image from "next/image";

const dishes = [
    { name: "Herb-Roasted Sea Bass", description: "Tender sea bass with lemon, capers and seasonal greens.", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=85" },
    { name: "Wild Mushroom Risotto", description: "Creamy arborio rice with wild mushrooms, thyme and parmesan.", image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1000&q=85" },
    { name: "Seasonal Garden Salad", description: "Crisp garden vegetables and fresh herbs with a citrus vinaigrette.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85" },
    { name: "Handmade Herb Pasta", description: "Fresh pasta tossed with basil, slow-roasted tomatoes and olive oil.", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=85" },
    { name: "Wood-Fired Margherita", description: "A crisp, airy crust topped with tomato, mozzarella and fresh basil.", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=85" },
    { name: "Classic Tiramisu", description: "Coffee-soaked layers of delicate sponge and silky mascarpone cream.", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=1000&q=85" },
];


const Menu = () => {
    const menuRef = useRef<HTMLDivElement>(null);

    const scrollMenu = (direction: -1 | 1) => {
        const carousel = menuRef.current;
        if (!carousel) return;
        const card = carousel.querySelector<HTMLElement>("article");
        const distance = card ? card.getBoundingClientRect().width + 24 : 360;
        carousel.scrollBy({ left: distance * direction, behavior: "smooth" });
    };

    return (
        <div className="relative">
            <div
                ref={menuRef}
                aria-label="Signature dishes"
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {dishes.map((dish) => (
                    <article key={dish.name} className="group min-w-0 flex-none basis-[85%] snap-start bg-[#F7F3EA] sm:basis-[48%] lg:basis-[calc((100%-48px)/3)]">
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <Image src={dish.image} alt={dish.name} fill unoptimized className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 640px) 85vw, (max-width: 1024px) 48vw, 33vw" />
                        </div>
                        <div className="min-h-[144px] p-7">
                            <h3 className="font-serif text-2xl">{dish.name}</h3>
                            <p className="mt-3 text-sm leading-6 text-[#647269]">{dish.description}</p>
                        </div>
                    </article>
                ))}
            </div>
            <button
                type="button"
                onClick={() => scrollMenu(-1)}
                aria-label="Previous dishes"
                className="absolute left-0 top-[35%] z-10 flex h-11 w-11 -translate-x-2 items-center justify-center rounded-full border border-[#173B30]/15 bg-[#F7F3EA] text-2xl text-[#173B30] shadow-lg transition hover:bg-[#173B30] hover:text-white md:-translate-x-1/2"
            >
                <span aria-hidden="true">‹</span>
            </button>
            <button
                type="button"
                onClick={() => scrollMenu(1)}
                aria-label="Next dishes"
                className="absolute right-0 top-[35%] z-10 flex h-11 w-11 translate-x-2 items-center justify-center rounded-full border border-[#173B30]/15 bg-[#F7F3EA] text-2xl text-[#173B30] shadow-lg transition hover:bg-[#173B30] hover:text-white md:translate-x-1/2"
            >
                <span aria-hidden="true">›</span>
            </button>
        </div>
    )
}

export default Menu