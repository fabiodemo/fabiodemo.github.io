// Pixel art desenhada à mão: cada sprite é uma grade de caracteres mapeada para a paleta.

const PAL = {
  k: '#14161c', K: '#000000', w: '#ffffff', g: '#c9ced6', G: '#8a919c', d: '#454b55',
  b: '#2f7fe0', B: '#0f3f8c', c: '#8fdcff', y: '#ffd95a', Y: '#d99a00', o: '#ff8c1a',
  r: '#e5483b', R: '#8e1f1b', n: '#46c04a', N: '#1f7a2a', p: '#a66bff', s: '#f2c48d',
  S: '#c78a4f', h: '#4a2f1b', t: '#2bd1a6',
};

const S = {
  computer: [
    '................',
    '.kkkkkkkkkkkkkk.',
    '.kggggggggggggk.',
    '.kgBBBBBBBBBBgk.',
    '.kgBbbbbbbbbBgk.',
    '.kgBbccbbbbbBgk.',
    '.kgBbcbbbbbbBgk.',
    '.kgBbbbbbbbbBgk.',
    '.kgBbbbbbbbtBgk.',
    '.kgBBBBBBBBBBgk.',
    '.kggggggggggnGk.',
    '.kkkkkkkkkkkkkk.',
    '......kGGk......',
    '....kkGGGGkk....',
    '...kggggggggk...',
    '...kkkkkkkkkk...',
  ],
  folder: [
    '................',
    '................',
    '.kkkkkk.........',
    'kyyyyyykkkkkkkk.',
    'kyyyyyywwwwwwwyk',
    'kYYYYYYYYYYYYYYk',
    'kYyyyyyyyyyyyyYk',
    'kYyyyyyyyyyyyyYk',
    'kYyyyyyyyyyyyyYk',
    'kYyyyyyyyyyyyyYk',
    'kYyyyyyyyyyyyyYk',
    'kYyyyyyyyyyyyyYk',
    'kYyyyyyyyyyyyyYk',
    'kYYYYYYYYYYYYYYk',
    'kkkkkkkkkkkkkkkk',
    '................',
  ],
  doc: [
    '..kkkkkkkkk.....',
    '..kwwwwwwwkk....',
    '..kwwwwwwwkgk...',
    '..kwbbbbwwkkkk..',
    '..kwwwwwwwwwwk..',
    '..kwGGGGGGGGwk..',
    '..kwwwwwwwwwwk..',
    '..kwGGGGGGGGwk..',
    '..kwwwwwwwwwwk..',
    '..kwGGGGGGwwwk..',
    '..kwwwwwwwwwwk..',
    '..kwGGGGGGGGwk..',
    '..kwwwwwwwwwwk..',
    '..kwwwwwwwwwwk..',
    '..kkkkkkkkkkkk..',
    '................',
  ],
  terminal: [
    '................',
    'GGGGGGGGGGGGGGGG',
    'GbbbbbbbbbbbgwrG',
    'GGGGGGGGGGGGGGGG',
    'GKKKKKKKKKKKKKKG',
    'GKgKKKKKKKKKKKKG',
    'GKKgKKKKKKKKKKKG',
    'GKKKgKKKKKKKKKKG',
    'GKKgKKKKKKKKKKKG',
    'GKgKKggggKKKKKKG',
    'GKKKKKKKKKKKKKKG',
    'GKKKKKKKKKKKKKKG',
    'GKKKKKKKKKKKKKKG',
    'GGGGGGGGGGGGGGGG',
    '................',
    '................',
  ],
  globe: [
    '................',
    '.....kkkkkk.....',
    '...kkbbbbbbkk...',
    '..kbcnnbbbbbbk..',
    '.kbnnnnbbbnnbbk.',
    '.kbnnnbbbnnnnbk.',
    'kbbbnnbbbbnnnbbk',
    'kbbbbnbbbbbnbbbk',
    'kbbbbbbbnnbbbbbk',
    'kbbnbbbnnnnbbbbk',
    '.kbnnbbbnnnbbbk.',
    '.kbbnbbbbnbbbbk.',
    '..kbbbbbbbbbbk..',
    '...kkbbbbbbkk...',
    '.....kkkkkk.....',
    '................',
  ],
  trash: [
    '................',
    '.....kkkkkk.....',
    '..kkkggggggkkk..',
    '.kggggggggggggk.',
    '.kkkkkkkkkkkkkk.',
    '..kcwcccwcccwk..',
    '..kcwcccwcccwk..',
    '..kcwcccwcccwk..',
    '..kcwcnnwcccwk..',
    '..kcwnccncccwk..',
    '..kcwcccwcncwk..',
    '..kcwcccwnccwk..',
    '..kcwcccwcccwk..',
    '...kcwccwccwk...',
    '...kkkkkkkkkk...',
    '................',
  ],
  book: [
    '................',
    '..kkkkkkkkkkk...',
    '..kRrrrrrrrrkk..',
    '..kRrrrrrrrrkwk.',
    '..kRrryyyyrrkwk.',
    '..kRrryyyyrrkwk.',
    '..kRrrrrrrrrkwk.',
    '..kRrrrrrrrrkwk.',
    '..kRrrrrrrrrkwk.',
    '..kRrrrrrrrrkwk.',
    '..kRrrrrrrrrkwk.',
    '..kRrrrrrrrrkwk.',
    '..kRrrrrrrrrkwk.',
    '..kkkkkkkkkkkwk.',
    '...kwwwwwwwwwwk.',
    '....kkkkkkkkkkk.',
  ],
  gear: [
    '................',
    '.......kk.......',
    '...kk.kggk.kk...',
    '...kgkkggkkgk...',
    '....kggggggk....',
    '..kkgggkkgggkk..',
    '.kggggkGGkggggk.',
    '.kgggkGddGkgggk.',
    '.kgggkGddGkgggk.',
    '.kggggkGGkggggk.',
    '..kkgggkkgggkk..',
    '....kggggggk....',
    '...kgkkggkkgk...',
    '...kk.kggk.kk...',
    '.......kk.......',
    '................',
  ],
  mail: [
    '................',
    '................',
    '................',
    '.kkkkkkkkkkkkkk.',
    '.kkwwwwwwwwwwkk.',
    '.kwkwwwwwwwwkwk.',
    '.kwwkwwwwwwkwwk.',
    '.kwwwkwwwwkwwwk.',
    '.kwwwwkkkkwwwwk.',
    '.kwwwwwwwwwwwwk.',
    '.kwwwwwwwwwwwwk.',
    '.kwwwwwwwwwwwwk.',
    '.kkkkkkkkkkkkkk.',
    '................',
    '................',
    '................',
  ],
  avatar: [
    '................',
    '.....hhhhhh.....',
    '....hhhhhhhh....',
    '...hhhhhhhhhh...',
    '...hssssssssh...',
    '...skkkkkkkks...',
    '...skcksskcks...',
    '...skkksskkks...',
    '...ssssssssss...',
    '....ssskksss....',
    '.....ssssss.....',
    '....bbbSSbbb....',
    '..bbbbbwwbbbbb..',
    '.bbbbbbwwbbbbbb.',
    '.bbbbbbbbbbbbbb.',
    '.bbbbbbbbbbbbbb.',
  ],
  repo: [
    '................',
    '..kkkkkkkkkkk...',
    '..kNnnnnnnnnkk..',
    '..kNnnnnnnnnkwk.',
    '..kNnwwnnwwnkwk.',
    '..kNnwwnnwwnkwk.',
    '..kNnnwnnwnnkwk.',
    '..kNnnwnwnnnkwk.',
    '..kNnnwwnnnnkwk.',
    '..kNnwwnnnnnkwk.',
    '..kNnwwnnnnnkwk.',
    '..kNnnnnnnnnkwk.',
    '..kNnnnnnnnnkwk.',
    '..kkkkkkkkkkkwk.',
    '...kwwwwwwwwwwk.',
    '....kkkkkkkkkkk.',
  ],
  star: [
    '.......kk.......',
    '......kyyk......',
    '......kyyk......',
    '.....kyyyyk.....',
    'kkkkkkyyyyykkkkk',
    'kyyyyyyyyyyyyyyk',
    '.kyyyyyyyyyyyyk.',
    '..kyyyyyyyyyyk..',
    '...kyyyyyyyyk...',
    '...kyyyyyyyyk...',
    '..kyyyykkyyyyk..',
    '..kyyykk.kyyyk..',
    '.kyyyk....kyyyk.',
    '.kyyk......kyyk.',
    '.kkk........kkk.',
    '................',
  ],
  speaker: [
    '........',
    '...k..w.',
    '..kk.w.w',
    'kkwk..w.',
    'kkwk..w.',
    '..kk.w.w',
    '...k..w.',
    '........',
  ],
  speakerOff: [
    '........',
    '...k....',
    '..kk.r.r',
    'kkwk..r.',
    'kkwk..r.',
    '..kk.r.r',
    '...k....',
    '........',
  ],
  mines: [
    '................',
    '.......k........',
    '..k....k....k...',
    '...k.kkkkk.k....',
    '....kkkkkkk.....',
    '...kkwwkkkkk....',
    '...kkwwkkkkk....',
    'kkkkkkkkkkkkkkk.',
    '...kkkkkkkkk....',
    '...kkkkkkkkk....',
    '....kkkkkkk.....',
    '...k.kkkkk.k....',
    '..k....k....k...',
    '.......k........',
    '.......k........',
    '................',
  ],
  snake: [
    '................',
    '................',
    '..........kkkkk.',
    '.........knnnnnk',
    '.........knwknnk',
    '.........knnnnnk',
    '..kkkkkk..knnnk.',
    '.knnnnnnk.knnnk.',
    '.knnnnnnnkknnnk.',
    '.knnkkknnnnnnk..',
    '.knnk..knnnnk...',
    '.knnk...kkkk....',
    '.knnnk..........',
    '..knnnkkk.......',
    '...kkkk.........',
    '................',
  ],
  flappy: [
    '................',
    '................',
    '.....kkkkk......',
    '....kyyykwk.....',
    '...kyyyykwwk....',
    '..kwwyyykwkwk...',
    '.kwwwwyykwwwk...',
    '.kwwwwwykkkkkk..',
    '.kywwwykorrrrrk.',
    '..kyyykorkkkkk..',
    '...kkyyyorrrrk..',
    '.....kkkkkkk....',
    '................',
    '................',
    '................',
    '................',
  ],
  cert: [
    '................',
    '.kkkkkkkkkkkkkk.',
    '.kwwwwwwwwwwwwk.',
    '.kwbbbbbbbbbbwk.',
    '.kwwwwwwwwwwwwk.',
    '.kwGGGGGGGGwwwk.',
    '.kwwwwwwwwwwwwk.',
    '.kwGGGGGGwwwwwk.',
    '.kwwwwwwwkkkkwk.',
    '.kwwwwwwkrrrrkk.',
    '.kwwwwwwkrryrkk.',
    '.kkkkkkkkrrrrkk.',
    '........kkrkrk..',
    '........krk.krk.',
    '........kk...kk.',
    '................',
  ],
  turtlebot: [
    '................',
    '.....kkkkkk.....',
    '...kkddddddkk...',
    '..kddddddddddk..',
    '.kddddkkkkddddk.',
    '.kdddkcccckdddk.',
    'GGdddkcwwckdddGG',
    'GGdddkcwwckdddGG',
    'GGdddkcccckdddGG',
    'GGddddkkkkddddGG',
    '.kddddddddddddk.',
    '..kddddrrddddk..',
    '...kkddddddkk...',
    '.....kkkkkk.....',
    '................',
    '................',
  ],
  canoe: [
    '................',
    '.......kk.......',
    '......kssk......',
    '......kssk......',
    '.......kk..k....',
    '......kbbk.k....',
    '.....kbbbbkk....',
    '.....kbbbbk.....',
    '...........k....',
    'krrrrrrrrrrrrrrk',
    '.krrrrrrrrrrrrk.',
    '..kkkkkkkkkkkk.k',
    'cc.cccc.ccccc.kc',
    '.ccc..cccc..ccck',
    'c..cccc..cccc...',
    '................',
  ],
  taskmgr: [
    '................',
    'kkkkkkkkkkkkkkkk',
    'kGGGGGGGGGGGGGGk',
    'kGKKKKKKKKKKKKGk',
    'kGKKKKKKKKKKKKGk',
    'kGKKKKKKKKKnKKGk',
    'kGKKKKnKKKnKKKGk',
    'kGKKKnKnKnKKKKGk',
    'kGKnnKKKnKKKKKGk',
    'kGnKKKKKKKKKKKGk',
    'kGKKKKKKKKKKKKGk',
    'kGGGGGGGGGGGGGGk',
    'kkkkkkkkkkkkkkkk',
    '......kGGk......',
    '....kkkkkkkk....',
    '................',
  ],
  photo: [
    '................',
    '.kkkkkkkkkkkkkk.',
    '.kcccccccccccck.',
    '.kcccyyccccccck.',
    '.kcccyyccccccck.',
    '.kcccccccccccck.',
    '.kccccccnccccck.',
    '.kcccccnnncccck.',
    '.kccnccnnnnccck.',
    '.kcnnnnnnnnnnck.',
    '.knnnnnnnnnnnnk.',
    '.kNNNNNNNNNNNNk.',
    '.kkkkkkkkkkkkkk.',
    '................',
    '................',
    '................',
  ],
  chest: [
    '................',
    '..kkkkkkkkkkkk..',
    '.kSSSSSSSSSSSSk.',
    '.kShhhhhhhhhhSk.',
    '.kShhhhhhhhhhSk.',
    '.kkkkkkkkkkkkkk.',
    '.kSSSSSggSSSSSk.',
    '.kShhhhgGhhhhSk.',
    '.kShhhhggShhhSk.',
    '.kShhhhhhhhhhSk.',
    '.kShhhhhhhhhhSk.',
    '.kSSSSSSSSSSSSk.',
    '.kkkkkkkkkkkkkk.',
    '................',
    '................',
    '................',
  ],
  netTray: [
    '.......w',
    '......ww',
    '.....www',
    '....wwww',
    '...wwwww',
    '..wwwwww',
    '.wwwwwww',
    'wwwwwwww',
  ],
};

