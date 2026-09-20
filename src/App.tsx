import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Check,
  ChevronDown,
  Crosshair,
  Crown,
  Gamepad2,
  Landmark,
  Menu,
  MessageCircle,
  MoveUpRight,
  Quote,
  Shield,
  X,
} from 'lucide-react';

type Division =
  | '1ª DIVISÃO'
  | '2ª DIVISÃO'
  | '3ª DIVISÃO'
  | '4ª DIVISÃO';

type Attribute =
  | 'comportamento'
  | 'disciplina'
  | 'liderança'
  | 'estratégia'
  | 'poder'
  | 'lealdade';

type RawAttribute =
  | Attribute
  | 'iniciativa'
  | 'coragem';

type Answer = {
  label: string;
  scores: Partial<Record<RawAttribute, number>>;
};

type Question = {
  number: string;
  title: string;
  prompt: string;
  answers: Answer[];
};

type Result = {
  name: string;
  division: Division;
  scores: Record<Attribute, number>;
};

const officialLinks = [
  {
    label: 'ROBLOX',
    title: 'Gakuran',
    description: 'Entre no universo onde a Allied constrói sua história.',
    href: 'https://www.roblox.com/pt/games/128736949265057/Gakuran',
    icon: Gamepad2,
  },
  {
    label: 'DISCORD GAKURAN',
    title: 'Comunidade oficial',
    description: 'Conecte-se ao servidor central de Gakuran.',
    href: 'https://discord.gg/gakuran',
    icon: MessageCircle,
  },
  {
    label: 'DISCORD ALLIED',
    title: 'Abra seu ticket',
    description: 'O primeiro passo para encontrar seu lugar.',
    href: 'https://discord.gg/UFUMMx5PkD',
    icon: Shield,
  },
];

const rules = [
  [
    'RESPEITO ACIMA DE TUDO',
    'Sem ofensas, discriminação ou ataques pessoais entre membros.',
  ],
  [
    'HIERARQUIA DEVE SER RESPEITADA',
    'Ordens da staff e liderança não são opcionais.',
  ],
  [
    'PROIBIDO FLOOD E SPAM',
    'Nada de poluir chats com mensagens inúteis ou repetidas.',
  ],
  [
    'USO CORRETO DOS CANAIS',
    'Cada canal tem sua finalidade, use direito.',
  ],
  [
    'SEM DIVULGAÇÃO NÃO AUTORIZADA',
    'Proibido divulgar outros servidores, links ou conteúdos sem permissão.',
  ],
  [
    'COMPROMETIMENTO COM O CLÃ',
    'Inatividade sem aviso pode resultar em punição ou remoção.',
  ],
  [
    'PARTICIPAÇÃO OBRIGATÓRIA EM EVENTOS/TRYOUTS',
    'Quando convocado, o membro deve participar. Sumir nessas horas mostra falta de compromisso com o clã.',
  ],
  [
    'PROIBIDO COMPORTAMENTO TÓXICO',
    'Confusões paralelas no chat, reclamações exageradas, desrespeito ou desmotivação não serão tolerados.',
  ],
  [
    'USO ADEQUADO DE VOZ',
    'Evite gritaria, interrupções e bagunça durante calls.',
  ],
  [
    'DECISÕES DA STAFF SÃO FINAIS',
    'Discussões podem acontecer, desobediência não.',
  ],
];

