import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Crown,
  Droplets,
  Eclipse,
  Menu,
  MessageCircle,
  Moon,
  Shield,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';

type SectionId =
  | 'home'
  | 'allied'
  | 'hierarchy'
  | 'chuva'
  | 'sangue'
  | 'abismo'
  | 'eclipse'
  | 'test'
  | 'join'
  | 'rules'
  | 'faq';

type DivisionId = 'chuva' | 'sangue' | 'abismo' | 'eclipse';
type DivisionScores = Record<DivisionId, number>;
type Answer = { label: string; weights: Partial<DivisionScores> };
type Question = { id: number; prompt: string; answers: Answer[] };

const FALLING_CHARS = [
  '桜', '月', '風', '雪', '龍', '夜', '光', '空', '夢', '影',
  '炎', '剣', '魂', '絆', '静', '雷', '霧', '玄', '刃', '嵐',
  '桜', '月', '風', '雪',
];

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'home', label: 'INÍCIO' },
  { id: 'allied', label: 'ALLIED' },
  { id: 'hierarchy', label: 'HIERARQUIA' },
  { id: 'chuva', label: 'CHUVA' },
  { id: 'sangue', label: 'SANGUE' },
  { id: 'abismo', label: 'ABISMO' },
  { id: 'eclipse', label: 'ECLIPSE' },
  { id: 'test', label: 'TESTE' },
  { id: 'join', label: 'ENTRAR' },
  { id: 'rules', label: 'CÓDIGO' },
  { id: 'faq', label: 'FAQ' },
];

