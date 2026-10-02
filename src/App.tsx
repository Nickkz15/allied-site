import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Crosshair,
  Crown,
  Droplets,
  Eclipse,
  Gamepad2,
  Menu,
  MessageCircle,
  Moon,
  MoveUpRight,
  Quote,
  Shield,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';

type DivisionId = 'chuva' | 'sangue' | 'abismo' | 'eclipse';
type DivisionLabel = 'DIVISÃO DA CHUVA' | 'DIVISÃO DO SANGUE' | 'DIVISÃO DO ABISMO' | 'DIVISÃO DO ECLIPSE';
type Attribute = 'comportamento' | 'disciplina' | 'liderança' | 'estratégia' | 'poder' | 'lealdade';
type Answer = { label: string; scores: Partial<Record<Attribute, number>> };
type Question = { number: string; title: string; prompt: string; answers: Answer[] };
type Result = { name: string; division: DivisionLabel; scores: Record<Attribute, number> };

const officialLinks = [
  {
    label: 'DISCORD ALLIED',
    title: 'Abra seu ticket',
    description: 'O primeiro passo para encontrar seu lugar na estrutura.',
    href: 'https://discord.gg/UFUMMx5PkD',
    icon: Shield,
  },
  {
    label: 'COMUNIDADE',
    title: 'Espaço oficial',
    description: 'Conecte-se, participe de eventos e cresça com a Allied.',
    href: 'https://discord.gg/UFUMMx5PkD',
    icon: MessageCircle,
  },
  {
    label: 'MULTIJOGOS',
    title: 'Todos os frontes',
    description: 'Uma organização aberta a diversos jogos e estilos de jogo.',
    href: 'https://discord.gg/UFUMMx5PkD',
    icon: Gamepad2,
  },
];

const rules = [
  ['RESPEITO ACIMA DE TUDO', 'Sem ofensas, discriminação ou ataques pessoais entre membros.'],
  ['HIERARQUIA DEVE SER RESPEITADA', 'Ordens da staff e liderança não são opcionais.'],
  ['PROIBIDO FLOOD E SPAM', 'Nada de poluir chats com mensagens inúteis ou repetidas.'],
  ['USO CORRETO DOS CANAIS', 'Cada canal tem sua finalidade. Use direito.'],
  ['SEM DIVULGAÇÃO NÃO AUTORIZADA', 'Proibido divulgar outros servidores, links ou conteúdos sem permissão.'],
  ['COMPROMETIMENTO COM A ORGANIZAÇÃO', 'Inatividade sem aviso pode resultar em punição ou remoção.'],
  ['PARTICIPAÇÃO EM EVENTOS', 'Quando convocado, o membro deve participar. Ausência sem justificativa demonstra falta de compromisso.'],
  ['PROIBIDO COMPORTAMENTO TÓXICO', 'Confusões paralelas, reclamações exageradas, desrespeito ou desmotivação não serão tolerados.'],
  ['USO ADEQUADO DE VOZ', 'Evite gritaria, interrupções e bagunça durante calls.'],
  ['DECISÕES DA STAFF SÃO FINAIS', 'Discussões podem acontecer. Desobediência, não.'],
];

