const LOGIN_USER = "joao.porto@policiacivil.sp.gov.br";
const LOGIN_PASS = "pingo";

const loginScreen = document.getElementById("loginScreen");
const terminalScreen = document.getElementById("terminalScreen");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const commandForm = document.getElementById("commandForm");
const commandInput = document.getElementById("commandInput");
const output = document.getElementById("output");
const overlay = document.getElementById("alertOverlay");
const alertTitle = document.getElementById("alertTitle");
const alertMessage = document.getElementById("alertMessage");
const unlockCount = document.getElementById("unlockCount");

const discoveries = {
  homens: {
    title: "REGISTRO 01 // HOMENS",
    message: "de a cesar o que é de cesar.",
    line: "[OK] Fragmento sobre os homens recuperado."
  },
  borboleta: {
    title: "REGISTRO 02 // BORBOLETA",
    message: "Um símbolo foi identificado nos documentos. A borboleta parece conectar pistas distintas.",
    line: "[OK] Referência à borboleta localizada."
  },
  "666": {
    title: "ARTEFATO // SINAL 666",
    message: "Os arquivos revelam uma referência a um artefato de adolescente.",
    line: "[ALERTA] Assinatura do artefato detectada. Protocolo dourado ativado.",
    gold: true
  },
  vaivai: {
    title: "ARTEFATO // VAI-VAI",
    message: "Uma segunda chave confirma a presença do artefato. O sistema projeta um brilho dourado sobre o arquivo selado.",
    line: "[ALERTA] Chave Vai-Vai reconhecida. Protocolo dourado ativado.",
    gold: true
  }
};
const unlocked = new Set();

function normalize(value) {
  return value.trim().toLocaleLowerCase("pt-BR");
}
function normalizeCommand(value) {
  // Ignora espaços e hífens para aceitar "Vai - vai", "vai-vai" e "vaivai".
  return normalize(value).replace(/[\s-]+/g, "");
}
function addLine(text, className = "response-line") {
  const p = document.createElement("p");
  p.className = className;
  p.textContent = text;
  output.appendChild(p);
  output.scrollTop = output.scrollHeight;
}
function updateRecords() {
  unlockCount.textContent = `${String(unlocked.size).padStart(2, "0")} / 04`;
  const rows = document.querySelectorAll("#recordList span");
  const keys = ["homens", "borboleta", "666", "vaivai"];
  rows.forEach((row, i) => {
    const isOpen = unlocked.has(keys[i]);
    row.querySelector("b").textContent = isOpen ? "LIBERADO" : "TRANCADO";
    row.querySelector("b").style.color = isOpen ? (i > 1 ? "var(--gold)" : "var(--green)") : "";
    row.querySelector(".record-dot").style.background = isOpen ? (i > 1 ? "var(--gold)" : "var(--green)") : "";
  });
}
function showAlert(item) {
  alertTitle.textContent = item.title;
  alertMessage.textContent = item.message;
  overlay.classList.toggle("gold", Boolean(item.gold));
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");
}
function closeAlert() {
  overlay.classList.remove("show", "gold");
  overlay.setAttribute("aria-hidden", "true");
  commandInput.focus();
}
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const user = document.getElementById("username").value.trim().toLowerCase();
  const pass = document.getElementById("loginPassword").value.trim().toLowerCase();

  if (user === LOGIN_USER && pass === LOGIN_PASS.toLowerCase()) {
    loginError.textContent = "";
    loginScreen.classList.add("hidden");
    terminalScreen.classList.remove("hidden");
    commandInput.focus();
    addLine("[AUTENTICAÇÃO] Identidade confirmada. Bem-vindo, operador.", "system-line");
  } else {
    loginError.textContent = "CREDENCIAIS INVÁLIDAS. TENTE NOVAMENTE.";
    document.getElementById("loginPassword").value = "";
  }
});
commandForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const raw = commandInput.value.trim();
  if (!raw) return;
  addLine(`root@investigador:~$ ${raw}`, "user-line");
  commandInput.value = "";
  const key = normalizeCommand(raw);
  const item = discoveries[key];
  if (!item) {
    addLine("[ERRO 404] Palavra-chave não reconhecida. Consulta negada.", "error-line");
    return;
  }
  if (unlocked.has(key)) {
    addLine("[SISTEMA] Este registro já foi desbloqueado.", "dim");
    return;
  }
  unlocked.add(key);
  updateRecords();
  addLine(item.line, item.gold ? "response-line gold-text" : "response-line");
  showAlert(item);
});
document.getElementById("closeAlert").addEventListener("click", closeAlert);
overlay.addEventListener("click", (event) => {
  if (event.target === overlay) closeAlert();
});
document.getElementById("logoutBtn").addEventListener("click", () => {
  terminalScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  loginForm.reset();
  loginError.textContent = "";
  output.innerHTML = '<p class="dim">ARQUIVO — INTERFACE DE CONSULTA v.4.06</p><p class="dim">Digite uma palavra-chave para consultar os registros.</p><p class="system-line">[SISTEMA] Aguardando entrada do operador<span class="cursor">_</span></p>';
  unlocked.clear();
  updateRecords();
});
document.querySelectorAll(".reveal").forEach(button => {
  button.addEventListener("click", () => {
    const field = document.getElementById(button.dataset.target);
    field.type = field.type === "password" ? "text" : "password";
  });
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && overlay.classList.contains("show")) closeAlert();
});
