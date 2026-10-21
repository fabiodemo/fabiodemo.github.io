# fabio-cv

CV pessoal em forma de desktop retrô: Windows 7 (Aero, barra de tarefas, menu Iniciar, Aero Snap/Peek),
fórum estilo 2009 e pixel art, com fundo em three.js renderizado em baixa resolução.

- Inglês por padrão, português pelo botão EN/PT na barra (ou `?lang=pt` na URL).
- Todo o conteúdo fica em `src/data.js`, no formato `T('english', 'português')`. Preencha `email` lá se quiser mostrar.
- Avatar em `src/assets/` (avatar.webp e portrait.webp).
- Easter egg: código Konami (↑↑↓↓←→←→BA), `canoe` no Prompt ou o 🛶 escondido nos projetos acadêmicos.
- Janelas: README com currículo formatado, Fórum (CV completo), Projetos (GitHub), turtle.py, Figuras da tese,
  Gerenciador de Tarefas (gráficos reais), Skills, Certificados, Prompt, 5 jogos, Livro de visitas, Contato e Lixeira.
- `public/og.jpg` é a prévia para LinkedIn/WhatsApp. Depois do deploy, troque `content="og.jpg"` no `index.html`
  pela URL absoluta (ex.: `https://seudominio.com.br/og.jpg`), porque a maioria dos crawlers não aceita caminho relativo.

## Rodar no Fedora

```bash
sudo dnf install -y nodejs npm     # Fedora 40+ já traz Node 20/22
cd fabio-cv
npm install
npm run dev                        # http://localhost:5173
```

Build de produção:

```bash
npm run build                      # gera dist/
npm run preview                    # serve dist/ em http://localhost:4173
```

`dist/` é só HTML/CSS/JS estático: dá para jogar em qualquer hospedagem estática.

## Estrutura

| Arquivo | O que tem |
|---|---|
| `src/data.js` | perfil, experiência, projetos do GitHub, skills, artigo |
| `src/apps.js` | conteúdo de cada janela (fórum, explorer, cmd, etc.) |
| `src/i18n.js` | idioma (EN padrão, PT) |
| `src/games.js` | os 5 jogos: Tetris, Jogo da Velha (minimax), Campo Minado, Snake, Flappy Birb |
| `src/turtle.js` | turtle.py: TurtleBot3 com LIDAR em 6 estágios |
| `tech.html` + `src/tech.js` + `src/tech.css` | página separada estilo blog: emblemas (shields.io) da stack, Data Engineering em destaque, github-readme-stats e a cobrinha. Abre sozinha em `/tech.html` ou como janela "Stack (blog)" no desktop |
| `public/snake-dark.svg` | cópia local da cobrinha, usada se o raw.githubusercontent falhar |
| `blog.html` + `src/blog.js` + `src/blog.css` | blog (posts em Markdown) com a plaquinha de "em obras". Abre em `/blog.html` ou como janela "Blog" no desktop |
| `posts/*.md` | os posts do blog. `posts/_modelo.md` é o modelo (rascunho, só aparece no `npm run dev`) |
| `src/wallpaper.js` | papéis de parede em pixel art gerados em canvas (colinas, lago, cidade, peixe betta, mundo de blocos, pôr do sol 16-bit, hotel pixelado, cor sólida). Com um deles ativo, o three.js nem carrega |
| `src/screensaver.js` | protetores de tela: Bolhas, Mystify, Canos 3D, Viagem espacial, Texto 3D, Fotos (figuras da tese), PolyStation, Em branco |
| `src/personalize.js` | janela Personalização (botão direito no desktop > Personalizar, ou `desk.cpl` no cmd) |
| `src/lanhouse.js` | pasta Lan House com os clássicos dos anos 2000 (só mensagens, nenhum jogo ou arte de terceiros) |
| `src/paint.js` | paint.exe: lápis, pincel, spray, borracha, balde, conta-gotas, linha, retângulo e elipse, sem antialiasing; abre imagem e salva PNG |
| `src/canoe.js` | easter egg da canoagem |
| `src/taskmgr.js` | Gerenciador de Tarefas com gráficos reais (git log, runtime, custos, GitHub) |
| `src/resume.css` | currículo no padrão FAANG (janela README, impressão) |
| `public/figs/` | figuras da tese (webp), carregadas só quando abertas |
| `src/main.js` | boot, login, gerenciador de janelas, taskbar, menu Iniciar |
| `src/scene.js` | cena three.js (aurora com dithering, bolhas, blocos voxel) |
| `src/pixels.js` | sprites de pixel art desenhados como grades de caracteres |
| `src/style.css` | visual Aero/Win7, fórum, responsivo, impressão |

