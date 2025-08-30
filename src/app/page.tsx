"use client";
import { useState, useEffect } from "react";
import { Ripple } from "../components/magicui/ripple";
import { motion } from "framer-motion";
import { ArrowRight, HeartPulse, Lightbulb, Lock, MessageSquareHeart, Waves } from "lucide-react";
import { div } from "framer-motion/client";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export default function Home() {
  const features = [
    {
      icon: HeartPulse,
      title: "24/7 Support",
      description: "Get assistance anytime you need it, day or night.",
      color: "from-rose-500/20",
      delay: 0.2,
    },
    {
      icon: Lightbulb,
      title: "Smart Insights",
      description: "Receive personalized insights based on your mood and interactions.",
      color: "from-amber-500/20",
      delay: 0.4,
    },
    {
      icon: Lock, // Replace with actual icon component
      title: "Private and Secure",
      description: "Your data is protected with top-notch security measures.",
      color: "from-emerald-500/20",
      delay: 0.6,
    },
    {
      icon: MessageSquareHeart, // Replace with actual icon component
      title: "Evidence-Based",
      description: "Utilizes proven methods to support your mental well-being.",
      color: "from-blue-500/20",
      delay: 0.8,
    },
  ];
  const emotions = [
    { value: 0, label: "😔 Down", color: "from-pink-400/50" },
    { value: 25, label: "😌 Peaceful", color: "from-purple-400/50" },
    { value: 50, label: "😊 Content", color: "from-pink-500/50" },
    { value: 75, label: "🤗 Happy", color: "from-purple-500/50" },
    { value: 100, label: "🥳 Excited", color: "from-sky-400/50" },
  ];

  const [emotion, setEmotion] = useState(50);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentEmotion =
    emotions.find((em) => Math.abs(emotion - em.value) < 15) || emotions[2];

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <section className="relative min-h-[90vh] mt-20 flex flex-col items-center justify-center py-12 px-4">
        <div
          className={`absolute w-[500px] h-[500px] rounded-full blur-3xl top-0 left-20 transition-all duration-700 ease-in-out bg-gradient-to-r ${currentEmotion.color} to-transparent opacity-60`}
        />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl bottom-0 right-0 animate-pulse delay-700" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />

        <Ripple className="opacity-60" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative space-y-8 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm border border-primary/20 bg-primary/5 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
            <Waves className="w-4 h-4 text-primary" />
            <span>Your AI Companion to Boost Mental Well-being</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-plus-jakarta tracking-light">
            <span className="inline-block bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)] hover:to-primary transition-all duration-300">
              FIND PEACE
            </span>
            <br />
            <span className="inline-block mt-2 bg-gradient-to-b from-foreground to-foreground/90 bg-clip-text text-transparent">
              OF MIND
            </span>
          </h1>
          <p className="max-w-[600px] mx-auto text-base md:text-lg text-muted-foreground leading-relaxed tracking-wide">
            Yo,vibe with a whole new way to get emotional support!Our AI buddy’s
            here to listen, get you, and help you slay life’s journey.
          </p>
          {/* Emotion Slider */}
          <motion.div
            className="w-full max-w-[600px] mx-auto space-y-6 py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          >
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground/80 font-medium">
                Whatever you are feeling, we are here to listen
              </p>
              <div className="flex justify-between items-center px-2">
               { emotions.map((em) => (
                <div
                key={em.value}
                className={`transition-all duration-500 ease-out cursor-pointer hover:scale-105 ${Math.abs(emotion-em.value)<15?"opacity-100 scale-100 transform-gpu":"opacity-50 scale-100"}`}
                onClick={()=>setEmotion(em.value)}>
                  <div className="text-2xl transform-gpu">{em.label.split(" ")[0]}</div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">{em.label.split(" ")[1]}</div>

                </div>
               ))}
              </div>
            </div>
            {/* Slider */}

           <div>
           <Slider
            value={[emotion]}
            onValueChange={(value)=>setEmotion(value[0])}
            max={100}
            min={0}
            step={1}
            className="py-4"
            />
           </div>
           <div className="text-center">
            <p className="text-sm text-muted-foreground animate-pulse">
              Slide to express how you are feeling
            </p>

           </div>
          </motion.div>
          <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{opacity:0, y:20}}
          animate={{opacity: mounted?1:0, y: mounted?0:20}}
          transition={{duration:1, ease:"easeOut", delay:0.6}}

          >
            <Button
            size={"lg"}
            className="relative group h-12 px-8 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold overflow-hidden hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
            >
              <span className="relative z-10 font-medium flex items-center gap-2">
               Begin your KORA journey
               <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1"/>
              </span>

            </Button>

          </motion.div>
        </motion.div>
      </section>
      {/* Additional sections can be added here */}
      <section className="relative py-20 px-4 overflow:hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16 space-y-4 text-white">
           <h2 className="text-3xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent dark:text-primary/90">
            HOW KORA HELPS YOU
           </h2>
           <p className="text-foreground dark:text-foreground/95 max-w-2xl mx-auto font-medium text-lg">
            Experience personalized support with KORA's AI-powered chat, mood tracking, and mindfulness exercises designed to enhance your mental well-being.
           </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {features.map((feature, index)=>(
              <motion.div
              key={feature.title}
              className="p-6 rounded-2xl border border-primary/10 bg-primary/5 backdrop-blur-sm hover:bg-primary/10 hover:scale-105 transition-all duration-300"
              initial={{opacity:0, y:20}}
              whileInView={{opacity:1, y:0}}
              viewport={{once:true}}
              transition={{duration:0.6, delay:feature.delay}}
              >
                <div className={`w-12 h-12 mb-4 rounded-lg bg-gradient-to-tr ${feature.color} to-transparent flex items-center justify-center`}>
                  <feature.icon className="w-6 h-6 text-white stroke-current" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground dark:text-foreground/90">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
              
          </div>
        </div>

      </section>
    </div>
  );
}
