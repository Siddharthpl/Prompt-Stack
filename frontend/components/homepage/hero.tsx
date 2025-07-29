"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"


function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }))


  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-foreground md:text-foreground/10 transition-colors duration-500"
        viewBox="0 0 696 316"
        fill="none"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.02}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export default function Hero() {
  const title = "Prompt Stack"
  const words = title.split(" ")
  const router = useRouter();
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium mb-8 bg-background/50 backdrop-blur-sm"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            The Ultimate AI Prompt Repository
          </motion.div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text 
                                        bg-gradient-to-r from-foreground to-foreground/80"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Save, remix, and share AI prompts with the community. The intelligent repository designed for AI power
            users.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <div
              className="inline-block group relative bg-card p-px rounded-2xl backdrop-blur-lg 
                          overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border"
            >
              <Button
                size="lg"
                onClick={() => router.push("/register")}
                className="rounded-[1.15rem] px-2 py-3 md:px-4 md:py-4 text-md md:text-lg font-semibold backdrop-blur-md 
                            bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 
                            group-hover:-translate-y-0.5 border-0"
              >
                <span className="opacity-90 group-hover:opacity-100 transition-opacity">Get Started Free</span>
                <ArrowRight
                  className="md:ml-2 h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 
                                transition-all duration-300"
                />
              </Button>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/explore")}
              className="px-4 py-3 md:py-4 text-md md:text-lg font-semibold backdrop-blur-md bg-background border-border text-foreground transition-all duration-300"
            >
              Explore Prompts
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-16 flex justify-between max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Prompts Shared</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-primary">5K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">AI Models</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
