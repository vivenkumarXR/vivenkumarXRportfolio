import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import SectionWrapper, { fadeIn, textVariant } from "./SectionWrapper";
import { socials } from "../constants";
import { MailIcon, LinkedInIcon, GitHubIcon, MediumIcon, XIcon } from "./Icons";

const PlanetCanvas = lazy(() => import("./canvas/Planet"));

const links = [
  { label: "Email", href: socials.email, icon: <MailIcon /> },
  { label: "LinkedIn", href: socials.linkedin, icon: <LinkedInIcon /> },
  { label: "GitHub", href: socials.github, icon: <GitHubIcon /> },
  { label: "Medium", href: socials.medium, icon: <MediumIcon /> },
  { label: "X / Twitter", href: socials.twitter, icon: <XIcon /> },
];

function Contact() {
  return (
    <div className="xl:mt-12 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden">
      <motion.div
        variants={fadeIn("left", 0.2)}
        className="flex-[0.75] glass-card p-8 rounded-2xl"
      >
        <motion.div variants={textVariant()}>
          <p className="sm:text-[18px] text-[14px] text-secondary uppercase tracking-wider">
            Get in touch
          </p>
          <h2 className="text-white font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px]">
            Contact.
          </h2>
        </motion.div>

        <p className="text-secondary text-[16px] mt-4 leading-[28px] max-w-md">
          Whether it's an XR project, a Physical AI experiment, a speaking opportunity, or
          mentorship for your community — my inbox is open.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noreferrer"
              className="glass-card rounded-xl px-6 py-4 flex items-center gap-4 text-white font-medium hover:translate-x-1 transition duration-300"
            >
              <span>{link.icon}</span>
              {link.label}
            </a>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={fadeIn("right", 0.2)}
        className="xl:flex-1 xl:h-auto md:h-[550px] h-[350px]"
      >
        <Suspense fallback={null}>
          <PlanetCanvas />
        </Suspense>
      </motion.div>
    </div>
  );
}

export default SectionWrapper(Contact, "contact");
