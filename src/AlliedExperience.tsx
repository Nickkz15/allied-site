import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';

type PhotoItem = { src: string; label: string };

function createWireframe(): Float32Array {
  const vertices: number[] = [];
  const addLine = (a: number[], b: number[]) => vertices.push(...a, ...b);
  const point = (theta: number, phi: number, radius = 1.08) => [
    radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.cos(theta),
    radius * Math.sin(theta) * Math.sin(phi),
  ];

  const latitudeCount = 22;
  const longitudeCount = 52;

  for (let lat = 1; lat < latitudeCount; lat += 1) {
    const theta = (Math.PI * lat) / latitudeCount;
    for (let lon = 0; lon < longitudeCount; lon += 1) {
      const phi = (Math.PI * 2 * lon) / longitudeCount;
      const nextPhi = (Math.PI * 2 * (lon + 1)) / longitudeCount;
      addLine(point(theta, phi), point(theta, nextPhi));
    }
  }

  for (let lon = 0; lon < longitudeCount / 2; lon += 1) {
    const phi = (Math.PI * 2 * lon) / longitudeCount;
    for (let lat = 0; lat < latitudeCount; lat += 1) {
      const theta = (Math.PI * lat) / latitudeCount;
      const nextTheta = (Math.PI * (lat + 1)) / latitudeCount;
      addLine(point(theta, phi), point(nextTheta, phi));
    }
  }

  for (let ring = 0; ring < 3; ring += 1) {
    const radius = ring === 2 ? 1.55 : 1.38;
    for (let i = 0; i < 128; i += 1) {
      const a = (Math.PI * 2 * i) / 128;
      const b = (Math.PI * 2 * (i + 1)) / 128;
      const orbitPoint = (angle: number) => {
        if (ring === 0) return [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.82, 0];
        if (ring === 1) return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
        return [
          Math.cos(angle) * radius * 0.92,
          Math.sin(angle) * radius * 0.68,
          Math.sin(angle) * radius * 0.55,
        ];
      };
      addLine(orbitPoint(a), orbitPoint(b));
    }
  }

  const diamond = [
    [0, 1.34, 0],
    [0.72, 0, 0.18],
    [0, -1.34, 0],
    [-0.72, 0, -0.18],
    [0, 1.34, 0],
  ];
  for (let i = 0; i < diamond.length - 1; i += 1) {
    addLine(diamond[i], diamond[i + 1]);
  }

  return new Float32Array(vertices);
}

const vertexShader = [
  'attribute vec3 aPosition;',
  'uniform mat4 uProjection;',
  'uniform float uTime;',
  'uniform vec2 uPointer;',
  'varying float vDepth;',
  'varying float vLight;',
  'void main() {',
  '  float yaw = uTime * 0.13 + uPointer.x * 0.34;',
  '  float pitch = 0.18 + uPointer.y * 0.25;',
  '  float x = aPosition.x * cos(yaw) + aPosition.z * sin(yaw);',
  '  float z = -aPosition.x * sin(yaw) + aPosition.z * cos(yaw);',
  '  float y = aPosition.y * cos(pitch) - z * sin(pitch);',
  '  z = aPosition.y * sin(pitch) + z * cos(pitch);',
  '  vec3 p = vec3(x, y, z);',
  '  p *= 1.0 + 0.012 * sin(uTime * 0.9 + p.y * 3.0);',
  '  vec4 viewPosition = vec4(p, 1.0);',
  '  viewPosition.z -= 4.25;',
  '  gl_Position = uProjection * viewPosition;',
  '  vDepth = p.z;',
  '  vLight = 0.48 + 0.52 * clamp(p.z * 0.5 + 0.5, 0.0, 1.0);',
  '}',
].join('\n');

const fragmentShader = [
  'precision mediump float;',
  'uniform float uTime;',
  'varying float vDepth;',
  'varying float vLight;',
  'void main() {',
  '  float pulse = 0.5 + 0.5 * sin(uTime * 0.72 + vDepth * 4.0);',
  '  vec3 deep = vec3(0.17, 0.025, 0.055);',
  '  vec3 bright = vec3(0.95, 0.27, 0.34);',
  '  vec3 color = mix(deep, bright, smoothstep(-1.2, 1.2, vDepth));',
  '  color += vec3(0.12, 0.035, 0.025) * pulse;',
  '  gl_FragColor = vec4(color * vLight, 0.22 + 0.28 * vLight + 0.06 * pulse);',
  '}',
].join('\n');

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function perspective(fov: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(fov / 2);
  const range = 1 / (near - far);
  const matrix = new Float32Array(16);
  matrix[0] = f / aspect;
  matrix[5] = f;
  matrix[10] = (far + near) * range;
  matrix[11] = -1;
  matrix[14] = 2 * far * near * range;
  return matrix;
}

function useCoreScene(canvasRef: RefObject<HTMLCanvasElement>) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      depth: true,
      powerPreference: 'low-power',
      premultipliedAlpha: true,
    });
    if (!gl) return;

    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      return;
    }

    const geometry = createWireframe();
    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'aPosition');
    const projectionLocation = gl.getUniformLocation(program, 'uProjection');
    const timeLocation = gl.getUniformLocation(program, 'uTime');
    const pointerLocation = gl.getUniformLocation(program, 'uPointer');

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.clearColor(0, 0, 0, 0);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = true;
    let frame = 0;
    let disposed = false;
    let startTime = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(rect.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    };

    const render = (now: number) => {
      if (disposed || !visible || document.hidden) return;
      if (!startTime) startTime = now;
      const elapsed = reducedMotion ? 0 : (now - startTime) / 1000;
      resize();
      const aspect = canvas.width / Math.max(canvas.height, 1);
      const projection = perspective(Math.PI / 3.15, aspect, 0.1, 40);

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniformMatrix4fv(projectionLocation, false, projection);
      gl.uniform1f(timeLocation, elapsed);
      gl.uniform2f(pointerLocation, pointer.current.x, pointer.current.y);
      gl.drawArrays(gl.LINES, 0, geometry.length / 3);

      if (!reducedMotion) frame = window.requestAnimationFrame(render);
    };

    const observer = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible && !document.hidden && !reducedMotion) {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(render);
          } else if (!visible) {
            cancelAnimationFrame(frame);
          }
        }, { threshold: 0.05 })
      : null;

    observer?.observe(canvas);
    const onVisibility = () => {
      if (!document.hidden && visible && !reducedMotion) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(render);
      } else if (document.hidden) {
        cancelAnimationFrame(frame);
      }
    };

    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    render(0);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [canvasRef]);

  return pointer;
}

