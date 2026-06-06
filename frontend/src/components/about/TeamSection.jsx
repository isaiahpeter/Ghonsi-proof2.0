'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';

const teamMembers = [
  {
    name: 'Prosper Ayere',
    role: 'Founder & Product Lead',
    bio: "Prosper Ayere leads Ghonsi's product direction and partnerships. With experience in Web3 developers, professional and ecosystem operations - she understands the trust issues with unverifiable portfolios and is driving Ghonsi's mission to make builder records provable on-chain.",
    image: '/assets/team/Prosper.png',
    website: 'https://linkedin.com/in/prosper-ayere',
  },
  {
    name: 'Godwin Adakonye John',
    role: 'Blockchain Engineer',
    bio: 'Godwin is a Solana smart contract developer skilled in Rust and Anchor. He specializes in building scalable, decentralized applications (DApps) on Solana, combining deep technical expertise with a focus on reliability and real-world usability.',
    image: '/assets/team/godwin.jpg',
    website: 'https://linkedin.com/in/godwin-adakonye',
  },
  {
    name: 'Progress Ayere',
    role: 'Lead Frontend Engineer',
    bio: 'Progress is a front-end developer and blockchain educator specializing in clean, scalable, high-performance interfaces with HTML, CSS, JavaScript, React, Next JS, Node JS, TypeScript and SQL. He implements UI/UX designs, shapes component architecture, and ensures a seamless user experience. He is also the co-founder of BlockChain on Campus (BCC), a student-led community driving Web3 awareness and adoption.',
    image: '/assets/team/progress.png',
    website: 'https://progress-dev.vercel.app',
  },
  {
    name: 'Victor Gunduor',
    role: 'Frontend Engineer',
    bio: 'Victor is a Frontend Engineer who crafts beautiful, responsive, and motion-rich interfaces using React, Tailwind CSS, TypeScript, and 3D motion. With obsessive attention to detail, he transforms complex workflows into immersive UIs users love. He is also a Web3 content creator and experienced writer.',
    image: '/assets/team/victor.jpg',
    website: 'https://linkedin.com/in/victor-gunduor',
  },
  {
    name: 'Nie Osaoboh',
    role: 'Product Designer',
    bio: 'Nie is a product designer with a background in digital marketing, focused on creating simple, user-friendly experiences. He designs products that are visually appealing and easy to use, helping bring ideas to life seamlessly.',
    image: '/assets/team/nie.jpg',
    website: 'https://linkedin.com/in/nie-osaoboh',
  },
  {
    name: 'Success Ola-Ojo',
    role: 'Advisor',
    bio: 'Success aka Web3Geek, is a community builder and blockchain educator with years of experience helping top web3 brands grow strong engaged communities. He currently serves as Regional Captain for SuperteamNG North East and North West, while also supporting major projects with community strategy and growth.',
    image: '/assets/team/success.jpg',
    website: 'https://linkedin.com/in/success-ola-ojo',
  },
];

export default function TeamSection() {
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <section id="team" className="py-20 px-5 text-center rounded-lg m-4 relative bg-gradient-to-b from-white/5 to-transparent">
      <div className="mb-16">
        <h2 className="text-white text-3xl md:text-5xl mb-4 font-bold font-[Inter]">
          A Team of Real Builders
        </h2>
        <p className="text-white/60 text-lg">
          We&apos;re a small, and committed team that&apos;s inclusive of people of different backgrounds.
          Get to know the wonderful team who&apos;s building our product, and shaping the proof of work layer.
        </p>
      </div>

      {/* Desktop grid */}
      <motion.div
        className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1150px] mx-auto justify-items-center"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {teamMembers.map((member) => (
          <motion.div
            key={member.name}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedMember(member)}
            className="w-[210px] bg-[#0B0F19] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:border-[#C19A4A]/30 transition-all duration-300"
          >
            <div className="p-4 pt-4">
              <img src={member.image} alt={member.name} className="w-full aspect-square object-cover rounded-xl" />
            </div>
            <div className="p-4 pt-2">
              <h3 className="text-white text-base font-bold mb-1">{member.name}</h3>
              <p className="text-[#C19A4A] text-xs uppercase italic mb-3">{member.role}</p>
              <div className="flex items-center justify-center text-white/40 text-xs">
                <span>View Profile</span>
                <ArrowRight size={12} className="ml-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile stack */}
      <motion.div
        className="md:hidden flex flex-col items-center gap-6 max-w-[360px] mx-auto"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {teamMembers.map((member) => (
          <motion.div
            key={member.name}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            onClick={() => setSelectedMember(member)}
            className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
          >
            <div className="p-4 pt-4">
              <img src={member.image} alt={member.name} className="w-full aspect-square object-cover rounded-xl" />
            </div>
            <div className="p-4 pt-2">
              <h3 className="text-[#C19A4A] text-base font-bold mb-1">{member.name}</h3>
              <p className="text-white text-xs uppercase mb-3">{member.role}</p>
              <div className="flex items-center justify-center text-white/40 text-xs">
                <span>View Profile</span>
                <ArrowRight size={12} className="ml-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMember(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-[750px] w-full relative mt-20 md:mt-0 md:max-h-[90vh] md:overflow-y-auto flex flex-col max-h-[85vh]"
            >
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              >
                <X size={20} className="text-gray-600" />
              </button>

              {/* Desktop modal layout */}
              <div className="hidden md:flex gap-8 p-8">
                <img src={selectedMember.image} alt={selectedMember.name} className="w-[220px] h-[280px] object-cover rounded-xl flex-shrink-0" />
                <div className="flex-1 flex flex-col">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedMember.name}</h2>
                  <p className="text-[#C19A4A] text-sm uppercase italic mb-6">{selectedMember.role}</p>
                  <p className="text-gray-700 text-base leading-relaxed mb-6 flex-1">{selectedMember.bio}</p>
                  <a href={selectedMember.website} target="_blank" rel="noopener noreferrer" className="text-[#C19A4A] hover:text-[#a8853b] underline text-sm font-medium inline-flex items-center gap-1">
                    Personal Website <ArrowRight size={14} />
                  </a>
                </div>
              </div>

              {/* Mobile modal layout */}
              <div className="md:hidden overflow-y-auto h-full">
                <div className="p-6">
                  <img src={selectedMember.image} alt={selectedMember.name} className="w-full aspect-square object-cover rounded-xl mb-6" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedMember.name}</h2>
                  <p className="text-[#C19A4A] text-sm uppercase italic mb-6">{selectedMember.role}</p>
                  <p className="text-gray-700 text-base leading-relaxed mb-6">{selectedMember.bio}</p>
                  <a href={selectedMember.website} target="_blank" rel="noopener noreferrer" className="text-[#C19A4A] hover:text-[#a8853b] underline text-sm font-medium inline-flex items-center gap-1">
                    Personal Website <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
