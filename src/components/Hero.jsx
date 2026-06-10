import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { heroTagline } from "../constants";

const ComputersCanvas = lazy(() => import("./canvas/Computers"));

export default function Hero() {
  return (
    <section className="relative w-full h-screen mx-auto">
      <div className="absolute inset-0 top-[120px] max-w-7xl mx-auto sm:px-16 px-6 flex flex-row items-start gap-5">
        <div className="flex flex-col justify-center items-center mt-5">
          <div className="w-5 h-5 rounded-full bg-accent" />
          <div className="w-1 sm:h-80 h-40 violet-gradient" />
        </div>

        <div>
          <h1 className="font-black text-white lg:text-[64px] sm:text-[50px] xs:text-[40px] text-[32px] lg:leading-[78px] mt-2">
            Hi, I'm <span className="text-accent">Vivek</span>
          </h1>
          <p className="text-[#dfd9ff] font-medium lg:text-[26px] sm:text-[22px] xs:text-[18px] text-[16px] lg:leading-[40px] mt-2 max-w-3xl">
            {heroTagline}
          </p>
          <p className="text-secondary sm:text-[17px] text-[14px] mt-4 max-w-2xl leading-[28px]">
            XR Solution Architect · Physical AI & Edge Computing · Digital Twin · Unity Certified
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <ComputersCanvas />
      </Suspense>

      <div className="absolute xs:bottom-10 bottom-24 w-full flex justify-center items-center">
        <a href="#about" aria-label="scroll to about">
          <div className="w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2">
            <motion.div
              animate={{ y: [0, 24, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
              className="w-3 h-3 rounded-full bg-secondary mb-1"
            />
          </div>
        </a>
      </div>
    </section>
  );
}