const questions: Question[] = [
  {
    number: '01',
    title: 'CONDUTA',
    prompt: 'Uma provocação surge no chat antes de um confronto. Como você reage?',
    answers: [
      {
        label: 'Observo primeiro e respondo apenas quando a estratégia exigir.',
        scores: { comportamento: 3, estratégia: 2 },
      },
      {
        label: 'Corto a tensão com humor, sem deixar o grupo perder o foco.',
        scores: { comportamento: 2, liderança: 2 },
      },
      {
        label: 'Aceito o desafio e deixo minha atuação falar por mim.',
        scores: { poder: 3, coragem: 2 },
      },
      {
        label: 'Peço à liderança que decida se a resposta é necessária.',
        scores: { disciplina: 3, lealdade: 2 },
      },
    ],
  },
  {
    number: '02',
    title: 'DISCIPLINA',
    prompt: 'Você recebe uma ordem que não seria sua primeira escolha.',
    answers: [
      {
        label: 'Executo com precisão e registro o que poderia melhorar.',
        scores: { disciplina: 4, estratégia: 1 },
      },
      {
        label: 'Faço perguntas rápidas para entender o objetivo completo.',
        scores: { liderança: 2, estratégia: 3 },
      },
      {
        label: 'Adapto a ordem ao meu estilo e entrego o resultado.',
        scores: { iniciativa: 3, poder: 2 },
      },
      {
        label: 'Sigo o fluxo do grupo e cubro quem precisar.',
        scores: { lealdade: 3, comportamento: 2 },
      },
    ],
  },
  {
    number: '03',
    title: 'PRESENÇA',
    prompt: 'Quando você chega em um grupo novo, qual é sua postura?',
    answers: [
      {
        label: 'Leio o ambiente antes de ocupar espaço.',
        scores: { comportamento: 3, estratégia: 2 },
      },
      {
        label: 'Me apresento e encontro rapidamente uma função.',
        scores: { liderança: 3, iniciativa: 2 },
      },
      {
        label: 'Procuro o membro mais experiente e ofereço apoio.',
        scores: { lealdade: 3, disciplina: 2 },
      },
      {
        label: 'Deixo minhas ações criarem minha reputação.',
        scores: { poder: 3, comportamento: 2 },
      },
    ],
  },
  {
    number: '04',
    title: 'EQUIPE',
    prompt: 'Uma parte do time está atrasada para o evento.',
    answers: [
      {
        label: 'Reorganizo as tarefas para proteger o objetivo principal.',
        scores: { estratégia: 4, liderança: 1 },
      },
      {
        label: 'Espero o time e mantenho todos informados.',
        scores: { lealdade: 3, comportamento: 2 },
      },
      {
        label: 'Assumo uma função extra para ganhar tempo.',
        scores: { poder: 2, iniciativa: 3 },
      },
      {
        label: 'Aviso a liderança e sigo o plano que for definido.',
        scores: { disciplina: 4, lealdade: 1 },
      },
    ],
  },
  {
    number: '05',
    title: 'CONFIANÇA',
    prompt: 'O que sustenta uma gangue forte?',
    answers: [
      {
        label: 'A capacidade de cumprir o combinado quando ninguém olha.',
        scores: { lealdade: 4, disciplina: 1 },
      },
      {
        label: 'A soma de talentos diferentes em uma direção comum.',
        scores: { estratégia: 3, comportamento: 2 },
      },
      {
        label: 'A presença de alguém disposto a assumir a frente.',
        scores: { liderança: 4, poder: 1 },
      },
      {
        label: 'A coragem de continuar quando o cenário muda.',
        scores: { poder: 3, iniciativa: 2 },
      },
    ],
  },
  {
    number: '06',
    title: 'CONFLITO',
    prompt: 'Dois membros discordam antes de uma decisão importante.',
    answers: [
      {
        label: 'Escuto ambos e encontro o ponto que protege a missão.',
        scores: { comportamento: 3, liderança: 2 },
      },
      {
        label: 'Defendo minha leitura e aceito a decisão final.',
        scores: { poder: 2, disciplina: 3 },
      },
      {
        label: 'Proponho um teste rápido para decidir com evidência.',
        scores: { estratégia: 4, iniciativa: 1 },
      },
      {
        label: 'Evito ampliar o conflito e sigo quem responde pelo grupo.',
        scores: { lealdade: 3, disciplina: 2 },
      },
    ],
  },
  {
    number: '07',
    title: 'CORAGEM',
    prompt: 'Qual é a sua definição de coragem?',
    answers: [
      {
        label: 'Entrar em ação mesmo quando o plano não é perfeito.',
        scores: { poder: 3, iniciativa: 2 },
      },
      {
        label: 'Manter a calma quando todos procuram uma reação.',
        scores: { comportamento: 3, disciplina: 2 },
      },
      {
        label: 'Assumir a responsabilidade pelo efeito das próprias escolhas.',
        scores: { liderança: 3, lealdade: 2 },
      },
      {
        label: 'Esperar o momento certo e não desperdiçar força.',
        scores: { estratégia: 4, disciplina: 1 },
      },
    ],
  },
  {
    number: '08',
    title: 'ESTRATÉGIA',
    prompt: 'O plano original deixa de funcionar no meio da missão.',
    answers: [
      {
        label: 'Improviso uma rota e mantenho o objetivo intacto.',
        scores: { estratégia: 4, iniciativa: 1 },
      },
      {
        label: 'Protejo a formação e aguardo uma nova instrução.',
        scores: { disciplina: 4, lealdade: 1 },
      },
      {
        label: 'Assumo o risco de abrir uma nova frente.',
        scores: { poder: 4, liderança: 1 },
      },
      {
        label: 'Procuro quem está com dificuldade e reorganizo o apoio.',
        scores: { comportamento: 2, lealdade: 3 },
      },
    ],
  },
  {
    number: '09',
    title: 'RESPONSABILIDADE',
    prompt: 'Você percebe que cometeu um erro.',
    answers: [
      {
        label: 'Aviso rapidamente e apresento uma forma de corrigir.',
        scores: { liderança: 2, lealdade: 3 },
      },
      {
        label: 'Reparo o que for possível antes de chamar atenção.',
        scores: { iniciativa: 3, disciplina: 2 },
      },
      {
        label: 'Analiso a causa para não repetir o mesmo padrão.',
        scores: { estratégia: 3, comportamento: 2 },
      },
      {
        label: 'Aceito a orientação de quem está responsável.',
        scores: { disciplina: 3, lealdade: 2 },
      },
    ],
  },
  {
    number: '10',
    title: 'COMPETITIVIDADE',
    prompt: 'O que uma derrota muda em você?',
    answers: [
      {
        label: 'Transformo o resultado em uma lista objetiva de ajustes.',
        scores: { estratégia: 3, disciplina: 2 },
      },
      {
        label: 'Volto mais forte e procuro uma nova oportunidade.',
        scores: { poder: 3, iniciativa: 2 },
      },
      {
        label: 'Cuido para que o grupo não se fragmente depois do resultado.',
        scores: { lealdade: 3, liderança: 2 },
      },
      {
        label: 'Aceito a derrota sem mudar meu respeito pelo adversário.',
        scores: { comportamento: 4, disciplina: 1 },
      },
    ],
  },
  {
    number: '11',
    title: 'INICIATIVA',
    prompt: 'Não existe uma tarefa definida para você.',
    answers: [
      {
        label: 'Encontro uma lacuna e proponho uma solução.',
        scores: { iniciativa: 4, liderança: 1 },
      },
      {
        label: 'Pergunto à liderança onde a presença é mais necessária.',
        scores: { disciplina: 3, lealdade: 2 },
      },
      {
        label: 'Observo até entender a dinâmica do ambiente.',
        scores: { estratégia: 3, comportamento: 2 },
      },
      {
        label: 'Me junto à função que parece mais exigente.',
        scores: { poder: 3, coragem: 2 },
      },
    ],
  },
  {
    number: '12',
    title: 'LEALDADE',
    prompt: 'Um amigo pede para você ignorar uma regra do servidor.',
    answers: [
      {
        label: 'Explico o motivo da regra e mantenho o limite.',
        scores: { lealdade: 3, comportamento: 2 },
      },
      {
        label: 'Consulto a staff antes de tomar qualquer atitude.',
        scores: { disciplina: 4, lealdade: 1 },
      },
      {
        label: 'Procuro uma alternativa permitida para ajudar.',
        scores: { estratégia: 3, iniciativa: 2 },
      },
      {
        label: 'Recuso, mesmo que isso gere uma conversa difícil.',
        scores: { poder: 2, lealdade: 3 },
      },
    ],
  },
  {
    number: '13',
    title: 'LIDERANÇA',
    prompt: 'O grupo precisa de direção, mas ninguém se manifesta.',
    answers: [
      {
        label: 'Assumo a frente, distribuo funções e ouço o retorno.',
        scores: { liderança: 4, comportamento: 1 },
      },
      {
        label: 'Apresento uma leitura clara e deixo o grupo decidir.',
        scores: { estratégia: 3, liderança: 2 },
      },
      {
        label: 'Começo a agir e crio movimento pelo exemplo.',
        scores: { iniciativa: 3, poder: 2 },
      },
      {
        label: 'Peço que a autoridade mais próxima confirme o caminho.',
        scores: { disciplina: 3, lealdade: 2 },
      },
    ],
  },
  {
    number: '14',
    title: 'CONTROLE',
    prompt: 'Uma situação começa a sair do controle durante a call.',
    answers: [
      {
        label: 'Reduzo o tom, organizo as vozes e retomo a pauta.',
        scores: { liderança: 3, comportamento: 2 },
      },
      {
        label: 'Fico em silêncio até o momento de contribuir.',
        scores: { disciplina: 3, estratégia: 2 },
      },
      {
        label: 'Interrompo o ruído e tomo uma decisão rápida.',
        scores: { poder: 3, iniciativa: 2 },
      },
      {
        label: 'Sigo a pessoa responsável e ajudo a manter o grupo unido.',
        scores: { lealdade: 3, comportamento: 2 },
      },
    ],
  },
  {
    number: '15',
    title: 'TRAJETÓRIA',
    prompt: 'O que você procura ao entrar na Allied?',
    answers: [
      {
        label: 'Um lugar para evoluir com constância e responsabilidade.',
        scores: { disciplina: 3, lealdade: 2 },
      },
      {
        label: 'Um grupo onde presença e competência sejam reconhecidas.',
        scores: { poder: 2, iniciativa: 3 },
      },
      {
        label: 'Uma estrutura para aprender a liderar situações reais.',
        scores: { liderança: 4, estratégia: 1 },
      },
      {
        label: 'Uma história coletiva da qual eu possa fazer parte.',
        scores: { comportamento: 2, lealdade: 3 },
      },
    ],
  },
];

