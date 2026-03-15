function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responseJSON({ success: false, error: "No post data" });
    }
    
    // 解析前端傳來的資料
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'getQuestions') {
      return handleGetQuestions(data);
    }
    
    if (action === 'submitAnswers') {
      return handleSubmitAnswers(data);
    }

    return responseJSON({ success: false, error: "Unknown action" });

  } catch (error) {
    return responseJSON({ success: false, error: error.message });
  }
}

function handleGetQuestions(data) {
  const db = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = db.getSheetByName('題目');
  if(!sheet) throw new Error("找不到『題目』工作表");

  const dataRange = sheet.getDataRange().getValues();
  const rows = dataRange.slice(1); // 略過標題 (題號, 題目, A, B, C, D, 解答)
  
  const qCount = parseInt(data.questionCount) || 5;

  // 隨機抽取題目
  const shuffled = rows.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, qCount);
  
  const questions = selected.map(row => ({
    id: row[0],
    question: row[1],
    options: {
      A: row[2],
      B: row[3],
      C: row[4],
      D: row[5]
    }
  }));

  return responseJSON({ success: true, questions });
}

function handleSubmitAnswers(data) {
  const { id, userAnswers, passThreshold } = data; 
  // userAnswers 格式範例: { "Q1": "A", "Q2": "B" }
  
  const db = SpreadsheetApp.getActiveSpreadsheet();
  const qSheet = db.getSheetByName('題目');
  const aSheet = db.getSheetByName('回答');
  if(!qSheet || !aSheet) throw new Error("找不到『題目』或『回答』工作表");

  // 建立解答對照表
  const qData = qSheet.getDataRange().getValues();
  const qDict = {};
  for(let i=1; i<qData.length; i++) {
    qDict[qData[i][0]] = qData[i][6]; // 假設第0欄是題號，第6欄(G)是解答
  }
  
  // 計算總分
  let correctCount = 0;
  for (const qId in userAnswers) {
    if (qDict[qId] === userAnswers[qId]) {
      correctCount++;
    }
  }
  
  const score = correctCount; 
  const passed = correctCount >= passThreshold;
  const now = new Date();
  
  // 處理回答工作表 (ID, 闖關次數, 總分, 最高分, 第一次通關分數, 花了幾次通關, 最近遊玩時間)
  const aData = aSheet.getDataRange().getValues();
  let userRowIndex = -1;
  
  for(let i=1; i<aData.length; i++) {
    if (aData[i][0] == id) {
      userRowIndex = i + 1; // GAS row index 從 1 開始
      break;
    }
  }
  
  if (userRowIndex !== -1) {
    // 使用者已存在，更新資料
    let playCount = aData[userRowIndex - 1][1] || 0;
    let totalScore = aData[userRowIndex - 1][2] || 0;
    let highestScore = aData[userRowIndex - 1][3] || 0;
    let firstPassScore = aData[userRowIndex - 1][4] || "";
    let attemptsToPass = aData[userRowIndex - 1][5] || "";
    
    playCount++;
    totalScore += score;
    if (score > highestScore) highestScore = score;
    
    // 若為首次通關
    if (passed && firstPassScore === "") {
      firstPassScore = score;
      attemptsToPass = playCount;
    }
    
    aSheet.getRange(userRowIndex, 2, 1, 6).setValues([[
      playCount, totalScore, highestScore, firstPassScore, attemptsToPass, now
    ]]);
    
  } else {
    // 新使用者
    const firstPassScore = passed ? score : "";
    const attemptsToPass = passed ? 1 : "";
    aSheet.appendRow([id, 1, score, score, firstPassScore, attemptsToPass, now]);
  }
  
  return responseJSON({ 
    success: true, 
    score,
    passed
  });
}

// 產生 JSON 回應的 helper (解決 CORS 或 redirect 回傳的問題)
function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// 若前端用 GET / POST 無預檢請求的形式測試
function doGet(e) {
  return responseJSON({ success: true, message: "Pixel Game Backend is running!" });
}