// Tetris: cada letra vira um bloco 4x4 com brilho e sombra
S.tetris = (() => {
  const map = ['ppp.', '.p..', 'r.yy', 'rryy'];
  const out = Array.from({ length: 16 }, () => Array(16).fill('.'));
  map.forEach((row, cy) => [...row].forEach((c, cx) => {
    if (c === '.') return;
    const cell = ['w' + c + c + 'k', c + c + c + 'k', c + c + c + 'k', 'kkkk'];
    cell.forEach((r, y) => [...r].forEach((ch, x) => { out[cy * 4 + y][cx * 4 + x] = ch; }));
  }));
  return out.map((r) => r.join(''));
})();

// Jogo da velha: grade com um X e um O
S.velha = (() => {
  const out = Array.from({ length: 16 }, () => Array(16).fill('w'));
  for (let i = 0; i < 16; i++) { out[5][i] = out[10][i] = 'G'; out[i][5] = out[i][10] = 'G'; }
  const X = (ox, oy) => [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]].forEach(([x, y]) => { out[oy + y][ox + x] = 'r'; });
  const O = (ox, oy) => [[1, 0], [2, 0], [0, 1], [3, 1], [0, 2], [3, 2], [1, 3], [2, 3]].forEach(([x, y]) => { out[oy + y][ox + x] = 'b'; });
  X(1, 1); O(6, 6); X(12, 12); O(11, 0); X(1, 12);
  return out.map((r) => r.join(''));
})();

