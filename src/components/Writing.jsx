import { motion } from "framer-motion";
import SectionWrapper, { fadeIn, textVariant } from "./SectionWrapper";
import { articles, socials } from "../constants";

function Writing() {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className="sm:text-[18px] text-[14px] text-secondary uppercase tracking-wider">
          Thoughts & tutorials
        </p>
        <h2 className="text-white font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px]">
          Writing.
        </h2>
      </motion.div>

      <div className="mt-12 grid sm:grid-cols-2 grid-cols-1 gap-6">
        {articles.map((article, index) => (
          <motion.a
            key={article.title}
            variants={fadeIn("up", index * 0.1)}
            href={socials.medium}
            target="_blank"
            rel="noreferrer"
            className="glass-card rounded-2xl p-6 transition hover:-translate-y-1 duration-300 block"
          >
            <p className="text-accent text-[13px] font-medium">{article.date}</p>
            <h3 className="text-white font-bold text-[18px] mt-2 leading-snug">
              {article.title}
            </h3>
            <p className="text-secondary text-[14px] mt-2 leading-[24px]">
              {article.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="text-[12px] text-secondary glass-card rounded-full px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </motion.a>
        ))}
      </div>

      <motion.div variants={fadeIn("up", 0.4)} className="mt-8">
        <a
          href={socials.medium}
          target="_blank"
          rel="noreferrer"
          className="text-accent text-[16px] font-semibold hover:underline"
        >
          Read all articles on Medium →
        </a>
      </motion.div>
    </>
  );
}

export default SectionWrapper(Writing, "writing");