const divisions: Record<
  Division,
  { eyebrow: string; title: string; description: string }
> = {
  '1ª DIVISÃO': {
    eyebrow: 'NÚCLEO DE COMANDO',
    title: 'Responsabilidade acima do ruído.',
    description:
      'Os membros da 1ª Divisão representam o núcleo de maior responsabilidade da Allied. São indivíduos preparados para assumir grandes responsabilidades, liderar situações críticas e representar a gangue.',
  },
  '2ª DIVISÃO': {
    eyebrow: 'PRESENÇA EM ASCENSÃO',
    title: 'Potencial que já ocupa espaço.',
    description:
      'Os membros da 2ª Divisão demonstram forte potencial, disciplina e capacidade de atuação. São membros confiáveis e preparados para situações de maior exigência.',
  },
  '3ª DIVISÃO': {
    eyebrow: 'FORÇA EM DESENVOLVIMENTO',
    title: 'Toda presença começa aqui.',
    description:
      'Os membros da 3ª Divisão apresentam potencial e disposição para evoluir. Com experiência, presença e dedicação, podem alcançar posições superiores dentro da Allied.',
  },
  '4ª DIVISÃO': {
    eyebrow: 'PRIMEIRO PASSO',
    title: 'A porta de entrada está aberta.',
    description:
      'A 4ª Divisão é a porta de entrada. Aqui estão aqueles que estão começando sua trajetória na Allied. Todo membro começa em algum lugar, e evolução depende de presença, disciplina e dedicação.',
  },
};