const questions: Question[] = [
  {
    number: '01',
    title: 'CONDUTA',
    prompt: 'Uma provocação surge no chat antes de um confronto. Como você reage?',
    answers: [
      { label: 'Observo primeiro e respondo apenas quando a estratégia exigir.', scores: { comportamento: 3, estratégia: 2 } },
      { label: 'Corto a tensão com humor, sem deixar o grupo perder o foco.', scores: { comportamento: 2, liderança: 2 } },
      { label: 'Aceito o desafio e deixo minha atuação falar por mim.', scores: { poder: 3 } },
      { label: 'Peço à liderança que decida se a resposta é necessária.', scores: { disciplina: 3, lealdade: 2 } },
    ],
  },
  {
    number: '02',
    title: 'DISCIPLINA',
    prompt: 'Você recebe uma ordem que não seria sua primeira escolha.',
    answers: [
      { label: 'Executo com precisão e registro o que poderia melhorar.', scores: { disciplina: 4, estratégia: 1 } },
      { label: 'Faço perguntas rápidas para entender o objetivo completo.', scores: { liderança: 2, estratégia: 3 } },
      { label: 'Adapto a ordem ao meu estilo e entrego o resultado.', scores: { poder: 2 } },
      { label: 'Sigo o fluxo do grupo e cubro quem precisar.', scores: { lealdade: 3, comportamento: 2 } },
    ],
  },
  {
    number: '03',
    title: 'PRESENÇA',
    prompt: 'Quando você chega em um grupo novo, qual é sua postura?',
    answers: [
      { label: 'Leio o ambiente antes de ocupar espaço.', scores: { comportamento: 3, estratégia: 2 } },
      { label: 'Me apresento e encontro rapidamente uma função.', scores: { liderança: 3 } },
      { label: 'Procuro o membro mais experiente e ofereço apoio.', scores: { lealdade: 3, disciplina: 2 } },
      { label: 'Deixo minhas ações criarem minha reputação.', scores: { poder: 3, comportamento: 2 } },
    ],
  },
  {
    number: '04',
    title: 'EQUIPE',
    prompt: 'Uma parte do time está atrasada para o evento.',
    answers: [
      { label: 'Reorganizo as tarefas para proteger o objetivo principal.', scores: { estratégia: 4, liderança: 1 } },
      { label: 'Espero o time e mantenho todos informados.', scores: { lealdade: 3, comportamento: 2 } },
      { label: 'Assumo uma função extra para ganhar tempo.', scores: { poder: 2 } },
      { label: 'Aviso a liderança e sigo o plano que for definido.', scores: { disciplina: 4, lealdade: 1 } },
    ],
  },
  {
    number: '05',
    title: 'CONFIANÇA',
    prompt: 'O que sustenta uma organização forte?',
    answers: [
      { label: 'A capacidade de cumprir o combinado quando ninguém olha.', scores: { lealdade: 4, disciplina: 1 } },
      { label: 'A soma de talentos diferentes em uma direção comum.', scores: { estratégia: 3, comportamento: 2 } },
      { label: 'A presença de alguém disposto a assumir a frente.', scores: { liderança: 4, poder: 1 } },
      { label: 'A coragem de continuar quando o cenário muda.', scores: { poder: 3 } },
    ],
  },
  {
    number: '06',
    title: 'CONFLITO',
    prompt: 'Dois membros discordam antes de uma decisão importante.',
    answers: [
      { label: 'Escuto ambos e encontro o ponto que protege a missão.', scores: { comportamento: 3, liderança: 2 } },
      { label: 'Defendo minha leitura e aceito a decisão final.', scores: { poder: 2, disciplina: 3 } },
      { label: 'Proponho um teste rápido para decidir com evidência.', scores: { estratégia: 4 } },
      { label: 'Evito ampliar o conflito e sigo quem responde pelo grupo.', scores: { lealdade: 3, disciplina: 2 } },
    ],
  },
  {
    number: '07',
    title: 'CORAGEM',
    prompt: 'Qual é a sua definição de coragem?',
    answers: [
      { label: 'Entrar em ação mesmo quando o plano não é perfeito.', scores: { poder: 3 } },
      { label: 'Manter a calma quando todos procuram uma reação.', scores: { comportamento: 3, disciplina: 2 } },
      { label: 'Assumir a responsabilidade pelo efeito das próprias escolhas.', scores: { liderança: 3, lealdade: 2 } },
      { label: 'Esperar o momento certo e não desperdiçar força.', scores: { estratégia: 4, disciplina: 1 } },
    ],
  },
  {
    number: '08',
    title: 'ESTRATÉGIA',
    prompt: 'O plano original deixa de funcionar no meio da operação.',
    answers: [
      { label: 'Improviso uma rota e mantenho o objetivo intacto.', scores: { estratégia: 4 } },
      { label: 'Protejo a formação e aguardo uma nova instrução.', scores: { disciplina: 4, lealdade: 1 } },
      { label: 'Assumo o risco de abrir uma nova frente.', scores: { poder: 4, liderança: 1 } },
      { label: 'Procuro quem está com dificuldade e reorganizo o apoio.', scores: { comportamento: 2, lealdade: 3 } },
    ],
  },
  {
    number: '09',
    title: 'RESPONSABILIDADE',
    prompt: 'Você percebe que cometeu um erro.',
    answers: [
      { label: 'Aviso rapidamente e apresento uma forma de corrigir.', scores: { liderança: 2, lealdade: 3 } },
      { label: 'Reparo o que for possível antes de chamar atenção.', scores: { disciplina: 2 } },
      { label: 'Analiso a causa para não repetir o mesmo padrão.', scores: { estratégia: 3, comportamento: 2 } },
      { label: 'Aceito a orientação de quem está responsável.', scores: { disciplina: 3, lealdade: 2 } },
    ],
  },
  {
    number: '10',
    title: 'COMPETITIVIDADE',
    prompt: 'O que uma derrota muda em você?',
    answers: [
      { label: 'Transformo o resultado em uma lista objetiva de ajustes.', scores: { estratégia: 3, disciplina: 2 } },
      { label: 'Volto mais forte e procuro uma nova oportunidade.', scores: { poder: 3 } },
      { label: 'Cuido para que o grupo não se fragmente depois do resultado.', scores: { lealdade: 3, liderança: 2 } },
      { label: 'Aceito a derrota sem mudar meu respeito pelo adversário.', scores: { comportamento: 4, disciplina: 1 } },
    ],
  },
  {
    number: '11',
    title: 'INICIATIVA',
    prompt: 'Não existe uma tarefa definida para você.',
    answers: [
      { label: 'Encontro uma lacuna e proponho uma solução.', scores: { liderança: 1 } },
      { label: 'Pergunto à liderança onde a presença é mais necessária.', scores: { disciplina: 3, lealdade: 2 } },
      { label: 'Observo até entender a dinâmica do ambiente.', scores: { estratégia: 3, comportamento: 2 } },
      { label: 'Me junto à função que parece mais exigente.', scores: { poder: 3 } },
    ],
  },
  {
    number: '12',
    title: 'LEALDADE',
    prompt: 'Um amigo pede para você ignorar uma regra da organização.',
    answers: [
      { label: 'Explico o motivo da regra e mantenho o limite.', scores: { lealdade: 3, comportamento: 2 } },
      { label: 'Consulto a staff antes de tomar qualquer atitude.', scores: { disciplina: 4, lealdade: 1 } },
      { label: 'Procuro uma alternativa permitida para ajudar.', scores: { estratégia: 3 } },
      { label: 'Recuso, mesmo que isso gere uma conversa difícil.', scores: { poder: 2, lealdade: 3 } },
    ],
  },
  {
    number: '13',
    title: 'LIDERANÇA',
    prompt: 'O grupo precisa de direção, mas ninguém se manifesta.',
    answers: [
      { label: 'Assumo a frente, distribuo funções e ouço o retorno.', scores: { liderança: 4, comportamento: 1 } },
      { label: 'Apresento uma leitura clara e deixo o grupo decidir.', scores: { estratégia: 3, liderança: 2 } },
      { label: 'Começo a agir e crio movimento pelo exemplo.', scores: { poder: 2 } },
      { label: 'Peço que a autoridade mais próxima confirme o caminho.', scores: { disciplina: 3, lealdade: 2 } },
    ],
  },
  {
    number: '14',
    title: 'CONTROLE',
    prompt: 'Uma situação começa a sair do controle durante a call.',
    answers: [
      { label: 'Reduzo o tom, organizo as vozes e retomo a pauta.', scores: { liderança: 3, comportamento: 2 } },
      { label: 'Fico em silêncio até o momento de contribuir.', scores: { disciplina: 3, estratégia: 2 } },
      { label: 'Interrompo o ruído e tomo uma decisão rápida.', scores: { poder: 3 } },
      { label: 'Sigo a pessoa responsável e ajudo a manter o grupo unido.', scores: { lealdade: 3, comportamento: 2 } },
    ],
  },
  {
    number: '15',
    title: 'TRAJETÓRIA',
    prompt: 'O que você procura ao entrar na Allied?',
    answers: [
      { label: 'Um lugar para evoluir com constância e responsabilidade.', scores: { disciplina: 3, lealdade: 2 } },
      { label: 'Um grupo onde presença e competência sejam reconhecidas.', scores: { poder: 2 } },
      { label: 'Uma estrutura para aprender a liderar situações reais.', scores: { liderança: 4, estratégia: 1 } },
      { label: 'Uma história coletiva da qual eu possa fazer parte.', scores: { comportamento: 2, lealdade: 3 } },
    ],
  },
];