// Paint: paleta de madeira com pincel
S.paint = (() => {
  const rows = [
    '................',
    '................',
    '................',
    '...kkkkkkk......',
    '..kSSSSSSSkk....',
    '.kSrrSSbbSSSk...',
    '.kSrrSSbbSSSSk..',
    'kSSSSSSSSSyySk..',
    'kSnnSSkkSSyySk..',
    'kSnnSk..kSSSSk..',
    'kSSSSk..kSppSk..',
    '.kSSSSkkSSppSk..',
    '..kSSSSSSSSSk...',
    '...kkkkkkkkk....',
    '................',
    '................',
  ].map((r) => [...r]);
  [[15, 0, 'h'], [14, 1, 'h'], [13, 2, 'h'], [12, 3, 'h'], [11, 4, 'g'], [10, 5, 'b'], [9, 6, 'b'], [14, 0, 'k'], [15, 1, 'k'], [13, 1, 'k'], [14, 2, 'k'], [12, 2, 'k'], [13, 3, 'k'], [11, 3, 'k'], [12, 4, 'k'], [10, 4, 'k'], [11, 5, 'k'], [9, 5, 'k'], [10, 6, 'k'], [8, 6, 'k'], [9, 7, 'k']]
    .forEach(([x, y, c]) => { rows[y][x] = c; });
  return rows.map((r) => r.join(''));
})();

