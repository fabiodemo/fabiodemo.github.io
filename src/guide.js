// Guia do DemOS: janela no estilo Gerenciador de Tarefas com o tour do site,
// todas as referências espalhadas por aí e os segredos (com spoiler).
// Também tem a oferta de guia que o Disquete faz na primeira visita.
import { T } from './i18n.js';
import { icon } from './pixels.js';
import { sfx } from './sfx.js';
import { APPS } from './apps.js';
import { createPal } from './assistant.js';

/* ---------------------------------------------------------------- tour */
// [id do app ou null, ícone (se não for app), nome (se não for app), descrição]
const TOUR = [
  [T('Resume and career', 'Currículo e carreira'), [
    ['leiame', 0, 0, T('The resume on one page, formatted or as plain text. Ctrl+P prints it as a PDF.', 'O currículo numa página, formatado ou em texto puro. Ctrl+P imprime em PDF.')],
    ['forum', 0, 0, T('The full CV as a 2009 forum: experience, featured projects, case studies (STAR), education, research and papers.', 'O CV completo num fórum de 2009: experiência, destaques, estudos de caso (STAR), formação, pesquisa e acadêmicos.')],
    ['sobre', 0, 0, T('Quick summary in the System Properties window.', 'Resumo rápido na janela de Propriedades do Sistema.')],
    ['taskmgr', 0, 0, T('Numbers from Warren: commits per month, repositories, runtime and cost before and after each optimization, GitHub charts. Also a button you should not press.', 'Números da Warren: commits por mês, repositórios, runtime e custo antes e depois de cada otimização, gráficos do GitHub. E um botão que não é pra apertar.')],
    ['skills', 0, 0, T('Tech stack laid out like the Device Manager.', 'Stack técnico no formato do Gerenciador de Dispositivos.')],
    ['certs', 0, 0, T('Certifications in a certmgr window.', 'Certificações numa janela do certmgr.')],
    ['contato', 0, 0, T('GitHub, LinkedIn and the paper, in an MSN-style window. It has a nudge button.', 'GitHub, LinkedIn e o artigo, numa janela estilo MSN. Tem botão de chamar a atenção.')],
  ]],
  [T('Projects and research', 'Projetos e pesquisa'), [
    ['projetos', 0, 0, T('Public GitHub repositories in an Explorer folder.', 'Repositórios públicos do GitHub numa pasta do Explorer.')],
    ['turtle', 0, 0, T('TurtleBot3 simulation from the master\'s: a robot reaching goals with LIDAR across 6 stages. Reactive controller, no AI in the browser.', 'Simulação do TurtleBot3 do mestrado: robô chegando nos objetivos com LIDAR em 6 estágios. Controlador reativo, sem IA no navegador.')],
    ['figs', 0, 0, T('Thesis figures in the Photo Viewer, with slideshow.', 'Figuras da dissertação no Visualizador de Fotos, com apresentação de slides.')],
    ['stack', 0, 0, T('2009-style blog with the technologies I use, github-readme-stats and the contribution snake.', 'Blog estilo 2009 com as tecnologias que uso, github-readme-stats e a cobrinha de contribuições.')],
    ['blog', 0, 0, T('Markdown blog. Under construction for now, with the About me page.', 'Blog em Markdown. Em obras por enquanto, com a página Sobre mim.')],
  ]],
  [T('Fun', 'Diversão'), [
    ['jogos', 0, 0, T('Tetris, Tic-tac-toe, Minesweeper, Snake, Flappy Birb, Spider Solitaire, FreeCell, chess against the computer and a space pinball, all built from scratch.', 'Tetris, Jogo da Velha, Campo Minado, Snake, Flappy Birb, Paciência Spider, FreeCell, xadrez contra o computador e um pinball espacial, todos feitos do zero.')],
    ['lanhouse', 0, 0, T('Shortcuts to 2000s classics. Each one opens a memory from back then.', 'Atalhos dos clássicos dos anos 2000. Cada um abre uma lembrança da época.')],
    ['steam', 0, 0, T('Steam activity: hours, achievements, recent games. Updates by itself every 6 hours without exposing the profile.', 'Atividade na Steam: horas, conquistas, jogos recentes. Atualiza sozinha a cada 6 horas sem expor o perfil.')],
    ['musicpaint', 0, 0, T('Compose by stamping notes on the sheet with Paint tools (pencil, eraser, select, fill, picker). 14 instruments, sound in 8, 16, 32 or 64 bits, exports WAV and video.', 'Componha carimbando notas na partitura com as ferramentas do Paint (lápis, borracha, seleção, balde, conta-gotas). 14 instrumentos, som em 8, 16, 32 ou 64 bits, exporta WAV e vídeo.')],
    ['paint', 0, 0, T('Classic Paint, no antialiasing, just like the original.', 'Paint clássico, sem antialiasing, igual ao original.')],
    ['guestbook', 0, 0, T('Sign the guestbook. Messages stay only in your browser.', 'Assine o livro de visitas. Os recados ficam só no seu navegador.')],
  ]],
  [T('System', 'Sistema'), [
    ['personalize', 0, 0, T('Wallpaper, screen saver and glass transparency. Right-clicking the desktop gets you there too.', 'Papel de parede, proteção de tela e transparência do vidro. O clique direito no desktop também leva lá.')],
    ['cmd', 0, 0, T('Terminal with CV commands. Type help. Some commands are not in the help.', 'Terminal com comandos do CV. Digite help. Alguns comandos não estão no help.')],
    ['lixeira', 0, 0, T('What was retired: 19-hour pipelines, giant clusters, unused buckets.', 'O que foi aposentado: pipelines de 19 horas, clusters gigantes, buckets sem uso.')],
    [null, 'chart', T('Gadgets', 'Gadgets'), T('Right side of the desktop: Before × After of the pipelines, Steam and a media player with 10 original tracks (press play) and 6 visualizations.', 'Lado direito do desktop: Antes × Depois dos pipelines, Steam e um media player com 10 faixas originais (é só dar play) e 6 visualizações.')],
    [null, 'computer', T('Taskbar', 'Barra de tarefas'), T('Start menu (or the Windows key), EN/PT button (auto follows the browser language), sound on/off and the clock.', 'Menu Iniciar (ou a tecla Windows), botão EN/PT (o auto segue o idioma do navegador), som liga/desliga e o relógio.')],
  ]],
];

