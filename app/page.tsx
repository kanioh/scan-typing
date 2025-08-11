"use client";

import { useEffect, useRef, useState } from "react";

//supabaseから単語を取得
/**
 * APIからランダムな単語のリストを取得します。
 * @async
 * @param {string} level - 難易度 (easy, normal, hard)
 * @returns {Promise<string[]>} 取得した単語の配列を返すPromise。
 */
const getRandomWord = async (level: string) => {
  const response = await fetch(`/api/words?level=${level}`);
  const data = await response.json();
  return data.words;
};

/**
 * タイピングゲームのメインコンポーネントです。
 * ゲームの状態管理、ラウンドの進行、UIのレンダリングを行います。
 */
const TypingGamePage = () => {
  const [currentWord, setCurrentWord] = useState(""); // 現在表示されている単語
  const [inputValue, setInputValue] = useState(""); // ユーザーが入力した値
  const [score, setScore] = useState(0); // ユーザーのスコア
  const [round, setRound] = useState(0); // 現在のラウンド数
  const [isGameActive, setIsGameActive] = useState(false); // ゲームがアクティブ（進行中）かどうか
  const [showWord, setShowWord] = useState(false); // 単語が表示されているかどうか
  const [resultMessage, setResultMessage] = useState(""); // ゲームの結果メッセージ（例: Correct!, Wrong!）
  const [wordList, setWordList] = useState<string[]>([]); // APIから取得した単語のリスト
  const [isRoundOver, setIsRoundOver] = useState(false); // 現在のラウンドが終了したかどうか
  const [difficulty, setDifficulty] = useState("normal"); // 難易度（easy, normal, hard）
  const [speed, setSpeed] = useState("normal"); // スピード（slow, normal, quick）
  const [animationDuration, setAnimationDuration] = useState(1); // 単語のスキャン速度（秒）
  // カウントダウンの数値を保持するステート（nullの場合はカウントダウンなし）
  const [countdown, setCountdown] = useState<number | null>(null);

  // 入力フィールドへの参照を作成し、フォーカス制御に使用
  const inputRef = useRef<HTMLInputElement>(null);
  // 単語取得のPromiseを保持し、カウントダウン中に非同期処理を開始できるようにする
  const wordFetchPromise = useRef<Promise<string[]> | null>(null);

  // モバイル端末かどうかを判定するstate
  const [isMobile, setIsMobile] = useState(false);

  // ページ読み込み時にモバイル判定を行う
  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone/i.test(navigator.userAgent));
  }, []);

  // スピード選択に応じてanimationDuration（アニメーション速度）を更新するuseEffect
  useEffect(() => {
    switch (speed) {
      case "slow":
        setAnimationDuration(isMobile ? 1 : 2); // slowの場合は2秒
        break;
      case "normal":
        setAnimationDuration(isMobile ? 0.8 : 1); // normalの場合は1秒
        break;
      case "quick":
        setAnimationDuration(0.5); // quickの場合は0.5秒
        break;
      default:
        setAnimationDuration(1); // デフォルトは1秒
    }
  }, [speed, isMobile]); // speedステートが変更されるたびに実行

  /**
   * ゲームの状態やラウンドが変更されたときに副作用を処理します。
   * ゲームがアクティブでラウンドが10未満の場合は新しいラウンドを開始し、
   * 10ラウンドに達した場合はゲームを終了します。
   */
  useEffect(() => {
    if (isGameActive && round < 10) {
      startRound(); // ゲームがアクティブでラウンドが10未満なら次のラウンドを開始
    } else if (round >= 10) {
      endGame(); // ラウンドが10に達したらゲームを終了
    }
  }, [isGameActive, round]); // isGameActiveまたはroundステートが変更されるたびに実行

  /**
   * ゲームの状態に応じて入力欄にフォーカスを当てます。
   */
  useEffect(() => {
    // ゲーム中で、ラウンドが終了していなければ常に入力欄にフォーカスする
    if (isGameActive && !isRoundOver) {
      inputRef.current?.focus(); // inputRefが参照する要素にフォーカス
    }
  }, [isGameActive, isRoundOver, showWord]); // isGameActive, isRoundOver, showWordステートが変更されるたびに実行

  /**
   * ゲームを開始し、初期化処理を行います。
   * 単語リストを取得し、スコアやラウンドをリセットします。
   */
  const startGame = () => {
    setScore(0); // スコアを0にリセット
    setRound(0); // ラウンドを0にリセット
    setInputValue(""); // 入力値をクリア
    setResultMessage(""); // 結果メッセージをクリア

    setCountdown(3); // カウントダウンを3から開始
    wordFetchPromise.current = getRandomWord(difficulty); // 単語取得を非同期で開始

    // 1秒ごとにカウントダウンを更新するタイマー
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer); // カウントダウンが1になったらタイマーを停止
          // カウントダウン終了後、単語取得を待ってからゲーム開始
          wordFetchPromise.current?.then((words) => {
            setWordList(words); // 取得した単語リストを設定
            setIsGameActive(true); // ゲームをアクティブにし、useEffect経由でラウンドを開始
          });
          return null; // カウントダウン表示を終了
        }
        return (prev || 0) - 1; // カウントダウンを1減らす
      });
    }, 1000); // 1000ミリ秒（1秒）ごとに実行
  };

  /**
   * 新しいラウンドを開始します。
   * 入力値や結果メッセージをリセットし、新しい単語を表示します。
   */
  const startRound = () => {
    if (wordList.length === 0) return; // 単語リストが空の場合は何もしない

    setInputValue(""); // 入力値をクリア
    setResultMessage(""); // 結果メッセージをクリア
    setCurrentWord(wordList[round]); // 現在のラウンドの単語を設定
    setShowWord(true); // 単語を表示
    setIsRoundOver(false); // ラウンド終了フラグをfalseに設定
  };

  /**
   * ゲームを終了し、最終スコアを表示します。
   */
  const endGame = () => {
    setIsGameActive(false); // ゲームを非アクティブに設定
    if (score === 0) {
      setResultMessage("残念。1つレベルを落としてもう一度チャレンジしてみよう！"); // 最終スコアを表示
    } else {
      setResultMessage(`おめでとう！ 正答率は${(score / 10) * 100}%！`); // 最終スコアを表示
    }
  };

  /**
   * 入力欄の変更をハンドルし、リアルタイムで正誤判定を行います。
   * @param {React.ChangeEvent<HTMLInputElement>} e - input要素のchangeイベントオブジェクト。
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isRoundOver) return; // ラウンドが終了している場合は何もしない

    const typedValue = e.target.value; // ユーザーが入力した値
    setInputValue(typedValue); // 入力値を更新

    if (!currentWord) return; // 現在の単語が設定されていない場合は何もしない

    /**
     * 現在のラウンドを終了し、結果を処理します。
     * @param {boolean} correct - 正解したかどうかを示す真偽値。
     */
    const endRound = (correct: boolean) => {
      setIsRoundOver(true); // ラウンド終了フラグをtrueに設定
      if (correct) {
        setScore((prev) => prev + 1); // スコアを1加算
        setResultMessage("正解！"); // 正解メッセージ
      } else {
        setResultMessage(`残念！"${currentWord}"だよ`); // 不正解メッセージと正しい単語
      }
      setShowWord(false); // ラウンド終了時に単語を隠す
      // 1.5秒後に次のラウンドへ
      setTimeout(() => {
        setRound((prev) => prev + 1); // ラウンド数を1加算
      }, 1500); // 1.5秒後に実行
    };

    // 入力が現在の単語の先頭と一致しているかチェック("abcde".startsWith("abc")ならtrue)
    if (currentWord.toLowerCase().startsWith(typedValue.toLowerCase())) {
      // 単語全体が正しく入力された場合
      if (typedValue.toLowerCase() === currentWord.toLowerCase()) {
        endRound(true); // 正解としてラウンドを終了
      }
    } else {
      // 入力ミスがあった場合
      endRound(false); // 不正解としてラウンドを終了
    }
  };

  return (
    // メインコンテナ: 画面全体をカバーし、要素を中央に配置
    <div className="flex flex-col items-center justify-baseline text-white p-4">
      {isGameActive ? (
        // ゲームアクティブ時のUI
        <>
          {/* ワード移動エリア */}
          <div className="relative w-full max-w-3xl h-12 md:h-24 md:mb-12 overflow-hidden max-md:mt-12">
            {showWord && (
              // アニメーションする単語
              <div
                key={round} // ラウンドごとにアニメーションをリセット
                className="absolute text-4xl font-normal whitespace-nowrap top-[50%] transform -translate-y-1/2 text-white tracking-widest"
                style={{
                  animation: `moveRightToLeft ${animationDuration}s linear forwards`,
                }}
              >
                {currentWord}
              </div>
            )}
          </div>

          {/* 入力フィールドと結果メッセージ */}
          <div className="flex flex-col items-center w-full max-w-md">
            <input
              ref={inputRef} // inputRefを割り当ててフォーカス制御を可能にする
              type="text"
              value={inputValue}
              onChange={handleInputChange} // 入力値が変更されたときにhandleInputChangeを実行
              className="w-full p-4 text-2xl text-center text-white rounded-lg focus:outline-none caret-transparent"
              placeholder={isMobile ? "ここをタップして入力" : ""}
              // ゲーム中かつラウンドが終了していなければ入力可能
              disabled={isRoundOver || !isGameActive} // ラウンド終了時またはゲーム非アクティブ時は入力不可
            />
            {resultMessage && <p className="mt-6 text-3xl font-bold text-white animate-pulse">{resultMessage}</p>}
          </div>
        </>
      ) : (
        // スタート画面（結果があれば表示）
        <>
          {countdown !== null ? (
            // カウントダウン表示
            <div className="text-center">
              <div className="text-9xl font-bold text-gray-300 animate-pulse mt-5 mb-10">{countdown}</div>
              <p>日本語入力モードをオフにしてください</p>
            </div>
          ) : (
            // 難易度とスピード選択
            <div className="flex justify-center gap-3 md:gap-8 mb-8">
              {/* 難易度選択セクション */}
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-medium mb-2">難易度</h2>
                <div className="flex flex-col space-y-2 p-2">
                  {["easy", "normal", "hard"].map((level) => (
                    <label
                      key={level}
                      className={`
                        relative cursor-pointer rounded-md px-12 py-2 text-sm font-medium whitespace-nowrap group
                        focus:outline-none transition-transform duration-300 ease-in-out text-center overflow-hidden
                        ${difficulty === level ? "text-white shadow-lg" : "text-gray-300"}
                      `}
                    >
                      <div
                        className={`
                          absolute inset-0 bg-white bg-cover bg-center transition-all duration-300 ease-in-out group-hover:blur-[100px]
                          ${difficulty === level ? "blur-[80px]" : "blur-[150px]"}
                        `}
                      />
                      <input
                        type="radio"
                        name="difficulty"
                        value={level}
                        checked={difficulty === level}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="sr-only" // ラジオボタン自体を視覚的に隠す
                      />
                      <span className="relative z-10 capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* スピード選択セクション */}
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-medium mb-2">スピード</h2>
                <div className="flex flex-col space-y-2 p-2">
                  {["slow", "normal", "quick"].map((s) => (
                    <label
                      key={s}
                      className={`
                        relative cursor-pointer rounded-md px-12 py-2 text-sm font-medium whitespace-nowrap group
                        focus:outline-none transition-transform duration-300 ease-in-out text-center overflow-hidden
                        ${speed === s ? "text-white shadow-lg" : "text-gray-300"}
                      `}
                    >
                      <div
                        className={`
                          absolute inset-0 bg-white bg-cover bg-center transition-all duration-300 ease-in-out group-hover:blur-[100px]
                          ${speed === s ? "blur-[80px]" : "blur-[150px]"}
                        `}
                      />
                      <input
                        type="radio"
                        name="speed"
                        value={s}
                        checked={speed === s}
                        onChange={(e) => setSpeed(e.target.value)}
                        className="sr-only" // ラジオボタン自体を視覚的に隠す
                      />
                      <span className="relative z-10 capitalize">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* カウントダウンがnullの場合のみスタートボタンを表示 */}
          {countdown === null && (
            // スタートボタン（クリックでゲーム開始）
            <button
              onClick={startGame} // クリックでゲーム開始
              className="relative group overflow-hidden mt-4 px-8 py-3 text-xl font-medium rounded-full shadow-xl transition duration-200"
            >
              <div className="absolute inset-0 bg-white bg-cover bg-center transition-all duration-300 ease-in-out blur-[150px] group-hover:blur-[100px]" />
              <span className="relative z-10">Start Game</span>
            </button>
          )}
          {/* 結果メッセージ（ゲーム終了後などに表示） */}
          {resultMessage && <p className="mt-10 text-2xl font-extrabold text-white">{resultMessage}</p>}
        </>
      )}
    </div>
  );
};

export default TypingGamePage;
