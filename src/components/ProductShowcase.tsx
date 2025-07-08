import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

const useInViewOnce = (options = {}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!ref.current || hasAnimated) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      options
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options, hasAnimated]);

  return [ref, hasAnimated] as const;
};

const ProductShowcase = forwardRef<HTMLDivElement>((_, ref) => {
  const features = [
    'Professional DAWs for complete studio control',
    'Next-gen synths and samplers',
    'High-fidelity orchestral and cinematic libraries',
    'Industry-grade mixing & mastering plugins',
    'Experimental sound design suites',
    'Royalty-free loops and hybrid presets'
  ];

  // For each card, use a separate inViewOnce hook
  const [ref1, hasAnimated1] = useInViewOnce({ threshold: 0.3 });
  const [ref2, hasAnimated2] = useInViewOnce({ threshold: 0.3 });
  const [ref3, hasAnimated3] = useInViewOnce({ threshold: 0.3 });

  // For staggered animation
  const delays = [0, 150, 300];

  return (
    <section
      ref={ref}
      className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Discover Your <span className="text-yellow-400">Creative Arsenal</span>
          </h2>
          <p className="text-gray-300 mt-4 text-lg">
            Explore pro-level tools that power today’s top producers:
          </p>
        </div>

        {/* Feature List */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition duration-300"
            >
              <ChevronRight className="w-5 h-5 text-yellow-400 mt-1 animate-pulse" />
              <p className="text-base text-gray-300">{feature}</p>
            </div>
          ))}
        </div>

        {/* ================= ANIMATION DESIGN 4: Staggered Animation (Once Only) ================= */}
        <div className="mt-16">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">Product Highlights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { ref: ref1, animated: hasAnimated1 },
              { ref: ref2, animated: hasAnimated2 },
              { ref: ref3, animated: hasAnimated3 },
            ].map((card, idx) => {
              const titles = [
                'Studio DAWs',
                'Powerful Synths',
                'Pro Mixing Tools',
              ];
              const descs = [
                'Like Ableton and Logic Pro offer endless control over every detail of your mix.',
                'Such as Serum and Vital redefine modulation and expression.',
                'Like FabFilter and Valhalla sculpt your tracks with clarity and depth.',
              ];
              const imgs = ['/img1.png', '/img2.png', '/img3.png'];
              return (
                <div
                  ref={card.ref}
                  key={titles[idx]}
                  className="relative rounded-xl overflow-hidden shadow-lg"
                  style={{ transitionDelay: card.animated ? `${delays[idx]}ms` : '0ms' }}
                >
                  <img
                    src={imgs[idx]}
                    alt={titles[idx]}
                    className={`object-cover w-full h-56 transition-transform duration-700 ${card.animated ? 'scale-105' : 'scale-100'}`}
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 transition-all duration-700 ${
                      card.animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                  >
                    <h4 className="text-xl font-bold text-yellow-400 mb-1">{titles[idx]}</h4>
                    <p className="text-gray-100 text-sm">{descs[idx]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Descriptive Sections */}
        <div className="mt-12 sm:mt-16 space-y-6 sm:space-y-8 max-w-3xl mx-auto">
          <div className="flex items-start space-x-3">
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-bounce mt-1 flex-shrink-0" />
            <p className="text-base sm:text-lg text-gray-300 text-left leading-relaxed">
              <span className="font-semibold text-white block mb-1">Your Music Production Hub</span>
              Access a vast library of professional-grade tools and resources including music production DAWs, virtual instruments, sound libraries, mixing and mastering plugins, sound effects libraries, and a wide variety of loops and presets to enhance your creative workflow.
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-bounce mt-1 flex-shrink-0" />
            <p className="text-base sm:text-lg text-gray-300 text-left leading-relaxed">
              Personalized consultation is available <span className="text-yellow-400 font-medium">free of charge</span> to ensure you pick the perfect tools.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

export default ProductShowcase;