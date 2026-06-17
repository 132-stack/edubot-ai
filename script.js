
//
// ===================== LOGIN + STORAGE =====================
//

function login(){
    const name = document.getElementById("nameInput").value;
    const grade = document.getElementById("gradeInput").value;

    if(!name || !grade){
        alert("Please enter name and grade!");
        return;
    }

    localStorage.setItem("studentName", name);
    localStorage.setItem("studentGrade", grade);

    showHome();
}

//
// ===================== SCREEN NAVIGATION =====================
//

function showScreen(id){

    document.querySelectorAll(".screen").forEach(s => {
        s.classList.remove("active");
        s.classList.add("hidden");
    });

    document.getElementById(id).classList.add("active");
    document.getElementById(id).classList.remove("hidden");
}

function showHome(){
    const name = localStorage.getItem("studentName");

    document.getElementById("welcomeText").innerText =
        `Welcome, ${name}! 👋`;

    showScreen("homeScreen");
}

function openChat(){ showScreen("chatScreen"); }
function openQuiz(){ showScreen("quizScreen"); }
function openDashboard(){ 
    showScreen("dashboardScreen");
    loadDashboard();
}
function openFeedback(){ showScreen("feedbackScreen"); }

//
// ===================== DARK MODE =====================
//

function toggleDarkMode(){
    document.body.classList.toggle("dark");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark") ? "on" : "off"
    );
}

window.onload = function(){

    // restore dark mode
    if(localStorage.getItem("darkMode") === "on"){
        document.body.classList.add("dark");
    }

    const name = localStorage.getItem("studentName");
    const grade = localStorage.getItem("studentGrade");

    // ❌ DO NOT auto-login
    // ALWAYS show login first (for school project requirement)

    showScreen("loginScreen");
};

//
// ===================== 🤖 GROQ AI CHAT =====================
//

async function askAI(message){

    const grade = localStorage.getItem("studentGrade");

    const res = await fetch("/chat", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            message: `
You are EduBot AI, a friendly tutor.

Student grade: ${grade}

Explain clearly for this grade level.

Question: ${message}
            `
        })
    });

    const data = await res.json();
    return data.reply;
}

//
// ===================== 📝 QUIZ SYSTEM =====================
//

let currentQuiz = [];
let currentScore = 0;

async function generateQuiz(subject){

    const grade = localStorage.getItem("studentGrade");

    const res = await fetch("/chat", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            message: `
Create 5 multiple choice questions for ${subject}.

Grade level: ${grade}

Format:
Q: question
A) option
B) option
C) option
D) option
Answer: A
            `
        })
    });

    const data = await res.json();

    parseQuiz(data.reply);
}



function addScore(){
    currentScore++;

    localStorage.setItem("lastScore", currentScore);
}

//
// ===================== 📊 DASHBOARD SYSTEM =====================
//

function saveProgress(subject, score){

    let progress =
        JSON.parse(localStorage.getItem("progress")) || {};

    if(!progress[subject]){
        progress[subject] = [];
    }

    progress[subject].push(score);

    localStorage.setItem("progress", JSON.stringify(progress));
}

//
// ===================== 🧠 AI FEEDBACK =====================
//


async function generateFeedback(){

    const score = localStorage.getItem("lastScore") || 0;
    const grade = localStorage.getItem("studentGrade");
    const progress = localStorage.getItem("progress");

    document.getElementById("feedbackBox").innerHTML =
        "⏳ Generating AI feedback...";

    const res = await fetch("/chat", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            message: `
You are an expert AI teacher.

Analyze this student performance:

Grade: ${grade}
Quiz Score: ${score}/5
Progress Data: ${progress}

Give feedback in this format:

1. Strengths
2. Weaknesses
3. Mistakes made
4. Improvement tips
5. Motivation message

Keep it simple and student friendly and use emojis!
            `
        })
    });

    const data = await res.json();

    document.getElementById("feedbackBox").innerHTML =
        `<pre style="white-space:pre-wrap;">${data.reply}</pre>`;
}


async function sendChat(){

    const input = document.getElementById("chatInput");
    const text = input.value;

    if(!text) return;

    const box = document.getElementById("chatBox");

    box.innerHTML += `<p><b>You:</b> ${text}</p>`;

    input.value = "";

    const reply = await askAI(text);

    box.innerHTML += `<p><b>EduBot:</b> ${reply}</p>`;

    box.scrollTop = box.scrollHeight;
}

let quizData = [];
let quizIndex = 0;
let quizScore = 0;

async function startQuiz(subject){

    const grade = localStorage.getItem("studentGrade");

    const seed = Math.random().toString(36).substring(2, 8);

    document.getElementById("quizBox").innerHTML =
        "⏳ Generating quiz...";

  const res = await fetch("/chat", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
        message: `
You are an AI quiz generator.

Generate 5 COMPLETELY NEW and UNIQUE multiple choice questions for ${subject}.

RULES:
- Do NOT repeat common textbook questions
- Do NOT reuse previous patterns
- Make each question different in style
- Mix easy, medium, and hard difficulty
- Use real-world examples where possible
- Avoid repeating similar topics in the same quiz
- Ensure questions are NEVER repeated in future quizzes even in structure.

Grade level: ${grade}

FORMAT STRICTLY:

Q: question
A) option
B) option
C) option
D) option
ANSWER: A
        `
    })
});

    const data = await res.json();

    parseQuiz(data.reply);
}

