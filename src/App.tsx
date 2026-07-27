/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Trophy, 
  RefreshCcw, 
  User,
  CreditCard,
  Play,
  BookOpen,
  Settings,
  Sun,
  Moon,
  Car,
  Clock,
  AlertTriangle
} from 'lucide-react';
import questionsDataRaw from './data/questions.json';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  description: string;
}

const FREE_QUESTIONS_LIMIT = 5;
const QUIZ_SIZE = 40;
const TOTAL_TIME_SECONDS = 50 * 60; // 50 minutes

// Fisher-Yates Shuffle
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

type AppState = 'welcome' | 'quiz' | 'results';
type Theme = 'light' | 'dark';

export default function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isPremium, setIsPremium] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_is_premium') === 'true';
    }
    return false;
  });
  const [theme, setTheme] = useState<Theme>('light');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [timeTaken, setTimeTaken] = useState(0);

  // Timer Effect
  useEffect(() => {
    let timer: number;
    if (appState === 'quiz' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setAppState('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [appState, timeLeft]);

  // Format time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Initialize quiz with 40 questions (shuffle included)
  const startQuizFlow = () => {
    setShowWarningModal(true);
  };

  const confirmStartQuiz = () => {
    setShowWarningModal(false);
    const shuffled = shuffleArray([...questionsDataRaw]);
    setQuizQuestions(shuffled.slice(0, QUIZ_SIZE) as Question[]);
    setCurrentIndex(0);
    setAnswers({});
    setTimeLeft(TOTAL_TIME_SECONDS);
    setAppState('quiz');
  };

  const currentQuestion = quizQuestions[currentIndex];
  const totalQuestions = quizQuestions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const score = useMemo(() => {
    return Object.entries(answers).reduce((acc, [idx, answer]) => {
      const q = quizQuestions[parseInt(idx)];
      return q && q.correct === answer ? acc + 1 : acc;
    }, 0);
  }, [answers, quizQuestions]);

  const errors = useMemo(() => {
    return Object.keys(answers).length - score;
  }, [answers, score]);

  const handleSelectAnswer = (optionIndex: number) => {
    if (answers[currentIndex] !== undefined) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      const nextIndex = currentIndex + 1;
      if (!isPremium && nextIndex >= FREE_QUESTIONS_LIMIT) {
        return;
      }
      setCurrentIndex(nextIndex);
    } else {
      setTimeTaken(TOTAL_TIME_SECONDS - timeLeft);
      setAppState('results');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handlePurchaseSuccess = () => {
    setIsPremium(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_is_premium', 'true');
    }
    setShowSuccessModal(true);
  };

  const themeClasses = theme === 'dark' 
    ? 'bg-slate-900 text-slate-100 border-slate-800' 
    : 'bg-white text-slate-900 border-slate-50';

  return (
    <div className={`min-h-screen font-sans flex justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-slate-100'}`}>
      <div className={`w-full max-w-md min-h-screen shadow-2xl flex flex-col relative overflow-hidden transition-colors duration-300 ${themeClasses}`}>
        
        {/* Status Bar Mock */}
        <div className="w-full bg-slate-950 text-white px-6 py-2 flex justify-between items-center text-[10px] font-bold">
          <div className="flex gap-1 items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>CONDUCEPRO ONLINE</span>
          </div>
          <div className="flex gap-3">
            <span>5G</span>
            <span>98%</span>
          </div>
        </div>

        {/* Theme and Account Header */}
        <div className="p-4 flex justify-between items-center bg-transparent">
          <button onClick={toggleTheme} className={`p-2 rounded-full ${theme === 'dark' ? 'bg-slate-900 text-yellow-400 border border-yellow-400/20' : 'bg-slate-100 text-slate-600'}`}>
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <div className="flex gap-2">
            {!isPremium && (
              <button 
                onClick={handlePurchaseSuccess}
                className="text-[10px] font-black bg-yellow-400 text-slate-950 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-yellow-400/20"
              >
                <Lock className="w-3 h-3" /> VERSIÓN PREMIUM
              </button>
            )}
            <button className={`p-2 rounded-full ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-slate-100'}`}>
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {appState === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8"
            >
              {/* Logo Component */}
              <div className="relative group">
                <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 scale-150 group-hover:opacity-40 transition-opacity"></div>
                <div className="w-32 h-32 bg-slate-950 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-yellow-400/10 rotate-12 relative overflow-hidden border-2 border-yellow-400/30">
                  <div className="absolute inset-0 bg-yellow-400/5 -rotate-45 translate-x-12"></div>
                  <Car className="w-16 h-16 text-yellow-400 -rotate-12" />
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tighter leading-tight text-slate-950 dark:text-white">
                  CONDUCEPRO
                </h1>
                <div className="space-y-1">
                  <p className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-yellow-400' : 'text-slate-500'}`}>
                    Examen Teórico para conducir en CR
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Basado en el Manual de COSEVI 2026
                  </p>
                </div>
              </div>

              <div className="w-full">
                <div className={`${theme === 'dark' ? 'bg-slate-900 border-yellow-400/10' : 'bg-slate-50'} p-6 rounded-3xl border text-center`}>
                  <p className="text-3xl font-black">40</p>
                  <p className={`text-[10px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-yellow-400' : 'text-slate-600'}`}>Preguntas Diferentes en cada Prueba</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">Pruebas de 40 preguntas - Fuente Manual de COSEVI 2026</p>
                </div>
              </div>

              <div className="w-full space-y-4">
                <button 
                  onClick={startQuizFlow}
                  className="w-full bg-yellow-400 text-slate-950 font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-yellow-300 transition-all shadow-xl shadow-yellow-400/20 active:scale-95"
                >
                  <Play className="fill-current w-5 h-5" />
                  EMPEZAR TEST AHORA
                </button>
                <div className="flex items-center justify-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>GRATIS: 5 PREGUNTAS</span>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <span>COSEVI 2026</span>
                </div>
              </div>
            </motion.div>
          )}

          {appState === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <header className="p-4 flex items-center justify-between">
                <button onClick={handlePrevious} disabled={currentIndex === 0} className={`p-2 rounded-full disabled:opacity-20 ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                  <ChevronLeft />
                </button>
                <div className="flex bg-slate-950 text-yellow-400 px-4 py-2 rounded-2xl items-center gap-2 border border-yellow-400/20 shadow-lg">
                  <Clock className="w-4 h-4" />
                  <span className={`font-mono text-lg font-black ${timeLeft < 300 ? 'text-red-500 animate-pulse' : ''}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${theme === 'dark' ? 'text-yellow-400' : 'text-slate-400'}`}>PREGUNTA</span>
                  <p className="font-black text-xl leading-none">{currentIndex + 1}<span className={theme === 'dark' ? 'text-slate-700' : 'text-slate-200'}> / {totalQuestions}</span></p>
                </div>
              </header>

              {/* Progress */}
              <div className={`w-full h-1.5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <motion.div 
                  className="h-full bg-yellow-400" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>

              <main className="flex-1 p-6 space-y-6 overflow-y-auto">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${theme === 'dark' ? 'text-green-400 bg-green-400/10' : 'text-green-600 bg-green-500/10'}`}><CheckCircle2 className="w-3.5 h-3.5" />{score}</span>
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${theme === 'dark' ? 'text-red-400 bg-red-400/10' : 'text-red-600 bg-red-500/10'}`}><XCircle className="w-3.5 h-3.5" />{errors}</span>
                  </div>
                  {!isPremium && <span className="text-[10px] font-black text-yellow-500 animate-pulse bg-yellow-400/10 px-2 py-1 rounded-lg">PRUEBA LIMITADA</span>}
                </div>

                <h2 className={`text-xl font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  {currentQuestion?.question}
                </h2>

                <div className="space-y-3">
                  {currentQuestion?.options.map((option, idx) => {
                    const isSelected = answers[currentIndex] === idx;
                    const isCorrect = currentQuestion.correct === idx;
                    const hasAnswered = answers[currentIndex] !== undefined;
                    
                    let bgStyle = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
                    let textStyle = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';

                    if (hasAnswered) {
                      if (isCorrect) {
                        bgStyle = theme === 'dark' ? "bg-green-500/20 border-green-500" : "bg-green-500/10 border-green-500";
                        textStyle = "text-green-500 font-bold";
                      } else if (isSelected) {
                        bgStyle = theme === 'dark' ? "bg-red-500/20 border-red-500" : "bg-red-500/10 border-red-500";
                        textStyle = "text-red-500 font-bold";
                      } else {
                        bgStyle = "opacity-40 border-transparent shadow-none";
                        textStyle = theme === 'dark' ? 'text-slate-600' : 'text-slate-300';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={hasAnswered}
                        onClick={() => handleSelectAnswer(idx)}
                        className={`w-full p-5 rounded-3xl border-2 text-left font-medium transition-all flex items-center justify-between ${bgStyle} ${textStyle}`}
                      >
                        <span>{option}</span>
                        {hasAnswered && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                        {hasAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                      </button>
                    );
                  })}
                </div>

                {answers[currentIndex] !== undefined && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-3xl border ${theme === 'dark' ? 'bg-slate-950 border-yellow-400/20 text-slate-300' : 'bg-blue-50 border-blue-100 text-blue-900'} text-sm`}
                  >
                    <p className={`font-bold mb-1 uppercase tracking-tight text-[10px] ${theme === 'dark' ? 'text-yellow-400' : 'text-blue-900'}`}>Explicación Técnica:</p>
                    {currentQuestion?.description}
                  </motion.div>
                )}

                <div className="pt-4">
                  {!isPremium && currentIndex >= FREE_QUESTIONS_LIMIT - 1 && answers[currentIndex] !== undefined ? (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-8 rounded-[2.5rem] text-center space-y-4 shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-slate-900'}`}
                    >
                      <Lock className="w-10 h-10 text-yellow-500 mx-auto" />
                      <div className="space-y-1">
                        <h3 className="text-white font-bold text-lg">Fin de Prueba Gratis</h3>
                        <p className="text-slate-400 text-xs">
                          La versión Premium desbloquea 50 preguntas diferentes en cada sesión para que practiques y ganes.
                        </p>
                      </div>
                      <button 
                        onClick={handlePurchaseSuccess}
                        className="w-full bg-yellow-400 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-400/20"
                      >
                        <CreditCard className="w-5 h-5" />
                        DESBLOQUEAR PREMIUM
                      </button>
                    </motion.div>
                  ) : (
                    <button 
                      onClick={handleNext}
                      disabled={answers[currentIndex] === undefined}
                      className="w-full bg-slate-950 text-yellow-400 font-black py-5 rounded-[2rem] flex items-center justify-center gap-2 disabled:opacity-30 hover:bg-slate-900 shadow-xl shadow-yellow-400/5 active:scale-95 transition-all border border-yellow-400/20"
                    >
                      {currentIndex === totalQuestions - 1 ? 'TERMINAR Y VER RESULTADOS' : 'SIGUIENTE PREGUNTA'}
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </main>
            </motion.div>
          )}

          {appState === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-8 space-y-8"
            >
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-slate-950 border-2 border-yellow-400 rounded-full flex items-center justify-center shadow-xl shadow-yellow-400/20">
                    <Trophy className="w-12 h-12 text-yellow-400" />
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="absolute -top-2 -right-2 bg-yellow-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full border-2 border-slate-950 shadow-lg"
                  >
                    100%
                  </motion.div>
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">¡Test Completado!</h2>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Resultados del simulador 2026</p>
                </div>
              </div>

              <div className="w-full flex gap-4">
                <div className={`flex-1 p-6 rounded-[2rem] border text-center ${theme === 'dark' ? 'bg-slate-900 border-green-500/20' : 'bg-green-50 border-green-100'}`}>
                  <p className="text-3xl font-black text-green-500">{score}</p>
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Aciertos</p>
                </div>
                <div className={`flex-1 p-6 rounded-[2rem] border text-center ${theme === 'dark' ? 'bg-slate-900 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
                  <p className="text-3xl font-black text-red-500">{errors}</p>
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Errores</p>
                </div>
              </div>

              <div className="w-full flex flex-col gap-4">
                <div className={`p-6 rounded-[2.5rem] border-4 border-yellow-400/20 text-center space-y-1 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Puntaje Final</p>
                  <p className={`text-6xl font-black ${theme === 'dark' ? 'text-yellow-400' : 'text-slate-800'}`}>{Math.round((score / totalQuestions) * 100)}</p>
                  <p className={`text-xs font-bold ${score >= (totalQuestions * 0.8) ? 'text-green-500' : 'text-red-500'}`}>
                    {score >= (totalQuestions * 0.8) ? '¡EXCELENTE! ESTÁS LISTO 🎉' : 'RECOMIENDA REPASAR EL MANUAL 📚'}
                  </p>
                </div>
                
                <div className={`p-4 rounded-2xl border text-center flex items-center justify-between px-8 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Tiempo Empleado</p>
                    <p className="font-bold text-lg">{formatTime(timeTaken)}</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setAppState('welcome')}
                className="w-full bg-yellow-400 text-slate-950 font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-yellow-300 transition-colors shadow-lg active:scale-95"
              >
                <RefreshCcw className="w-5 h-5" />
                INTENTAR DE NUEVO
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            >
              {/* Confetti Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: Math.random() * window.innerWidth, 
                      y: -20, 
                      rotate: 0,
                      scale: Math.random() * 0.5 + 0.5
                    }}
                    animate={{ 
                      y: window.innerHeight + 20,
                      rotate: 360,
                      opacity: [0, 1, 1, 0],
                      x: `calc(${Math.random() * 100}vw + ${Math.sin(i) * 100}px)`
                    }}
                    transition={{ 
                      duration: Math.random() * 2 + 3,
                      repeat: Infinity,
                      ease: "linear",
                      delay: Math.random() * 2
                    }}
                    className={`absolute w-3 h-3 rounded-full ${['bg-amber-400', 'bg-blue-500', 'bg-green-500', 'bg-pink-500', 'bg-purple-500'][i % 5]}`}
                  />
                ))}
              </div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} w-full max-w-sm rounded-[3rem] p-8 text-center shadow-2xl relative border`}
              >
                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-400/20">
                  <Trophy className="w-10 h-10 text-slate-950" />
                </div>
                
                <h2 className={`text-2xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  ¡Acceso Premium Activado!
                </h2>
                
                <p className={`text-sm mb-8 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Bienvenido a la mejor experiencia de estudio. Ahora tienes acceso ilimitado a más de 100 preguntas actualizadas del Manual COSEVI 2026.
                </p>

                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    confirmStartQuiz();
                  }}
                  className="w-full bg-yellow-400 text-slate-950 font-black py-5 rounded-[2rem] shadow-xl shadow-yellow-400/20 hover:bg-yellow-300 transition-all active:scale-95"
                >
                  ¡EMPEZAR AHORA!
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warning Modal */}
        <AnimatePresence>
          {showWarningModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`${theme === 'dark' ? 'bg-slate-900 border-yellow-400/20' : 'bg-white'} w-full max-w-xs rounded-[2.5rem] p-8 text-center shadow-2xl border`}
              >
                <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className={`text-xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Prueba Oficial
                </h2>
                <p className={`text-sm mb-8 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Esta prueba simula las condiciones reales del COSEVI. Cuentas con <span className="font-bold text-yellow-500">50 minutos</span> para completar las 40 preguntas. ¿Estás listo?
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={confirmStartQuiz}
                    className="w-full bg-yellow-400 text-slate-950 font-black py-4 rounded-2xl hover:bg-yellow-300 active:scale-95 transition-all"
                  >
                    Entendido, ¡Comenzar!
                  </button>
                  <button
                    onClick={() => setShowWarningModal(false)}
                    className={`w-full py-3 text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                  >
                    Tal vez luego
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Improved Navigation Simulation */}
        <div className={`p-4 flex justify-around border-t ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-white'}`}>
          <button onClick={() => setAppState('welcome')} className={`flex flex-col items-center gap-1 transition-colors ${appState === 'welcome' ? 'text-yellow-400' : 'text-slate-300'}`}>
            <Play className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase">Inicio</span>
          </button>
          <div className="flex flex-col items-center gap-1 text-slate-300 grayscale opacity-50 cursor-not-allowed">
            <BookOpen className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase">Manual</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-300 grayscale opacity-50 cursor-not-allowed">
            <Trophy className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase">Ranking</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-300 grayscale opacity-50 cursor-not-allowed">
            <Settings className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase">Ajustes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