const questions: Question[] = [
  {
    id: 1,
    prompt: 'Uma operação começa a desmoronar. O plano original falhou. O que você faz primeiro?',
    answers: [
      { label: 'Congelo o cenário, recalculo rotas e só então ajo.', weights: { chuva: 3, abismo: 1 } },
      { label: 'Assumo o risco e forço uma nova frente de impacto.', weights: { sangue: 3, eclipse: 1 } },
      { label: 'Recuo para a sombra, observo falhas e espero o momento certo.', weights: { abismo: 3, chuva: 1 } },
      { label: 'Alterno entre pressão e contenção conforme o ritmo muda.', weights: { eclipse: 3, chuva: 1 } },
    ],
  },
  {
    id: 2,
    prompt: 'Dois membros valiosos entram em conflito aberto. Como você intervém?',
    answers: [
      { label: 'Imponho silêncio imediato e redistribuo funções com frieza.', weights: { chuva: 3, sangue: 1 } },
      { label: 'Deixo a tensão estourar e uso o resultado a favor do grupo.', weights: { sangue: 3 } },
      { label: 'Ouço ambos em separado e decido sem exposição pública.', weights: { abismo: 3, eclipse: 1 } },
      { label: 'Medio o confronto e transformo a divergência em acordo operacional.', weights: { eclipse: 3, chuva: 1 } },
    ],
  },
  {
    id: 3,
    prompt: 'Você recebe informação privilegiada que pode mudar o jogo — mas vazar agora também pode destruir alianças.',
    answers: [
      { label: 'Guardo até confirmar o impacto completo e o timing.', weights: { chuva: 2, abismo: 3 } },
      { label: 'Uso imediatamente para dominar a situação antes de qualquer um.', weights: { sangue: 3 } },
      { label: 'Compartilho só com quem precisa saber, em camadas controladas.', weights: { abismo: 3, eclipse: 1 } },
      { label: 'Avalio o custo e revelo parcialmente para manter equilíbrio.', weights: { eclipse: 3, chuva: 1 } },
    ],
  },
  {
    id: 4,
    prompt: 'Em uma disputa, o adversário provoca você pessoalmente. Qual é sua resposta?',
    answers: [
      { label: 'Ignoro. Provocação é ruído. Continuo o plano.', weights: { chuva: 3 } },
      { label: 'Respondo com força suficiente para encerrar a conversa.', weights: { sangue: 3, eclipse: 1 } },
      { label: 'Anoto o padrão e uso depois, quando for vantajoso.', weights: { abismo: 3 } },
      { label: 'Espelho a intensidade dele só o necessário e devolvo o foco ao objetivo.', weights: { eclipse: 3 } },
    ],
  },
  {
    id: 5,
    prompt: 'Você precisa montar uma equipe para uma missão crítica. O que prioriza?',
    answers: [
      { label: 'Precisão, disciplina e quem executa sem drama.', weights: { chuva: 3, abismo: 1 } },
      { label: 'Quem empurra, pressiona e não recua sob fogo.', weights: { sangue: 3 } },
      { label: 'Quem lê o campo e age com informação incompleta.', weights: { abismo: 3, chuva: 1 } },
      { label: 'Um mix equilibrado: agressão, controle e adaptação.', weights: { eclipse: 3, chuva: 1, sangue: 1 } },
    ],
  },
  {
    id: 6,
    prompt: 'Uma ordem da liderança entra em conflito com o que você considera mais eficiente.',
    answers: [
      { label: 'Executo com rigor e documento o que poderia ser melhor.', weights: { chuva: 3, abismo: 1 } },
      { label: 'Adapto a ordem no limite e entrego resultado por força.', weights: { sangue: 2, eclipse: 2 } },
      { label: 'Questiono em privado, com dados, antes de agir.', weights: { abismo: 2, chuva: 2 } },
      { label: 'Cumpro o essencial e ajusto o método sem quebrar a estrutura.', weights: { eclipse: 3, chuva: 1 } },
    ],
  },
  {
    id: 7,
    prompt: 'O grupo está perdendo moral depois de uma derrota. Qual é o seu papel?',
    answers: [
      { label: 'Reorganizo a rotina e corto o excesso emocional.', weights: { chuva: 3 } },
      { label: 'Acendo o fogo: próxima vitória, sem discurso longo.', weights: { sangue: 3 } },
      { label: 'Observo quem quebrou e reforço a estrutura por dentro.', weights: { abismo: 3 } },
      { label: 'Equilibro contenção e impulso até o ritmo voltar.', weights: { eclipse: 3, sangue: 1 } },
    ],
  },
  {
    id: 8,
    prompt: 'Você está sozinho em uma situação ambígua, sem instrução clara.',
    answers: [
      { label: 'Defino um protocolo mínimo e ajo com consistência.', weights: { chuva: 3, eclipse: 1 } },
      { label: 'Tomo a iniciativa agressiva e crio movimento.', weights: { sangue: 3 } },
      { label: 'Permaneço invisível até entender as variáveis ocultas.', weights: { abismo: 3 } },
      { label: 'Testo duas abordagens em paralelo e escolho a que responde melhor.', weights: { eclipse: 3, chuva: 1 } },
    ],
  },
  {
    id: 9,
    prompt: 'O que mais te incomoda em uma organização?',
    answers: [
      { label: 'Improviso sem método e desperdício de movimento.', weights: { chuva: 3 } },
      { label: 'Passividade e medo de confrontar.', weights: { sangue: 3 } },
      { label: 'Excesso de exposição e falta de controle de informação.', weights: { abismo: 3 } },
      { label: 'Extremismo sem flexibilidade — só um lado do espectro.', weights: { eclipse: 3 } },
    ],
  },
  {
    id: 10,
    prompt: 'No final, o que define sua presença em uma estrutura como a Allied?',
    answers: [
      { label: 'Consistência silenciosa. Resultado sem alarde.', weights: { chuva: 3, abismo: 1 } },
      { label: 'Capacidade de impor ritmo e virar o jogo pela força.', weights: { sangue: 3 } },
      { label: 'Leitura profunda e influência que poucos percebem.', weights: { abismo: 3, chuva: 1 } },
      { label: 'Saber quando ser lâmina e quando ser escudo.', weights: { eclipse: 3, sangue: 1, chuva: 1 } },
    ],
  },
];

