const EVENTS = [
  { text: "群里有人 @ 你，让你明早前交材料。", emoji: "📄", type: "now", hint: "有明确截止时间，而且现在能处理。" },
  { text: "手机只剩 5% 电，你还在外面。", emoji: "🔋", type: "now", hint: "这是会马上影响你的现实问题。" },
  { text: "明天早上要用的工牌找不到了。", emoji: "🪪", type: "now", hint: "拖到明早只会更慌。" },
  { text: "锅里还开着火，你突然想起没关。", emoji: "🍳", type: "now", hint: "先处理安全问题，其他都靠后。" },
  { text: "快递员说十分钟后到，但你还没下楼。", emoji: "📦", type: "now", hint: "窗口很短，现在处理最省事。" },

  { text: "想整理手机里两万张旧照片。", emoji: "🖼️", type: "later", hint: "重要，但不需要现在把自己榨干。" },
  { text: "想给房间重新规划收纳。", emoji: "🧺", type: "later", hint: "值得做，但可以排进日程。" },
  { text: "有个不急的表格，下周才交。", emoji: "📊", type: "later", hint: "安排时间比临时硬扛更聪明。" },
  { text: "突然想学一门新软件。", emoji: "💻", type: "later", hint: "好想法，先记下，不必今晚通关。" },
  { text: "准备买新耳机，想慢慢做功课。", emoji: "🎧", type: "later", hint: "这是计划项，不是火警。" },

  { text: "路人看了你一眼，你开始猜他是不是讨厌你。", emoji: "👀", type: "drop", hint: "无法验证的脑补，不值得占内存。" },
  { text: "朋友回了一个“嗯”，你反复分析了半小时。", emoji: "💬", type: "drop", hint: "一个字不该霸占整个晚上。" },
  { text: "刷到别人晒成功，你突然觉得自己一无是处。", emoji: "📱", type: "drop", hint: "比较焦虑不是待办事项。" },
  { text: "有人随口评价了你的发型，你越想越气。", emoji: "💇", type: "drop", hint: "别人的嘴，不是你的全天候后台程序。" },
  { text: "三年前一次尴尬聊天突然在脑子里重播。", emoji: "🫠", type: "drop", hint: "旧录像带可以关掉。" },
  { text: "同事语气有点怪，你开始猜是不是针对你。", emoji: "🧩", type: "drop", hint: "没有证据的推理先别判刑。" },

  { text: "明天下午要开会，但资料还差最后一页。", emoji: "🗂️", type: "later", hint: "不是现在就爆炸，但值得排入今天或明早。" },
  { text: "刚收到银行卡异常提醒。", emoji: "🏦", type: "now", hint: "涉及账户安全，优先确认。" },
  { text: "突然想起别人半年前说你“有点笨”。", emoji: "🪨", type: "drop", hint: "过期评价没有续费必要。" },
  { text: "周末想洗床单，但今天已经很累。", emoji: "🛏️", type: "later", hint: "安排到周末就好，不必现在硬撑。" }
];

const screens = {
  start: document.getElementById("startScreen"),
  game: document.getElementById("gameScreen"),
  result: document.getElementById("resultScreen")
};

const startButton = document.getElementById("startButton");
const againButton = document.getElementById("againButton");
const backButton = document.getElementById("backButton");
const breatheButton = document.getElementById("breatheButton");
const clearButton = document.getElementById("clearButton");
const actionButtons = Array.from(document.querySelectorAll(".action-button"));

const timeText = document.getElementById("timeText");
const scoreText = document.getElementById("scoreText");
const comboText = document.getElementById("comboText");
const clutterText = document.getElementById("clutterText");
const clutterBar = document.getElementById("clutterBar");
const energyText = document.getElementById("energyText");
const energyBar = document.getElementById("energyBar");

const eventCard = document.getElementById("eventCard");
const eventEmoji = document.getElementById("eventEmoji");
const eventTag = document.getElementById("eventTag");
const eventText = document.getElementById("eventText");
const eventHint = document.getElementById("eventHint");
const feedback = document.getElementById("feedback");

