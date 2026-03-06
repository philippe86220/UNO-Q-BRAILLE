const input = document.getElementById("letterInput");

function selectInputText() {
  setTimeout(() => {
    input.select();
  }, 0);
}

input.addEventListener("focus", selectInputText);
input.addEventListener("click", selectInputText);

window.addEventListener("load", () => {
  input.select();
});

async function getJSON(url) {
  const r = await fetch(url.toString());
  return await r.json();
}

function updateBraille(mask) {
  const dots = document.querySelectorAll(".dot");

  dots.forEach(dot => {
    const n = parseInt(dot.dataset.dot, 10);
    const bit = 1 << (n - 1);

    if (mask & bit) {
      dot.style.background = "lime";
    } else {
      dot.style.background = "#1f2937";
    }
  });
}

function setStatus(msg) {
  document.getElementById("status").innerHTML = msg;
}

function isSupportedChar(ch) {
  return /^[A-Z0-9 ]$/.test(ch);
}

async function turnOffBraille() {
  try {
    const url = new URL("/off", window.location.href);
    const res = await getJSON(url);
    if (res.ok) {
      updateBraille(0);
    }
  } catch (e) {
    setStatus("Erreur JS: " + e);
  }
}

input.addEventListener("input", async () => {
  let value = input.value || "";

  if (value.length === 0) {
    updateBraille(0);
    await turnOffBraille();
    setStatus("Vide");
    return;
  }

  value = value[0].toUpperCase();
  input.value = value;

  if (!isSupportedChar(value)) {
    input.value = "";
    updateBraille(0);
    await turnOffBraille();
    setStatus("Caractere non supporte");
    return;
  }
});

document.getElementById("showBtn").onclick = async () => {
  try {

    let letter = input.value || "";
    letter = letter.trim().toUpperCase();
    input.value = letter;

    if (!letter || !isSupportedChar(letter[0])) {
      input.value = "";
      updateBraille(0);
      await turnOffBraille();
      setStatus("Caractere non supporte");
      selectInputText();
      return;
    }

    const url = new URL("/show", window.location.href);
    url.searchParams.set("letter", letter[0]);

    setStatus("Envoi...");
    const res = await getJSON(url);

    if (!res.ok) {
      updateBraille(0);
      await turnOffBraille();
      setStatus("Caractere non supporte");
      selectInputText();
      return;
    }

    updateBraille(res.mask);

    if (letter.match(/[0-9]/)) {
      setStatus("<span class='number'>Chiffre</span>: " + res.char + " | mask: " + res.mask);
    } else {
      setStatus("Lettre: " + res.char + " | mask: " + res.mask);
    }

    selectInputText();

  } catch (e) {
    setStatus("Erreur JS: " + e);
    selectInputText();
  }
};

document.getElementById("offBtn").onclick = async () => {
  try {
    const url = new URL("/off", window.location.href);

    setStatus("Extinction...");
    const res = await getJSON(url);

    if (!res.ok) {
      setStatus("Erreur: " + (res.error || "inconnue"));
      return;
    }

    updateBraille(res.mask);
    setStatus("Eteint");
    selectInputText();

  } catch (e) {
    setStatus("Erreur JS: " + e);
    selectInputText();
  }
};

document.getElementById("onBtn").onclick = async () => {
  try {
    const url = new URL("/on", window.location.href);

    setStatus("Allumage...");
    const res = await getJSON(url);

    if (!res.ok) {
      setStatus("Erreur: " + (res.error || "inconnue"));
      return;
    }

    updateBraille(res.mask);
    setStatus("Tous les points allumes");
    selectInputText();

  } catch (e) {
    setStatus("Erreur JS: " + e);
    selectInputText();
  }
};

updateBraille(0);