const divisionMeta: Record<
  DivisionId,
  {
    name: string;
    full: string;
    code: string;
    tagline: string;
    profile: string;
    traits: string[];
    icon: typeof Droplets;
  }
> = {
  chuva: {
    name: 'Chuva',
    full: 'DIVISÃO DA CHUVA',
    code: '01',
    tagline: 'Silêncio. Precisão. Pressão constante.',
    profile:
      'Você opera com frieza e método. Lê o cenário antes de se mover, corta ruído e transforma caos em sequência. Sua presença não grita — ela cobre o campo até não restar saída.',
    traits: ['Estratégia', 'Paciência', 'Precisão', 'Controle'],
    icon: Droplets,
  },
  sangue: {
    name: 'Sangue',
    full: 'DIVISÃO DO SANGUE',
    code: '02',
    tagline: 'Impacto. Domínio. Sem recuo.',
    profile:
      'Você empurra o confronto. Onde outros hesitam, você acelera. Sua força está na intensidade controlada: pressão que quebra linhas e força o adversário a ceder terreno.',
    traits: ['Agressão', 'Domínio', 'Intensidade', 'Iniciativa'],
    icon: Zap,
  },
  abismo: {
    name: 'Abismo',
    full: 'DIVISÃO DO ABISMO',
    code: '03',
    tagline: 'Profundidade. Controle. O que não se vê.',
    profile:
      'Você age nas camadas que poucos monitoram. Informação, timing e paciência são suas armas. Sua influência chega antes da sua imagem — e permanece depois do barulho.',
    traits: ['Mistério', 'Profundidade', 'Controle', 'Paciência'],
    icon: Moon,
  },
  eclipse: {
    name: 'Eclipse',
    full: 'DIVISÃO DO ECLIPSE',
    code: '04',
    tagline: 'Dualidade. Adaptação. Equilíbrio instável.',
    profile:
      'Você alterna entre pólos sem se perder. Sabe quando pressionar e quando conter, quando aparecer e quando sumir. Sua força é mudar o ritmo do jogo no momento certo.',
    traits: ['Equilíbrio', 'Dualidade', 'Adaptação', 'Versatilidade'],
    icon: Eclipse,
  },
};

const hierarchyNodes = [
  { id: 'leader', role: 'LÍDER', title: 'Comando da Allied', desc: 'Direção absoluta da organização.', img: '/images/leadership/lider-allied.png', ring: 0 },
  { id: 'vice', role: 'VICE-LÍDER', title: 'Coordenação central', desc: 'Braço direito do comando.', img: '/images/leadership/vice-lider-allied.png', ring: 1 },
  { id: 'd1', role: 'CHUVA', title: 'Líder da 1ª Divisão', desc: 'Estratégia e precisão.', img: '/images/leadership/lider-divisao-1.png', ring: 2, div: 'chuva' as DivisionId },
  { id: 'd2', role: 'SANGUE', title: 'Líder da 2ª Divisão', desc: 'Impacto e domínio.', img: '/images/leadership/lider-divisao-2.png', ring: 2, div: 'sangue' as DivisionId },
  { id: 'd3', role: 'ABISMO', title: 'Líder da 3ª Divisão', desc: 'Profundidade e controle.', img: '/images/leadership/lider-divisao-3.png', ring: 2, div: 'abismo' as DivisionId },
  { id: 'd4', role: 'ECLIPSE', title: 'Líder da 4ª Divisão', desc: 'Dualidade e adaptação.', img: '/images/leadership/lider-divisao-4.png', ring: 2, div: 'eclipse' as DivisionId },
];

const muralPhotos = Array.from({ length: 10 }, (_, i) => ({
  src: `/images/mural/foto${i + 1}.png`,
  label: `Lembrança - ${String(i + 1).padStart(2, '0')}`,
}));

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

