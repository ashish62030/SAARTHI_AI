import { useEffect, useRef, useState } from 'react'
import { FiVolume2, FiVolumeX } from 'react-icons/fi'

const themes = {
  dark: {
    bg: 'bg-[#050816]',
    overlay: 'bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.2),transparent_48%)]',
    orb: 'from-cyan-400 via-purple-500 to-pink-500',
    border: 'border-white/10',
    text: 'text-white',
    sub: 'text-white/60',
    accent: 'text-emerald-300',
    button: 'from-purple-500 to-violet-400',
    surface: 'bg-white/[0.06]',
    bubble: 'bg-white/10 text-white',
  },
  light: {
    bg: 'bg-gradient-to-br from-white via-[#f8fafc] to-[#eef6ff]',
    overlay: 'bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_48%)]',
    orb: 'from-blue-300 via-cyan-300 to-pink-300',
    border: 'border-[#dbeafe]',
    text: 'text-[#081028]',
    sub: 'text-[#475569]',
    accent: 'text-blue-600',
    button: 'from-blue-400 to-cyan-400',
    surface: 'bg-white/75',
    bubble: 'bg-blue-50 text-[#081028]',
  },
  glass: {
    bg: 'bg-[#111326]',
    overlay: 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_48%)]',
    orb: 'from-cyan-200 via-violet-300 to-fuchsia-300',
    border: 'border-white/10',
    text: 'text-white',
    sub: 'text-white/65',
    accent: 'text-cyan-200',
    button: 'from-cyan-400 to-violet-500',
    surface: 'bg-white/[0.07]',
    bubble: 'bg-white/10 text-white',
  },
  neon: {
    bg: 'bg-[#03120d]',
    overlay: 'bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.2),transparent_48%)]',
    orb: 'from-emerald-300 via-green-400 to-cyan-400',
    border: 'border-emerald-400/20',
    text: 'text-emerald-50',
    sub: 'text-emerald-100/65',
    accent: 'text-emerald-300',
    button: 'from-emerald-400 to-green-500',
    surface: 'bg-emerald-300/[0.07]',
    bubble: 'bg-emerald-300/10 text-emerald-50',
  },
}

const questions = [
  {
    label: 'What can it do?',
    question: 'What can Saarthi do for my website?',
    answer: 'Saarthi answers visitor questions using your business information and can guide people to pages on your website.',
  },
  {
    label: 'How do I add it?',
    question: 'How do I add Saarthi to my website?',
    answer: 'Customize your assistant in the builder, then copy one small script tag into your website. No complicated integration is needed.',
  },
  {
    label: 'Do I need to code?',
    question: 'Do I need coding skills to set it up?',
    answer: 'No. Add your business details, choose a voice and theme, and copy the embed code. Saarthi handles the setup for you.',
  },
]