/* ---------------------------------------------------------------- referências */
// [referência, onde aparece no site, de onde vem, é segredo?]
const REFS = [
  ['Windows 7 / Aero', T('The whole desktop: glass windows, Start menu, taskbar, gadgets, balloons', 'O desktop inteiro: janelas de vidro, menu Iniciar, barra de tarefas, gadgets, balões'), 'Windows 7 (2009)'],
  [T('Classic screen savers', 'Proteções de tela clássicas'), T('Personalize: Bubbles, Mystify, 3D Pipes, Starfield, 3D Text', 'Personalizar: Bolhas, Mystify, Canos 3D, Viagem espacial, Texto 3D'), 'Windows 95 a 7'],
  [T('Windows accessories', 'Acessórios do Windows'), T('Notepad, Paint, Photo Viewer, Device Manager, certmgr, Command Prompt, Recycle Bin', 'Bloco de Notas, Paint, Visualizador de Fotos, Gerenciador de Dispositivos, certmgr, Prompt, Lixeira'), 'Windows'],
  [T('Office assistants', 'Assistentes do Office'), T('Floppy, the assistant who offers the guide (an original character)', 'O Disquete, assistente que oferece o guia (personagem próprio)'), T('The 90s paperclip', 'O clipe dos anos 90')],
  [T('Minecraft advancements', 'Conquistas do Minecraft'), T('Achievement toasts when opening windows (Taking Inventory, Time to Mine!...), /gamemode, /seed and /time in the Prompt, Voxel world wallpaper', 'Conquistas ao abrir janelas (Taking Inventory, Time to Mine!...), /gamemode, /seed e /time no Prompt, papel de parede Mundo de blocos'), 'Minecraft (2011)'],
  ['Habbo Hotel', T('Stack (chat filter "bobba", furni), Pixel hotel wallpaper, LAN House, "Bobba Groove" track', 'Stack (filtro "bobba", mobis), papel de parede Hotel pixelado, Lan House, faixa "Bobba Groove"'), 'Habbo (2000)'],
  ['MSN Messenger', T('Contact (status, nudge), LAN House (the nudge shakes the screen)', 'Contato (status, chamar a atenção), Lan House (o treme-treme sacode a tela)'), 'MSN (1999)'],
  ['Orkut', T('LAN House (scraps and testimonials), "Eu Odeio Acordar Cedo" track', 'Lan House (scraps e depoimentos), faixa "Eu Odeio Acordar Cedo"'), 'Orkut (2004)'],
  ['Tibia', T('LAN House, exura and utevo lux in the Prompt, "Exura Vita" track', 'Lan House, exura e utevo lux no Prompt, faixa "Exura Vita"'), 'Tibia (1997)'],
  ['Mu Online', T('LAN House (Lorencia, +7 blade), "Lorencia Nights" track', 'Lan House (Lorencia, espada +7), faixa "Lorencia Nights"'), 'Mu Online (2001)'],
  ['Counter-Strike 1.6', T('LAN House, connect in the Prompt, "Fire in the Hole" track', 'Lan House, connect no Prompt, faixa "Fire in the Hole"'), 'CS 1.6 (2003)'],
  ['Grand Chase', T('LAN House', 'Lan House'), 'Grand Chase (2003)'],
  ['Age of Empires II', T('LAN House, robin hood, rock on, lumberjack, cheese steak jimmy\'s and wololo in the Prompt, "Wololo" track', 'Lan House, robin hood, rock on, lumberjack, cheese steak jimmy\'s e wololo no Prompt, faixa "Wololo"'), 'AoE II (1999)'],
  ['GTA San Andreas', T('HESOYAM, save in the Recycle Bin, LAN House, "HESOYAM" track', 'HESOYAM, save na Lixeira, Lan House, faixa "HESOYAM"'), 'GTA SA (2004)'],
  [T('9999-in-1 consoles', 'Consoles 9999 em 1'), T('PolyStation in the LAN House and as a screen saver, "Blow the Cartridge" track', 'PolyStation na Lan House e na proteção de tela, faixa "Blow the Cartridge"'), T('Generic consoles from the 90s', 'Consoles genéricos dos anos 90')],
  ['PlayStation 2', T('LAN House (8MB memory card)', 'Lan House (memory card de 8MB)'), 'PS2 (2000)'],
  ['Click Jogos, Bacaninha, Miniclip', T('LAN House', 'Lan House'), T('Flash game sites from the 2000s', 'Sites de jogos em Flash dos anos 2000')],
  ['Adobe Flash Player', T('LAN House', 'Lan House'), T('Retired on 31/12/2020', 'Aposentado em 31/12/2020')],
  ['Baixaki', T('LAN House (untick the toolbars)', 'Lan House (desmarcar as barras de ferramentas)'), T('Brazilian download site', 'Site brasileiro de downloads')],
  ['Nero Burning ROM', T('LAN House (buffer underrun)', 'Lan House (buffer underrun)'), T('CD burning software', 'Gravador de CD')],
  ['Ares, Kazaa', T('LAN House ("no Kazaa" sign, the 99.9% mp3)', 'Lan House (placa "proibido Kazaa", o mp3 em 99,9%)'), T('2000s P2P', 'P2P dos anos 2000')],
  [T('Dial-up internet', 'Internet discada'), T('Sound when the LAN House connects, "Dial-up Symphony in 56k" track', 'Som ao conectar a Lan House, faixa "Dial-up Symphony in 56k"'), T('56k modems', 'Modems de 56k')],
  [T('LAN houses', 'Lan houses'), T('LAN House do Seu Zé: R$1.50 an hour, 60-minute timer', 'Lan House do Seu Zé: R$1,50 a hora, timer de 60 minutos'), T('Brazil, 2000s', 'Brasil, anos 2000')],
  [T('Music editors of the 90s', 'Editores de música dos anos 90'), T('Music Paint: notes stamped on a sheet with character-like icons, plus the sound of each console generation', 'Paint Musical: notas carimbadas na partitura com ícones, mais o som de cada geração de console'), 'Mario Paint (1992), trackers'],
  ['Winamp / Windows Media Player', T('Media player gadget with visualizations', 'Gadget de media player com visualizações'), 'Winamp (1997), WMP'],
  [T('2000s music', 'Música dos anos 2000'), T('Media player tracks: eurodance, G-funk, bossa nova, emo, piano rock, nu-metal, chiptune, choir (original loops, no samples)', 'Faixas do media player: eurodance, G-funk, bossa nova, emo, rock com piano, nu-metal, chiptune, coral (loops originais, sem samples)'), T('MTV and the LAN house speakers', 'MTV e as caixinhas de som da lan house')],
  [T('Windows games', 'Jogos do Windows'), T('Games folder: Minesweeper, Spider Solitaire, FreeCell (numbered deals, game no. 1 is the classic hand), chess in the spirit of Chess Titans and a space pinball in the spirit of 3D Pinball, all in original versions', 'Pasta Jogos: Campo Minado, Paciência Spider, FreeCell (mãos numeradas, o jogo nº 1 é a mão clássica), xadrez no espírito do Chess Titans e um pinball espacial no espírito do 3D Pinball, todos em versões próprias'), 'Windows 3.1 a 7'],
  ['Tetris, Snake, Flappy Bird', T('Games folder (Flappy Birb)', 'Pasta Jogos (Flappy Birb)'), '1984, Nokia (1997), 2013'],
  [T('2000s web', 'Web dos anos 2000'), T('phpBB forum, visitor counter, guestbook ~*~, "best viewed at 1024x768", under construction sign', 'Fórum phpBB, contador de visitas, livro de visitas ~*~, "melhor visualizado em 1024x768", plaquinha de em obras'), 'Web 1.0'],
  [T('Linux memes', 'Memes de Linux'), T('Prompt: sudo, dnf, pacman ("btw, I use Arch"), neofetch', 'Prompt: sudo, dnf, pacman ("aliás, eu uso Arch"), neofetch'), 'Linux'],
  [T('The Zen of Python', 'O Zen do Python'), T('python in the Prompt (import this)', 'python no Prompt (import this)'), 'PEP 20'],
  ['Steam / Steam Deck', T('Steam window and gadget', 'Janela e gadget da Steam'), 'Valve'],
  [T('Blue screen of death', 'Tela azul'), '', 'Windows', 1],
  [T('"Did you mean: recursion"', '"Você quis dizer: recursão"'), '', T('The Google joke', 'A piada do Google'), 1],
  ['"We Need to Go Deeper"', '', T('Inception meme', 'Meme de A Origem'), 1],
  [T('Konami Code', 'Código Konami'), '', 'Konami (1986)', 1],
  [T('"Delete System32"', '"Apague o System32"'), '', T('Old internet prank', 'Pegadinha antiga da internet'), 1],
  [T('VHS rewind', 'Rebobinar a fita'), '', T('VHS tapes and "be kind, rewind"', 'Fitas VHS da locadora'), 1],
  [T('Spaghettification', 'Espaguetificação'), '', T('Physics: what happens to things that fall into a black hole', 'Física: o que acontece com quem cai num buraco negro'), 1],
  [T('Black hole', 'Buraco negro'), '', 'Interstellar (2014)', 1],
];