const finalScore = document.getElementById("finalScore");
const bestCombo = document.getElementById("bestCombo");
const correctCount = document.getElementById("correctCount");
const finalClutter = document.getElementById("finalClutter");
const resultTitle = document.getElementById("resultTitle");
const resultSummary = document.getElementById("resultSummary");
const resultQuote = document.getElementById("resultQuote");
const resultEmoji = document.getElementById("resultEmoji");

let timerId = null;
let secondsLeft = 45;
let score = 0;
let combo = 0;
let bestComboValue = 0;
let correct = 0;
let clutter = 0;
let energy = 0;
let currentEvent = null;
let lastEventText = "";
let locked = false;
let paused = false;
let breatheUsed = false;
let clearUsed = false;

function showScreen(name) {
  Object.values(screens).forEach((screen) => {
    screen.classList.remove("screen-active");
  });
  screens[name].classList.add("screen-active");
}

function resetGame() {
  clearInterval(timerId);
  timerId = null;
  secondsLeft = 45;
  score = 0;
  combo = 0;
  bestComboValue = 0;
  correct = 0;
  clutter = 0;
  energy = 0;
  currentEvent = null;
  lastEventText = "";
  locked = false;
  paused = false;
  breatheUsed = false;
  clearUsed = false;
  breatheButton.disabled = false;
  breatheButton.textContent = "🌿 呼吸三秒";
  const breatheSmall = document.createElement("small");
  breatheSmall.textContent = "本局一次，暂停并减轻堵塞";
  breatheButton.appendChild(breatheSmall);
  clearButton.disabled = true;
  clearButton.classList.remove("ready");
  screens.game.classList.remove("paused");
  feedback.textContent = "准备分拣";
  feedback.className = "feedback";
  updateHud();
}

