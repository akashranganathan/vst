import React, { forwardRef } from 'react';
import { ChevronRight } from 'lucide-react';

const ProductShowcase = forwardRef<HTMLDivElement>((_, ref) => {
  const features = [
    'Professional DAWs for complete studio control',
    'Next-gen synths and samplers',
    'High-fidelity orchestral and cinematic libraries',
    'Industry-grade mixing & mastering plugins',
    'Experimental sound design suites',
    'Royalty-free loops and hybrid presets'
  ];

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

        {/* Plugin Image Showcase with fade-up animation */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="flex flex-col items-start text-left animate-fadeUp">
            <img
              src="/img1.png"
              alt="DAW software interface"
              className="rounded-xl shadow-xl object-cover w-full h-52 hover:scale-105 transition-transform duration-300"
            />
            <p className="mt-3 text-sm text-gray-300">
              <span className="text-yellow-400 font-semibold">Studio DAWs</span> like Ableton and Logic Pro offer endless control over every detail of your mix.
            </p>
          </div>

          <div className="flex flex-col items-start text-left animate-fadeUp delay-100">
            <img
              src="/img2.png"
              alt="Synth plugin display"
              className="rounded-xl shadow-xl object-cover w-full h-52 hover:scale-105 transition-transform duration-300"
            />
            <p className="mt-3 text-sm text-gray-300">
              <span className="text-yellow-400 font-semibold">Powerful Synths</span> such as Serum and Vital redefine modulation and expression.
            </p>
          </div>

          <div className="flex flex-col items-start text-left animate-fadeUp delay-200">
            <img
              src="/img3.png"
              alt="EQ plugin interface"
              className="rounded-xl shadow-xl object-cover w-full h-52 hover:scale-105 transition-transform duration-300"
            />
            <p className="mt-3 text-sm text-gray-300">
              <span className="text-yellow-400 font-semibold">Pro Mixing Tools</span> like FabFilter and Valhalla sculpt your tracks with clarity and depth.
            </p>
          </div>
        </div>

        {/* Descriptive Sections */}
        <div className="mt-12 sm:mt-16 space-y-6 sm:space-y-8 max-w-3xl mx-auto">
          <div className="flex items-start space-x-3">
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-bounce mt-1 flex-shrink-0" />
            <p className="text-base sm:text-lg text-gray-300 text-left leading-relaxed">
              <span className="font-semibold text-white block mb-1">High-performance Tools</span>
              Equip yourself with battle-tested plugins used in professional studios worldwide.
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
