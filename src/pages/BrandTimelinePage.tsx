import React from 'react';
import { motion } from 'framer-motion';
export function BrandTimelinePage() {
  const events = [{
    year: '2018',
    title: 'The Beginning',
    desc: 'Rose Secret was founded in Grasse, France.'
  }, {
    year: '2019',
    title: 'First Collection',
    desc: "Launched our signature 'Midnight Rose' collection."
  }, {
    year: '2020',
    title: 'Global Expansion',
    desc: 'Opened flagship stores in Paris and New York.'
  }, {
    year: '2022',
    title: 'Sustainable Future',
    desc: 'Transitioned to 100% eco-friendly packaging.'
  }, {
    year: '2024',
    title: 'Digital Revolution',
    desc: 'Launched our immersive digital experience.'
  }];
  return <div className="bg-white min-h-screen py-20">
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-20">
          <h1 className="font-serif text-5xl font-bold text-gray-900 mb-6">
            Our Journey
          </h1>
          <p className="text-xl text-gray-600">
            From a small atelier to a global luxury house.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-rose-200" />

          <div className="space-y-24">
            {events.map((event, i) => <motion.div key={i} initial={{
            opacity: 0,
            x: i % 2 === 0 ? -50 : 50
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} className={`flex items-center justify-between ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="w-5/12 text-right">
                  {i % 2 === 0 && <>
                      <span className="text-rose-600 font-bold text-xl block mb-2">
                        {event.year}
                      </span>
                      <h3 className="font-serif text-2xl font-bold mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600">{event.desc}</p>
                    </>}
                </div>

                <div className="w-2/12 flex justify-center relative z-10">
                  <div className="w-4 h-4 bg-rose-600 rounded-full border-4 border-white shadow-md" />
                </div>

                <div className="w-5/12 text-left">
                  {i % 2 !== 0 && <>
                      <span className="text-rose-600 font-bold text-xl block mb-2">
                        {event.year}
                      </span>
                      <h3 className="font-serif text-2xl font-bold mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600">{event.desc}</p>
                    </>}
                </div>
              </motion.div>)}
          </div>
        </div>
      </div>
    </div>;
}