function startGame() {
  resetGame();
  showScreen("game");
  nextEvent();

  timerId = setInterval(() => {
    if (paused) return;
    secondsLeft -= 1;
    updateHud();
    if (secondsLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function nextEvent() {
  if (secondsLeft <= 0) return;
  let pick = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  let guard = 0;

  while (pick.text === lastEventText && guard < 10) {
    pick = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    guard += 1;
  }

  currentEvent = pick;
  lastEventText = pick.text;
  eventCard.classList.remove("card-out");
  eventEmoji.textContent = pick.emoji;
  eventTag.textContent = "新烂事";
  eventText.textContent = pick.text;
  eventHint.textContent = "先判断：现在处理、安排以后，还是直接放下？";
}

function handleChoice(choice) {
  if (locked || paused || !currentEvent) return;
  locked = true;

  const isCorrect = choice === currentEvent.type;

  if (isCorrect) {
    combo += 1;
    correct += 1;
    bestComboValue = Math.max(bestComboValue, combo);
    const multiplier = 1 + Math.floor(combo / 4) * 0.25;
    score += Math.round(100 * multiplier);
    energy = Math.min(100, energy + 14 + Math.min(combo, 8));
    clutter = Math.max(0, clutter - 3);
    feedback.textContent = combo >= 4 ? `漂亮！连续分对 ${combo} 次` : "分得好，脑内省下一格空间";
    feedback.className = "feedback feedback-good";
    eventCard.classList.add("flash");
    setTimeout(() => eventCard.classList.remove("flash"), 330);
  } else {
    combo = 0;
    score = Math.max(0, score - 35);
    clutter = Math.min(100, clutter + 16);
    feedback.textContent = getWrongFeedback(currentEvent.type);
    feedback.className = "feedback feedback-bad";
    eventCard.classList.add("shake");
    setTimeout(() => eventCard.classList.remove("shake"), 280);
  }

  if (energy >= 100 && !clearUsed) {
    clearButton.disabled = false;
    clearButton.classList.add("ready");
  }

  updateHud();
  eventCard.classList.add("card-out");

  if (clutter >= 100) {
    setTimeout(endGame, 280);
    return;
  }

  setTimeout(() => {
    nextEvent();
    locked = false;
  }, 300);
}

function getWrongFeedback(correctType) {
  if (correctType === "now") return "这件事真会马上影响你，别往后拖";
  if (correctType === "later") return "它值得安排，但没必要现在把自己烧干";
  return "这类内耗不该进入待办清单";
}

function useBreathe() {
  if (breatheUsed || paused) return;
  breatheUsed = true;
  paused = true;
  breatheButton.disabled = true;
  screens.game.classList.add("paused");
  feedback.textContent = "吸气……呼气……先把脑袋从红温区拉回来";
  feedback.className = "feedback feedback-good";

  let remaining = 3;
  breatheButton.textContent = `🌿 ${remaining}`;

  const pauseTimer = setInterval(() => {
    remaining -= 1;
    breatheButton.textContent = `🌿 ${remaining}`;
    if (remaining <= 0) {
      clearInterval(pauseTimer);
      clutter = Math.max(0, clutter - 28);
      updateHud();
      paused = false;
      screens.game.classList.remove("paused");
      breatheButton.textContent = "🌿 已用过";
      const small = document.createElement("small");
      small.textContent = "脑内堵塞已下降";
      breatheButton.appendChild(small);
      feedback.textContent = "好一点了，继续分";
    }
  }, 1000);
}

function useClear() {
  if (clearUsed || energy < 100 || locked || paused) return;
  clearUsed = true;
  energy = 0;
  clutter = Math.max(0, clutter - 40);
  score += 350;
  combo += 3;
  bestComboValue = Math.max(bestComboValue, combo);
  clearButton.disabled = true;
  clearButton.classList.remove("ready");
  feedback.textContent = "🧹 清空成功！这一波不让烂事进脑子";
  feedback.className = "feedback feedback-good";
  eventCard.classList.add("card-out");
  updateHud();

  locked = true;
  setTimeout(() => {
    nextEvent();
    locked = false;
  }, 450);
}

function updateHud() {
  timeText.textContent = String(Math.max(0, secondsLeft));
  scoreText.textContent = String(score);
  comboText.textContent = `x${Math.max(1, combo)}`;
  clutterText.textContent = `${clutter}%`;
  clutterBar.style.width = `${clutter}%`;
  energyText.textContent = `${energy}%`;
  energyBar.style.width = `${energy}%`;
}

function endGame() {
  clearInterval(timerId);
  timerId = null;
  locked = true;
  showScreen("result");

  finalScore.textContent = String(score);
  bestCombo.textContent = String(bestComboValue);
  correctCount.textContent = String(correct);
  finalClutter.textContent = `${clutter}%`;
  resultSummary.textContent = `你把 ${correct} 件破事成功分流，最高连击 ${bestComboValue}。`;

  if (clutter >= 100) {
    resultEmoji.textContent = "🧠💥";
    resultTitle.textContent = "今天先别硬扛";
    resultQuote.textContent = "堵塞爆表不是失败，是提醒你该把一部分事情留到明天。";
  } else if (score >= 1600) {
    resultEmoji.textContent = "🧹✨";
    resultTitle.textContent = "脑内清仓成功";
    resultQuote.textContent = "真正厉害的不是把所有事都做完，而是知道哪些事根本不配占位置。";
  } else if (score >= 900) {
    resultEmoji.textContent = "🌤️";
    resultTitle.textContent = "今天轻了一点";
    resultQuote.textContent = "能解决的解决，不能解决的排队，没必要解决的就让它滚出去。";
  } else {
    resultEmoji.textContent = "🪴";
    resultTitle.textContent = "先腾出一点位置";
    resultQuote.textContent = "今天剩下的事，不必全在今天解决。";
  }
}

startButton.addEventListener("click", startGame);
againButton.addEventListener("click", startGame);
backButton.addEventListener("click", () => {
  clearInterval(timerId);
  showScreen("start");
});

breatheButton.addEventListener("click", useBreathe);
clearButton.addEventListener("click", useClear);

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handleChoice(button.dataset.choice);
  });
});
