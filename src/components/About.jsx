import { motion } from "framer-motion";
import SectionWrapper, { fadeIn, textVariant } from "./SectionWrapper";
import { aboutText, services, certifications } from "../constants";
import { HeadsetIcon, GamepadIcon, ChipIcon, GlobeIcon } from "./Icons";

const serviceIcons = {
  headset: <HeadsetIcon />,
  gamepad: <GamepadIcon />,
  chip: <ChipIcon />,
  globe: <GlobeIcon />,
};

function ServiceCard({ title, icon, index }) {
  return (
    <motion.div
      variants={fadeIn("up", index * 0.15)}
      className="xs:w-[250px] w-full glass-card p-[1px] rounded-[20px] shadow-card transition"
    >
      <div className="rounded-[20px] py-10 px-8 min-h-[220px] flex justify-evenly items-center flex-col">
        <span>{serviceIcons[icon]}</span>
        <h3 className="text-white text-[18px] font-bold text-center">{title}</h3>
      </div>
    </motion.div>
  );
}

function About() {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className="sm:text-[18px] text-[14px] text-secondary uppercase tracking-wider">
          Introduction
        </p>
        <h2 className="text-white font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px]">
          Overview.
        </h2>
      </motion.div>

      <motion.p
        variants={fadeIn("", 0.1)}
        className="mt-4 text-secondary text-[17px] max-w-3xl leading-[30px]"
      >
        {aboutText}
      </motion.p>

      <div className="mt-16 flex flex-wrap gap-8 justify-center sm:justify-start">
        {services.map((service, index) => (
          <ServiceCard key={service.title} index={index} {...service} />
        ))}
      </div>

      <motion.div variants={textVariant(0.2)} className="mt-20">
        <p className="sm:text-[18px] text-[14px] text-secondary uppercase tracking-wider">
          Credentials
        </p>
        <h3 className="text-white font-bold sm:text-[32px] text-[24px]">Certifications.</h3>
      </motion.div>

      <div className="mt-8 flex flex-wrap gap-4">
        {certifications.map((cert, index) => (
          <motion.div
            key={cert.title}
            variants={fadeIn("up", index * 0.08)}
            className="glass-card rounded-xl px-5 py-4 transition"
          >
            <p className="text-white text-[15px] font-semibold">{cert.title}</p>
            <p className="text-secondary text-[13px] mt-1">
              {cert.issuer} · {cert.year}
            </p>
          </motion.div>
        ))}
      </div>
    </>
  );
}

export default SectionWrapper(About, "about");