S.worker = [
  '................',
  '......yyyy......',
  '.....yyyyyy.....',
  '....YYYYYYYY....',
  '......ssss......',
  '......skks......',
  '......ssss......',
  '.....oooooo...k.',
  '....oooooooo.k..',
  '...ss.oooo.sk...',
  '......oooo.k....',
  '......BBBB.k....',
  '......B..B.k....',
  '.....BB..BBG....',
  '....kk....GGG...',
  '................',
];

S.gamepad = [
  '................',
  '................',
  '................',
  '...kkkk..kkkk...',
  '..kGGGGkkGGGGk..',
  '.kGgggggggggGGk.',
  '.kGgkgggggrgGGk.',
  'kGgkkkgggrgbgGGk',
  'kGggkggggynggGGk',
  'kGgggggggggyggGk',
  'kGggggkkkkgggGGk',
  'kGgggk....kgggGk',
  '.kGGk......kGGk.',
  '..kk........kk..',
  '................',
  '................',
];

// Badges 8x8 para pastas e para o Gerenciador de Dispositivos
const B = {
  db: ['.kkkkkk.', 'kcbbbbck', 'kkccccKk', 'kbbbbbbk', 'kkbbbbkk', 'kbbbbbbk', 'kkbbbbkk', '.kkkkkk.'],
  robot: ['...kk...', '.kkkkkk.', 'kggggggk', 'kgcggcgk', 'kggggggk', 'kgkkkkgk', 'kkkkkkkk', '.k....k.'],
  net: ['..kkkk..', '.kbnbbk.', 'kbnnbbnk', 'kbbbbnnk', 'knbbbbbk', 'kbnnbbbk', '.kbnnbk.', '..kkkk..'],
  chart: ['kkkkkkkk', 'kwwwwwwk', 'kwwwwnwk', 'kwwwnnwk', 'kwbwnnwk', 'kwbrnnwk', 'kwbrnnwk', 'kkkkkkkk'],
  game: ['........', '.kkkkkk.', 'kGGGGGGk', 'kGwGGrGk', 'kwwwGGGk', 'kGwGrGGk', '.kk..kk.', '........'],
  cpu: ['.k.k.k..', 'kkkkkkkk', '.kgggk..', 'kkgbgkkk', '.kgggk..', 'kkkkkkkk', '.k.k.k..', '........'],
  disk: ['kkkkkkkk', 'kGGGGGGk', 'kGgggGGk', 'kGgkgGGk', 'kGgggGGk', 'kGGGGGnk', 'kkkkkkkk', '........'],
  gear: ['..k..k..', '.kkggkk.', 'kggkkggk', 'kgk..kgk', 'kgk..kgk', 'kggkkggk', '.kkggkk.', '..k..k..'],
  cloud: ['........', '...kkk..', '..kwwwk.', '.kkwwwwk', 'kwwwwwwk', 'kwwwwwwk', '.kkkkkk.', '........'],
  lock: ['..kkkk..', '.kk..kk.', '.k....k.', 'kkkkkkkk', 'kyyyyyyk', 'kyyKKyyk', 'kyyyyyyk', 'kkkkkkkk'],
  check: ['.......k', '......kn', '.....knk', 'k...knk.', 'nk.knk..', 'knknk...', '.knk....', '..k.....'],
  coin: ['..kkkk..', '.kyyyyk.', 'kyyYYyyk', 'kyYyyyyk', 'kyyYYyyk', 'kyyyyYyk', '.kyYYyk.', '..kkkk..'],
  clock: ['..kkkk..', '.kwwwwk.', 'kwwkwwwk', 'kwwkwwwk', 'kwwkkkwk', 'kwwwwwwk', '.kwwwwk.', '..kkkk..'],
  chip: ['k.k.k.k.', 'kkkkkkkk', '.kNNNNk.', 'kkNttNkk', '.kNttNk.', 'kkNNNNkk', 'kkkkkkkk', 'k.k.k.k.'],
  code: ['........', '.k....k.', 'k..k...k', 'k..k...k', 'k.k....k', '.k....k.', '........', '........'],
  pc: ['kkkkkkkk', 'kbbbbbbk', 'kbccbbbk', 'kbbbbbbk', 'kkkkkkkk', '...kk...', '.kkkkkk.', '........'],
  sword: ['......kk', '.....kgk', '....kgk.', '.k.kgk..', '..kgk...', '..kk....', '.k..k...', 'k.......'],
  gem: ['..kkkk..', '.kccbbk.', 'kccbbbbk', 'kbbbbbbk', '.kbbbbk.', '..kbbk..', '...kk...', '........'],
  bomb: ['.....k..', '....k.y.', '..kkk...', '.kddkk..', 'kdgdkkk.', 'kddddkk.', '.kddkk..', '..kkk...'],
  heart: ['.kk.kk..', 'krrkrrk.', 'krwrrrk.', 'krrrrrk.', '.krrrk..', '..krk...', '...k....', '........'],
  star8: ['...k....', '..kyk...', 'kkkyykkk', 'kyyyyyyk', '.kyyyyk.', '.kykkyk.', 'kyk..kyk', 'kk....kk'],
  block: ['kkkkkkkk', 'knnNnnNk', 'kNnnnNnk', 'kShSShSk', 'kSShSSSk', 'khSSShSk', 'kSSSShSk', 'kkkkkkkk'],
  cart: ['kkkkkkkk', 'kggggggk', 'kgddddgk', 'kgddddgk', 'kggggggk', 'kgGkkGgk', 'kgGkkGgk', 'kkkkkkkk'],
  disc: ['..kkkk..', '.kgcgck.', 'kgcwwgck', 'kcwkkwgk', 'kgwkkwck', 'kcgwwcgk', '.kcgcgk.', '..kkkk..'],
  cone: ['...oo...', '...oo...', '..owwo..', '..oooo..', '.owwwwo.', '.oooooo.', 'kkkkkkkk', '........'],
  pencil: ['......kk', '.....kyk', '....kyyk', '...kyyk.', '..kyyk..', '.ksyk...', '.kdk....', 'kk......'],
  brush: ['......kk', '.....khk', '....khk.', '...khk..', '..kgk...', '.krrk...', 'krrk....', 'kk......'],
  spray: ['.k.k....', 'k.k.....', '.k.kkkk.', '...kggk.', '..kGGGGk', '..kGddGk', '..kGddGk', '..kkkkkk'],
  eraser: ['........', '....kkkk', '...kppwk', '..kppwkk', '.kwwwkk.', 'kwwwkk..', 'kkkkk...', '........'],
  bucket: ['...k....', '..kgk...', '.kgggk..', 'kgggggkb', '.kgggk.b', '..kgk..b', '...k...b', '.......b'],
  picker: ['......kk', '.....kkk', '....kkk.', '...kgk..', '..kgk...', '.kgk....', 'kbk.....', 'kk......'],
  line: ['k.......', '.k......', '..k.....', '...k....', '....k...', '.....k..', '......k.', '.......k'],
  rect: ['kkkkkkkk', 'k......k', 'k......k', 'k......k', 'k......k', 'k......k', 'k......k', 'kkkkkkkk'],
  oval: ['..kkkk..', '.k....k.', 'k......k', 'k......k', 'k......k', 'k......k', '.k....k.', '..kkkk..'],
};

