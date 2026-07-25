import { Link } from 'react-router-dom';

export function LegalCompliance() {
  return (
    <section className="px-6 py-8 bg-blue-50/50 border border-blue-100 rounded-2xl text-center space-y-6">
      {/* Conformidade legal */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-blue-950 uppercase tracking-wide">
          Telemedicina e conformidade
        </h2>

       <p className="max-w-3xl mx-auto text-xs text-blue-900/70 font-medium leading-relaxed">
  O ConsulToque é um programa de benefícios em saúde e
  bem-estar oferecido pela SIA – Sistema Inteligente de
  Apoio Associativo e Amparo Comunitário. Os serviços de
  telessaúde são prestados por empresa parceira especializada,
  observando a Lei nº 14.510/2022 e, nos atendimentos médicos,
  a Resolução CFM nº 2.314/2022.
</p>

        <p className="max-w-3xl mx-auto text-xs text-blue-900/70 font-medium leading-relaxed">
          Os atendimentos são realizados exclusivamente de forma
          remota, por meio das plataformas oficiais indicadas pela
          associação. A disponibilidade das especialidades e dos
          demais serviços segue as regras de encaminhamento e
          agendamento informadas no Termo de Adesão.
        </p>
      </div>

      {/* Aviso de urgência e emergência */}
      <div
        role="alert"
        className="max-w-3xl mx-auto rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 text-left shadow-sm"
      >
        <p className="text-sm font-black text-red-800 uppercase">
          Atenção: urgências e emergências
        </p>

        <p className="mt-2 text-xs font-semibold leading-relaxed text-red-800">
          A telemedicina não substitui o atendimento presencial em
          situações de urgência ou emergência. Em caso de sintomas
          graves, acidentes ou risco à vida, procure imediatamente
          uma unidade de pronto atendimento ou pronto-socorro.
          Quando necessário, acione o SAMU pelo telefone 192.
        </p>
      </div>

      {/* Parceiros e portais oficiais */}
      <div className="flex flex-col items-center gap-2 pt-4 border-t border-blue-100/70">
        <span className="mb-1 text-[10px] font-bold text-blue-900/50 uppercase tracking-widest">
          Parceiros e portais oficiais
        </span>

        <a
          href="https://telemedicina.consultoque.com.br/login"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors underline underline-offset-2"
        >
          Portal de Telemedicina
        </a>

        <a
          href="https://clube.servidabeneficios.com.br/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors underline underline-offset-2"
        >
          Clube de Benefícios
        </a>

        <Link
          to="/associado"
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors underline underline-offset-2"
        >
          Portal do Associado
        </Link>
      </div>
    </section>
  );
}