const divisionResults: Record<DivisionLabel, { eyebrow: string; title: string; description: string }> = {
  'DIVISÃO DA CHUVA': {
    eyebrow: 'ESTRATÉGIA · SILÊNCIO · PRECISÃO',
    title: 'Frio. Calculado. Inevitável.',
    description:
      'A Divisão da Chuva reúne quem age com frieza e leitura de cenário. Silêncio antes do movimento. Estratégia antes do impacto.',
  },
  'DIVISÃO DO SANGUE': {
    eyebrow: 'AGRESSÃO · DOMÍNIO · INTENSIDADE',
    title: 'Pressão constante. Sem recuo.',
    description:
      'A Divisão do Sangue é o braço ofensivo. Dominância, intensidade e presença que força o adversário a ceder.',
  },
  'DIVISÃO DO ABISMO': {
    eyebrow: 'MISTÉRIO · PROFUNDIDADE · CONTROLE',
    title: 'O vazio que observa.',
    description:
      'A Divisão do Abismo opera nas sombras da estrutura. Leitura profunda, paciência e controle de informações.',
  },
  'DIVISÃO DO ECLIPSE': {
    eyebrow: 'EQUILÍBRIO · DUALIDADE · ADAPTAÇÃO',
    title: 'Luz e sombra no mesmo movimento.',
    description:
      'A Divisão do Eclipse equilibra agressão e contenção. Adaptável, versátil e capaz de mudar o ritmo do confronto.',
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

const attributeKeys: Attribute[] = ['comportamento', 'disciplina', 'liderança', 'estratégia', 'poder', 'lealdade'];

const faqItems = [
  { q: 'Como entro na Allied?', a: 'Abra um ticket no Discord da Allied e envie qualquer mensagem. A equipe irá orientar você.' },
  { q: 'Preciso ser bom em um jogo específico?', a: 'Não. A Allied é aberta a diversos jogos e estilos. O que importa é presença, disciplina e participação.' },
  { q: 'A Allied é só de um jogo?', a: 'Não. A Allied é uma organização multi-jogo, com estrutura própria, divisões e hierarquia independentes de um único título.' },
  { q: 'Preciso estar no Discord?', a: 'Sim. O Discord é o principal espaço de comunicação e organização da Allied.' },
  { q: 'Existem eventos e tryouts?', a: 'Sim. Eventos, treinos, tryouts e atividades podem ser realizados de acordo com a organização da equipe.' },
  { q: 'Posso entrar mesmo sendo iniciante?', a: 'Sim. A Allied possui espaço para membros em diferentes níveis. O importante é disposição para participar e evoluir.' },
  { q: 'Existe hierarquia?', a: 'Sim. A Allied possui Líder, Vice-Líder e quatro divisões com lideranças próprias.' },
  { q: 'Como descubro minha divisão?', a: 'Realize o teste de recrutamento disponível no site. O resultado indica a divisão mais alinhada ao seu perfil.' },
];

const muralPhotos = [
  { src: '/images/mural/foto1.png', label: 'Lembrança - 01' },
  { src: '/images/mural/foto2.png', label: 'Lembrança - 02' },
  { src: '/images/mural/foto3.png', label: 'Lembrança - 03' },
  { src: '/images/mural/foto4.png', label: 'Lembrança - 04' },
  { src: '/images/mural/foto5.png', label: 'Lembrança - 05' },
  { src: '/images/mural/foto6.png', label: 'Lembrança - 06' },
  { src: '/images/mural/foto7.png', label: 'Lembrança - 07' },
  { src: '/images/mural/foto8.png', label: 'Lembrança - 08' },
  { src: '/images/mural/foto9.png', label: 'Lembrança - 09' },
  { src: '/images/mural/foto10.png', label: 'Lembrança - 10' },
];

const hierarchy = [
  {
    role: 'LÍDER',
    title: 'Líder da Allied',
    desc: 'Comando absoluto da organização. Define a direção e protege a estrutura.',
    img: '/images/leadership/lider-allied.png',
    tier: 'top' as const,
  },
  {
    role: 'VICE-LÍDER',
    title: 'Vice-Líder da Allied',
    desc: 'Braço direito do comando. Coordena operações e reforça a hierarquia.',
    img: '/images/leadership/vice-lider-allied.png',
    tier: 'top' as const,
  },
  {
    role: '1ª DIVISÃO',
    title: 'Líder — Divisão da Chuva',
    desc: 'Comando da Divisão da Chuva. Estratégia, frieza e precisão.',
    img: '/images/leadership/lider-divisao-1.png',
    tier: 'div' as const,
    theme: 'chuva' as DivisionId,
  },
  {
    role: '2ª DIVISÃO',
    title: 'Líder — Divisão do Sangue',
    desc: 'Comando da Divisão do Sangue. Agressão, domínio e intensidade.',
    img: '/images/leadership/lider-divisao-2.png',
    tier: 'div' as const,
    theme: 'sangue' as DivisionId,
  },
  {
    role: '3ª DIVISÃO',
    title: 'Líder — Divisão do Abismo',
    desc: 'Comando da Divisão do Abismo. Mistério, profundidade e controle.',
    img: '/images/leadership/lider-divisao-3.png',
    tier: 'div' as const,
    theme: 'abismo' as DivisionId,
  },
  {
    role: '4ª DIVISÃO',
    title: 'Líder — Divisão do Eclipse',
    desc: 'Comando da Divisão do Eclipse. Dualidade, equilíbrio e adaptação.',
    img: '/images/leadership/lider-divisao-4.png',
    tier: 'div' as const,
    theme: 'eclipse' as DivisionId,
  },
];

const divisionsData = [
  {
    id: 'chuva' as DivisionId,
    name: 'Divisão da Chuva',
    short: 'Chuva',
    tagline: 'Silêncio antes do impacto.',
    description:
      'Operam com frieza e leitura de cenário. Cada movimento é calculado. A chuva não grita — ela cobre tudo até não restar saída.',
    traits: ['Estratégia', 'Paciência', 'Precisão'],
    icon: Droplets,
    code: '01',
  },
  {
    id: 'sangue' as DivisionId,
    name: 'Divisão do Sangue',
    short: 'Sangue',
    tagline: 'Pressão até o limite.',
    description:
      'O braço ofensivo da Allied. Intensidade, domínio e presença que força o adversário a ceder. Não recuam.',
    traits: ['Agressão', 'Domínio', 'Intensidade'],
    icon: Zap,
    code: '02',
  },
  {
    id: 'abismo' as DivisionId,
    name: 'Divisão do Abismo',
    short: 'Abismo',
    tagline: 'O vazio que observa.',
    description:
      'Operam nas profundezas da estrutura. Controle de informação, paciência e uma presença que o adversário sente antes de ver.',
    traits: ['Mistério', 'Profundidade', 'Controle'],
    icon: Moon,
    code: '03',
  },
  {
    id: 'eclipse' as DivisionId,
    name: 'Divisão do Eclipse',
    short: 'Eclipse',
    tagline: 'Luz e sombra no mesmo gesto.',
    description:
      'Equilíbrio entre agressão e contenção. Adaptáveis, versáteis e capazes de mudar o ritmo do confronto em instantes.',
    traits: ['Equilíbrio', 'Dualidade', 'Adaptação'],
    icon: Eclipse,
    code: '04',
  },
];

function LogoMark({ small = false }: { small?: boolean }) {
  return (
    <div className={`logo-mark ${small ? 'logo-mark-small' : ''}`} aria-label="Símbolo Allied">
      <span>✦</span>
      <span>✦</span>
      <span>✦</span>
      <span>✦</span>
    </div>
  );
}

function SectionLabel({ children, number }: { children: string; number?: string }) {
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
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [visitorName, setVisitorName] = useState('');
  const [musicOn, setMusicOn] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeDivision, setActiveDivision] = useState<DivisionId>('chuva');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicTried = useRef(false);
  const unlockAttempted = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      revealObserver.disconnect();
    };
  }, [activeDivision, result, quizStep]);

  useEffect(() => {
    const audio = new Audio('/audio/japanese-ambient.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = 'auto';
    audioRef.current = audio;

    const tryPlay = async () => {
      if (musicTried.current) return;
      musicTried.current = true;
      try {
        await audio.play();
        setMusicOn(true);
      } catch {
        setMusicOn(true);
      }
    };

    tryPlay();

    const unlock = async () => {
      if (unlockAttempted.current || !audioRef.current) return;
      unlockAttempted.current = true;
      try {
        if (audioRef.current.paused) {
          await audioRef.current.play();
          setMusicOn(true);
        }
      } catch {
        /* silent */
      }
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('keydown', unlock);
    };

    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) {
      audio.pause();
      setMusicOn(false);
    } else {
      try {
        await audio.play();
        setMusicOn(true);
      } catch {
        setMusicOn(false);
      }
    }
  };

  const progress = Math.round((answers.length / questions.length) * 100);
  const currentQuestion = questions[quizStep];
  const closeMenu = () => setMenuOpen(false);

  const selectAnswer = (answerIndex: number) =>
    setAnswers((current) => {
      const next = [...current];
      next[quizStep] = answerIndex;
      return next;
    });

  const finishQuiz = () => {
    const totals: Record<Attribute, number> = {
      comportamento: 0,
      disciplina: 0,
      liderança: 0,
      estratégia: 0,
      poder: 0,
      lealdade: 0,
    };

    answers.forEach((answerIndex, questionIndex) => {
      Object.entries(questions[questionIndex].answers[answerIndex].scores).forEach(([key, value]) => {
        totals[key as Attribute] += value ?? 0;
      });
    });

    const scores = Object.fromEntries(
      attributeKeys.map((key) => [key, Math.min(99, Math.round(58 + totals[key] * 3.2))])
    ) as Record<Attribute, number>;

    const total = Object.values(scores).reduce((sum, value) => sum + value, 0) / attributeKeys.length;

    let division: DivisionLabel = 'DIVISÃO DO ECLIPSE';
    if (total >= 88) division = 'DIVISÃO DA CHUVA';
    else if (total >= 78) division = 'DIVISÃO DO SANGUE';
    else if (total >= 68) division = 'DIVISÃO DO ABISMO';

    setResult({ name: visitorName.trim() || 'RECRUTA', division, scores });
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setAnswers([]);
    setResult(null);
    setVisitorName('');
  };

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const stats = useMemo(
    () => [
      {
        value: '0',
        label: 'TOLERÂNCIA PARA TRAIDORES',
        note: 'Lealdade é a base da estrutura.',
        icon: Shield,
        featured: true,
      },
      { value: '04', label: 'DIVISÕES', note: 'Chuva · Sangue · Abismo · Eclipse.', icon: Crosshair },
      { value: 'MULTI', label: 'JOGOS', note: 'Aberta a diversos títulos e estilos.', icon: Gamepad2 },
      { value: 'ATIVA', label: 'HIERARQUIA', note: 'Cada posição exige presença.', icon: Crown },
      { value: 'ABERTO', label: 'RECRUTAMENTO', note: 'A próxima história pode ser a sua.', icon: ArrowRight },
      { value: 'PT-BR', label: 'COMUNIDADE', note: 'Organização, eventos e união.', icon: MessageCircle },
    ],
    []
  );

  const activeDiv = divisionsData.find((d) => d.id === activeDivision)!;
  const ActiveIcon = activeDiv.icon;

  return (
    <div className={`allied-app ${musicOn ? 'ambient-on' : ''}`}>
      <div className="grain" />
      <div className="rain" />

      <div className="sakura-layer" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={`sakura-${i}`}
            className={`sakura sakura-var-${(i % 6) + 1}`}
            style={{
              left: `${(i * 7.2 + 3) % 100}%`,
              animationDelay: `${(i * 1.1) % 14}s`,
              animationDuration: `${13 + (i % 8)}s`,
              width: `${10 + (i % 5) * 2}px`,
              height: `${10 + (i % 5) * 2}px`,
            }}
          />
        ))}
      </div>

      <header className={`site-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <a className="nav-brand" href="#home" onClick={closeMenu}>
          <LogoMark small />
          <span>
            ALLIED<em>ORGANIZAÇÃO • PT-BR</em>
          </span>
        </a>
        <button
          className="menu-button"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <nav className={menuOpen ? 'nav-links nav-links-open' : 'nav-links'}>
          {[
            'home:HOME',
            'allied:ALLIED',
            'divisions:DIVISÕES',
            'hierarchy:HIERARQUIA',
            'mural:MURAL',
            'stats:ESTATÍSTICAS',
            'rules:REGRAS',
            'test:TESTE',
            'faq:FAQ',
          ].map((link) => {
            const [id, label] = link.split(':');
            return (
              <a href={`#${id}`} key={id} onClick={closeMenu}>
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
            <SectionLabel number="01 / 09">ORGANIZAÇÃO • PT-BR</SectionLabel>
            <p className="hero-kicker">Estrutura. Disciplina. Presença.</p>
            <h1>
              ENTRE
              <br />
              <span>NA ALLIED</span>
            </h1>
            <p className="hero-copy">
              Uma organização aberta a diversos jogos, estilos e frentes. A Allied reúne membros que buscam competição,
              hierarquia, eventos e uma estrutura real de crescimento.
            </p>
            <div className="hero-actions">
              <a className="button button-red" href="https://discord.gg/UFUMMx5PkD" target="_blank" rel="noreferrer">
                ENTRAR NA ALLIED <ArrowUpRight size={16} />
              </a>
              <a className="button button-outline" href="#divisions">
                CONHECER DIVISÕES <ArrowRight size={15} />
              </a>
            </div>
            <div className="hero-note">
              <span className="note-line" />
              Para entrar, abra um ticket no Discord e envie qualquer mensagem.
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

        <section className="manifesto section-dark" id="allied">
          <div className="content-grid">
            <div className="reveal">
              <SectionLabel number="02 / 09">A ALLIED</SectionLabel>
              <h2>
                Não é apenas
                <br />
                <span>entrar.</span>
              </h2>
              <p className="large-copy">
                A Allied é uma organização multi-jogo construída sobre hierarquia, disciplina, competitividade e
                presença. Quatro divisões. Um comando. Espaço para quem quer crescer dentro de uma estrutura real — em
                qualquer frente.
              </p>
              <a className="text-link" href="#hierarchy">
                CONHEÇA NOSSA ESTRUTURA <ArrowRight size={16} />
              </a>
            </div>
            <div className="manifesto-card reveal">
              <div className="card-image school-image" />
              <div className="manifesto-card-footer">
                <span>ALLIED ARCHIVE / 001</span>
                <span>ESTRUTURA — PRESENÇA</span>
              </div>
            </div>
          </div>
          <div className="quote-line reveal">
            <Quote size={20} />
            <span>“ENTRAR É FÁCIL. PERMANECER EXIGE COMPROMISSO.”</span>
            <i />
          </div>
        </section>

        <section className="central section-paper" id="central">
          <div className="section-heading reveal">
            <div>
              <SectionLabel number="03 / 09">PORTAS DE ACESSO</SectionLabel>
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
            {officialLinks.map(({ label, title, description, href, icon: Icon }, index) => (
              <a
                className="official-card reveal"
                href={href}
                target="_blank"
                rel="noreferrer"
                key={label}
                style={{ transitionDelay: `${index * 90}ms` }}
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
            ))}
          </div>
        </section>

        <section className="divisions-section section-dark" id="divisions">
          <div className="section-heading reveal">
            <div>
              <SectionLabel number="04 / 09">AS QUATRO FRENTES</SectionLabel>
              <h2>Divisões</h2>
            </div>
            <p>
              Cada uma com identidade própria.
              <br />
              Escolha a que ressoa com você.
            </p>
          </div>

          <div className="division-tabs reveal">
            {divisionsData.map((division) => {
              const Icon = division.icon;
              return (
                <button
                  key={division.id}
                  type="button"
                  className={`division-tab ${activeDivision === division.id ? 'active' : ''} tab-${division.id}`}
                  onClick={() => setActiveDivision(division.id)}
                >
                  <Icon size={16} />
                  <span>{division.short}</span>
                </button>
              );
            })}
          </div>

          <div className={`division-stage division-${activeDivision} reveal`} key={activeDivision}>
            <div className="division-fx" aria-hidden="true">
              {activeDivision === 'chuva' && (
                <div className="fx-rain">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <span
                      key={i}
                      className="rain-drop"
                      style={{
                        left: `${(i * 2.1) % 100}%`,
                        animationDelay: `${(i * 0.11) % 2.8}s`,
                        animationDuration: `${0.75 + (i % 6) * 0.12}s`,
                        opacity: 0.35 + (i % 5) * 0.1,
                      }}
                    />
                  ))}
                </div>
              )}

              {activeDivision === 'sangue' && (
                <div className="fx-blood">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <span
                      key={i}
                      className="blood-drip"
                      style={{
                        left: `${6 + i * 7}%`,
                        animationDelay: `${(i * 0.35) % 3.5}s`,
                        height: `${36 + (i % 5) * 18}px`,
                        width: `${2 + (i % 3)}px`,
                      }}
                    />
                  ))}
                </div>
              )}

              {activeDivision === 'abismo' && (
                <div className="fx-abyss">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span
                      key={i}
                      className="abyss-particle"
                      style={{
                        left: `${(i * 3.7) % 100}%`,
                        top: `${(i * 6.3) % 100}%`,
                        animationDelay: `${(i * 0.28) % 5}s`,
                        width: `${2 + (i % 4)}px`,
                        height: `${2 + (i % 4)}px`,
                      }}
                    />
                  ))}
                </div>
              )}

              {activeDivision === 'eclipse' && (
                <div className="fx-eclipse">
                  <div className="eclipse-orb" />
                  <div className="eclipse-shadow" />
                </div>
              )}
            </div>

            <div className="division-content">
              <div className="division-badge">
                <ActiveIcon size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                {activeDiv.code}
              </div>
              <h3>{activeDiv.name}</h3>
              <p className="division-tagline">{activeDiv.tagline}</p>
              <p className="division-desc">{activeDiv.description}</p>
              <div className="division-traits">
                {activeDiv.traits.map((trait) => (
                  <span key={trait}>{trait}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="hierarchy section-dark" id="hierarchy">
          <div className="section-heading reveal">
            <div>
              <SectionLabel number="05 / 09">A ESTRUTURA</SectionLabel>
              <h2>
                Hierarquia
                <br />
                <span>ativa.</span>
              </h2>
            </div>
            <p>
              Cada posição exige presença,
              <br />
              responsabilidade e lealdade.
            </p>
          </div>

          <div className="hierarchy-grid">
            {hierarchy
              .filter((item) => item.tier === 'top')
              .map((item, index) => (
                <article className="hier-card hier-top reveal" key={item.role} style={{ transitionDelay: `${index * 80}ms` }}>
                  <div className="hier-photo">
                    <img
                      src={item.img}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0.12';
                      }}
                    />
                    <div className="hier-glow" />
                  </div>
                  <div className="hier-info">
                    <span className="hier-role">{item.role}</span>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                  <LogoMark small />
                </article>
              ))}
          </div>

          <div className="hierarchy-divs">
            {hierarchy
              .filter((item) => item.tier === 'div')
              .map((item, index) => (
                <article
                  className={`hier-card hier-div hier-${item.theme} reveal`}
                  key={item.role}
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  <div className="hier-photo">
                    <img
                      src={item.img}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0.12';
                      }}
                    />
                  </div>
                  <div className="hier-info">
                    <span className="hier-role">{item.role}</span>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </article>
              ))}
          </div>
        </section>

        <section className="mural-section section-paper" id="mural">
          <div className="section-heading reveal">
            <div>
              <SectionLabel number="06 / 09">REGISTRO</SectionLabel>
              <h2>
                Mural de
                <br />
                <span>Fotos</span>
              </h2>
            </div>
            <p>
              Momentos capturados.
              <br />
              Presença registrada.
            </p>
          </div>
          <div className="mural-gallery">
            {muralPhotos.map((photo, index) => (
              <article className="mural-piece reveal" key={photo.src} style={{ transitionDelay: `${index * 45}ms` }}>
                <div className="mural-frame">
                  <img className="mural-img" src={photo.src} alt={photo.label} loading="lazy" />
                  <div className="mural-corner mural-corner-tl" />
                  <div className="mural-corner mural-corner-br" />
                </div>
                <div className="mural-caption">
                  <span>{photo.label}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="stats section-paper" id="stats">
          <div className="section-heading reveal">
            <div>
              <SectionLabel number="07 / 09">REGISTRO ALLIED</SectionLabel>
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
            {stats.map(({ value, label, note, icon: Icon, featured }, index) => (
              <div
                className={`stat-card reveal ${featured ? 'stat-featured' : ''}`}
                key={label}
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <Icon size={17} />
                <strong>{value}</strong>
                <h3>{label}</h3>
                <p>{note}</p>
                <span className="stat-index">0{index + 1}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rules section-dark" id="rules">
          <div className="rules-intro reveal">
            <SectionLabel number="08 / 09">CÓDIGO DA ALLIED</SectionLabel>
            <h2>
              As regras existem
              <br />
              para preservar
              <br />
              <span>nossa estrutura.</span>
            </h2>
            <p>Um nome forte exige uma conduta à altura. Leia antes de entrar.</p>
          </div>
          <div className="rules-list">
            {rules.map(([title, description], index) => (
              <article className="rule reveal" key={title}>
                <span className="rule-number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <Check size={15} />
              </article>
            ))}
          </div>
        </section>

        <section className="quiz-section section-paper" id="test">
          <div className="quiz-inline reveal">
            <div className="quiz-inline-header">
              <SectionLabel number="09 / 09">TESTE DE RECRUTAMENTO</SectionLabel>
              <h2>
                Descubra sua
                <br />
                <span>divisão.</span>
              </h2>
              <p>
                Quinze perguntas. Quatro caminhos. O resultado indica a divisão mais alinhada ao seu perfil dentro da
                Allied.
              </p>
            </div>

            {result ? (
              <div className="result-inline">
                <div className="result-orbit">
                  <LogoMark />
                  <span>
                    {result.division.includes('CHUVA')
                      ? '01'
                      : result.division.includes('SANGUE')
                        ? '02'
                        : result.division.includes('ABISMO')
                          ? '03'
                          : '04'}
                  </span>
                </div>
                <p className="result-eyebrow">{divisionResults[result.division].eyebrow}</p>
                <h3>
                  {result.name}, <span>{result.division}</span>
                </h3>
                <p className="result-title">{divisionResults[result.division].title}</p>
                <p className="result-description">{divisionResults[result.division].description}</p>
                <div className="score-grid">
                  {attributeKeys.map((key) => (
                    <div className="score-row" key={key}>
                      <span>{attributeLabels[key]}</span>
                      <div>
                        <i style={{ width: `${result.scores[key]}%` }} />
                      </div>
                      <strong>{result.scores[key]}%</strong>
                    </div>
                  ))}
                </div>
                <div className="result-actions">
                  <a className="button button-red" href="https://discord.gg/UFUMMx5PkD" target="_blank" rel="noreferrer">
                    ENTRAR NA ALLIED <ArrowUpRight size={15} />
                  </a>
                  <button className="button button-ghost" onClick={resetQuiz}>
                    REFAZER TESTE
                  </button>
                </div>
              </div>
            ) : (
              <div className="quiz-inline-body">
                {!visitorName && quizStep === 0 && answers.length === 0 ? (
                  <div className="quiz-name-step">
                    <label htmlFor="visitor-name">Seu nome (opcional)</label>
                    <input
                      id="visitor-name"
                      type="text"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      placeholder="RECRUTA"
                      maxLength={24}
                    />
                    <button className="button button-red" onClick={() => setVisitorName((v) => v.trim() || 'RECRUTA')}>
                      COMEÇAR TESTE <ArrowRight size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="quiz-progress">
                      <span>
                        PERGUNTA {String(quizStep + 1).padStart(2, '0')} / {questions.length}
                      </span>
                      <div>
                        <i style={{ width: `${Math.max(7, progress)}%` }} />
                      </div>
                      <span>{progress}%</span>
                    </div>
                    <span className="question-number">{currentQuestion.number}</span>
                    <p className="question-category">{currentQuestion.title}</p>
                    <h3 className="quiz-prompt">{currentQuestion.prompt}</h3>
                    <div className="answers">
                      {currentQuestion.answers.map((answer, index) => (
                        <button
                          className={answers[quizStep] === index ? 'answer selected' : 'answer'}
                          key={answer.label}
                          type="button"
                          onClick={() => selectAnswer(index)}
                        >
                          <span>{String.fromCharCode(65 + index)}</span>
                          <strong>{answer.label}</strong>
                          {answers[quizStep] === index && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                    <div className="quiz-footer">
                      <span>DISCIPLINA · LEALDADE · PRESENÇA</span>
                      <div>
                        {quizStep > 0 && (
                          <button className="back-button" type="button" onClick={() => setQuizStep((step) => step - 1)}>
                            VOLTAR
                          </button>
                        )}
                        <button
                          className="button button-red"
                          type="button"
                          disabled={answers[quizStep] === undefined}
                          onClick={() =>
                            quizStep === questions.length - 1 ? finishQuiz() : setQuizStep((step) => step + 1)
                          }
                        >
                          {quizStep === questions.length - 1 ? 'REVELAR DIVISÃO' : 'PRÓXIMA'} <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="faq section-dark" id="faq">
          <div className="section-heading reveal">
            <div>
              <SectionLabel>FAQ</SectionLabel>
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
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div className={`faq-item ${isOpen ? 'faq-open' : ''}`} key={item.q}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    onClick={() => toggleFaq(index)}
                  >
                    <span>0{index + 1}</span>
                    <strong>{item.q}</strong>
                    <ChevronDown size={17} />
                  </button>
                  <div
                    className="faq-answer"
                    id={`faq-answer-${index}`}
                    role="region"
                    style={{
                      maxHeight: isOpen ? '220px' : '0px',
                      opacity: isOpen ? 1 : 0,
                      paddingBottom: isOpen ? '27px' : '0px',
                    }}
                  >
                    <p>{item.a}</p>
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
            <SectionLabel>THE NEXT CHAPTER</SectionLabel>
            <h2>
              Se você chegou
              <br />
              até aqui, talvez
              <br />
              seja hora de <span>entrar.</span>
            </h2>
            <p>A Allied está esperando por novos membros.</p>
            <a className="button button-red" href="https://discord.gg/UFUMMx5PkD" target="_blank" rel="noreferrer">
              ABRIR MEU TICKET <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <LogoMark small />
          <div>
            <strong>ALLIED</strong>
            <span>ORGANIZAÇÃO • PT-BR</span>
          </div>
        </div>
        <p>Uma organização multi-jogo com estrutura, divisões e hierarquia próprias.</p>
        <div className="footer-links">
          <a href="https://discord.gg/UFUMMx5PkD" target="_blank" rel="noreferrer">
            DISCORD ALLIED
          </a>
        </div>
        <span className="copyright">© ALLIED / 2026</span>
      </footer>

      <button
        className={`music-toggle ${musicOn ? 'music-on' : ''}`}
        onClick={toggleMusic}
        aria-label={musicOn ? 'Desativar música' : 'Ativar música'}
        type="button"
      >
        {musicOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        <span>{musicOn ? 'MÚSICA ON' : 'MÚSICA OFF'}</span>
      </button>
    </div>
  );
}

export default App;