function norm(rows, size) {
  return rows.map((r) => (r + '.'.repeat(size)).slice(0, size));
}

function drawGrid(ctx, rows, ox, oy, px) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      ctx.fillStyle = PAL[ch] || '#f0f';
      ctx.fillRect((ox + x) * px, (oy + y) * px, px, px);
    }
  });
}

const cache = new Map();

/** Retorna um dataURL do sprite. name pode ser "folder+db" para sobrepor um badge. */
export function icon(name, scale = 2) {
  const key = name + '@' + scale;
  if (cache.has(key)) return cache.get(key);
  const [base, badge] = name.split('+');
  let rows = S[base];
  let size = 16;
  if (!rows && B[base]) { rows = B[base]; size = 8; }
  if (!rows) rows = S.doc;
  const c = document.createElement('canvas');
  c.width = c.height = size * scale;
  const ctx = c.getContext('2d');
  drawGrid(ctx, norm(rows, size), 0, 0, scale);
  if (badge && B[badge]) drawGrid(ctx, norm(B[badge], 8), 8, 8, scale);
  const url = c.toDataURL();
  cache.set(key, url);
  return url;
}

/** Orb pixelado com dithering (logo do boot e do botão Iniciar). */
export function orb(size = 24, scale = 4) {
  const key = 'orb' + size + scale;
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = size * scale;
  const ctx = c.getContext('2d');
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const ramp = ['#06224f', '#0d3f8a', '#1a64c4', '#2f8bf0', '#6fc0ff', '#c9ecff'];
  const r = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - r, dy = y + 0.5 - r;
      const d = Math.hypot(dx, dy);
      if (d > r) continue;
      // luz vinda de cima à esquerda + brilho na borda inferior
      let v = 0.35 + 0.45 * (1 - (dy + r) / size) + 0.25 * Math.max(0, (dy / r) - 0.4) * 2;
      v += -0.15 * (d / r);
      const th = (bayer[(y % 4) * 4 + (x % 4)] / 16 - 0.5) * 0.18;
      const idx = Math.max(0, Math.min(ramp.length - 1, Math.round((v + th) * (ramp.length - 1))));
      ctx.fillStyle = d > r - 1 ? '#041633' : ramp[idx];
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  // reflexo superior
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let y = 2; y < size * 0.4; y++) {
    const half = Math.sqrt(Math.max(0, (r * 0.75) ** 2 - (y - r * 0.55) ** 2)) * 0.9;
    for (let x = Math.ceil(r - half); x < r + half; x++) ctx.fillRect(x * scale, y * scale, scale, scale);
  }
  // cilindro de dados no centro
  const cyl = ['.kkkkkkk.', 'kwwwwwwwk', 'kkwwwwwkk', 'kwkkkkkwk', 'kwwwwwwwk', 'kkwwwwwkk', 'kwkkkkkwk', 'kwwwwwwwk', '.kkkkkkk.'];
  const cx = Math.round(r - 4.5), cy = Math.round(r - 3.5);
  cyl.forEach((row, yy) => [...row].forEach((ch, xx) => {
    if (ch === '.') return;
    ctx.fillStyle = ch === 'w' ? '#ffffff' : '#0b2f6b';
    ctx.fillRect((cx + xx) * scale, (cy + yy) * scale, scale, scale);
  }));
  const url = c.toDataURL();
  cache.set(key, url);
  return url;
}

export function favicon() {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = orb(16, 2);
  document.head.appendChild(link);
}
