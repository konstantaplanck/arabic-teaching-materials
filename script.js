const kosakata = [
  { emoji: "🍎", arab: "تفاح", indo: "Apel" },
  { emoji: "🍌", arab: "موز", indo: "Pisang" },
  { emoji: "🥕", arab: "جزر", indo: "Wortel" },
  { emoji: "🍊", arab: "برتقال", indo: "Jeruk" },
  { emoji: "🥒", arab: "خيار", indo: "Timun" },
  { emoji: "🍇", arab: "عنب", indo: "Anggur" },
  { emoji: "🍉", arab: "بطيخ", indo: "Semangka" },
  { emoji: "🥛", arab: "حليب", indo: "Susu" },
  { emoji: "☕", arab: "قهوة", indo: "Kopi" },
  { emoji: "🍞", arab: "خبز", indo: "Roti" }
];

// Membuat audio manual menggunakan Web Speech API untuk sintesis
function createManualAudio() {
  const audioData = {};
  
  kosakata.forEach(item => {
    // Membuat audio context untuk setiap kata
    audioData[item.arab] = {
      text: item.arab,
      synth: null
    };
  });
  
  return audioData;
}

const manualAudio = createManualAudio();

// Render cards
const cardsContainer = document.getElementById("cards-container");
cardsContainer.innerHTML = kosakata.map((item, idx) => `
  <div class="card">
    <span>${item.emoji}</span>
    <p><b>${item.arab}</b></p>
    <p>${item.indo}</p>
    <button id="audio-btn-${idx}" onclick="playAudio('${item.arab}', ${idx})">🔊</button>
    <button onclick="addNote(${idx})">✏️</button>
  </div>
`).join("");

// Audio manual menggunakan Speech Synthesis API
function playAudio(text, buttonIndex) {
  if ('speechSynthesis' in window) {
    const button = document.getElementById(`audio-btn-${buttonIndex}`);
    
    // Hentikan audio yang sedang berjalan
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA'; // Bahasa Arab
    utterance.rate = 0.7; // Kecepatan bicara (lebih lambat untuk pembelajaran)
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Visual feedback
    button.classList.add('audio-playing');
    
    utterance.onstart = () => {
      console.log('Audio dimulai:', text);
    };
    
    utterance.onend = () => {
      button.classList.remove('audio-playing');
      console.log('Audio selesai:', text);
    };
    
    utterance.onerror = (event) => {
      button.classList.remove('audio-playing');
      console.error('Error audio:', event);
      
      // Fallback: gunakan audio buatan manual sederhana
      playFallbackAudio(text, buttonIndex);
    };
    
    window.speechSynthesis.speak(utterance);
    
  } else {
    // Fallback untuk browser yang tidak support
    playFallbackAudio(text, buttonIndex);
  }
}

// Fallback audio sederhana menggunakan Web Audio API
function playFallbackAudio(text, buttonIndex) {
  const button = document.getElementById(`audio-btn-${buttonIndex}`);
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Buat nada sederhana untuk setiap karakter
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Frekuensi berdasarkan panjang teks (simulasi variasi suara)
    const baseFreq = 200 + (text.length * 20);
    oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
    
    // Durasi berdasarkan panjang teks
    const duration = Math.max(0.5, text.length * 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    button.classList.add('audio-playing');
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    
    oscillator.onended = () => {
      button.classList.remove('audio-playing');
    };
    
  } catch (error) {
    console.error('Audio fallback error:', error);
    button.classList.remove('audio-playing');
    
    // Notifikasi visual sebagai pengganti suara
    button.textContent = '✅';
    setTimeout(() => {
      button.textContent = '🔊';
    }, 1000);
  }
}

// Catatan (ikon pensil)
function addNote(idx) {
  let note = prompt(`Tulis catatan untuk kata "${kosakata[idx].arab}"`);
  if (note) {
    alert(`Catatan tersimpan: ${note}`);
  }
}

// Quiz
let currentQ = 0;
let score = 0;
const quizContainer = document.getElementById("quiz-container");

function startQuiz() {
  currentQ = 0;
  score = 0;
  loadQuiz();
}

function loadQuiz() {
  if (currentQ >= kosakata.length) {
    quizContainer.innerHTML = `
      <p><b>Selesai!</b> 🎉<br>Skor kamu: ${score}/${kosakata.length}</p>
      <button class="btn" onclick="startQuiz()">Ulangi Quiz</button>
    `;
    return;
  }
  
  const q = kosakata[currentQ];
  const options = [q.indo];
  
  while (options.length < 4) {
    let random = kosakata[Math.floor(Math.random()*kosakata.length)].indo;
    if (!options.includes(random)) options.push(random);
  }
  options.sort(() => Math.random()-0.5);
  
  quizContainer.innerHTML = `
    <p>Arti dari kata <b>${q.emoji} ${q.arab}</b> adalah...</p>
    ${options.map((opt,i) => 
      `<button class="quiz-option quiz-color-${i}" onclick="checkAnswer(this,'${opt}','${q.indo}')">${opt}</button>`
    ).join("")}
  `;
}

function checkAnswer(btn, answer, correct) {
  if (answer === correct) {
    btn.classList.add("correct");
    score++;
    setTimeout(() => {
      currentQ++;
      loadQuiz();
    }, 1000);
  } else {
    btn.classList.add("wrong");
    setTimeout(() => {
      btn.classList.remove("wrong");
    }, 800);
  }
}

// Latihan Bicara
function startSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Browser tidak mendukung speech recognition.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "ar-SA";
  recognition.start();

  document.getElementById("speech-result").textContent = "🎤 Mendengarkan...";

  recognition.onresult = (event) => {
    const result = event.results[0][0].transcript;
    document.getElementById("speech-result").textContent = `Kamu bilang: ${result}`;
    const kataArab = kosakata.map(k => k.arab);
    if (kataArab.includes(result)) {
      document.getElementById("speech-result").textContent += " ✅ Benar!";
    } else {
      document.getElementById("speech-result").textContent += " ❌ Coba lagi!";
    }
  };

  recognition.onerror = (event) => {
    document.getElementById("speech-result").textContent = "❌ Error: " + event.error;
  };

  recognition.onend = () => {
    if (document.getElementById("speech-result").textContent === "🎤 Mendengarkan...") {
      document.getElementById("speech-result").textContent = "🔇 Tidak terdengar suara";
    }
  };
}

// Inisialisasi saat halaman dimuat
window.addEventListener('load', () => {
  console.log('Aplikasi Mufrodat Arab siap digunakan!');
  
  // Test speech synthesis availability
  if ('speechSynthesis' in window) {
    console.log('Speech Synthesis tersedia');
  } else {
    console.log('Speech Synthesis tidak tersedia, menggunakan fallback');
  }
});