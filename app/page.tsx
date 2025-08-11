"use client";

import { useEffect, useRef, useState } from "react";

/**
 * APIから指定された難易度のランダムな単語リストを取得します。
 * @async
 * @param {string} level - 取得する単語の難易度 (easy, normal, hard)。
 * @returns {Promise<string[]>} 取得した単語の配列を格納したPromiseオブジェクト。
 */
const getRandomWord = async (level: string) => {
  const response = await fetch(`/api/words?level=${level}`);
  const data = await response.json();
  return data.words;
};

/**
 * タイピングゲームのメインコンポーネント。
 * ゲームの状態管理、ラウンド進行、UIレンダリングを担当します。
 */
const TypingGamePage = () => {
  const [currentWord, setCurrentWord] = useState(""); // 現在のラウンドで表示されている単語
  const [inputValue, setInputValue] = useState(""); // ユーザーの入力値
  const [score, setScore] = useState(0); // 現在のスコア
  const [round, setRound] = useState(0); // 現在のラウンド数 (0から9)
  const [isGameActive, setIsGameActive] = useState(false); // ゲームが進行中かどうか
  const [showWord, setShowWord] = useState(false); // 単語を画面に表示するかどうか
  const [resultMessage, setResultMessage] = useState(""); // ラウンド終了時の結果メッセージ
  const [wordList, setWordList] = useState<string[]>([]); // APIから取得した単語のリスト
  const [isRoundOver, setIsRoundOver] = useState(false); // 現在のラウンドが終了したかどうか
  const [difficulty, setDifficulty] = useState("normal"); // ゲームの難易度
  const [speed, setSpeed] = useState("normal"); // 単語の表示速度
  const [animationDuration, setAnimationDuration] = useState(1); // 単語が画面を横切るアニメーションの時間(秒)
  const [countdown, setCountdown] = useState<number | null>(null); // ゲーム開始前のカウントダウン

  const inputRef = useRef<HTMLInputElement>(null); // 入力フィールドへの参照
  const wordFetchPromise = useRef<Promise<string[]> | null>(null); // 単語リスト取得処理のPromiseを保持

  const [isMobile, setIsMobile] = useState(false); // モバイルデバイスかどうかを判定

  // コンポーネントのマウント時に、ユーザーエージェントからモバイルデバイスかどうかを判定
  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone/i.test(navigator.userAgent));
  }, []);

  // 選択されたスピードに応じて、アニメーションの時間を調整
  useEffect(() => {
    switch (speed) {
      case "slow":
        setAnimationDuration(isMobile ? 1 : 2);
        break;
      case "normal":
        setAnimationDuration(isMobile ? 0.8 : 1);
        break;
      case "quick":
        setAnimationDuration(0.5);
        break;
      default:
        setAnimationDuration(1);
    }
  }, [speed, isMobile]);

  /**
   * ゲームの進行状況を管理します。
   * ゲームがアクティブでラウンドが10未満の場合に新しいラウンドを開始し、
   * 10ラウンドに達した場合はゲームを終了します。
   */
  useEffect(() => {
    if (isGameActive && round < 10) {
      startRound();
    } else if (round >= 10) {
      endGame();
    }
  }, [isGameActive, round]);

  /**
   * ゲーム中、入力フィールドに自動でフォーカスを当てます。
   */
  useEffect(() => {
    if (isGameActive && !isRoundOver) {
      inputRef.current?.focus();
    }
  }, [isGameActive, isRoundOver, showWord]);

  /**
   * ゲームを開始します。
   * スコアやラウンドを初期化し、3秒のカウントダウンの後にゲームを開始します。
   * カウントダウン中に単語リストの取得を非同期で開始します。
   */
  const startGame = () => {
    setScore(0);
    setRound(0);
    setInputValue("");
    setResultMessage("");
    setCountdown(3);
    wordFetchPromise.current = getRandomWord(difficulty); // 単語取得をバックグラウンドで開始

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          // カウントダウン終了後、単語取得が完了してからゲームを開始
          wordFetchPromise.current?.then((words) => {
            setWordList(words);
            setIsGameActive(true); // ゲームをアクティブ化し、useEffect経由で最初のラウンドを開始
          });
          return null;
        }
        return (prev || 0) - 1;
      });
    }, 1000);
  };

  /**
   * 新しいラウンドを開始します。
   * 入力値や結果メッセージをリセットし、単語リストから新しい単語を表示します。
   */
  const startRound = () => {
    if (wordList.length === 0) return;

    setInputValue("");
    setResultMessage("");
    setCurrentWord(wordList[round]);
    setShowWord(true);
    setIsRoundOver(false);
  };

  /**
   * ゲームを終了し、最終スコアに応じたメッセージを表示します。
   */
  const endGame = () => {
    setIsGameActive(false);
    if (score === 0) {
      setResultMessage("残念。1つレベルを落としてもう一度チャレンジしてみよう！");
    } else {
      setResultMessage(`おめでとう！ 正答率は${(score / 10) * 100}%！`);
    }
  };

  /**
   * ユーザーの入力値を処理し、リアルタイムで正誤判定を行います。
   * @param {React.ChangeEvent<HTMLInputElement>} e - input要素のchangeイベント。
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isRoundOver) return;

    const typedValue = e.target.value;
    setInputValue(typedValue);

    if (!currentWord) return;

    /**
     * 現在のラウンドを終了し、結果を処理します。
     * @param {boolean} correct - 正解したかどうか。
     */
    const endRound = (correct: boolean) => {
      setIsRoundOver(true);
      if (correct) {
        setScore((prev) => prev + 1);
        setResultMessage("正解！");
      } else {
        setResultMessage(`残念！正解は "${currentWord}"`);
      }
      setShowWord(false);
      // 1.5秒後に次のラウンドへ移行
      setTimeout(() => {
        setRound((prev) => prev + 1);
      }, 1500);
    };

    // 入力値が現在の単語の先頭部分と一致しているかチェック
    if (currentWord.toLowerCase().startsWith(typedValue.toLowerCase())) {
      // 単語全体が正しく入力された場合
      if (typedValue.toLowerCase() === currentWord.toLowerCase()) {
        endRound(true);
      }
    } else {
      // 入力ミスがあった場合
      endRound(false);
    }
  };

  return (
    // メインコンテナ
    <div className="flex flex-col items-center justify-baseline text-white p-4">
      {isGameActive ? (
        // ゲーム中の画面
        <>
          {/* 単語が流れるアニメーションエリア */}
          <div className="relative w-full max-w-3xl h-12 md:h-24 md:mb-12 overflow-hidden max-md:mt-12">
            {showWord && (
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

          {/* 入力フォームと結果メッセージ */}
          <div className="flex flex-col items-center w-full max-w-md">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="w-full p-4 text-2xl text-center text-white rounded-lg focus:outline-none caret-transparent"
              placeholder={isMobile ? "ここをタップして入力" : ""}
              disabled={isRoundOver || !isGameActive} // ラウンド終了時またはゲーム非アクティブ時は入力不可
            />
            {resultMessage && (
              <p className="mt-6 text-3xl font-bold text-white animate-pulse text-center">{resultMessage}</p>
            )}
          </div>
        </>
      ) : (
        // ゲーム開始前の画面
        <>
          {countdown !== null ? (
            // カウントダウン表示
            <div className="text-center">
              <div className="text-9xl font-bold text-gray-300 animate-pulse mt-5 mb-10">{countdown}</div>
              <p>日本語入力モードをオフにしてください</p>
            </div>
          ) : (
            // スタート前の設定画面
            <>
              <div className="flex justify-center gap-3 md:gap-8 mb-8">
                {/* 難易度選択 */}
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
                          className="sr-only" // ラジオボタン自体は非表示
                        />
                        <span className="relative z-10 capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* スピード選択 */}
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
                          className="sr-only" // ラジオボタン自体は非表示
                        />
                        <span className="relative z-10 capitalize">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* スタートボタン (カウントダウン中は非表示) */}
              {countdown === null && (
                <button
                  onClick={startGame}
                  className="relative group overflow-hidden mt-4 px-8 py-3 text-xl font-medium rounded-full shadow-xl transition duration-200"
                >
                  <div className="absolute inset-0 bg-white bg-cover bg-center transition-all duration-300 ease-in-out blur-[150px] group-hover:blur-[100px]" />
                  <span className="relative z-10">Start Game</span>
                </button>
              )}
              {/* ゲーム終了後の結果メッセージ */}
              {resultMessage && <p className="mt-10 text-2xl font-extrabold text-white text-center">{resultMessage}</p>}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TypingGamePage;