/* ---------------------------------------------------------------- segredos */
const SECRETS = [
  ['HESOYAM', T('Type HESOYAM anywhere on the desktop (or in the Prompt).', 'Digite HESOYAM em qualquer lugar do desktop (ou no Prompt).'), T('Health, armor and every minimized window comes back.', 'Vida, colete e todas as janelas minimizadas voltam.')],
  [T('Konami Code', 'Código Konami'), '↑ ↑ ↓ ↓ ← → ← → B A', T('A canoe crosses the screen. Watch for the fish: it unlocks an achievement.', 'Uma canoa atravessa a tela. Fique de olho no peixe: ele destrava uma conquista.')],
  [T('Recursion', 'Recursão'), T('Open the Blog inside the desktop and click "Full CV (desktop)".', 'Abra o Blog dentro do desktop e clique em "CV completo (desktop)".'), T('The desktop tries to open inside itself: blue screen, stack overflow and the achievement We Need to Go Deeper.', 'O desktop tenta abrir dentro dele mesmo: tela azul, stack overflow e a conquista We Need to Go Deeper.')],
  [T('Self-destruct', 'Autodestruição'), T('Task Manager, bottom right corner.', 'Gerenciador de Tarefas, canto inferior direito.'), T('Floppy asks twice. If you insist, he throws every app in the Recycle Bin and jumps in after them; System32 gets deleted, the screen glitches and a black hole swallows the desktop and a few planets. At the end, "Undo and turn back time" blows it up and rewinds everything.', 'O Disquete pergunta duas vezes. Se você insistir, ele joga todos os apps na Lixeira e pula junto; o System32 é apagado, a tela entra em glitch e um buraco negro engole o desktop e alguns planetas. No fim, "Desfazer e voltar no tempo" explode o buraco negro e rebobina tudo.')],
  ['Wololo', T('Type wololo in the Prompt.', 'Digite wololo no Prompt.'), T('Every window switches to red. Type it again to switch back.', 'Todas as janelas mudam para vermelho. Digite de novo para voltar.')],
  ['Utevo lux', T('Type utevo lux (or /time set day) in the Prompt.', 'Digite utevo lux (ou /time set day) no Prompt.'), T('The wallpaper gets brighter.', 'O papel de parede fica mais claro.')],
  [T('Age of Empires cheats', 'Cheats do Age of Empires'), 'robin hood · rock on · lumberjack · cheese steak jimmy\'s', T('+1000 gold, stone, wood and food. Useless, but nostalgic.', '+1000 de ouro, pedra, madeira e comida. Inútil, mas nostálgico.')],
  [T('Blow the cartridge', 'Assoprar a fita'), T('PolyStation in the LAN House.', 'PolyStation na Lan House.'), T('You hear the blow before the "No signal".', 'Dá pra ouvir a assoprada antes do "Sem sinal".')],
  [T('The impossible deal', 'A mão impossível'), T('FreeCell, game no. 11982.', 'FreeCell, jogo nº 11982.'), T('Legend says this one has no solution. Good luck.', 'Dizem que este não tem solução. Boa sorte.')],
  [T('Skill shot', 'Skill shot'), T('Orbital Pinball: watch which top lane blinks at launch.', 'Pinball Orbital: repare qual pista de cima pisca no lançamento.'), T('Hit that lane right after launching: +20,000. The black hole on the table holds the ball and pays 10,000.', 'Acerte essa pista logo depois de lançar: +20.000. O buraco negro da mesa segura a bola e paga 10.000.')],
  [T('Wololo remix', 'Wololo remix'), T('Media player gadget, press play.', 'Gadget do media player, aperte o play.'), T('Each of the 10 tracks is a real loop in a 2000s style, and the visualizations follow the actual sound.', 'Cada uma das 10 faixas é um loop de verdade num estilo dos anos 2000, e as visualizações seguem o som de verdade.')],
  [T('Nudge again', 'Chamar de novo'), T('MSN in the LAN House, or Contact.', 'MSN na Lan House, ou Contato.'), T('The window and the screen shake. You can keep nudging.', 'A janela e a tela tremem. Dá pra continuar chamando.')],
];

