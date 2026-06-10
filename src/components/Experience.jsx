import { motion } from "framer-motion";
import SectionWrapper, { fadeIn, textVariant } from "./SectionWrapper";
import { experiences, testimonials } from "../constants";

function ExperienceCard({ experience, index }) {
  return (
    <motion.div variants={fadeIn("up", index * 0.1)} className="relative pl-10 pb-12 last:pb-0">
      <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-accent ring-4 ring-accent/20" />
      <div className="absolute left-[7px] top-6 bottom-0 w-[2px] bg-accent/20" />
      <div className="glass-card rounded-2xl p-6 transition">
        <div className="flex flex-wrap justify-between items-baseline gap-2">
          <h3 className="text-white text-[22px] font-bold">{experience.title}</h3>
          <span className="text-accent text-[14px] font-medium">{experience.date}</span>
        </div>
        <p className="text-secondary text-[16px] font-semibold mt-1">
          {experience.company_name}
        </p>
        <ul className="mt-4 list-disc ml-5 space-y-2">
          {experience.points.map((point, i) => (
            <li key={i} className="text-white-100 text-[14px] pl-1 tracking-wide leading-[24px]">
              {point}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function Experience() {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className="sm:text-[18px] text-[14px] text-secondary uppercase tracking-wider">
          What I have done so far
        </p>
        <h2 className="text-white font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px]">
          Work Experience.
        </h2>
      </motion.div>

      <div className="mt-12 flex flex-col">
        {experiences.map((experience, index) => (
          <ExperienceCard key={`${experience.company_name}-${index}`} experience={experience} index={index} />
        ))}
      </div>

      <div className="mt-16">
        {testimonials.map((t) => (
          <motion.div
            key={t.name}
            variants={fadeIn("up", 0.2)}
            className="glass-card rounded-2xl p-8 max-w-2xl"
          >
            <p className="text-white text-[40px] font-black leading-none">"</p>
            <p className="text-white-100 text-[17px] leading-[30px] -mt-3">{t.testimonial}</p>
            <p className="text-accent text-[15px] font-semibold mt-4">
              {t.name} <span className="text-secondary font-normal">· {t.company}</span>
            </p>
          </motion.div>
        ))}
      </div>
    </>
  );
}

export default SectionWrapper(Experience, "work");