const faqItems = [
  { q: 'Como entro na Allied?', a: 'Abra um ticket no Discord da Allied e envie qualquer mensagem. A equipe orienta o próximo passo.' },
  { q: 'Preciso jogar um título específico?', a: 'Não. A Allied é multi-jogo. O que importa é presença, disciplina e participação.' },
  { q: 'O que são as divisões?', a: 'Quatro frentes com identidades próprias: Chuva, Sangue, Abismo e Eclipse. O teste indica o alinhamento mais próximo do seu perfil.' },
  { q: 'Preciso estar no Discord?', a: 'Sim. O Discord é o centro de comunicação e organização da Allied.' },
  { q: 'Existem eventos e tryouts?', a: 'Sim. Treinos, tryouts e atividades conforme a organização da equipe.' },
  { q: 'Posso entrar sendo iniciante?', a: 'Sim. Há espaço para diferentes níveis. Evolução depende de constância e presença.' },
  { q: 'Como funciona a hierarquia?', a: 'Líder e Vice-Líder no comando central. Cada divisão possui liderança própria.' },
  { q: 'O teste define minha divisão para sempre?', a: 'O teste indica o alinhamento inicial. A trajetória também depende de presença, desempenho e decisão da liderança.' },
];

function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <div className="logo-mark" style={{ width: size, height: size }} aria-hidden>
      <span /><span /><span /><span />
    </div>
  );
}

function AmbientLayer({ mouse }: { mouse: { x: number; y: number } }) {
  const mx = (mouse.x - 0.5) * 48;
  const my = (mouse.y - 0.5) * 36;
  return (
    <div className="ambient" aria-hidden>
      <div className="ambient-glow" style={{ transform: `translate(${mx * 0.45}px, ${my * 0.45}px)` }} />
      <div className="sakura-field" style={{ transform: `translate(${mx * 0.18}px, ${my * 0.12}px)` }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={`p-${i}`}
            className={`petal p-${(i % 5) + 1}`}
            style={{
              left: `${(i * 5.1 + 1.5) % 100}%`,
              animationDelay: `${(i * 0.82) % 14}s`,
              animationDuration: `${13 + (i % 10)}s`,
              width: `${8 + (i % 7) * 2}px`,
              height: `${8 + (i % 7) * 2}px`,
              opacity: 0.22 + (i % 5) * 0.07,
            }}
          />
        ))}
      </div>
      <div className="glyph-field" style={{ transform: `translate(${mx * -0.22}px, ${my * -0.16}px)` }}>
        {FALLING_CHARS.map((ch, i) => (
          <span
            key={`g-${i}`}
            className={`glyph g-${(i % 3) + 1}`}
            style={{
              left: `${2 + ((i * 4.1) % 96)}%`,
              animationDelay: `${(i * 0.75) % 16}s`,
              animationDuration: `${15 + (i % 9)}s`,
              fontSize: `${12 + (i % 7) * 2.2}px`,
            }}
          >
            {ch}
          </span>
        ))}
      </div>
      <div className="grain-overlay" />
    </div>
  );
}

function DivisionFX({ id, mouse }: { id: DivisionId; mouse: { x: number; y: number } }) {
  if (id === 'chuva') {
    return (
      <div className="dw-fx" aria-hidden>
        {Array.from({ length: 56 }).map((_, i) => (
          <span
            key={i}
            className="drop"
            style={{
              left: `${(i * 1.8) % 100}%`,
              animationDelay: `${(i * 0.07) % 2.2}s`,
              animationDuration: `${0.55 + (i % 6) * 0.14}s`,
              height: `${10 + (i % 9) * 5}px`,
              opacity: 0.25 + (i % 5) * 0.1,
            }}
          />
        ))}
      </div>
    );
  }
  if (id === 'sangue') {
    return (
      <div className="dw-fx" aria-hidden>
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className="drip"
            style={{
              left: `${5 + i * 6}%`,
              animationDelay: `${(i * 0.38) % 4.2}s`,
              height: `${48 + (i % 6) * 28}px`,
              width: `${2 + (i % 3)}px`,
            }}
          />
        ))}
      </div>
    );
  }
  if (id === 'abismo') {
    return (
      <div className="dw-fx" aria-hidden>
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="void-dot"
            style={{
              left: `${(i * 2.5) % 100}%`,
              top: `${(i * 3.9) % 100}%`,
              animationDelay: `${(i * 0.18) % 7}s`,
              width: `${2 + (i % 6)}px`,
              height: `${2 + (i % 6)}px`,
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="dw-fx" aria-hidden>
      <div
        className="eclipse-system"
        style={{ transform: `translate(${(mouse.x - 0.5) * 40}px, ${(mouse.y - 0.5) * 20}px)` }}
      >
        <div className="ecl-body" />
        <div className="ecl-mask" />
        <div className="ecl-ring" />
      </div>
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState<SectionId>('home');
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>(Array(10).fill(undefined));
  const [result, setResult] = useState<{ division: DivisionId; scores: DivisionScores } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicTried = useRef(false);
  const unlockTried = useRef(false);
  const rafRef = useRef(0);
  const targetMouse = useRef({ x: 0.5, y: 0.5 });

  const scrollTo = useCallback((id: SectionId) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetMouse.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    const tick = () => {
      setMouse((prev) => ({
        x: prev.x + (targetMouse.current.x - prev.x) * 0.07,
        y: prev.y + (targetMouse.current.y - prev.y) * 0.07,
      }));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActive(visible[0].target.id as SectionId);
      },
      { threshold: [0.2, 0.35, 0.5], rootMargin: '-20% 0px -35% 0px' }
    );
    nodes.forEach((n) => observer.observe(n));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    return () => {
      observer.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const audio = new Audio('/audio/japanese-ambient.mp3');
    audio.loop = true;
    audio.volume = 0.28;
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
      if (unlockTried.current || !audioRef.current) return;
      unlockTried.current = true;
      try {
        if (audioRef.current.paused) {
          await audioRef.current.play();
          setMusicOn(true);
        }
      } catch { /* */ }
    };
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const toggleMusic = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (musicOn) {
      a.pause();
      setMusicOn(false);
    } else {
      try {
        await a.play();
        setMusicOn(true);
      } catch {
        setMusicOn(false);
      }
    }
  };

  const selectAnswer = (idx: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[quizStep] = idx;
      return next;
    });
  };

  const finishTest = () => {
    const scores: DivisionScores = { chuva: 0, sangue: 0, abismo: 0, eclipse: 0 };
    answers.forEach((ai, qi) => {
      if (ai === undefined) return;
      const w = questions[qi].answers[ai].weights;
      (Object.keys(w) as DivisionId[]).forEach((k) => {
        scores[k] += w[k] ?? 0;
      });
    });
    const ordered = (Object.entries(scores) as [DivisionId, number][]).sort((a, b) => b[1] - a[1]);
    setResult({ division: ordered[0][0], scores });
  };

  const resetTest = () => {
    setQuizStep(0);
    setAnswers(Array(10).fill(undefined));
    setResult(null);
  };

  const progress = useMemo(
    () => Math.round((answers.filter((a) => a !== undefined).length / 10) * 100),
    [answers]
  );

  const themeClass =
    active === 'chuva' || active === 'sangue' || active === 'abismo' || active === 'eclipse'
      ? `theme-${active}`
      : active === 'test' || active === 'join'
        ? 'theme-core theme-ember'
        : 'theme-core';

  const activeIndex = SECTIONS.findIndex((s) => s.id === active);

  return (
    <div className={`allied-root continuous ${themeClass} ${musicOn ? 'music-live' : ''}`}>
      <AmbientLayer mouse={mouse} />

      <header className="topbar">
        <button type="button" className="brand" onClick={() => scrollTo('home')}>
          <LogoMark size={30} />
          <span>
            ALLIED<em>ORGANIZAÇÃO</em>
          </span>
        </button>
        <button type="button" className="burger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <nav className={menuOpen ? 'nav open' : 'nav'}>
          {SECTIONS.filter((s) => !['join', 'rules'].includes(s.id)).map((item) => (
            <button
              key={item.id}
              type="button"
              className={active === item.id ? 'nav-link active' : 'nav-link'}
              onClick={() => scrollTo(item.id)}
            >
              {item.label}
            </button>
          ))}
          <a className="nav-cta" href="https://discord.gg/UFUMMx5PkD" target="_blank" rel="noreferrer">
            ENTRAR <ArrowUpRight size={12} />
          </a>
        </nav>
      </header>

      <aside className="journey-rail" aria-label="Progresso da jornada">
        <div className="rail-track">
          <div
            className="rail-fill"
            style={{ height: `${(activeIndex / Math.max(SECTIONS.length - 1, 1)) * 100}%` }}
          />
        </div>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`rail-dot ${active === s.id ? 'active' : ''} ${s.id}`}
            title={s.label}
            onClick={() => scrollTo(s.id)}
          >
            <span>{s.label}</span>
          </button>
        ))}
      </aside>

      <main className="journey">
        {/* HOME */}
        <section className="region home-world" id="home">
          <div
            className="home-orb"
            style={{ transform: `translate(${(mouse.x - 0.5) * -36}px, ${(mouse.y - 0.5) * -24}px)` }}
          />
          <div className="home-hero reveal">
            <p className="kicker">ORGANIZAÇÃO · MULTI-JOGO · PT-BR</p>
            <h1>
              <span className="line">ALLIED</span>
              <span className="line accent">NÃO É UM LUGAR.</span>
              <span className="line">É UMA ESTRUTURA.</span>
            </h1>
            <p className="lede">
              Quatro divisões. Um comando. Competição, eventos, hierarquia e presença — em qualquer frente.
              Role para atravessar o território da Allied.
            </p>
            <div className="home-actions">
              <button type="button" className="btn primary" onClick={() => scrollTo('allied')}>
                COMEÇAR A JORNADA <ArrowRight size={16} />
              </button>
              <button type="button" className="btn ghost" onClick={() => scrollTo('test')}>
                IR AO TESTE
              </button>
            </div>
          </div>
          <div className="scroll-hint">
            <span>DESCER</span>
            <i />
          </div>
        </section>

        {/* ALLIED INTRO */}
        <section className="region allied-world" id="allied">
          <div className="region-inner reveal">
            <p className="kicker">O TERRITÓRIO</p>
            <h2>
              Um universo.
              <span> Quatro regiões.</span>
            </h2>
            <p className="lede">
              A Allied não se resume a um único jogo ou estilo. É uma organização com estrutura, código e frentes
              distintas — Chuva, Sangue, Abismo e Eclipse — unidas pela mesma assinatura.
            </p>
            <div className="home-grid">
              {(Object.keys(divisionMeta) as DivisionId[]).map((id) => {
                const meta = divisionMeta[id];
                const Icon = meta.icon;
                return (
                  <button key={id} type="button" className={`home-div card-${id}`} onClick={() => scrollTo(id)}>
                    <span className="hd-code">
                      <Icon size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      {meta.code}
                    </span>
                    <strong>{meta.full}</strong>
                    <em>{meta.tagline}</em>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* HIERARCHY */}
        <section className="region hierarchy-world" id="hierarchy">
          <div className="hw-head reveal">
            <p className="kicker">ESTRUTURA DE COMANDO</p>
            <h2>
              Hierarquia
              <span> orbital</span>
            </h2>
            <p className="lede">Comando no centro. Divisões em órbita.</p>
          </div>
          <div className="orbit reveal">
            <div className="orbit-ring r1" />
            <div className="orbit-ring r2" />
            {hierarchyNodes.map((node, i) => {
              const angle = node.ring === 0 ? 0 : node.ring === 1 ? -90 : (i - 2) * 90 - 45;
              const radius = node.ring === 0 ? 0 : node.ring === 1 ? 150 : 280;
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;
              return (
                <article
                  key={node.id}
                  className={`orbit-node ring-${node.ring} ${node.div ? `node-${node.div}` : ''}`}
                  style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                >
                  <div className="on-photo">
                    <img
                      src={node.img}
                      alt={node.title}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0.12';
                      }}
                    />
                  </div>
                  <span className="on-role">{node.role}</span>
                  <strong>{node.title}</strong>
                </article>
              );
            })}
          </div>
          <div className="hw-mobile">
            {hierarchyNodes.map((node) => (
              <article key={node.id} className={`m-node ${node.div ? `node-${node.div}` : ''}`}>
                <div className="on-photo">
                  <img
                    src={node.img}
                    alt={node.title}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '0.12';
                    }}
                  />
                </div>
                <div>
                  <span className="on-role">{node.role}</span>
                  <strong>{node.title}</strong>
                  <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 12 }}>{node.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* DIVISIONS + TRANSITIONS */}
        {(Object.keys(divisionMeta) as DivisionId[]).map((id, index) => {
          const meta = divisionMeta[id];
          const Icon = meta.icon;
          const nextId = (['sangue', 'abismo', 'eclipse', 'test'] as const)[index];
          return (
            <div key={id} className="division-block">
              <section className={`region division-world dw-${id}`} id={id}>
                <DivisionFX id={id} mouse={mouse} />
                <div className="dw-content reveal">
                  <p className="dw-code">
                    <Icon size={15} style={{ marginRight: 10, verticalAlign: 'middle' }} />
                    {meta.code}
                  </p>
                  <h2>{meta.full}</h2>
                  <p className="dw-tag">{meta.tagline}</p>
                  <p className="dw-body">{meta.profile}</p>
                  <div className="trait-row">
                    {meta.traits.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </section>
              <div className={`bridge bridge-${id}-to-${nextId}`} aria-hidden>
                <div className="bridge-particles" />
                <span className="bridge-label">
                  {index < 3 ? 'A REGIÃO SE TRANSFORMA' : 'O TERRITÓRIO ABRE O TESTE'}
                </span>
              </div>
            </div>
          );
        })}

        {/* TEST */}
        <section className="region test-world" id="test">
          <div className="tw-head reveal">
            <p className="kicker">SISTEMA DE CLASSIFICAÇÃO</p>
            <h2>
              Teste de
              <span> alinhamento</span>
            </h2>
            <p className="lede">Dez decisões. Pesos internos. Uma divisão.</p>
          </div>

          {result ? (
            <div className={`result-panel rp-${result.division} reveal`}>
              <p className="rp-label">VOCÊ FOI CLASSIFICADO</p>
              <h3>{divisionMeta[result.division].full}</h3>
              <p className="rp-tag">{divisionMeta[result.division].tagline}</p>
              <p className="rp-body">{divisionMeta[result.division].profile}</p>
              <div className="rp-bars">
                {(Object.keys(result.scores) as DivisionId[]).map((k) => {
                  const max = Math.max(...Object.values(result.scores), 1);
                  const pct = Math.round((result.scores[k] / max) * 100);
                  return (
                    <div key={k} className="rp-bar">
                      <span>{divisionMeta[k].name}</span>
                      <div>
                        <i style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="home-actions">
                <button type="button" className="btn primary" onClick={() => scrollTo(result.division)}>
                  VER A REGIÃO
                </button>
                <button type="button" className="btn ghost" onClick={resetTest}>
                  REFAZER
                </button>
                <button type="button" className="btn primary" onClick={() => scrollTo('join')}>
                  SEGUIR PARA O INGRESSO
                </button>
              </div>
            </div>
          ) : (
            <div className="quiz-panel reveal">
              <div className="qp-progress">
                <span>
                  {String(quizStep + 1).padStart(2, '0')} / 10
                </span>
                <div>
                  <i style={{ width: `${Math.max(8, progress)}%` }} />
                </div>
                <span>{progress}%</span>
              </div>
              <h3 className="quiz-prompt">{questions[quizStep].prompt}</h3>
              <div className="qp-answers">
                {questions[quizStep].answers.map((ans, i) => (
                  <button
                    key={ans.label}
                    type="button"
                    className={answers[quizStep] === i ? 'selected' : ''}
                    onClick={() => selectAnswer(i)}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    <strong>{ans.label}</strong>
                    {answers[quizStep] === i && <Check size={16} />}
                  </button>
                ))}
              </div>
              <div className="qp-nav">
                {quizStep > 0 && (
                  <button type="button" className="btn ghost" onClick={() => setQuizStep((s) => s - 1)}>
                    VOLTAR
                  </button>
                )}
                <button
                  type="button"
                  className="btn primary"
                  disabled={answers[quizStep] === undefined}
                  onClick={() => (quizStep === 9 ? finishTest() : setQuizStep((s) => s + 1))}
                >
                  {quizStep === 9 ? 'REVELAR DIVISÃO' : 'PRÓXIMA'} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* JOIN */}
        <section className="region join-world" id="join">
          <div className="join-inner reveal">
            <LogoMark size={72} />
            <p className="kicker">THE NEXT CHAPTER</p>
            <h2>
              Se você chegou até aqui,
              <span> talvez seja hora de entrar.</span>
            </h2>
            <p className="lede">A Allied está esperando por novos membros.</p>
            <div className="home-actions">
              <a className="btn primary" href="https://discord.gg/UFUMMx5PkD" target="_blank" rel="noreferrer">
                ABRIR MEU TICKET <ArrowUpRight size={16} />
              </a>
              <button type="button" className="btn ghost" onClick={() => scrollTo('rules')}>
                LER O CÓDIGO
              </button>
            </div>
          </div>
        </section>

        {/* MURAL inline light */}
        <section className="region mural-world" id="mural-inline">
          <div className="hw-head reveal">
            <p className="kicker">REGISTRO</p>
            <h2>
              Mural de
              <span> presença</span>
            </h2>
          </div>
          <div className="mural-grid">
            {muralPhotos.map((p) => (
              <figure key={p.src} className="mural-item reveal">
                <img src={p.src} alt={p.label} loading="lazy" />
                <figcaption>{p.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* RULES */}
        <section className="region rules-world" id="rules">
          <div className="hw-head reveal">
            <p className="kicker">CÓDIGO</p>
            <h2>
              Regras da
              <span> estrutura</span>
            </h2>
          </div>
          <div className="rules-list">
            {rules.map(([title, description], i) => (
              <article key={title} className="reveal">
                <span>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="region faq-world" id="faq">
          <div className="hw-head reveal">
            <p className="kicker">FAQ</p>
            <h2>
              Antes de
              <span> entrar</span>
            </h2>
          </div>
          <div className="faq-list">
            {faqItems.map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={item.q} className={open ? 'faq-item open' : 'faq-item'}>
                  <button type="button" onClick={() => setOpenFaq(open ? null : i)}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    <strong>{item.q}</strong>
                    <ChevronDown size={16} />
                  </button>
                  <div className="faq-a" style={{ maxHeight: open ? 220 : 0, opacity: open ? 1 : 0 }}>
                    <p>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="foot">
        <LogoMark size={22} />
        <span>ALLIED · ORGANIZAÇÃO · PT-BR</span>
        <Shield size={12} style={{ opacity: 0.4 }} />
        <Crown size={12} style={{ opacity: 0.35 }} />
        <a href="https://discord.gg/UFUMMx5PkD" target="_blank" rel="noreferrer">
          <MessageCircle size={12} /> Discord
        </a>
      </footer>

      <button
        type="button"
        className={`music-btn ${musicOn ? 'on' : ''}`}
        onClick={toggleMusic}
        aria-label={musicOn ? 'Desativar música' : 'Ativar música'}
      >
        {musicOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        <span>{musicOn ? 'ON' : 'OFF'}</span>
      </button>
    </div>
  );
}

export default App;