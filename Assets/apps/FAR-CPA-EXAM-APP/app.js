let questions = [];
let currentQuestionIndex = 0;

// Player Stats
let playerXP = 0;
let playerLevel = 1;
let currentStreak = 0;
const xpPerLevel = 100;

// XP Rewards based on Skill Level
const xpMap = {
    "Remembering and Understanding": 10,
    "Application": 20,
    "Analysis": 30
};

// Titles based on Level
const titleMap = {
    1: "Staff Accountant",
    2: "Senior Accountant",
    3: "Accounting Manager",
    4: "Controller",
    5: "CFO"
};

// DOM Elements
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackContainer = document.getElementById('feedback-container');
const feedbackText = document.getElementById('feedback-text');
const explanationText = document.getElementById('explanation-text');
const nextBtn = document.getElementById('next-btn');

// Gamification DOM Elements
const xpDisplay = document.getElementById('player-xp');
const levelDisplay = document.getElementById('player-level');
const streakDisplay = document.getElementById('player-streak');
const titleDisplay = document.getElementById('player-title');
const xpBar = document.getElementById('xp-bar');
const metaArea = document.getElementById('meta-area');
const metaSkill = document.getElementById('meta-skill');

// Fetch questions from JSON
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        questions = await response.json();
        updateDashboard();
        displayQuestion();
    } catch (error) {
        questionText.textContent = "Error loading questions. Ensure you are running this through a local server (like VS Code Live Server).";
        console.error("Fetch error:", error);
    }
}

// Update Gamification UI
function updateDashboard() {
    // Calculate Level
    playerLevel = Math.floor(playerXP / xpPerLevel) + 1;
    let currentLevelXP = playerXP % xpPerLevel;
    
    // Update Text
    levelDisplay.textContent = playerLevel;
    xpDisplay.textContent = currentLevelXP;
    streakDisplay.textContent = `${currentStreak} 🔥`;
    
    // Update Title (caps at CFO if level > 5)
    titleDisplay.textContent = titleMap[playerLevel] || "CPA Master";

    // Update Progress Bar
    let xpPercentage = (currentLevelXP / xpPerLevel) * 100;
    xpBar.style.width = `${xpPercentage}%`;
}

// Render the current question
function displayQuestion() {
    // Reset UI state
    feedbackContainer.classList.add('hidden');
    nextBtn.classList.add('hidden');
    optionsContainer.innerHTML = '';
    
    const currentQ = questions[currentQuestionIndex];
    questionText.textContent = currentQ.question;
    
    // Display Metadata Badges
    metaArea.textContent = currentQ.blueprintArea;
    
    // Safely check if skillLevel exists in our map, default to 10 XP if not
    let potentialXP = xpMap[currentQ.skillLevel] || 10;
    metaSkill.textContent = `${currentQ.skillLevel} (${potentialXP} XP)`;

    // Create answer buttons
    currentQ.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option-btn');
        button.addEventListener('click', () => selectAnswer(button, option, currentQ));
        optionsContainer.appendChild(button);
    });
}

// Handle Answer Selection
function selectAnswer(selectedBtn, selectedText, currentQ) {
    // Disable all buttons to prevent multiple clicks
    const allButtons = optionsContainer.querySelectorAll('.option-btn');
    allButtons.forEach(btn => btn.disabled = true);
    
    // Show feedback container
    feedbackContainer.classList.remove('hidden');
    
    // Load the specific explanation for the option clicked
    explanationText.textContent = currentQ.explanations[selectedText];

    // Check if correct
    if (selectedText === currentQ.answer) {
        selectedBtn.classList.add('correct');
        feedbackText.textContent = "Correct! + XP";
        feedbackText.style.color = "var(--correct-color)";
        
        // Calculate Rewards
        let earnedXP = xpMap[currentQ.skillLevel] || 10;
        
        // Streak Logic: Increment streak, add bonus if streak is 3 or higher
        currentStreak++;
        if (currentStreak >= 3) {
            earnedXP += 5; 
            feedbackText.textContent = `Correct! + XP (Streak Bonus!)`;
        }
        
        playerXP += earnedXP;
        
        // Trigger streak animation
        streakDisplay.classList.add('streak-active');
        setTimeout(() => streakDisplay.classList.remove('streak-active'), 300);

    } else {
        selectedBtn.classList.add('incorrect');
        feedbackText.textContent = "Incorrect. Streak lost!";
        feedbackText.style.color = "var(--incorrect-color)";
        currentStreak = 0; // Reset streak on wrong answer
        
        // Highlight the correct answer for the user
        allButtons.forEach(btn => {
            if (btn.textContent === currentQ.answer) {
                btn.classList.add('correct');
            }
        });
    }

    // Refresh the dashboard stats and show the Next button
    updateDashboard();
    nextBtn.classList.remove('hidden');
}

// Next Question Button Logic
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        // End of Quiz
        document.getElementById('quiz-section').classList.add('hidden');
        document.getElementById('results-section').classList.remove('hidden');
        document.getElementById('final-level').textContent = playerLevel;
        document.getElementById('final-xp').textContent = playerXP;
    }
});

// Restart Quiz Button Logic
document.getElementById('restart-btn').addEventListener('click', () => {
    currentQuestionIndex = 0;
    playerXP = 0;
    currentStreak = 0;
    
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('quiz-section').classList.remove('hidden');
    
    // Reshuffle or reload logic could go here in the future
    updateDashboard();
    displayQuestion();
});

// Start the app!
loadQuestions();