const attributeLabels: Record<Attribute, string> = {
  comportamento: 'COMPORTAMENTO',
  disciplina: 'DISCIPLINA',
  liderança: 'LIDERANÇA',
  estratégia: 'ESTRATÉGIA',
  poder: 'PODER',
  lealdade: 'LEALDADE',
};

const attributeKeys: Attribute[] = [
  'comportamento',
  'disciplina',
  'liderança',
  'estratégia',
  'poder',
  'lealdade',
];

function LogoMark({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`logo-mark ${small ? 'logo-mark-small' : ''}`}
      aria-label="Símbolo Allied"
    >
      <span>✦</span>
      <span>✦</span>
      <span>✦</span>
      <span>✦</span>
    </div>
  );
}

function SectionLabel({
  children,
  number,
}: {
  children: string;
  number?: string;
}) {
  return (
    <div className="section-label">
      <span>{number ?? '///'}</span>
      <span>{children}</span>
      <i />
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [visitorName, setVisitorName] = useState('');
  const [audioOn, setAudioOn] = useState(false);
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(
    () => new Set(),
  );

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll('.reveal').forEach((element) => {
      revealObserver.observe(element);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      revealObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!quizOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setQuizOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [quizOpen]);

  const progress = Math.round(
    (answers.length / questions.length) * 100,
  );

  const currentQuestion = questions[quizStep];

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const startQuiz = () => {
    setVisitorName('');
    setQuizOpen(true);
    setQuizStep(0);
    setAnswers([]);
    setResult(null);
    closeMenu();
  };

  const closeQuiz = () => {
    setQuizOpen(false);
  };

  const selectAnswer = (answerIndex: number) => {
    setAnswers((current) => {
      const next = [...current];
      next[quizStep] = answerIndex;
      return next;
    });
  };

  const finishQuiz = () => {
    const scoreTotals: Record<RawAttribute, number> = {
      comportamento: 0,
      disciplina: 0,
      liderança: 0,
      estratégia: 0,
      poder: 0,
      lealdade: 0,
      iniciativa: 0,
      coragem: 0,
    };

    answers.forEach((answerIndex, questionIndex) => {
      const question = questions[questionIndex];

      if (!question) return;

      const answer = question.answers[answerIndex];

      if (!answer) return;

      Object.entries(answer.scores).forEach(([key, value]) => {
        const attribute = key as RawAttribute;
        scoreTotals[attribute] += value ?? 0;
      });
    });

    /*
     * Iniciativa e coragem são dimensões usadas pelas respostas,
     * mas não precisam aparecer como barras separadas no resultado.
     * Elas são convertidas para atributos já existentes:
     *
     * iniciativa -> liderança
     * coragem    -> poder
     *
     * Isso mantém o perfil visual original da página sem perder
     * os pontos dessas respostas.
     */
    const normalizedTotals: Record<Attribute, number> = {
      comportamento: scoreTotals.comportamento,
      disciplina: scoreTotals.disciplina,
      liderança:
        scoreTotals.liderança + scoreTotals.iniciativa,
      estratégia: scoreTotals.estratégia,
      poder: scoreTotals.poder + scoreTotals.coragem,
      lealdade: scoreTotals.lealdade,
    };

    /*
     * Cada pergunta entrega até 5 pontos.
     * O resultado é convertido para uma escala visual de 0 a 99.
     *
     * A média parte de uma base neutra e usa a distribuição
     * efetivamente obtida pelo participante.
     */
    const scores = Object.fromEntries(
      attributeKeys.map((key) => [
        key,
        Math.min(
          99,
          Math.round(55 + normalizedTotals[key] * 2.8),
        ),
      ]),
    ) as Record<Attribute, number>;

    const total =
      Object.values(scores).reduce(
        (sum, score) => sum + score,
        0,
      ) / attributeKeys.length;

    const division: Division =
      total >= 88
        ? '1ª DIVISÃO'
        : total >= 78
          ? '2ª DIVISÃO'
          : total >= 68
            ? '3ª DIVISÃO'
            : '4ª DIVISÃO';

    const cleanedName = visitorName.trim();

    setResult({
      name: cleanedName || 'RECRUTA',
      division,
      scores,
    });
  };

  const toggleFaq = (index: number) => {
    setOpenFaqs((current) => {
      const next = new Set(current);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  };

  const stats = useMemo(
    () => [
      {
        value: '0',
        label: 'TOLERÂNCIA PARA TRAIDORES',
        note: 'Lealdade e confiança fazem parte da estrutura da Allied.',
        icon: Shield,
        featured: true,
      },
      {
        value: 'PT-BR',
        label: 'SERVIDOR',
        note: 'Uma base, muitas histórias.',
        icon: MessageCircle,
      },
      {
        value: '01',
        label: 'GANGUE COMPLETA',
        note: 'Uma estrutura com identidade própria.',
        icon: Crown,
      },
      {
        value: 'GAKURAN',
        label: 'UNIVERSO',
        note: 'Onde a presença ganha forma.',
        icon: Landmark,
      },
      {
        value: 'ATIVA',
        label: 'HIERARQUIA',
        note: 'Cada membro possui um lugar.',
        icon: Crosshair,
      },
      {
        value: 'ABERTO',
        label: 'RECRUTAMENTO',
        note: 'A próxima história pode ser a sua.',
        icon: ArrowRight,
      },
    ],
    [],
  );

  const faqQuestions = [
    'Como entro na Allied?',
    'Preciso jogar bem para entrar?',
    'A Allied é uma gangue do Gakuran?',
    'Preciso estar no Discord?',
    'Existem eventos e tryouts?',
    'Posso entrar mesmo sendo iniciante?',
    'Existe hierarquia?',
    'Como descubro minha divisão?',
  ];

  const faqAnswers = [
    'Abra um ticket no Discord da Allied e envie qualquer mensagem. A equipe irá orientar você.',
    'Não. A evolução dentro da Allied acontece com presença, disciplina e participação.',
    'Sim. A Allied é uma gangue completa dentro do universo de Gakuran.',
    'Sim. O Discord é o principal espaço de comunicação e organização da Allied.',
    'Sim. Eventos, treinos, tryouts e atividades podem ser realizados de acordo com a organização da equipe.',
    'Sim. A Allied possui espaço para membros iniciantes. O importante é disposição para participar e evoluir.',
    'Sim. A Allied possui uma estrutura hierárquica para organização, disciplina e funcionamento interno.',
    'Realize o teste de recrutamento disponível no site.',
  ];

  return (
    <div className={`allied-app ${audioOn ? 'ambient-on' : ''}`}>
      <div className="grain" aria-hidden="true" />
      <div className="rain" aria-hidden="true" />
      <div className="kanji kanji-one" aria-hidden="true">
        忠
        <br />
        誠
      </div>
      <div className="kanji kanji-two" aria-hidden="true">
        規
        <br />
        律
      </div>

      <header
        className={`site-nav ${scrolled ? 'nav-scrolled' : ''}`}
      >
        <a
          className="nav-brand"
          href="#home"
          onClick={closeMenu}
        >
          <LogoMark small />
          <span>
            ALLIED
            <em>GAKURAN • PT-BR</em>
          </span>
        </a>

        <button
          className="menu-button"
          aria-label={
            menuOpen ? 'Fechar menu' : 'Abrir menu'
          }
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X size={18} />
          ) : (
            <Menu size={18} />
          )}
        </button>

        <nav
          className={
            menuOpen
              ? 'nav-links nav-links-open'
              : 'nav-links'
          }
        >
          {[
            'home:HOME',
            'allied:ALLIED',
            'hierarchy:HIERARQUIA',
            'stats:ESTATÍSTICAS',
            'rules:REGRAS',
            'test:TESTE',
            'faq:FAQ',
          ].map((link) => {
            const [id, label] = link.split(':');

            return (
              <a
                href={`#${id}`}
                key={id}
                onClick={closeMenu}
              >
                {label}
              </a>
            );
          })}

          <a
            className="nav-cta"
            href="https://discord.gg/UFUMMx5PkD"
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
          >
            ENTRAR <ArrowUpRight size={13} />
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-image" />
          <div className="hero-red-light" />

          <div className="hero-content reveal">
            <SectionLabel number="01 / 07">
              GAKURAN • PT-BR
            </SectionLabel>

            <p className="hero-kicker">
              A noite guarda quem tem presença.
            </p>

            <h1>
              ENTRE
              <br />
              <span>NA ALLIED</span>
            </h1>

            <p className="hero-copy">
              Uma gangue completa dentro do universo de
              Gakuran. A Allied reúne jogadores que buscam
              disciplina, competitividade, presença e
              evolução.
            </p>

            <div className="hero-actions">
              <a
                className="button button-red"
                href="https://discord.gg/UFUMMx5PkD"
                target="_blank"
                rel="noreferrer"
              >
                ENTRAR NA ALLIED
                <ArrowUpRight size={16} />
              </a>

              <a
                className="button button-outline"
                href="https://www.roblox.com/pt/games/128736949265057/Gakuran"
                target="_blank"
                rel="noreferrer"
              >
                JOGAR GAKURAN
                <Gamepad2 size={15} />
              </a>
            </div>

            <div className="hero-note">
              <span className="note-line" />
              Para entrar, abra um ticket no Discord e envie
              qualquer mensagem.
            </div>
          </div>

          <div className="hero-emblem reveal">
            <div className="emblem-glow" />
            <LogoMark />
            <span className="emblem-caption">
              A / 01
              <br />
              ALLIED
            </span>
          </div>

          <div className="scroll-cue">
            <ArrowDown size={15} />
            <span>DESCUBRA A ESTRUTURA</span>
          </div>

          <div className="hero-side-text">
            DISCIPLINA
            <br />
            LEALDADE
            <br />
            PRESENÇA
          </div>
        </section>

        <section
          className="manifesto section-dark"
          id="allied"
        >
          <div className="content-grid">
            <div className="reveal">
              <SectionLabel number="02 / 07">
                A ALLIED
              </SectionLabel>

              <h2>
                Não é apenas
                <br />
                <span>entrar.</span>
              </h2>

              <p className="large-copy">
                A Allied é uma gangue completa dentro de
                Gakuran, construída sobre hierarquia,
                disciplina, competitividade e presença.
                Nossa estrutura existe para transformar
                jogadores em membros preparados para
                representar a gangue dentro e fora dos
                confrontos.
              </p>

              <a
                className="text-link"
                href="#hierarchy"
              >
                CONHEÇA NOSSA ESTRUTURA
                <ArrowRight size={16} />
              </a>
            </div>

            <div className="manifesto-card reveal">
              <div className="card-image school-image" />

              <div className="manifesto-card-footer">
                <span>ALLIED ARCHIVE / 001</span>
                <span>忠誠 — LEALDADE</span>
              </div>
            </div>
          </div>

          <div className="quote-line reveal">
            <Quote size={20} />
            <span>
              “ENTRAR É FÁCIL. PERMANECER EXIGE COMPROMISSO.”
            </span>
            <i />
          </div>
        </section>

        <section
          className="central section-paper"
          id="central"
        >
          <div className="section-heading reveal">
            <div>
              <SectionLabel number="03 / 07">
                PORTAS DE ACESSO
              </SectionLabel>

              <h2>
                Central da <span>Allied</span>
              </h2>
            </div>

            <p>
              Três destinos. Uma mesma origem.
              <br />
              Escolha onde sua história começa.
            </p>
          </div>

          <div className="link-grid">
            {officialLinks.map(
              (
                {
                  label,
                  title,
                  description,
                  href,
                  icon: Icon,
                },
                index,
              ) => (
                <a
                  className="official-card reveal"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  key={label}
                  style={{
                    transitionDelay: `${index * 90}ms`,
                  }}
                >
                  <div className="official-top">
                    <span>0{index + 1}</span>
                    <Icon size={20} />
                  </div>

                  <div>
                    <p>{label}</p>
                    <h3>{title}</h3>
                    <span>{description}</span>
                  </div>

                  <div className="card-arrow">
                    <MoveUpRight size={17} />
                  </div>
                </a>
              ),
            )}
          </div>
        </section>

        <section
          className="hierarchy section-dark"
          id="hierarchy"
        >
          <div className="content-grid hierarchy-grid">
            <div className="reveal">
              <SectionLabel number="04 / 07">
                A ESTRUTURA
              </SectionLabel>

              <h2>
                Hierarquia
                <br />
                <span>ativa.</span>
              </h2>

              <p className="large-copy">
                A hierarquia define a estrutura. Cada posição
                exige presença, responsabilidade e a vontade
                de proteger o nome Allied.
              </p>

              <div className="vertical-note">
                <span>HIERARQUIA / ATIVA</span>
                <i />
              </div>
            </div>

            <div className="leader-stack">
              <article className="leader-card leader-primary reveal">
                <div className="leader-photo leader-one" />

                <div className="leader-info">
                  <span>LÍDER / 01</span>
                  <h3>Toru</h3>
                  <p>
                    O ponto de direção. A voz que mantém a
                    estrutura em movimento.
                  </p>
                </div>

                <LogoMark small />
              </article>

              <article className="leader-card reveal">
                <div className="leader-photo leader-two" />

                <div className="leader-info">
                  <span>SUB-LÍDER / 02</span>
                  <h3>Maniack</h3>
                  <p>
                    Presença de apoio, disciplina em cada
                    decisão.
                  </p>
                </div>

                <LogoMark small />
              </article>
            </div>
          </div>
        </section>

        <section
          className="stats section-paper"
          id="stats"
        >
          <div className="section-heading reveal">
            <div>
              <SectionLabel number="05 / 07">
                REGISTRO ALLIED
              </SectionLabel>

              <h2>
                Uma estrutura
                <br />
                <span>em movimento.</span>
              </h2>
            </div>

            <span className="stamp">
              ALLIED
              <br />
              RECORDS
            </span>
          </div>

          <div className="stats-grid">
            {stats.map(
              (
                {
                  value,
                  label,
                  note,
                  icon: Icon,
                  featured,
                },
                index,
              ) => (
                <div
                  className={`stat-card reveal ${
                    featured ? 'stat-featured' : ''
                  }`}
                  key={label}
                  style={{
                    transitionDelay: `${index * 70}ms`,
                  }}
                >
                  <Icon size={17} />
                  <strong>{value}</strong>
                  <h3>{label}</h3>
                  <p>{note}</p>
                  <span className="stat-index">
                    0{index + 1}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>

        <section
          className="rules section-dark"
          id="rules"
        >
          <div className="rules-intro reveal">
            <SectionLabel number="06 / 07">
              CÓDIGO DA ALLIED
            </SectionLabel>

            <h2>
              As regras existem
              <br />
              para preservar
              <br />
              <span>nossa estrutura.</span>
            </h2>

            <p>
              Um nome forte exige uma conduta à altura.
              Leia antes de entrar.
            </p>
          </div>

          <div className="rules-list">
            {rules.map(([title, description], index) => (
              <article
                className="rule reveal"
                key={title}
              >
                <span className="rule-number">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>

                <Check size={15} />
              </article>
            ))}
          </div>
        </section>

        <section
          className="quiz-section section-paper"
          id="test"
        >
          <div className="quiz-intro reveal">
            <div>
              <SectionLabel number="07 / 07">
                入隊試験 / RECRUITMENT TEST
              </SectionLabel>

              <h2>
                Descubra sua
                <br />
                <span>divisão.</span>
              </h2>

              <p>
                Quinze perguntas. Quatro caminhos em cada
                uma. Nenhuma resposta é certa, apenas revela
                como você se posiciona.
              </p>

              <button
                className="button button-red"
                onClick={startQuiz}
              >
                FAZER O TESTE
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="quiz-seal">
              <span>入隊</span>
              <small>
                ALLIED
                <br />
                EXAM / 001
              </small>
            </div>
          </div>
        </section>

        <section
          className="faq section-dark"
          id="faq"
        >
          <div className="section-heading reveal">
            <div>
              <SectionLabel>
                よくある質問
              </SectionLabel>

              <h2>
                Perguntas
                <br />
                <span>frequentes.</span>
              </h2>
            </div>

            <p>
              Antes de entrar, conheça o lugar
              <br />
              que você está prestes a ocupar.
            </p>
          </div>

          <div className="faq-list">
            {faqQuestions.map((question, index) => {
              const isOpen = openFaqs.has(index);

              return (
                <div
                  className={`faq-item reveal ${
                    isOpen ? 'faq-open' : ''
                  }`}
                  key={question}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    onClick={() => toggleFaq(index)}
                  >
                    <span>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <strong>{question}</strong>

                    <ChevronDown size={17} />
                  </button>

                  <div
                    className="faq-answer"
                    id={`faq-answer-${index}`}
                    aria-hidden={!isOpen}
                  >
                    <p>{faqAnswers[index]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="final-cta">
          <div className="final-image" />
          <div className="final-overlay" />

          <div className="final-content reveal">
            <LogoMark />

            <SectionLabel>
              THE NEXT CHAPTER
            </SectionLabel>

            <h2>
              Se você chegou
              <br />
              até aqui, talvez
              <br />
              seja hora de <span>entrar.</span>
            </h2>

            <p>
              A Allied está esperando por novos membros.
            </p>

            <a
              className="button button-red"
              href="https://discord.gg/UFUMMx5PkD"
              target="_blank"
              rel="noreferrer"
            >
              ABRIR MEU TICKET
              <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <LogoMark small />

          <div>
            <strong>ALLIED</strong>
            <span>GAKURAN • PT-BR</span>
          </div>
        </div>

        <p>
          Uma gangue completa dentro do universo de Gakuran.
        </p>

        <div className="footer-links">
          <a
            href="https://www.roblox.com/pt/games/128736949265057/Gakuran"
            target="_blank"
            rel="noreferrer"
          >
            ROBLOX
          </a>

          <a
            href="https://discord.gg/gakuran"
            target="_blank"
            rel="noreferrer"
          >
            DISCORD GAKURAN
          </a>

          <a
            href="https://discord.gg/UFUMMx5PkD"
            target="_blank"
            rel="noreferrer"
          >
            DISCORD ALLIED
          </a>
        </div>

        <button
          className="audio-toggle"
          onClick={() => setAudioOn((on) => !on)}
          aria-pressed={audioOn}
          aria-label="Ativar ambiente visual"
        >
          <AudioLines size={15} />
          {audioOn ? 'AMBIENTE ON' : 'AMBIENTE OFF'}
        </button>

        <span className="copyright">
          © ALLIED / 2026
        </span>
      </footer>

      {quizOpen && (
        <div
          className="quiz-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Teste de recrutamento"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeQuiz();
            }
          }}
        >
          <div className="quiz-window">
            {result ? (
              <div className="result-screen">
                <button
                  className="quiz-close"
                  onClick={closeQuiz}
                  aria-label="Fechar resultado"
                >
                  <X size={18} />
                </button>

                <div className="result-orbit">
                  <LogoMark />
                  <span>
                    {result.division.split('ª')[0]}ª
                  </span>
                </div>

                <SectionLabel>
                  RESULTADO DO TESTE
                </SectionLabel>

                <p className="result-eyebrow">
                  {divisions[result.division].eyebrow}
                </p>

                <h2>
                  {result.name},
                  <br />
                  <span>{result.division}</span>
                </h2>

                <p className="result-title">
                  {divisions[result.division].title}
                </p>

                <p className="result-description">
                  {divisions[result.division].description}
                </p>

                <div className="score-grid">
                  {attributeKeys.map((key) => (
                    <div
                      className="score-row"
                      key={key}
                    >
                      <span>{attributeLabels[key]}</span>

                      <div>
                        <i
                          style={{
                            width: `${result.scores[key]}%`,
                          }}
                        />
                      </div>

                      <strong>
                        {result.scores[key]}%
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="result-actions">
                  <a
                    className="button button-red"
                    href="https://discord.gg/UFUMMx5PkD"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ENTRAR NA ALLIED
                    <ArrowUpRight size={15} />
                  </a>

                  <button
                    className="button button-ghost"
                    onClick={startQuiz}
                  >
                    REFAZER TESTE
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="quiz-header">
                  <div>
                    <span>入隊試験</span>
                    <strong>
                      TESTE DE RECRUTAMENTO
                    </strong>
                  </div>

                  <button
                    className="quiz-close"
                    onClick={closeQuiz}
                    aria-label="Fechar teste"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="quiz-progress">
                  <span>
                    PERGUNTA{' '}
                    {String(quizStep + 1).padStart(2, '0')}{' '}
                    / {questions.length}
                  </span>

                  <div>
                    <i
                      style={{
                        width: `${Math.max(
                          7,
                          progress,
                        )}%`,
                      }}
                    />
                  </div>

                  <span>{progress}%</span>
                </div>

                <div className="quiz-body">
                  {quizStep === 0 && (
                    <div className="quiz-name-field">
                      <label htmlFor="visitor-name">
                        COMO DEVEMOS CHAMAR VOCÊ?
                      </label>

                      <input
                        id="visitor-name"
                        type="text"
                        value={visitorName}
                        onChange={(event) =>
                          setVisitorName(
                            event.target.value,
                          )
                        }
                        placeholder="Seu nome ou apelido"
                        maxLength={32}
                        autoComplete="off"
                      />
                    </div>
                  )}

                  <span className="question-number">
                    {currentQuestion.number}
                  </span>

                  <p className="question-category">
                    {currentQuestion.title}
                  </p>

                  <h2>{currentQuestion.prompt}</h2>

                  <div className="answers">
                    {currentQuestion.answers.map(
                      (answer, index) => (
                        <button
                          className={
                            answers[quizStep] === index
                              ? 'answer selected'
                              : 'answer'
                          }
                          key={answer.label}
                          onClick={() =>
                            selectAnswer(index)
                          }
                        >
                          <span>
                            {String.fromCharCode(
                              65 + index,
                            )}
                          </span>

                          <strong>{answer.label}</strong>

                          {answers[quizStep] ===
                            index && (
                            <Check size={16} />
                          )}
                        </button>
                      ),
                    )}
                  </div>

                  <div className="quiz-footer">
                    <span>
                      DISCIPLINA · LEALDADE · PRESENÇA
                    </span>

                    <div>
                      {quizStep > 0 && (
                        <button
                          className="back-button"
                          onClick={() =>
                            setQuizStep(
                              (step) => step - 1,
                            )
                          }
                        >
                          VOLTAR
                        </button>
                      )}

                      <button
                        className="button button-red"
                        disabled={
                          answers[quizStep] ===
                          undefined
                        }
                        onClick={() => {
                          if (
                            quizStep ===
                            questions.length - 1
                          ) {
                            finishQuiz();
                          } else {
                            setQuizStep(
                              (step) => step + 1,
                            );
                          }
                        }}
                      >
                        {quizStep ===
                        questions.length - 1
                          ? 'REVELAR DIVISÃO'
                          : 'PRÓXIMA'}

                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;