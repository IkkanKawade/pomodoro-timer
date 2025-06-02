// タイマーの状態管理
let timerState = {
    isRunning: false,
    isPaused: false,
    currentTime: 25 * 60, // 秒単位
    currentSession: 'work', // 'work', 'shortBreak', 'longBreak'
    completedPomodoros: 0,
    totalWorkTime: 0, // 分単位
    sessionsUntilLongBreak: 0
};

// DOM要素の取得
const timeDisplay = document.getElementById('time');
const sessionInfo = document.getElementById('session-info');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const workDurationInput = document.getElementById('work-duration');
const shortBreakInput = document.getElementById('short-break');
const longBreakInput = document.getElementById('long-break');
const sessionsBeforeLongInput = document.getElementById('sessions-before-long');
const completedPomodorosSpan = document.getElementById('completed-pomodoros');
const totalTimeSpan = document.getElementById('total-time');
const notificationSound = document.getElementById('notification-sound');

// タイマー変数
let timerInterval = null;

// 初期化
function init() {
    updateDisplay();
    loadSettings();
    loadStats();
}

// 設定の読み込み
function loadSettings() {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        workDurationInput.value = settings.workDuration || 25;
        shortBreakInput.value = settings.shortBreak || 5;
        longBreakInput.value = settings.longBreak || 15;
        sessionsBeforeLongInput.value = settings.sessionsBeforeLong || 4;
    }
}

// 設定の保存
function saveSettings() {
    const settings = {
        workDuration: parseInt(workDurationInput.value),
        shortBreak: parseInt(shortBreakInput.value),
        longBreak: parseInt(longBreakInput.value),
        sessionsBeforeLong: parseInt(sessionsBeforeLongInput.value)
    };
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
}

// 統計の読み込み
function loadStats() {
    const savedStats = localStorage.getItem('pomodoroStats');
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        const today = new Date().toDateString();
        
        if (stats.date === today) {
            timerState.completedPomodoros = stats.completedPomodoros || 0;
            timerState.totalWorkTime = stats.totalWorkTime || 0;
        } else {
            // 新しい日なのでリセット
            timerState.completedPomodoros = 0;
            timerState.totalWorkTime = 0;
        }
        
        updateStats();
    }
}

// 統計の保存
function saveStats() {
    const stats = {
        date: new Date().toDateString(),
        completedPomodoros: timerState.completedPomodoros,
        totalWorkTime: timerState.totalWorkTime
    };
    localStorage.setItem('pomodoroStats', JSON.stringify(stats));
}

// 統計の更新
function updateStats() {
    completedPomodorosSpan.textContent = timerState.completedPomodoros;
    totalTimeSpan.textContent = `${timerState.totalWorkTime}分`;
}

// 時間の表示更新
function updateDisplay() {
    const minutes = Math.floor(timerState.currentTime / 60);
    const seconds = timerState.currentTime % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // セッション情報の更新
    switch (timerState.currentSession) {
        case 'work':
            sessionInfo.textContent = '作業時間';
            break;
        case 'shortBreak':
            sessionInfo.textContent = '短い休憩';
            break;
        case 'longBreak':
            sessionInfo.textContent = '長い休憩';
            break;
    }
    
    // タイトルの更新
    document.title = `${timeDisplay.textContent} - ポモドーロタイマー`;
}

// タイマーの開始
function startTimer() {
    if (!timerState.isRunning) {
        timerState.isRunning = true;
        timerState.isPaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        // 設定を無効化
        disableSettings();
        
        timerInterval = setInterval(() => {
            if (timerState.currentTime > 0) {
                timerState.currentTime--;
                updateDisplay();
                
                // 作業時間の記録
                if (timerState.currentSession === 'work') {
                    if (timerState.currentTime % 60 === 0) {
                        timerState.totalWorkTime++;
                        saveStats();
                        updateStats();
                    }
                }
            } else {
                // タイマー終了
                completeSession();
            }
        }, 1000);
    }
}

// タイマーの一時停止
function pauseTimer() {
    if (timerState.isRunning && !timerState.isPaused) {
        timerState.isPaused = true;
        clearInterval(timerInterval);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        startBtn.textContent = '再開';
    }
}

// タイマーのリセット
function resetTimer() {
    clearInterval(timerInterval);
    timerState.isRunning = false;
    timerState.isPaused = false;
    
    // 現在のセッションに応じて時間をリセット
    switch (timerState.currentSession) {
        case 'work':
            timerState.currentTime = parseInt(workDurationInput.value) * 60;
            break;
        case 'shortBreak':
            timerState.currentTime = parseInt(shortBreakInput.value) * 60;
            break;
        case 'longBreak':
            timerState.currentTime = parseInt(longBreakInput.value) * 60;
            break;
    }
    
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.textContent = '開始';
    
    // 設定を有効化
    enableSettings();
}

// セッション完了処理
function completeSession() {
    clearInterval(timerInterval);
    timerState.isRunning = false;
    
    // 通知音を再生
    playNotification();
    
    // 通知を表示
    showNotification();
    
    if (timerState.currentSession === 'work') {
        timerState.completedPomodoros++;
        timerState.sessionsUntilLongBreak++;
        saveStats();
        updateStats();
        
        // 次のセッションを決定
        if (timerState.sessionsUntilLongBreak >= parseInt(sessionsBeforeLongInput.value)) {
            timerState.currentSession = 'longBreak';
            timerState.currentTime = parseInt(longBreakInput.value) * 60;
            timerState.sessionsUntilLongBreak = 0;
        } else {
            timerState.currentSession = 'shortBreak';
            timerState.currentTime = parseInt(shortBreakInput.value) * 60;
        }
    } else {
        // 休憩終了後は作業に戻る
        timerState.currentSession = 'work';
        timerState.currentTime = parseInt(workDurationInput.value) * 60;
    }
    
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.textContent = '開始';
    
    // 設定を有効化
    enableSettings();
}

// 通知音の再生
function playNotification() {
    // 簡易的なビープ音を生成
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// ブラウザ通知の表示
function showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        const message = timerState.currentSession === 'work' ? 
            '休憩時間です！' : '作業を再開しましょう！';
        
        new Notification('ポモドーロタイマー', {
            body: message,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23667eea"/></svg>'
        });
    }
}

// 通知の許可を要求
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// 設定の無効化
function disableSettings() {
    workDurationInput.disabled = true;
    shortBreakInput.disabled = true;
    longBreakInput.disabled = true;
    sessionsBeforeLongInput.disabled = true;
}

// 設定の有効化
function enableSettings() {
    workDurationInput.disabled = false;
    shortBreakInput.disabled = false;
    longBreakInput.disabled = false;
    sessionsBeforeLongInput.disabled = false;
}

// イベントリスナーの設定
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// 設定変更時の処理
workDurationInput.addEventListener('change', () => {
    saveSettings();
    if (!timerState.isRunning && timerState.currentSession === 'work') {
        timerState.currentTime = parseInt(workDurationInput.value) * 60;
        updateDisplay();
    }
});

shortBreakInput.addEventListener('change', () => {
    saveSettings();
    if (!timerState.isRunning && timerState.currentSession === 'shortBreak') {
        timerState.currentTime = parseInt(shortBreakInput.value) * 60;
        updateDisplay();
    }
});

longBreakInput.addEventListener('change', () => {
    saveSettings();
    if (!timerState.isRunning && timerState.currentSession === 'longBreak') {
        timerState.currentTime = parseInt(longBreakInput.value) * 60;
        updateDisplay();
    }
});

sessionsBeforeLongInput.addEventListener('change', saveSettings);

// 初期化実行
init();
requestNotificationPermission();
