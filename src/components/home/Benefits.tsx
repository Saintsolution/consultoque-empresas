import {
  CalendarClock,
  FileText,
  HeartPulse,
  Percent,
  Salad,
  ShieldCheck,
  Smartphone,
  Stethoscope,
} from 'lucide-react';

const benefits = [
  {
    icon: CalendarClock,
    title: 'Atendimento 24 horas',
    description:
      'Orientação médica online todos os dias, inclusive fins de semana e feriados.',
  },
  {
    icon: Stethoscope,
    title: 'Consultas e especialidades',
    description:
      'Acesso a clínico geral e diferentes especialidades por telemedicina.',
  },
  {
    icon: FileText,
    title: 'Receitas e atestados',
    description:
      'Documentos médicos digitais emitidos durante o atendimento.',
  },
  {
    icon: Smartphone,
    title: 'Acesso fácil',
    description:
      'Consultas pelo celular, tablet ou computador, sem deslocamento.',
  },
  {
    icon: HeartPulse,
    title: 'Saúde e bem-estar',
    description:
      'Programas de apoio emocional e cuidados complementares.',
  },
  {
    icon: Salad,
    title: 'Cuidados complementares',
    description:
      'Benefícios com nutrição, atividade física e qualidade de vida.',
  },
  {
    icon: Percent,
    title: 'Clube de benefícios',
    description:
      'Descontos em produtos, serviços, farmácias e estabelecimentos parceiros.',
  },
  {
    icon: ShieldCheck,
    title: 'Planos para grupos',
    description:
      'Condições especiais para empresas, igrejas, associações e coletivos.',
  },
];

export default function Benefits() {
  return (
    <section
      id="beneficios"
      className="bg-white px-4 py-14 md:py-16"
    >
      {/* Mesma largura do Pricing */}
      <div className="mx-auto max-w-5xl">
        {/* Cabeçalho */}
        <div className="mx-auto max-w-3xl text-center">
          <span
            className="text-xs font-black uppercase tracking-[0.2em]"
            style={{
              color: '#2563eb',
            }}
          >
            Benefícios para todos
          </span>

          <h2
            className="mt-3 text-3xl font-black tracking-tight md:text-4xl"
            style={{
              color: '#0f172a',
            }}
          >
            Cuidado completo em um só plano
          </h2>

          <p
            className="mx-auto mt-3 max-w-2xl text-base leading-relaxed md:text-lg"
            style={{
              color: '#64748b',
            }}
          >
            Telemedicina, bem-estar e vantagens para cuidar das pessoas da sua
            organização.
          </p>
        </div>

        {/* Benefícios compactos */}
        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                className="group flex min-h-28 items-start gap-3 rounded-2xl border bg-white p-4 transition duration-200 hover:-translate-y-1"
                style={{
                  borderColor: '#dbeafe',
                  boxShadow:
                    '0 5px 16px rgba(15, 23, 42, 0.07)',
                }}
              >
                {/* Ícone */}
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Informação */}
                <div>
                  <h3
                    className="text-sm font-black leading-tight"
                    style={{
                      color: '#0f172a',
                    }}
                  >
                    {benefit.title}
                  </h3>

                  <p
                    className="mt-1.5 text-xs leading-relaxed"
                    style={{
                      color: '#64748b',
                    }}
                  >
                    {benefit.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Observação comercial */}
        <div className="mt-7 flex justify-center">
          <p
            className="rounded-full px-5 py-2.5 text-center text-sm font-bold"
            style={{
              backgroundColor: '#f0fdf4',
              color: '#15803d',
            }}
          >
            A partir de 10 vidas, sua organização recebe condições especiais.
          </p>
        </div>
      </div>
    </section>
  );
}