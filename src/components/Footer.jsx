import { socials } from "../constants";

export default function Footer() {
  return (
    <footer className="bg-black-200 py-8 sm:px-16 px-6">
      <div className="max-w-7xl mx-auto flex sm:flex-row flex-col justify-between items-center gap-4">
        <p className="text-secondary text-[14px]">
          © {new Date().getFullYear()} Vivek Kumar Yadav · Built with React, Three.js & Tailwind
        </p>
        <div className="flex gap-6">
          <a href={socials.github} target="_blank" rel="noreferrer" className="text-secondary hover:text-white text-[14px] transition">GitHub</a>
          <a href={socials.linkedin} target="_blank" rel="noreferrer" className="text-secondary hover:text-white text-[14px] transition">LinkedIn</a>
          <a href={socials.medium} target="_blank" rel="noreferrer" className="text-secondary hover:text-white text-[14px] transition">Medium</a>
        </div>
      </div>
      <p className="text-secondary/50 text-[11px] text-center mt-6 max-w-3xl mx-auto">
        3D models: "Gaming Desktop PC" by Yolala1232 and "Stylized planet" by cmzw, licensed
        under CC-BY-4.0 via Sketchfab.
      </p>
    </footer>
  );
}