Atalhos: `#skip` na URL pula o boot. `Ctrl+P` (ou Imprimir CV) abre a impressão do currículo formatado; salve como PDF.

## Deploy

### Recomendado: Cloudflare Pages + domínio na Cloudflare

Site 100% estático: banda ilimitada no plano grátis, sem cobrança de egress, SSL automático.

1. Suba o projeto para um repo no GitHub.
2. Cloudflare > Workers & Pages > Create > Pages > Connect to Git. Preset **Vite**, build `npm run build`, output `dist`. Em Settings > Variables, `NODE_VERSION = 20` se o build reclamar da versão.
3. Domínio `.com`: Cloudflare > Domain Registration > Register Domains (preço de custo, sem markup). A zona já nasce na Cloudflare.
4. No projeto do Pages > Custom domains: adicione `fabiodemodarosa.com` e `www.fabiodemodarosa.com`. O certificado sai sozinho em alguns minutos.
5. SSL/TLS > Edge Certificates: ligue **Always Use HTTPS**.
6. Depois do domínio definido, troque `og.jpg` por `https://SEU-DOMINIO/og.jpg` no `og:image` de `index.html`, `tech.html` e `blog.html` (LinkedIn e WhatsApp só leem URL absoluta).

### `.com.br` redirecionando para o `.com`

1. Registre em registro.br (com CPF).
2. Na Cloudflare, Add a domain > `fabiodemodarosa.com.br` > plano Free. Ela mostra 2 nameservers.
3. No registro.br > domínio > DNS > "Alterar servidores DNS": cole os 2 nameservers da Cloudflare.
4. Na zona `.com.br` da Cloudflare, crie um registro `A @ 192.0.2.1` e um `CNAME www @`, ambos **proxied** (nuvem laranja). É só para o redirect ter onde rodar.
5. Rules > Redirect Rules > Create rule: quando o hostname contém `fabiodemodarosa.com.br`, redirecione (301, dinâmico) para `concat("https://fabiodemodarosa.com", http.request.uri.path)`, com "Preserve query string" ligado.

### Alternativas

- **GitHub Pages**: Settings > Pages > "GitHub Actions"; o workflow em `.github/workflows/deploy.yml` já está pronto. Limite de banda é "soft" (100 GB/mês), sobra para um CV.
- **VM (Oracle Free Tier)**: `npm run build`, copie `dist/` para `/var/www/cv` e use `deploy/Caddyfile` (Caddy emite o SSL sozinho). Dá mais trabalho de manutenção; só vale se quiser rodar backend.

## Blog (blog.html)

1. Copie `posts/_modelo.md` para `posts/AAAA-MM-DD-titulo.md` (o nome do arquivo vira o endereço: `blog.html#/p/AAAA-MM-DD-titulo`).
2. Preencha `title`, `date`, `tags`, `lang`, `summary` e tire o `draft: true`.
3. Imagens vão em `public/posts/` e entram no post como `![texto](posts/arquivo.webp)`.
4. `npm run dev` mostra também os rascunhos (marcados como DRAFT). `npm run build` publica só os que não são rascunho.

Sem nenhum post publicado, a página inicial do blog mostra a plaquinha grande de "em obras". Com posts, ela vira uma plaquinha pequena na lateral; para tirar, mude `UNDER_CONSTRUCTION` para `false` em `src/blog.js`.

## Página de stack (tech.html)

- Para mexer nas tecnologias, edite `B` (label, cor, logo do simple-icons) e as listas `MAIN` e `GROUPS` em `src/tech.js`.
- Alguns logos (AWS, Azure, Oracle, SQL Server, Java, Windows) saíram do simple-icons, então o shields.io mostra só o texto, igual no README do GitHub.
- Se o shields.io cair, cada badge vira um chip colorido com o nome. Se o github-readme-stats bater rate limit, aparece um aviso no lugar do card. Para não depender da instância pública, dá pra fazer deploy do seu próprio github-readme-stats na Vercel e trocar as URLs `STATS` e `LANGS`.

## Desempenho

- JS inicial ~40 KB gzip. three.js, jogos, turtle.py e o easter egg são chunks carregados sob demanda.
- Fundo three.js a 30 fps, em 1/3 da resolução (menos em telas grandes), congelado quando há janela maximizada ou a aba está oculta.
- Jogos e simulação param quando a janela é minimizada e redesenham devagar quando estão em segundo plano; fechar a janela encerra os loops.