function AssistantPreview() {
  const [theme, setTheme] = useState('dark')
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [thinking, setThinking] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const responseTimer = useRef(null)
  const current = themes[theme]

  useEffect(() => () => {
    clearTimeout(responseTimer.current)
    window.speechSynthesis?.cancel()
  }, [])

  const tryQuestion = (item) => {
    clearTimeout(responseTimer.current)
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    setSelectedQuestion(item)
    setThinking(true)
    responseTimer.current = setTimeout(() => setThinking(false), 550)
  }

  const toggleSpeech = () => {
    if (!selectedQuestion || thinking || !('speechSynthesis' in window)) return

    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(selectedQuestion.answer)
    utterance.lang = 'en-US'
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="px-3 py-10 sm:px-4 sm:py-14">
      <div className={`relative mx-auto min-h-[590px] w-full max-w-[430px] overflow-hidden rounded-[32px] border shadow-[0_24px_90px_rgba(15,23,42,0.22)] transition-colors duration-500 sm:rounded-[38px] ${current.bg} ${current.border}`}>
        <div className={`pointer-events-none absolute inset-0 ${current.overlay}`} />

        <div className="relative z-10 flex min-h-[590px] flex-col p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`relative h-11 w-11 shrink-0 rounded-full bg-gradient-to-br ${current.orb} shadow-[0_0_28px_rgba(168,85,247,0.35)]`}>
                <div className="absolute inset-1 rounded-full bg-white/20 blur-sm" />
              </div>
              <div className="min-w-0">
                <p className={`truncate text-sm font-semibold ${current.text}`}>Saarthi AI</p>
                <p className={`mt-0.5 flex items-center gap-1.5 text-[11px] ${current.sub}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Sample conversation
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5" aria-label="Preview themes">
              {[
                ['dark', 'Dark theme'],
                ['light', 'Light theme'],
                ['glass', 'Glass theme'],
                ['neon', 'Neon theme'],
              ].map(([name, label]) => (
                <button
                  key={name}
                  type="button"
                  aria-label={label}
                  aria-pressed={theme === name}
                  onClick={() => setTheme(name)}
                  className={`h-3.5 w-3.5 rounded-full border transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 ${
                    name === 'dark' ? 'bg-[#050816] border-white/40' :
                      name === 'light' ? 'bg-white border-slate-300' :
                        name === 'glass' ? 'bg-gradient-to-br from-cyan-200 to-fuchsia-400 border-white/50' :
                          'bg-emerald-400 border-emerald-200'
                  } ${theme === name ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-transparent' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="relative mx-auto mb-5 h-[76px] w-[76px]">
              <div className={`absolute inset-0 scale-150 rounded-full bg-gradient-to-br ${current.orb} opacity-35 blur-2xl`} />
              <div className={`relative h-full w-full rounded-full bg-gradient-to-br ${current.orb} shadow-[0_0_45px_rgba(255,255,255,0.12)] before:absolute before:inset-2 before:rounded-full before:bg-white/20 before:blur-md`} />
            </div>
            <h2 className={`text-xl font-semibold sm:text-2xl ${current.text}`}>Ask Saarthi a question</h2>
            <p className={`mx-auto mt-2 max-w-[290px] text-sm leading-6 ${current.sub}`}>
              Try a sample conversation. No sign-up or microphone needed.
            </p>
          </div>

          <div aria-live="polite" className={`mt-6 flex min-h-[170px] flex-1 flex-col gap-3 rounded-2xl border p-4 ${current.surface} ${current.border}`}>
            {selectedQuestion ? (
              <>
                <div className={`max-w-[90%] self-end rounded-2xl rounded-br-md px-3.5 py-2.5 text-left text-xs leading-5 ${current.bubble}`}>
                  {selectedQuestion.question}
                </div>
                {thinking ? (
                  <div className={`flex items-center gap-2 px-1 py-2 text-xs ${current.sub}`}>
                    <span className="flex gap-1" aria-hidden="true">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400" />
                    </span>
                    Saarthi is thinking
                  </div>
                ) : (
                  <div className={`max-w-[95%] self-start rounded-2xl rounded-bl-md px-3.5 py-3 text-left text-xs leading-5 ${current.bubble}`}>
                    {selectedQuestion.answer}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <span className={`mb-2 text-xl ${current.accent}`} aria-hidden="true">✦</span>
                <p className={`text-sm font-medium ${current.text}`}>Your website assistant, in action</p>
                <p className={`mt-1 max-w-[230px] text-xs leading-5 ${current.sub}`}>
                  Pick a question below to see how Saarthi helps your visitors.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5">
            <p className={`mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${current.sub}`}>Try asking</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => tryQuestion(item)}
                  aria-pressed={selectedQuestion?.label === item.label}
                  className={`rounded-full border px-3 py-2 text-left text-[11px] font-medium transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 ${current.text} ${current.border} ${current.surface}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-current/10 pt-4">
            <span className={`text-[11px] ${current.sub}`}>Powered by your business knowledge</span>
            <button
              type="button"
              onClick={toggleSpeech}
              disabled={!selectedQuestion || thinking || !('speechSynthesis' in window)}
              className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${current.button} px-3 py-2 text-[11px] font-semibold text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {speaking ? <FiVolumeX size={14} aria-hidden="true" /> : <FiVolume2 size={14} aria-hidden="true" />}
              {speaking ? 'Stop audio' : 'Hear answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssistantPreview
