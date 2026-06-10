import { motion } from "framer-motion";
import SectionWrapper, { fadeIn, textVariant } from "./SectionWrapper";
import { projects } from "../constants";

function ProjectCard({ project, index }) {
  return (
    <motion.div
      variants={fadeIn("up", index * 0.08)}
      className="glass-card rounded-2xl p-6 sm:w-[360px] w-full flex flex-col justify-between transition hover:-translate-y-1 duration-300"
    >
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-white font-bold text-[20px] leading-snug">{project.name}</h3>
          <a
            href={project.source_code_link}
            target="_blank"
            rel="noreferrer"
            aria-label={`${project.name} source code`}
            className="black-gradient w-10 h-10 min-w-[40px] rounded-full flex justify-center items-center cursor-pointer ml-3"
          >
            <svg viewBox="0 0 16 16" width="20" height="20" fill="#fff" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>
        <p className="mt-3 text-secondary text-[14px] leading-[24px]">{project.description}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <p key={tag.name} className={`text-[13px] font-medium ${tag.color}`}>
            #{tag.name.replace(/\s+/g, "")}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

function Projects() {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className="sm:text-[18px] text-[14px] text-secondary uppercase tracking-wider">
          My work
        </p>
        <h2 className="text-white font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px]">
          Projects.
        </h2>
      </motion.div>

      <motion.p
        variants={fadeIn("", 0.1)}
        className="mt-3 text-secondary text-[17px] max-w-3xl leading-[30px]"
      >
        From real-time voice AI agents and edge-AI experiments to VR wellness apps and a C++
        game engine built from scratch — each project links to its source code on GitHub.
      </motion.p>

      <div className="mt-12 flex flex-wrap gap-7">
        {projects.map((project, index) => (
          <ProjectCard key={project.name} project={project} index={index} />
        ))}
      </div>
    </>
  );
}

export default SectionWrapper(Projects, "projects");