export function guide(body, ctx) {
  const tabs = [
    ['tour', T('Tour', 'Tour')],
    ['refs', T('References', 'Referências')],
    ['eggs', T('Secrets', 'Segredos')],
  ];
  const nTour = TOUR.reduce((a, [, rows]) => a + rows.length, 0);
  const row = ([id, ic, name, desc]) => {
    const a = id ? APPS[id] : null;
    return `<tr><td class="gd-n"><img src="${icon(a ? a.icon : ic, 2)}" alt=""><b>${a ? a.label : name}</b></td><td>${desc}</td>
      <td class="gd-act">${a ? `<button type="button" class="btn7" data-open="${id}">${T('Open', 'Abrir')}</button>` : ''}</td></tr>`;
  };
  const panes = {
    tour: () => `<p class="gd-intro">${T('This is a CV that pretends to be a 2009 computer. Everything here is clickable: double-click the desktop icons (or tap them on a phone). Here is what each part does.', 'Este é um currículo que finge ser um computador de 2009. Tudo aqui é clicável: duplo clique nos ícones do desktop (ou um toque no celular). Abaixo, o que cada parte faz.')}</p>
      ${TOUR.map(([h, rows]) => `<div class="tm-sys">${h}</div><table class="tm-proc gd-t">${rows.map(row).join('')}</table>`).join('')}
      <p class="tm-cap">${T('Shortcuts: Ctrl+P prints the CV · Windows key opens Start · right-click the desktop for wallpaper, screen saver and System Info.', 'Atalhos: Ctrl+P imprime o CV · tecla Windows abre o Iniciar · clique direito no desktop para papel de parede, proteção de tela e Info do Sistema.')}</p>`,
    refs: () => `<div class="gd-search"><input type="search" placeholder="${T('Filter references...', 'Filtrar referências...')}" aria-label="${T('Filter references', 'Filtrar referências')}"></div>
      <table class="tm-proc gd-refs"><tr><th>${T('Reference', 'Referência')}</th><th>${T('Where it shows up', 'Onde aparece')}</th><th>${T('Origin', 'Origem')}</th></tr>
      ${REFS.map(([n, w, o, s]) => `<tr><td><b>${n}</b></td><td>${s ? `<a href="#" data-tab-go="eggs" class="gd-lock">🔒 ${T('a secret (see Secrets)', 'um segredo (veja Segredos)')}</a>` : w}</td><td>${o}</td></tr>`).join('')}
      </table>`,
    eggs: () => `<p class="gd-intro">${T('Spoilers. Click a card to reveal it.', 'Spoilers. Clique num cartão para revelar.')}</p>
      <div class="gd-eggs">${SECRETS.map(([n, how, what]) => `<button type="button" class="gd-egg"><b>${n}</b><span class="gd-sp"><i>${T('How', 'Como')}:</i> ${how}<br><i>${T('What happens', 'O que acontece')}:</i> ${what}</span></button>`).join('')}</div>`,
  };
  body.innerHTML = `
  <div class="taskmgr guide">
    <div class="menubar"><span>${T('File', 'Arquivo')}</span><span>${T('Options', 'Opções')}</span><span>${T('View', 'Exibir')}</span><span>${T('Help', 'Ajuda')}</span></div>
    <div class="tm-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" data-tab="${k}" role="tab">${l}</button>`).join('')}</div>
    <div class="tm-pane"></div>
    <div class="tm-status"><span>${T('Items in the tour', 'Itens no tour')}: ${nTour}</span><span>${T('References', 'Referências')}: ${REFS.length}</span><span>${T('Secrets', 'Segredos')}: ${SECRETS.length}</span></div>
  </div>`;
  const pane = body.querySelector('.tm-pane');
  const show = (k) => {
    ctx.arg = k;
    pane.innerHTML = panes[k]();
    pane.scrollTop = 0;
    body.querySelectorAll('.tm-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === k));
    const q = pane.querySelector('.gd-search input');
    q?.addEventListener('input', () => {
      const v = q.value.trim().toLowerCase();
      pane.querySelectorAll('.gd-refs tr').forEach((tr, i) => { if (i) tr.hidden = !!v && !tr.textContent.toLowerCase().includes(v); });
    });
  };
  body.querySelector('.tm-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) show(b.dataset.tab); });
  pane.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open]');
    if (o) { ctx.open(o.dataset.open); return; }
    const go = e.target.closest('[data-tab-go]');
    if (go) { e.preventDefault(); show(go.dataset.tabGo); return; }
    const egg = e.target.closest('.gd-egg');
    if (egg && !egg.classList.contains('open')) { egg.classList.add('open'); sfx('click'); }
  });
  ctx.onArg = (k) => show(Object.hasOwn(panes, k ?? '') ? k : 'tour');
  show(Object.hasOwn(panes, ctx.arg ?? '') ? ctx.arg : 'tour');
}

/* ---------------------------------------------------------------- oferta na primeira visita */
export async function offerGuide(open) {
  try {
    if (localStorage.getItem('cv.guideOffered')) return;
    localStorage.setItem('cv.guideOffered', '1');
  } catch { /* sem storage: oferece mesmo assim */ }
  const root = document.createElement('div');
  root.className = 'sd sd-offer';
  document.body.appendChild(root);
  const P = createPal(root);
  await P.enter();
  await P.say(T("Hi! I'm Floppy, the DemOS assistant.", 'Oi! Eu sou o Disquete, o assistente do DemOS.'), 1600);
  sfx('notify');
  const yes = await P.ask(
    T('First time here? Want a quick guide to everything on this site?', 'Primeira vez por aqui? Quer um guia rápido de tudo que tem no site?'),
    T('Show me the guide', 'Quero o guia'), T('Not now', 'Agora não'), { mark: '💾' },
  );
  if (yes) {
    open('guia');
    await P.say(T('Enjoy the tour!', 'Bom passeio!'), 1300);
  } else {
    await P.say(T('No problem. I live on the desktop as Guide if you change your mind.', 'Sem problema. Eu fico no desktop como Guia, se mudar de ideia.'), 2600);
  }
  await P.leave();
  root.remove();
}