type AlliedExperienceProps = { children: ReactNode };

export default function AlliedExperience({ children }: AlliedExperienceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([
    'ALLIED CORE // CONEXÃO LOCAL ESTABELECIDA',
    'Há mais por aqui do que a página deixa parecer.',
    'Digite "help" para consultar os comandos.',
  ]);
  const pointer = useCoreScene(canvasRef);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setConsoleOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  useEffect(() => {
    if (!consoleOpen) return;
    inputRef.current?.focus();
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setConsoleOpen(false);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [consoleOpen]);

  const runCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = command.trim();
    const key = raw.toLowerCase();
    if (!key) return;

    const responses: Record<string, string> = {
      help: 'COMANDOS: status · map · archives · identity · clear · exit',
      status: 'NÚCLEO ESTÁVEL. Quatro regiões mapeadas. Nenhuma telemetria pessoal é coletada por este terminal.',
      map: '01 CHUVA / 02 SANGUE / 03 ABISMO / 04 ECLIPSE. Quatro caminhos, uma mesma estrutura.',
      archives: 'Os registros ficam espalhados pela jornada. Explore as regiões e volte ao painel de arquivos.',
      identity: 'ALLIED: organização e comunidade multi-jogo brasileira. Presença, interação e identidade.',
    };

    if (key === 'clear') {
      setOutput([]);
    } else if (key === 'exit') {
      setConsoleOpen(false);
    } else {
      setOutput((current) => [...current, '> ' + raw, responses[key] ?? 'Sinal não reconhecido. "help" revela os comandos disponíveis.'].slice(-10));
    }
    setCommand('');
  };

  return (
    <div
      className="allied-core-experience"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointer.current.x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
        pointer.current.y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
      }}
      onPointerLeave={() => {
        pointer.current.x = 0;
        pointer.current.y = 0;
      }}
    >
      <canvas className="allied-core-canvas" ref={canvasRef} aria-hidden="true" />
      <span className="core-orbit core-orbit-one" aria-hidden="true" />
      <span className="core-orbit core-orbit-two" aria-hidden="true" />
      <button
        type="button"
        className="allied-core-trigger"
        onClick={() => setConsoleOpen(true)}
        aria-label="Abrir terminal secreto da Allied"
        title="O símbolo guarda um segredo. Atalho: Alt + Shift + A."
      >
        {children}
      </button>
      <span className="core-caption" aria-hidden="true">NÚCLEO / 04</span>

      {consoleOpen && (
        <div className="allied-console-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setConsoleOpen(false);
        }}>
          <section className="allied-console" role="dialog" aria-modal="true" aria-labelledby="allied-console-title">
            <header className="console-header">
              <div>
                <span className="console-kicker">ALLIED / INTERFACE LOCAL</span>
                <h2 id="allied-console-title">Núcleo de acesso</h2>
              </div>
              <button type="button" className="console-close" onClick={() => setConsoleOpen(false)} aria-label="Fechar terminal">×</button>
            </header>
            <div className="console-screen" aria-live="polite" aria-relevant="additions">
              {output.map((line, index) => <p key={index}>{line}</p>)}
            </div>
            <form className="console-command" onSubmit={runCommand}>
              <label htmlFor="allied-command">COMANDO</label>
              <span aria-hidden="true">›</span>
              <input
                id="allied-command"
                ref={inputRef}
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                placeholder="help"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="submit" aria-label="Executar comando">↵</button>
            </form>
            <p className="console-footnote">LOCAL ONLY · NENHUM DADO É ENVIADO</p>
          </section>
        </div>
      )}
    </div>
  );
}

type PhotoLightboxProps = {
  photo: PhotoItem;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function PhotoLightbox({ photo, onClose, onNext, onPrevious }: PhotoLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const actions = useRef({ onClose, onNext, onPrevious });
  actions.current = { onClose, onNext, onPrevious };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') actions.current.onClose();
      if (event.key === 'ArrowRight') actions.current.onNext();
      if (event.key === 'ArrowLeft') actions.current.onPrevious();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="mural-lightbox" role="dialog" aria-modal="true" aria-label="Visualização de lembrança" tabIndex={-1} ref={dialogRef} onClick={onClose}>
      <div className="lightbox-frame" onClick={(event) => event.stopPropagation()}>
        <div className="lightbox-topline">
          <span>ARQUIVO VISUAL / {photo.label.toUpperCase()}</span>
          <button type="button" onClick={onClose} aria-label="Fechar imagem">×</button>
        </div>
        <button type="button" className="lightbox-arrow previous" onClick={onPrevious} aria-label="Imagem anterior">‹</button>
        <img src={photo.src} alt={photo.label} />
        <button type="button" className="lightbox-arrow next" onClick={onNext} aria-label="Próxima imagem">›</button>
        <p className="lightbox-caption">{photo.label} <span>·</span> ALLIED / MEMÓRIA</p>
      </div>
    </div>
  );
}