function parseQuiz(text){

    const blocks = text.split("Q:").filter(b => b.trim() !== "");

    quizData = blocks.map(block => {

        const lines = block.split("\n").map(l => l.trim()).filter(l => l !== "");

        let question = lines[0] || "Question";

        let options = [];
        let answer = "";

        lines.forEach(line => {

            if(/^A\)/.test(line)) options.push({ letter: 'A', text: line.replace(/^A\)\s*/, '') });
            if(/^B\)/.test(line)) options.push({ letter: 'B', text: line.replace(/^B\)\s*/, '') });
            if(/^C\)/.test(line)) options.push({ letter: 'C', text: line.replace(/^C\)\s*/, '') });
            if(/^D\)/.test(line)) options.push({ letter: 'D', text: line.replace(/^D\)\s*/, '') });

            if(/^ANSWER:/i.test(line)){
                // normalize to single uppercase letter (A-D)
                const a = line.replace(/ANSWER:/i, '').trim();
                answer = a[0] ? a[0].toUpperCase() : '';
            }

        });

        return {
            question,
            options,
            answer
        };
    });

    quizIndex = 0;
    quizScore = 0;

    showQuestion();
}

function showQuestion(){

    if(quizIndex >= quizData.length){
        endQuiz();
        return;
    }

    const q = quizData[quizIndex];

    // keep original order (A, B, C, D)
    const options = q.options || [];

    let html = `
        <div class="quiz-card">
            <h3>${q.question}</h3>
    `;

    options.forEach(opt => {
        html += `
            <button class="quiz-option" onclick="selectAnswer('${opt.letter}')">
                ${opt.letter}) ${opt.text}
            </button><br><br>
        `;
    });

    html += `</div>`;

    document.getElementById("quizBox").innerHTML = html;
}

function answerQuiz(correct){

    if(correct){
        quizScore++;
    }

    quizIndex++;
    showQuestion();
}

function endQuiz(){

    document.getElementById("quizBox").innerHTML = `
        <h3>🎉 Quiz Finished!</h3>
        <p>Your Score: ${quizScore}/${quizData.length}</p>
    `;

    localStorage.setItem("lastScore", quizScore);

    saveProgress("quiz", quizScore);
}

function selectAnswer(selected){

    const correctLetter = quizData[quizIndex].answer;

    if(selected === correctLetter){
        quizScore++;
    }

    quizIndex++;
    showQuestion();
}

function goHome(){
    document.querySelectorAll(".screen").forEach(s => {
        s.classList.remove("active");
        s.classList.add("hidden");
    });

    document.getElementById("homeScreen").classList.add("active");
    document.getElementById("homeScreen").classList.remove("hidden");
}


function loadDashboard(){

    const name = localStorage.getItem("studentName");
    const grade = localStorage.getItem("studentGrade");
    const score = localStorage.getItem("lastScore");

    const progress =
        JSON.parse(localStorage.getItem("progress")) || {};

    let totalQuizzes = 0;
    let totalScore = 0;

    Object.keys(progress).forEach(subject => {
        totalQuizzes += progress[subject].length;

        progress[subject].forEach(s => {
            totalScore += Number(s);
        });
    });

    let avgScore = totalQuizzes
        ? (totalScore / totalQuizzes).toFixed(2)
        : 0;

    document.getElementById("dashboardBox").innerHTML = `
        <div class="dash-card">
            <h3>👤 Student Info</h3>
            <p>Name: ${name}</p>
            <p>Grade: ${grade}</p>
        </div>

        <div class="dash-card">
            <h3>📈 Performance</h3>
            <p>Total Quizzes: ${totalQuizzes}</p>
            <p>Last Score: ${score}</p>
            <p>Average Score: ${avgScore}</p>
        </div>
    `;

    // 🔥 LOAD CHART
    loadScoreChart();
}



function loadScoreChart(){

    const progress =
        JSON.parse(localStorage.getItem("progress")) || {};

    let data = [];

    Object.keys(progress).forEach(subject => {

        let total = 0;

        progress[subject].forEach(score => {
            total += Number(score);
        });

        let avg = progress[subject].length
            ? total / progress[subject].length
            : 0;

        data.push({
            subject: subject,
            score: Number(avg.toFixed(2))
        });
    });

    if(data.length === 0){
        document.getElementById("chartContainer").innerHTML =
            "<p>No data yet 📭</p>";
        return;
    }

    renderChart(data);
}

function renderChart(data){

    let html = `<h3>📊 Score by Subject</h3>`;
    
    data.forEach(item => {
        const percentage = (item.score / 5 * 100).toFixed(0);
        html += `
            <div style="margin:10px 0;">
                <p><strong>${item.subject}</strong>: ${item.score}/5 (${percentage}%)</p>
                <div style="background:#ddd; height:20px; border-radius:5px; overflow:hidden;">
                    <div style="background:#4CAF50; height:100%; width:${percentage}%;"></div>
                </div>
            </div>
        `;
    });
    
    document.getElementById("chartContainer").innerHTML = html;
}
