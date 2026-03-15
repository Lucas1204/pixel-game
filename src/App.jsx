import { useState } from 'react';

const GAS_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;
const PASS_THRESHOLD = parseInt(import.meta.env.VITE_PASS_THRESHOLD || 3);
const QUESTION_COUNT = parseInt(import.meta.env.VITE_QUESTION_COUNT || 5);

function App() {
  const [userId, setUserId] = useState('');
  const [gameState, setGameState] = useState('start'); // start, playing, result
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bossSeed, setBossSeed] = useState('');

  const startGame = async () => {
    if(!userId) return alert('請輸入 ID');
    setLoading(true);
    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        // GAS 對於 preflight 有時候會擋，若有問題請在 doPost加上文字字串解析或確認 GAS CORS 設定
        body: JSON.stringify({ action: 'getQuestions', questionCount: QUESTION_COUNT }),
      });
      const data = await res.json();
      if(data.success) {
        setQuestions(data.questions);
        setGameState('playing');
        setBossSeed(Math.random().toString(36).substring(7));
      } else {
        alert(data.error);
      }
    } catch(e) {
      alert('讀取題目失敗：' + e.message + ' (請確認 GAS URL 是否設定正確且允許跨域)');
    }
    setLoading(false);
  };

  const handleAnswer = (option) => {
    const qId = questions[currentQIndex].id;
    const newAnswers = { ...answers, [qId]: option };
    setAnswers(newAnswers);
    
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setBossSeed(Math.random().toString(36).substring(7));
    } else {
      submitGame(newAnswers);
    }
  };

  const submitGame = async (finalAnswers) => {
    setLoading(true);
    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'submitAnswers',
          id: userId,
          userAnswers: finalAnswers,
          passThreshold: PASS_THRESHOLD
        })
      });
      const data = await res.json();
      if(data.success) {
        setScoreData({ score: data.score, passed: data.passed });
        setGameState('result');
      } else {
        alert(data.error);
      }
    } catch(e) {
      alert('送出答案失敗：' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="game-container">
      {gameState === 'start' && (
        <div className="screen start-screen">
          <h1 className="title">PIXEL QUIZ ADVENTURE</h1>
          <p className="subtitle">請輸入 ID 開始挑戰<br/>達 {PASS_THRESHOLD} 題即可通關！</p>
          <input 
            type="text" 
            placeholder="請輸入 ID" 
            value={userId} 
            onChange={(e) => setUserId(e.target.value)}
            className="pixel-input"
          />
          <button onClick={startGame} disabled={loading} className="pixel-btn">
            {loading ? 'LOADING...' : 'START GAME'}
          </button>
        </div>
      )}

      {gameState === 'playing' && questions.length > 0 && (
        <div className="screen play-screen">
          <div className="status-bar">
            <span>LEVEL {currentQIndex + 1}/{questions.length}</span>
            <span>ID:{userId}</span>
          </div>
          
          <div className="boss-container">
            <img 
              src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${bossSeed}`} 
              alt="Boss" 
              className="boss-img"
            />
          </div>

          <div className="question-box">
            {questions[currentQIndex].question}
          </div>

          <div className="options-grid">
            {Object.entries(questions[currentQIndex].options).map(([key, val]) => (
              <button key={key} onClick={() => handleAnswer(key)} className="option-btn">
                {key}. {val}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'result' && scoreData && (
        <div className="screen result-screen">
          <h1 className="title">{scoreData.passed ? 'STAGE CLEAR' : 'GAME OVER'}</h1>
          <div className="score-board">
            <p>SCORE: {scoreData.score} / {questions.length}</p>
          </div>
          <p className="message">
            {scoreData.passed ? '恭喜過關！成績已記錄。' : '再接再厲！'}
          </p>
          <button onClick={() => {
            setGameState('start');
            setCurrentQIndex(0);
            setAnswers({});
            setScoreData(null);
          }} className="pixel-btn mt-4">
            RESTART
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
