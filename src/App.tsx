import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Menu,
  MessageCircle,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

/* =========================================================
   ALLIED — EXPERIÊNCIA CINEMATOGRÁFICA
   Arquitetura: jornada contínua em 6 atos
   Performance: mouse via CSS vars + rAF (sem re-render)
   ========================================================= */

type SectionId =
  | 'home'
  | 'allied'
  | 'mural'
  | 'hierarchy'
  | 'chuva'
  | 'sangue'
  | 'abismo'
  | 'eclipse'
  | 'test'
  | 'signal'
  | 'archives'
  | 'join'
  | 'rules'
  | 'faq';

type DivisionId = 'chuva' | 'sangue' | 'abismo' | 'eclipse';
type DivisionScores = Record<DivisionId, number>;
type Answer = { label: string; weights: Partial<DivisionScores> };
type Question = { id: number; prompt: string; answers: Answer[] };

type PassState = {
  chuva: boolean;
  sangue: boolean;
  abismo: boolean;
  eclipse: boolean;
  test: boolean;
  archives: boolean;
};

const PASS_KEY = 'allied-pass-v2';
const ARCHIVE_KEY = 'allied-archives-v1';

const FALLING_CHARS = [
  '桜', '月', '風', '雪', '龍', '夜', '光', '空', '夢', '影',
  '炎', '剣', '魂', '絆', '静', '雷', '霧', '玄', '刃', '嵐',
];

/** Ordem narrativa da jornada (6 atos) */
const JOURNEY: SectionId[] = [
  'home',
  'allied',
  'mural',
  'hierarchy',
  'chuva',
  'sangue',
  'abismo',
  'eclipse',
  'test',
  'signal',
  'archives',
  'join',
  'rules',
  'faq',
];

/** Menu superior — grandes atos (não cada micro-seção) */
const ACT_NAV: { id: SectionId; label: string }[] = [
  { id: 'home', label: 'IDENTIDADE' },
  { id: 'mural', label: 'ESTRUTURA' },
  { id: 'chuva', label: 'DIVISÕES' },
  { id: 'test', label: 'TESTE' },
  { id: 'signal', label: 'REGISTROS' },
  { id: 'join', label: 'ENTRAR' },
];

