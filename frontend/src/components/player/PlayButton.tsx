import { useEffect, useRef } from "react"
import anime from "animejs"

export default function PlayButton({ isPlaying, onClick }: { isPlaying: boolean; onClick: () => void }) {
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    anime({
      targets: el.current,
      rotate: isPlaying ? "1turn" : 0,
      scale: isPlaying ? [1, 1.1] : 1,
      duration: isPlaying ? 20000 : 600,
      loop: isPlaying,
      direction: "alternate",
      easing: "easeInOutSine"
    })
  }, [isPlaying])

  return (
    <button
      ref={el}
      onClick={onClick}
      className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl flex items-center justify-center hover:scale-110 transition"
    >
      <span className="text-6xl font-bold text-white drop-shadow-lg">
        {isPlaying ? "⏸" : "▶"}
      </span>
    </button>
  )
}