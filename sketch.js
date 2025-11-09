let quiz;
let ui;
let loading = true;
let particles = [];
let seaCreatures = [];
 
async function loadQuestionsFromCSV(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('no csv');
    const text = await res.text();
    const lines = text.trim().split(/\r?\n/);
    const header = lines.shift().split(',').map(h => h.trim());
    return lines.map(l => {
      const cols = l.split(',').map(c => c.trim());
      const obj = {};
      header.forEach((h, i) => obj[h] = cols[i] ?? '');
      return obj;
    });
  } catch (e) {
    return null;
  }
}
 
function defaultQuestions() {
  return [
    { question: "1+1=?", a: "1", b: "2", c: "3", d: "4", answer: "b" },
    { question: "太陽從哪邊昇起？", a: "東", b: "西", c: "南", d: "北", answer: "a" },
    { question: "水的沸點(攝氏)？", a: "0", b: "50", c: "100", d: "200", answer: "c" },
  ];
}
 
function setup() {
  const canvas = createCanvas(800, 520);
  canvas.parent('quiz-container');
  textFont('Noto Sans TC', 16);
  ui = new UI();
  noLoop();
  (async () => {
    let qs = await loadQuestionsFromCSV('questions.csv');
    if (!qs) qs = defaultQuestions();
    quiz = new Quiz(qs);
    loading = false;
    loop();
  })();
}
 
function draw() {
  background(162, 210, 255); // a2d2ff
  if (loading) {
    fill(2, 48, 71); // 改為深藍色 #023047
    textAlign(CENTER, CENTER);
    textSize(20);
    text('載入題庫中...', width / 2, height / 2);
    return;
  }
  ui.render();
  ui.renderSeaCreatures();
}
 
function mouseMoved() { ui.onMouseMove(mouseX, mouseY); }
function mousePressed() { ui.onMousePressed(mouseX, mouseY); }