/** Rail interna — sistema da organização */
const RAIL_NODES: { id: SectionId; label: string; sigil?: DivisionId }[] = [
  { id: 'home', label: 'NÚCLEO' },
  { id: 'mural', label: 'PRESENÇA' },
  { id: 'hierarchy', label: 'COMANDO' },
  { id: 'chuva', label: 'CHUVA', sigil: 'chuva' },
  { id: 'sangue', label: 'SANGUE', sigil: 'sangue' },
  { id: 'abismo', label: 'ABISMO', sigil: 'abismo' },
  { id: 'eclipse', label: 'ECLIPSE', sigil: 'eclipse' },
  { id: 'test', label: 'CLASSIFICAÇÃO' },
  { id: 'archives', label: 'ARQUIVOS' },
  { id: 'join', label: 'INGRESSO' },
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

/**
 * Desempate determinístico (não depende da ordem do objeto JS).
 * Ordem de prioridade em empate de score:
 * 1) maior peso total
 * 2) desempate por “afinidade de resposta dominante” (maior peso único em uma questão)
 * 3) ordem canônica fixa: chuva → sangue → abismo → eclipse
 */
const TIE_ORDER: DivisionId[] = ['chuva', 'sangue', 'abismo', 'eclipse'];

function resolveDivision(
  scores: DivisionScores,
  answers: (number | undefined)[]
): DivisionId {
  const max = Math.max(...TIE_ORDER.map((k) => scores[k]));
  const tied = TIE_ORDER.filter((k) => scores[k] === max);
  if (tied.length === 1) return tied[0];

  const peak: DivisionScores = { chuva: 0, sangue: 0, abismo: 0, eclipse: 0 };
  answers.forEach((ai, qi) => {
    if (ai === undefined) return;
    const w = questions[qi].answers[ai].weights;
    (Object.keys(w) as DivisionId[]).forEach((k) => {
      const v = w[k] ?? 0;
      if (v > peak[k]) peak[k] = v;
    });
  });
  const maxPeak = Math.max(...tied.map((k) => peak[k]));
  const byPeak = tied.filter((k) => peak[k] === maxPeak);
  if (byPeak.length === 1) return byPeak[0];

  return TIE_ORDER.find((k) => byPeak.includes(k)) ?? byPeak[0];
}

const divisionMeta: Record<
  DivisionId,
  { name: string; full: string; code: string; tagline: string; profile: string; traits: string[] }
> = {
  chuva: {
    name: 'Chuva',
    full: 'DIVISÃO DA CHUVA',
    code: '01',
    tagline: 'Silêncio. Precisão. Pressão constante.',
    profile:
      'Você opera com frieza e método. Lê o cenário antes de se mover, corta ruído e transforma caos em sequência. Sua presença não grita — ela cobre o campo até não restar saída.',
    traits: ['Estratégia', 'Paciência', 'Precisão', 'Controle'],
  },
  sangue: {
    name: 'Sangue',
    full: 'DIVISÃO DO SANGUE',
    code: '02',
    tagline: 'Impacto. Domínio. Sem recuo.',
    profile:
      'Você empurra o confronto. Onde outros hesitam, você acelera. Sua força está na intensidade controlada: pressão que quebra linhas e força o adversário a ceder terreno.',
    traits: ['Agressão', 'Domínio', 'Intensidade', 'Iniciativa'],
  },
  abismo: {
    name: 'Abismo',
    full: 'DIVISÃO DO ABISMO',
    code: '03',
    tagline: 'Profundidade. Controle. O que não se vê.',
    profile:
      'Você age nas camadas que poucos monitoram. Informação, timing e paciência são suas armas. Sua influência chega antes da sua imagem — e permanece depois do barulho.',
    traits: ['Mistério', 'Profundidade', 'Controle', 'Paciência'],
  },
  eclipse: {
    name: 'Eclipse',
    full: 'DIVISÃO DO ECLIPSE',
    code: '04',
    tagline: 'Dualidade. Adaptação. Equilíbrio instável.',
    profile:
      'Você alterna entre pólos sem se perder. Sabe quando pressionar e quando conter, quando aparecer e quando sumir. Sua força é mudar o ritmo do jogo no momento certo.',
    traits: ['Equilíbrio', 'Dualidade', 'Adaptação', 'Versatilidade'],
  },
};

const hierarchyNodes = [
  {
    id: 'leader',
    role: 'LÍDER',
    title: 'Comando da Allied',
    desc: 'Direção absoluta da organização.',
    img: '/images/leadership/lider-allied.png',
    ring: 0,
  },
  {
    id: 'vice',
    role: 'VICE-LÍDER',
    title: 'Coordenação central',
    desc: 'Braço direito do comando.',
    img: '/images/leadership/vice-lider-allied.png',
    ring: 1,
  },
  {
    id: 'd1',
    role: 'CHUVA',
    title: 'Líder da 1ª Divisão',
    desc: 'Estratégia e precisão.',
    img: '/images/leadership/lider-divisao-1.png',
    ring: 2,
    div: 'chuva' as DivisionId,
  },
  {
    id: 'd2',
    role: 'SANGUE',
    title: 'Líder da 2ª Divisão',
    desc: 'Impacto e domínio.',
    img: '/images/leadership/lider-divisao-2.png',
    ring: 2,
    div: 'sangue' as DivisionId,
  },
  {
    id: 'd3',
    role: 'ABISMO',
    title: 'Líder da 3ª Divisão',
    desc: 'Profundidade e controle.',
    img: '/images/leadership/lider-divisao-3.png',
    ring: 2,
    div: 'abismo' as DivisionId,
  },
  {
    id: 'd4',
    role: 'ECLIPSE',
    title: 'Líder da 4ª Divisão',
    desc: 'Dualidade e adaptação.',
    img: '/images/leadership/lider-divisao-4.png',
    ring: 2,
    div: 'eclipse' as DivisionId,
  },
];

const muralPhotos = [
  { src: '/images/mural/foto1.png', label: 'Lembrança - 01', size: 'hero' as const },
  { src: '/images/mural/foto2.png', label: 'Lembrança - 02', size: 'tall' as const },
  { src: '/images/mural/foto3.png', label: 'Lembrança - 03', size: 'wide' as const },
  { src: '/images/mural/foto4.png', label: 'Lembrança - 04', size: 'sq' as const },
  { src: '/images/mural/foto5.png', label: 'Lembrança - 05', size: 'sq' as const },
  { src: '/images/mural/foto6.png', label: 'Lembrança - 06', size: 'wide' as const },
];

const rules = [
  ['RESPEITO ACIMA DE TUDO', 'Sem ofensas, discriminação ou ataques pessoais entre membros.'],
  ['HIERARQUIA DEVE SER RESPEITADA', 'Ordens da staff e liderança não são opcionais.'],
  ['PROIBIDO FLOOD E SPAM', 'Nada de poluir chats com mensagens inúteis ou repetidas.'],
  ['USO CORRETO DOS CANAIS', 'Cada canal tem sua finalidade. Use direito.'],
  ['SEM DIVULGAÇÃO NÃO AUTORIZADA', 'Proibido divulgar outros servidores, links ou conteúdos sem permissão.'],
  ['COMPROMETIMENTO COM A ORGANIZAÇÃO', 'Inatividade sem aviso pode resultar em punição ou remoção.'],
  ['PARTICIPAÇÃO EM EVENTOS', 'Quando convocado, o membro deve participar.'],
  ['PROIBIDO COMPORTAMENTO TÓXICO', 'Confusões paralelas, desrespeito ou desmotivação não serão tolerados.'],
  ['USO ADEQUADO DE VOZ', 'Evite gritaria, interrupções e bagunça durante calls.'],
  ['DECISÕES DA STAFF SÃO FINAIS', 'Discussões podem acontecer. Desobediência, não.'],
];

const faqItems = [
  {
    q: 'Como entro na Allied?',
    a: 'Abra um ticket no Discord da Allied e envie qualquer mensagem. A equipe orienta o próximo passo.',
  },
  {
    q: 'Preciso jogar um título específico?',
    a: 'Não. A Allied é multi-jogo. O que importa é presença, disciplina e participação.',
  },
  {
    q: 'O que são as divisões?',
    a: 'Quatro frentes com identidades próprias: Chuva, Sangue, Abismo e Eclipse. O teste indica o alinhamento mais próximo do seu perfil.',
  },
  {
    q: 'Preciso estar no Discord?',
    a: 'Sim. O Discord é o centro de comunicação e organização.',
  },
  {
    q: 'Existem eventos?',
    a: 'Sim. Treinos, tryouts e atividades conforme a organização da equipe.',
  },
  {
    q: 'Posso entrar sendo iniciante?',
    a: 'Sim. Evolução depende de constância e presença.',
  },
  {
    q: 'Como funciona a hierarquia?',
    a: 'Líder e Vice-Líder no comando. Cada divisão possui liderança própria.',
  },
  {
    q: 'O teste define minha divisão para sempre?',
    a: 'Indica o alinhamento inicial. A trajetória também depende de presença e decisão da liderança.',
  },
];

/** Transmissões narrativas — índice do dia (sem backend) */
const transmissions = [
  { code: 'TX-07', status: 'ESTÁVEL', title: 'ESTRUTURA ATIVA', body: 'A organização permanece em operação. Presença continua sendo o critério.' },
  { code: 'TX-12', status: 'ATIVA', title: 'SINAL ESTÁVEL', body: 'Canais oficiais operando. Abra ticket apenas quando estiver pronto para o processo.' },
  { code: 'TX-03', status: 'ABERTA', title: 'TERRITÓRIO ABERTO', body: 'As quatro regiões permanecem acessíveis. Explore antes de solicitar ingresso.' },
  { code: 'TX-19', status: 'PROTOCOLO', title: 'ENTRADA OFICIAL', body: 'Discord → ticket → orientação. Não há atalho fora da estrutura.' },
  { code: 'TX-21', status: 'LATENTE', title: 'CLASSIFICAÇÃO', body: 'O sistema de alinhamento permanece disponível. Dez decisões. Uma divisão.' },
  { code: 'TX-05', status: 'MONITOR', title: 'PRESENÇA', body: 'O Allied Pass registra passagem. O que você explora deixa marca.' },
];

function dayTxIndex(): number {
  const d = new Date();
  const seed = d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate();
  return seed % transmissions.length;
}

type ArchiveFrag = {
  id: string;
  label: string;
  text: string;
  unlock: keyof PassState | 'all-divisions';
};

const archiveFragments: ArchiveFrag[] = [
  { id: 'A-01', label: 'FRAGMENTO', text: 'Quem grita primeiro raramente decide o fim.', unlock: 'chuva' },
  { id: 'A-02', label: 'REGISTRO', text: 'A estrutura não pede volume. Pede constância.', unlock: 'sangue' },
  { id: 'A-03', label: 'NOTA', text: 'Quatro regiões. Uma assinatura. Nenhuma é decoração.', unlock: 'abismo' },
  { id: 'A-04', label: 'SINAL', text: 'Presença registrada não se anuncia. Se acumula.', unlock: 'eclipse' },
  { id: 'A-05', label: 'OBSERVAÇÃO', text: 'Entrar é o começo. Permanecer é o teste real.', unlock: 'test' },
  { id: 'A-06', label: 'MARCA', text: 'Os sigilos não são enfeite. São mapa.', unlock: 'all-divisions' },
];

/* ——— SIGILOS ——— */
function SigilChuva({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={`sigil sigil-chuva ${className}`} width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <path d="M32 6 L32 52" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
      <path d="M22 14 L22 44" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
      <path d="M42 12 L42 40" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
      <path d="M14 20 L14 36" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />
      <path d="M50 18 L50 34" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />
      <path d="M32 48 C28 54 24 56 24 58 C24 60.2 27.6 62 32 62 C36.4 62 40 60.2 40 58 C40 56 36 54 32 48Z" fill="currentColor" opacity="0.85" />
      <circle cx="22" cy="46" r="2.2" fill="currentColor" opacity="0.45" />
      <circle cx="42" cy="42" r="1.8" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function SigilSangue({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={`sigil sigil-sangue ${className}`} width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <path d="M32 4 C32 4 18 22 18 36 C18 46 24 54 32 54 C40 54 46 46 46 36 C46 22 32 4 32 4Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.12" />
      <path d="M20 28 L44 40" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <path d="M24 22 L40 46" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
      <path d="M32 54 L32 60" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M26 58 H38" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function SigilAbismo({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={`sigil sigil-abismo ${className}`} width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
      <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="1.2" opacity="0.75" />
      <circle cx="32" cy="32" r="3.5" fill="currentColor" />
      <path d="M32 6 C40 16 44 24 44 32 C44 40 40 48 32 58" stroke="currentColor" strokeWidth="0.9" opacity="0.45" fill="none" />
      <path d="M32 8 C24 18 20 26 20 32 C20 38 24 46 32 56" stroke="currentColor" strokeWidth="0.7" opacity="0.3" fill="none" />
    </svg>
  );
}

function SigilEclipse({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={`sigil sigil-eclipse ${className}`} width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="32" cy="32" r="22" fill="currentColor" fillOpacity="0.08" />
      <path d="M32 10 A22 22 0 0 1 32 54 A16 16 0 0 0 32 10Z" fill="currentColor" opacity="0.85" />
      <circle cx="40" cy="24" r="2" fill="currentColor" opacity="0.35" />
      <circle cx="44" cy="36" r="1.4" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

function SigilFor({ id, size = 48, className = '' }: { id: DivisionId; size?: number; className?: string }) {
  if (id === 'chuva') return <SigilChuva size={size} className={className} />;
  if (id === 'sangue') return <SigilSangue size={size} className={className} />;
  if (id === 'abismo') return <SigilAbismo size={size} className={className} />;
  return <SigilEclipse size={size} className={className} />;
}

/** Núcleo da Allied — união dos quatro eixos */
function AlliedMark({ size = 72, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={`allied-mark ${className}`} width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden>
      <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="1" opacity="0.25" />
      <circle cx="48" cy="48" r="30" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      <path d="M48 18 L56 48 L48 78 L40 48 Z" fill="currentColor" opacity="0.9" />
      <path d="M18 48 L48 40 L78 48 L48 56 Z" fill="currentColor" opacity="0.55" />
      <circle cx="48" cy="48" r="5" fill="currentColor" />
      <circle cx="48" cy="14" r="2.5" fill="currentColor" opacity="0.7" className="mark-orbit o1" />
      <circle cx="82" cy="48" r="2.5" fill="currentColor" opacity="0.55" className="mark-orbit o2" />
      <circle cx="48" cy="82" r="2.5" fill="currentColor" opacity="0.45" className="mark-orbit o3" />
      <circle cx="14" cy="48" r="2.5" fill="currentColor" opacity="0.35" className="mark-orbit o4" />
    </svg>
  );
}

function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <div className="logo-mark" style={{ width: size, height: size }} aria-hidden>
      <span /><span /><span /><span />
    </div>
  );
}

/** Ambiente global — intensidade via data-attr no root (CSS) */
function AmbientLayer() {
  return (
    <div className="ambient" aria-hidden>
      {/* CAMADA 1–3: base + atmosfera + arquitetura */}
      <div className="world-base" />
      <div className="world-atmosphere" />
      <div className="world-arch">
        <span className="arch-arc a1" />
        <span className="arch-arc a2" />
        <span className="arch-line l1" />
        <span className="arch-line l2" />
        <span className="arch-line l3" />
        <span className="arch-plane p1" />
        <span className="arch-plane p2" />
        <span className="arch-ring r-far" />
        <span className="arch-sigil-ghost sg1" />
        <span className="arch-sigil-ghost sg2" />
      </div>

      {/* CAMADA 4: objetos 3D simulados em deriva */}
      <div className="drift-field">
        <div className="drift-obj do-plate do-near path-h1" />
        <div className="drift-obj do-prism do-mid path-d1" />
        <div className="drift-obj do-ring do-far path-h2" />
        <div className="drift-obj do-shard do-near path-d2" />
        <div className="drift-obj do-cube do-mid path-h3" />
        <div className="drift-obj do-plate do-far path-d3" />
        <div className="drift-obj do-glyph-slab do-mid path-h4" />
      </div>

      <div className="ambient-glow" />
      <div className="sakura-field">
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className={`petal p-${(i % 5) + 1}`}
            style={{
              left: `${(i * 6.1 + 2) % 100}%`,
              animationDelay: `${(i * 0.9) % 14}s`,
              animationDuration: `${14 + (i % 8)}s`,
              width: `${8 + (i % 5) * 2}px`,
              height: `${8 + (i % 5) * 2}px`,
              ['--petal-i' as string]: String(i),
            } as CSSProperties}
          />
        ))}
      </div>
      <div className="glyph-field">
        {FALLING_CHARS.map((ch, i) => (
          <span
            key={i}
            className={`glyph g-${(i % 3) + 1}`}
            style={{
              left: `${3 + ((i * 5.2) % 94)}%`,
              animationDelay: `${(i * 0.85) % 15}s`,
              animationDuration: `${16 + (i % 7)}s`,
              fontSize: `${12 + (i % 5) * 2}px`,
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

/** FX de divisão — só anima quando .fx-live (IntersectionObserver) */
function DivisionFX({ id }: { id: DivisionId }) {
  if (id === 'chuva') {
    return (
      <div className="dw-fx" data-fx="chuva" aria-hidden>
        {Array.from({ length: 36 }).map((_, i) => (
          <span
            key={i}
            className="drop"
            style={{
              left: `${(i * 2.7) % 100}%`,
              animationDelay: `${(i * 0.09) % 2}s`,
              animationDuration: `${0.65 + (i % 5) * 0.12}s`,
              height: `${12 + (i % 7) * 4}px`,
              opacity: 0.28 + (i % 4) * 0.1,
            }}
          />
        ))}
      </div>
    );
  }
  if (id === 'sangue') {
    return (
      <div className="dw-fx" data-fx="sangue" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="drip"
            style={{
              left: `${8 + i * 7}%`,
              animationDelay: `${(i * 0.42) % 4}s`,
              height: `${44 + (i % 5) * 22}px`,
              width: `${2 + (i % 3)}px`,
            }}
          />
        ))}
      </div>
    );
  }
  if (id === 'abismo') {
    return (
      <div className="dw-fx" data-fx="abismo" aria-hidden>
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="void-dot"
            style={{
              left: `${(i * 3.4) % 100}%`,
              top: `${(i * 4.6) % 100}%`,
              animationDelay: `${(i * 0.22) % 6}s`,
              width: `${2 + (i % 5)}px`,
              height: `${2 + (i % 5)}px`,
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="dw-fx" data-fx="eclipse" aria-hidden>
      <div className="eclipse-system">
        <div className="ecl-body" />
        <div className="ecl-mask" />
        <div className="ecl-ring" />
      </div>
    </div>
  );
}

function loadPass(): PassState {
  const emptyPass: PassState = { chuva: false, sangue: false, abismo: false, eclipse: false, test: false, archives: false };

  try {
    const raw = localStorage.getItem(PASS_KEY);
    const archiveRaw = localStorage.getItem(ARCHIVE_KEY);
    const archiveUnlocked = archiveRaw ? !!JSON.parse(archiveRaw) : false;

    if (raw) {
      return {
        ...emptyPass,
        ...JSON.parse(raw),
        archives: archiveUnlocked || !!JSON.parse(raw).archives,
      };
    }

    return {
      ...emptyPass,
      archives: archiveUnlocked,
    };
  } catch { /* */ }

  return { ...emptyPass };
}

function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicTried = useRef(false);
  const unlockTried = useRef(false);
  const rafRef = useRef(0);
  const targetMouse = useRef({ x: 0.5, y: 0.5 });
  const smoothMouse = useRef({ x: 0.5, y: 0.5 });

  const [menuOpen, setMenuOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [active, setActive] = useState<SectionId>('home');
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>(Array(10).fill(undefined));
  const [result, setResult] = useState<{ division: DivisionId; scores: DivisionScores } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [pass, setPass] = useState<PassState>(() => loadPass());
  const [txIndex, setTxIndex] = useState(() => dayTxIndex());
  const [archiveOpen, setArchiveOpen] = useState<number | null>(null);
  const [openingDone, setOpeningDone] = useState(false);

  const stampPass = useCallback((key: keyof PassState) => {
    setPass((prev) => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: true };
      try {
        localStorage.setItem(PASS_KEY, JSON.stringify(next));
        if (key === 'archives') {
          localStorage.setItem(ARCHIVE_KEY, JSON.stringify(true));
        }
      } catch { /* */ }
      return next;
    });
  }, []);

  const scrollTo = useCallback((id: SectionId) => {
    setMenuOpen(false);
    setPassOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /* Mouse → CSS variables (sem setState) */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onMove = (e: MouseEvent) => {
      targetMouse.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const tick = () => {
      const s = smoothMouse.current;
      const t = targetMouse.current;
      s.x += (t.x - s.x) * 0.08;
      s.y += (t.y - s.y) * 0.08;
      root.style.setProperty('--mx', s.x.toFixed(4));
      root.style.setProperty('--my', s.y.toFixed(4));
      root.style.setProperty('--mx-px', `${((s.x - 0.5) * 48).toFixed(2)}px`);
      root.style.setProperty('--my-px', `${((s.y - 0.5) * 32).toFixed(2)}px`);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* Opening progressivo */
  useEffect(() => {
    const t = window.setTimeout(() => setOpeningDone(true), 2200);
    return () => clearTimeout(t);
  }, []);

  /* Section observer + FX live + reveal */
  useEffect(() => {
    const sectionNodes = JOURNEY.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const sectionObs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = vis[0]?.target?.id as SectionId | undefined;
        if (!id) return;
        setActive(id);
        if (id === 'chuva' || id === 'sangue' || id === 'abismo' || id === 'eclipse') stampPass(id);
        if (id === 'archives') stampPass('archives');
      },
      { threshold: [0.18, 0.32, 0.48], rootMargin: '-16% 0px -28% 0px' }
    );
    sectionNodes.forEach((n) => sectionObs.observe(n));

    const fxNodes = document.querySelectorAll<HTMLElement>('.dw-fx, .region.division-world');
    const fxObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) el.classList.add('fx-live');
          else el.classList.remove('fx-live');
        });
      },
      { threshold: 0.08, rootMargin: '10% 0px' }
    );
    fxNodes.forEach((n) => fxObs.observe(n));

    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('is-visible');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));

    return () => {
      sectionObs.disconnect();
      fxObs.disconnect();
      revealObs.disconnect();
    };
  }, [stampPass]);

  /* Rotação lenta de transmissão (a partir do índice do dia) */
  useEffect(() => {
    const t = window.setInterval(() => {
      setTxIndex((i) => (i + 1) % transmissions.length);
    }, 10000);
    return () => clearInterval(t);
  }, []);

  /* Áudio */
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
    const division = resolveDivision(scores, answers);
    setResult({ division, scores });
    stampPass('test');
    stampPass(division);
    window.requestAnimationFrame(() => {
      document.getElementById('test')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
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

  const passCount = useMemo(() => Object.values(pass).filter(Boolean).length, [pass]);

  const allDivisions =
    pass.chuva && pass.sangue && pass.abismo && pass.eclipse;

  const isArchiveUnlocked = useCallback(
    (frag: ArchiveFrag) => {
      if (frag.unlock === 'all-divisions') return allDivisions;
      return pass[frag.unlock];
    },
    [pass, allDivisions]
  );

  const unlockedArchives = useMemo(
    () => archiveFragments.filter((f) => isArchiveUnlocked(f)).length,
    [isArchiveUnlocked]
  );

  const themeClass =
    active === 'chuva' || active === 'sangue' || active === 'abismo' || active === 'eclipse'
      ? `theme-${active}`
      : active === 'test' || active === 'join'
        ? 'theme-core theme-ember'
        : 'theme-core';

  const ambientIntensity =
    active === 'home'
      ? 'amb-strong'
      : active === 'test' || active === 'rules' || active === 'faq'
        ? 'amb-low'
        : active === 'chuva' || active === 'sangue' || active === 'abismo' || active === 'eclipse'
          ? `amb-div amb-${active}`
          : 'amb-mid';

  const activeRailIndex = Math.max(
    0,
    RAIL_NODES.findIndex((n) => n.id === active)
  );

  const tx = transmissions[txIndex];

  return (
    <div
      ref={rootRef}
      className={`allied-root continuous ${themeClass} ${ambientIntensity} ${musicOn ? 'music-live' : ''} ${passCount >= 6 ? 'pass-complete' : ''} ${openingDone ? 'opening-done' : 'opening'}${result ? ` classified classified-${result.division}` : ''}`}
      style={{ '--mx': '0.5', '--my': '0.5' } as CSSProperties}
    >
      <AmbientLayer />

      <header className="topbar">
        <button type="button" className="brand" onClick={() => scrollTo('home')}>
          <LogoMark size={28} />
          <span>
            ALLIED<em>ORGANIZAÇÃO</em>
          </span>
        </button>
        <button type="button" className="burger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <nav className={menuOpen ? 'nav open' : 'nav'}>
          {ACT_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                (item.id === 'home' && (active === 'home' || active === 'allied')) ||
                (item.id === 'mural' && (active === 'mural' || active === 'hierarchy')) ||
                (item.id === 'chuva' &&
                  (active === 'chuva' || active === 'sangue' || active === 'abismo' || active === 'eclipse')) ||
                (item.id === 'test' && active === 'test') ||
                (item.id === 'signal' && (active === 'signal' || active === 'archives')) ||
                (item.id === 'join' && (active === 'join' || active === 'rules' || active === 'faq'))
                  ? 'nav-link active'
                  : 'nav-link'
              }
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

      {/* Sistema interno — rail */}
      <aside className="journey-rail system-rail" aria-label="Sistema Allied">
        <div className="rail-track">
          <div
            className="rail-fill"
            style={{ height: `${(activeRailIndex / Math.max(RAIL_NODES.length - 1, 1)) * 100}%` }}
          />
        </div>
        {RAIL_NODES.map((n) => (
          <button
            key={n.id}
            type="button"
            className={`rail-dot ${active === n.id ? 'active' : ''} ${n.id} ${n.sigil ? `sig-${n.sigil}` : ''}`}
            title={n.label}
            onClick={() => scrollTo(n.id)}
          >
            {n.sigil ? <SigilFor id={n.sigil} size={12} className="rail-sigil" /> : <i className="rail-core" />}
            <span>{n.label}</span>
          </button>
        ))}
      </aside>

      {/* Allied Pass — registro + mobile sheet */}
      <div className={`allied-pass ${passOpen ? 'expanded' : ''}`}>
        <button type="button" className="pass-toggle" onClick={() => setPassOpen((v) => !v)} aria-label="Allied Pass">
          <AlliedMark size={18} />
          <span className="pass-title">PASS</span>
          <span className="pass-count">{String(passCount).padStart(2, '0')}/06</span>
        </button>
        <div className="pass-panel">
          <p className="pass-label">REGISTRO DE PRESENÇA</p>
          <div className="pass-slots">
            {(['chuva', 'sangue', 'abismo', 'eclipse'] as DivisionId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`pass-slot ${pass[id] ? 'lit' : ''} slot-${id}`}
                title={divisionMeta[id].name}
                onClick={() => scrollTo(id)}
              >
                <SigilFor id={id} size={18} />
              </button>
            ))}
            <button
              type="button"
              className={`pass-slot ${pass.test ? 'lit' : ''}`}
              title="Teste"
              onClick={() => scrollTo('test')}
            >
              <AlliedMark size={16} />
            </button>
            <button
              type="button"
              className={`pass-slot ${pass.archives ? 'lit' : ''}`}
              title="Arquivos"
              onClick={() => scrollTo('archives')}
            >
              <span className="pass-dot" />
            </button>
          </div>
          {passCount >= 6 && (
            <p className="pass-done">PASS COMPLETO — a estrutura registrou sua passagem.</p>
          )}
        </div>
      </div>

      <main className="journey">
        {/* ATO I — IDENTIDADE */}
        <section className="region home-world" id="home">
          <div className="home-orb" />
          <div className="home-hero">
            <div className="opening-stage">
              <div className="op-mark">
                <AlliedMark size={96} className="home-mark" />
              </div>
              <p className="kicker op-kicker">ORGANIZAÇÃO · MULTI-JOGO · PT-BR</p>
              <h1 className="op-title">
                <span className="line">ALLIED</span>
                <span className="line accent">NÃO É UM LUGAR.</span>
                <span className="line">É UMA ESTRUTURA.</span>
              </h1>
              <p className="lede op-lede">
                Quatro regiões. Um núcleo. Role para atravessar o território.
              </p>
              <div className="home-actions op-actions">
                <button type="button" className="btn primary" onClick={() => scrollTo('allied')}>
                  ENTRAR NO TERRITÓRIO <ArrowRight size={16} />
                </button>
                <a className="btn ghost" href="https://discord.gg/UFUMMx5PkD" target="_blank" rel="noreferrer">
                  ENTRAR NO DISCORD <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
          <div className="scroll-hint op-hint">
            <span>DESCER</span>
            <i />
          </div>
        </section>

        <section className="region allied-world" id="allied">
          <div className="region-inner reveal">
            <div className="nucleus-diagram" aria-hidden>
              <AlliedMark size={64} />
              <div className="nucleus-ring">
                {(['chuva', 'sangue', 'abismo', 'eclipse'] as DivisionId[]).map((id, i) => (
                  <button
                    key={id}
                    type="button"
                    className={`nucleus-node nn-${id}`}
                    style={{ ['--i' as string]: String(i) } as CSSProperties}
                    onClick={() => scrollTo(id)}
                    title={divisionMeta[id].name}
                  >
                    <SigilFor id={id} size={28} />
                  </button>
                ))}
              </div>
            </div>
            <p className="kicker">NÚCLEO</p>
            <h2>
              Um universo.
              <span> Quatro eixos.</span>
            </h2>
            <p className="lede">
              A Allied é maior do que um único jogo. É estrutura, presença e quatro frentes que orbitam o mesmo centro.
            </p>
            <div className="home-grid">
              {(Object.keys(divisionMeta) as DivisionId[]).map((id) => (
                <button key={id} type="button" className={`home-div card-${id}`} onClick={() => scrollTo(id)}>
                  <span className="hd-code">
                    <SigilFor id={id} size={22} />
                    {divisionMeta[id].code}
                  </span>
                  <strong>{divisionMeta[id].full}</strong>
                  <em>{divisionMeta[id].tagline}</em>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ATO II — ESTRUTURA */}
        <section className="region mural-world" id="mural">
          <div className="hw-head reveal">
            <p className="kicker">PRESENÇA</p>
            <h2>
              Mural de
              <span> memória</span>
            </h2>
            <p className="lede">Antes das regiões — as pessoas. Seis registros.</p>
          </div>
          <div className="mural-editorial">
            {muralPhotos.map((p, i) => (
              <figure
                key={p.src}
                className={`mural-item size-${p.size} reveal`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <img src={p.src} alt={p.label} loading="lazy" />
                <figcaption>{p.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="region hierarchy-world" id="hierarchy">
          <div className="hw-head reveal">
            <p className="kicker">COMANDO</p>
            <h2>
              Hierarquia
              <span> orbital</span>
            </h2>
            <p className="lede">Centro e órbitas. Cada líder de divisão carrega o sigilo da sua frente.</p>
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
                    {node.div && (
                      <div className="on-sigil">
                        <SigilFor id={node.div} size={26} />
                      </div>
                    )}
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
                  {node.div && (
                    <div className="on-sigil">
                      <SigilFor id={node.div} size={22} />
                    </div>
                  )}
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

        {/* ATO III — QUATRO REGIÕES */}
        {(Object.keys(divisionMeta) as DivisionId[]).map((id, index) => {
          const meta = divisionMeta[id];
          const nextBridge = (['sangue', 'abismo', 'eclipse', 'test'] as const)[index];
          return (
            <div key={id} className="division-block">
              <section className={`region division-world dw-${id}`} id={id}>
                <DivisionFX id={id} />
                <div className="dw-sigil-stage" aria-hidden>
                  <SigilFor id={id} size={200} className="dw-sigil-hero" />
                </div>
                <div className="dw-content reveal">
                  <p className="dw-code">
                    <SigilFor id={id} size={20} />
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
              <div className={`bridge bridge-${id}-to-${nextBridge}`} aria-hidden>
                <div className="bridge-particles" />
                <div className="bridge-sigils">
                  <SigilFor id={id} size={28} />
                  <AlliedMark size={20} />
                  {index < 3 ? (
                    <SigilFor id={nextBridge as DivisionId} size={28} />
                  ) : (
                    <AlliedMark size={28} />
                  )}
                </div>
                <span className="bridge-label">
                  {index === 0 && 'A ÁGUA ESCURECE'}
                  {index === 1 && 'A LUZ SOME'}
                  {index === 2 && 'O VAZIO RECEBE LUZ'}
                  {index === 3 && 'O SISTEMA SE CONCENTRA'}
                </span>
              </div>
            </div>
          );
        })}

        {/* ATO IV — CLASSIFICAÇÃO */}
        <section className="region test-world" id="test">
          <div className="tw-head reveal">
            <AlliedMark size={44} className="tw-mark" />
            <p className="kicker">SISTEMA INTERNO</p>
            <h2>
              Classificação
              <span> de alinhamento</span>
            </h2>
            <p className="lede">Dez decisões. Análise. Uma divisão.</p>
          </div>

          {result ? (
            <div className={`result-panel result-anchor rp-${result.division}`}>
              <p className="rp-process">ANÁLISE CONCLUÍDA</p>
              <div className="result-sigil">
                <SigilFor id={result.division} size={100} className="result-sigil-anim" />
              </div>
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
                      <span>
                        <SigilFor id={k} size={14} /> {divisionMeta[k].name}
                      </span>
                      <div>
                        <i style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="home-actions">
                <button type="button" className="btn ghost" onClick={() => scrollTo(result.division)}>
                  VER MINHA DIVISÃO
                </button>
                <a className="btn primary" href="https://discord.gg/UFUMMx5PkD" target="_blank" rel="noreferrer">
                  ENTRAR NA ALLIED <ArrowUpRight size={14} />
                </a>
                <button type="button" className="btn ghost" onClick={() => scrollTo('join')}>
                  CONTINUAR A JORNADA
                </button>
                <button type="button" className="btn ghost" onClick={resetTest}>
                  REFAZER
                </button>
              </div>
            </div>
          ) : (
            <div className="quiz-panel reveal">
              <div className="qp-latent" aria-hidden>
                {(['chuva', 'sangue', 'abismo', 'eclipse'] as DivisionId[]).map((id) => (
                  <SigilFor key={id} id={id} size={20} className="latent-sigil" />
                ))}
              </div>
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
                  {quizStep === 9 ? 'CONCLUIR ANÁLISE' : 'PRÓXIMA'} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ATO V — VIDA */}
        <section className="region signal-world" id="signal">
          <div className="signal-panel reveal">
            <div className="signal-scan" aria-hidden />
            <div className="signal-head">
              <div className="signal-brand">
                <AlliedMark size={36} />
                <div className="signal-meta">
                  <p className="kicker signal-kicker">SINAL DA ALLIED</p>
                  <span className="signal-code">{tx.code}</span>
                </div>
              </div>
              <span className={`signal-live st-${tx.status.toLowerCase()}`}>{tx.status}</span>
            </div>
            <h2 className="signal-title">{tx.title}</h2>
            <p className="signal-body">{tx.body}</p>
            <div className="signal-wave" aria-hidden>
              <span /><span /><span /><span /><span />
            </div>
            <div className="signal-dots">
              {transmissions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === txIndex ? 'on' : ''}
                  onClick={() => setTxIndex(i)}
                  aria-label={`Transmissão ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="region archives-world" id="archives">
          <div className="archives-inner reveal">
            <p className="kicker">CLASSIFICADOS</p>
            <h2>
              Arquivos
              <span> da estrutura</span>
            </h2>
            <p className="lede quiet">
              Desbloqueados pela exploração. {unlockedArchives} / 06 acessíveis.
            </p>
            <div className="archive-grid">
              {archiveFragments.map((frag, i) => {
                const unlocked = isArchiveUnlocked(frag);
                const open = archiveOpen === i && unlocked;
                return (
                  <button
                    key={frag.id}
                    type="button"
                    className={`archive-card ${unlocked ? 'unlocked' : 'locked'} ${open ? 'open' : ''}`}
                    onClick={() => {
                      if (!unlocked) return;
                      setArchiveOpen(open ? null : i);
                    }}
                    disabled={!unlocked}
                  >
                    <span className="arch-id">{frag.id}</span>
                    <span className="arch-label">{unlocked ? frag.label : 'BLOQUEADO'}</span>
                    <p>{open ? frag.text : unlocked ? '·····' : '········'}</p>
                  </button>
                );
              })}
            </div>
            {passCount >= 6 && (
              <p className="pass-complete-msg">ALLIED PASS COMPLETO — a estrutura reconheceu sua passagem.</p>
            )}
          </div>
        </section>

        {/* ATO VI — INGRESSO */}
        <section className="region join-world" id="join">
          <div className="join-inner reveal">
            <div className="discord-portal">
              <div className="portal-orbit" aria-hidden />
              <div className="portal-core">
                {result ? (
                  <SigilFor id={result.division} size={56} className="portal-sigil" />
                ) : (
                  <AlliedMark size={72} className={passCount >= 6 ? 'mark-complete' : ''} />
                )}
              </div>
              <p className="kicker portal-kicker">ACESSO EXTERNO</p>
              <h2 className="portal-title">
                Discord da Allied
                <span>O território continua fora daqui.</span>
              </h2>
              <p className="lede portal-lede">
                {result
                  ? `Classificação: ${divisionMeta[result.division].full}. A estrutura reconheceu seu alinhamento.`
                  : 'Agora que conhece a estrutura, o próximo passo é o canal oficial.'}
              </p>
              <div className="portal-actions">
                <a className="btn primary portal-cta" href="https://discord.gg/UFUMMx5PkD" target="_blank" rel="noreferrer">
                  ABRIR DISCORD <ArrowUpRight size={16} />
                </a>
                <button type="button" className="btn ghost" onClick={() => scrollTo('rules')}>
                  LER O CÓDIGO
                </button>
              </div>
              <div className="portal-lines" aria-hidden>
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </section>

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
        <AlliedMark size={28} />
        <div className="foot-sigils">
          <SigilChuva size={16} />
          <SigilSangue size={16} />
          <SigilAbismo size={16} />
          <SigilEclipse size={16} />
        </div>
        <span>ALLIED · ORGANIZAÇÃO · PT-BR</span>
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