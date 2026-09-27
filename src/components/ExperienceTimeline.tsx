import React from 'react';

const FLASHBACK_STEPS = [
  {
    step: '01',
    title: 'CONCEPTO',
    subtitle: 'Dirección visual e ideas',
    description: 'Conversamos sobre el objetivo de la sesión, referencias estéticas, estilo de vestuario y la atmósfera que buscamos construir.',
    details: [
      'Definición de moodboard y tono visual',
      'Asesoría en selección de prendas y texturas',
      'Elección entre estudio, entorno urbano o naturaleza',
    ],
  },
  {
    step: '02',
    title: 'LOCACIÓN',
    subtitle: 'Luz y arquitectura',
    description: 'Estudiamos el espacio y la trayectoria de la luz natural o planteamos el esquema de iluminación para esculpir la escena.',
    details: [
      'Selección de spots con luz óptima',
      'Coordinación de horario para evitar sol duro',
      'Exploración de fondos limpios y contrastes',
    ],
  },
  {
    step: '03',
    title: 'LA SESIÓN',
    subtitle: 'Dirección fluida y natural',
    description: 'Sin poses rígidas ni tensión. Creamos un ambiente distendido donde la cámara es un testigo discreto de tu autenticidad.',
    details: [
      'Acompañamiento cercano en postura y mirada',
      'Cambios de vestuario y variaciones de plano',
      'Revisión en vivo de capturas preliminares',
    ],
  },
  {
    step: '04',
    title: 'EDICIÓN',
    subtitle: 'Curaduría y etalonaje',
    description: 'Selección minuciosa y revelado digital cuidando la pureza de los negros, la textura de la piel y el grano cinematográfico.',
    details: [
      'Galería privada digital en alta resolución',
      'Descarga directa de archivos listos para web y print',
      'Retoque editorial respetando la identidad real',
    ],
  },
];

export const ExperienceTimeline: React.FC = () => {
  return (
    <section
      id="experiencia"
      className="relative w-full bg-black text-white py-24 md:py-32 px-6 md:px-12 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16 pb-8 border-b border-white/10">
          <span className="text-xs uppercase tracking-[0.35em] text-zinc-400 font-sans-clean font-semibold block mb-3">
            El Proceso
          </span>
          <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight font-medium">
            Cómo Trabajamos
          </h2>
          <p className="font-sans-clean text-xs sm:text-sm text-zinc-400 font-light leading-relaxed mt-4">
            Un flujo de trabajo transparente, creativo y sin complicaciones desde la primera idea hasta la entrega final de tu portafolio.
          </p>
        </div>

        <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          {FLASHBACK_STEPS.map((step, idx) => (
            <div
              key={step.step}
              className={`pt-8 lg:pt-0 ${
                idx !== 0 ? 'lg:pl-8' : ''
              } flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-baseline space-x-3 mb-4">
                  <span className="font-editorial text-5xl md:text-6xl text-zinc-600 font-light tracking-tighter group-hover:text-white transition-colors">
                    {step.step}
                  </span>
                  <div className="h-[1px] flex-grow bg-white/10" />
                </div>

                <h3 className="font-editorial text-2xl md:text-3xl tracking-[0.15em] text-white uppercase mb-1">
                  {step.title}
                </h3>
                <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-sans-clean font-medium mb-4">
                  {step.subtitle}
                </h4>

                <p className="font-sans-clean text-xs sm:text-sm text-zinc-400 font-light leading-relaxed mb-6">
                  {step.description}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <ul className="space-y-2">
                  {step.details.map((detail, dIdx) => (
                    <li
                      key={dIdx}
                      className="text-xs text-zinc-400 font-sans-clean flex items-start space-x-2 font-light"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
