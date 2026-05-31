'use client';
import React, { useState, useEffect } from 'react';
import { Eye, Users, Lightbulb, Accessibility, Rocket, Trophy, Briefcase, Building2, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

function About() {
  const [activeValueSlide, setActiveValueSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const valueInterval = setInterval(() => {
      setActiveValueSlide((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(valueInterval);
  }, []);

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-[18px]');
          entry.target.classList.add('opacity-100', 'translate-y-0');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(r => obs.observe(r));
    
    return () => obs.disconnect();
  }, []);

  if (loading) {
    return <SkeletonLoader type="about" />;
  }

   const teamMembers = [
    { 
      name: 'Prosper Ayere', 
      role: 'Founder & Product Lead', 
      bio: 'Prosper Ayere leads Ghonsi’s product direction and partnerships. With experience in Web3 developers, professional and ecosystem operations - she understands the trust issues with unverifiable portfolios and is driving Ghonsi’s mission to make builder records provable on-chain.', 
      image: '/assets/team/Prosper.png',
      website: 'https://linkedin.com/in/prosper-ayere'
    },
    { 
      name: 'Godwin Adakonye John', 
      role: 'Blockchain Engineer', 
      bio: 'Godwin is a Solana smart contract developer skilled in Rust and Anchor. He specializes in building scalable, decentralized applications (DApps) on Solana, combining deep technical expertise with a focus on reliability and real-world usability.', 
      image: '/assets/team/godwin.jpg',
      website: 'https://linkedin.com/in/godwin-adakonye'
    },
    { 
      name: 'Progress Ayere', 
      role: 'Lead Frontend Engineer', 
      bio: 'Progress is a front-end developer and blockchain educator specializing in clean, scalable, high-performance interfaces with HTML, CSS, JavaScript, React, Next JS, Node JS, TypeScript and SQL. He implements UI/UX designs, shapes component architecture, and ensures a seamless user experience. He is also the co-founder of BlockChain on Campus (BCC), a student-led community driving Web3 awareness and adoption.', 
      image: '/assets/team/progress.png',
      website: 'https://progress-dev.vercel.app'
    },
    { 
      name: 'Nie Osaoboh', 
      role: 'Product Lead', 
      bio: 'Nie is a product designer with a background in digital marketing, focused on creating simple, user-friendly experiences. He designs products that are visually appealing and easy to use, helping bring ideas to life seamlessly.', 
      image: '/assets/team/nie.jpg',
      website: 'https://linkedin.com/in/nie-osaoboh'
    },
    { 
      name: 'Success Ola-Ojo', 
      role: 'Advisor', 
      bio: 'Success aka Web3Geek, is a community builder and blockchain educator with years of experience helping top web3 brands grow strong engaged communities. He currently serves as Regional Captain for SuperteamNG North East and North West, while also supporting major projects with community strategy and growth.', 
      image: '/assets/team/success.jpg',
      website: 'https://linkedin.com/in/success-ola-ojo'
    },
    { 
      name: 'Victor Gunduor', 
      role: 'Frontend Engineer', 
      bio: 'Victor is a Frontend Engineer who crafts beautiful, responsive, and motion-rich interfaces using React, Tailwind CSS, TypeScript, and 3D motion. With obsessive attention to detail, he transforms complex workflows into immersive UIs users love. He is also a Web3 content creator and experienced writer.', 
      image: '/assets/team/victor.jpg',
      website: 'https://linkedin.com/in/victor-gunduor'
    }
  ];
  // Define values as plain objects without JSX
  const valuesData = [
    { 
      iconName: 'Eye',
      title: 'Transparency', 
      desc: 'Every proof and every agent action is provably true on-chain' 
    },
    { 
      iconName: 'Users',
      title: 'Accessibility', 
      desc: 'Building tools that empower everyone in Web3 & tech' 
    },
    { 
      iconName: 'Lightbulb',
      title: 'Innovation', 
      desc: 'Merging real human proof with personal AI agents to 10× productivity while keeping trust at the core' 
    },
    { 
      iconName: 'Accessibility',
      title: 'Inclusivity', 
      desc: 'Creating opportunities for all builders' 
    }
  ];

  // Helper function to render icons
  const renderIcon = (iconName) => {
    const iconSize = 32;
    switch(iconName) {
      case 'Eye':
        return <Eye size={iconSize} />;
      case 'Users':
        return <Users size={iconSize} />;
      case 'Lightbulb':
        return <Lightbulb size={iconSize} />;
      case 'Accessibility':
        return <Accessibility size={iconSize} />;
      default:
        return null;
    }
  };

  const handleValueSlideClick = (index) => {
    setActiveValueSlide(index);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white selection:bg-[#C19A4A]/30 relative overflow-hidden">
      
      {/* Background elements - matching home page */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(193,154,74,0.1) 1px, transparent 1px),
            linear-gradient(0deg, rgba(193,154,74,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
      </div>

      
      <div className="max-w-full mx-auto mt-[70px] min-h-screen relative z-10">
        
        {/* About Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          id="about" 
          className="p-4 text-center max-w-[100%] my-0 mx-auto mt-[110px] relative z-10"
        >
          <div className="opacity-85 font-bold font-[Inter] mb-8 text-4xl md:text-5xl">
            <span className="bg-gradient-to-r from-gray-400 to-[#C19A4A] bg-clip-text text-transparent">About Us</span>
          </div>
          
          {/* Mobile view - keep original */}
          <h1 className="md:hidden text-base text-left leading-[1.4] mb-3 font-normal text-gray-300">
            Ghonsi proof is a Web3 platform that turns real work into permanent, time-stamped on-chain records and then helps you scale that work with your own personal AI agent. <br /> <br/> We believe every builder deserves full credit for what they actually ship. No more scattered proofs across GitHub, Discord, X, and random folders. Your contributions should be easy to showcase, impossible to fake, and powerful enough to grow with you
          </h1>
          
          {/* Desktop view - with border matching next section */}
          <div className="hidden md:block max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
              <p className="text-white/80 text-base md:text-lg leading-relaxed text-left">
                Ghonsi proof is a Web3 platform that turns real work into permanent, time-stamped on-chain records and then helps you scale that work with your own personal AI agent.
                <br /><br />
                We believe every builder deserves full credit for what they actually ship. No more scattered proofs across GitHub, Discord, X, and random folders. Your contributions should be easy to showcase, impossible to fake, and powerful enough to grow with you
              </p>
            </div>
          </div>
        </motion.section>

                {/* Name Origin Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="p-4 text-center max-w-5xl my-0 mx-auto mt-16 mb-16 relative z-10"
        >
          <h2 className="text-white text-2xl md:text-3xl mb-8 font-bold font-[Inter]">Where does the name "Ghonsi" come from?</h2>
          
          <div className="relative max-w-4xl mx-auto mb-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 relative">
              <p className="text-white/80 text-base md:text-lg leading-relaxed">
                Ghonsi comes from "ghonsi" — a word in the Ika language, spoken by the indigenous people of Igbanke and Agbor in Nigeria. It means "to showcase" or "to prove something." It is pronounced as "hon-see" with a silent "g".
                <br /><br />
                This name carries deep cultural meaning for us. Ghonsi proof was born from the simple desire to help people proudly showcase who they are and what they've done — with real, tamper-proof evidence. Starting from African roots and built for the global tech (Web3) community, we created a place where your work speaks for itself.
              </p>
              
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-t-[24px] border-t-white/10"></div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A] to-[#d9b563] rounded-full blur-lg opacity-40"></div>
              <img 
                src="/assets/team/Prosper.png"
                alt="Prosper Ayere"
                className="relative w-full h-full rounded-full border-4 border-[#C19A4A] object-cover"
              />
            </div>
            <h3 className="text-white text-lg font-bold mb-1">Prosper Ayere</h3>
            <p className="text-[#C19A4A] text-sm">Founder at Ghonsi proof</p>
          </div>
        </motion.section>

        {/* Our Story Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="p-4 max-w-6xl mx-auto mt-20 mb-20 relative z-10"
        >
          <h2 className="text-white text-3xl md:text-4xl font-bold font-[Inter] text-center mb-12">Our Story</h2>
          
          {/* Desktop Layout: Image Left, Text Right */}
          <div className="hidden md:flex gap-8 items-start">
            {/* Image Container */}
            <div className="flex-shrink-0 w-[45%]">
              <div className="relative p-[3px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 flex items-center justify-center min-h-[400px]">
                  <img 
                    src="/assets/ghonsi-proof-logos/transparent-png-logo/Get-noticed.PNG"
                    alt="Ghonsi proof platform diagram" 
                    className="max-w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Text Container */}
            <div className="flex-1 text-white/80 text-base leading-relaxed space-y-4">
              <p>It started with a clear problem: In Web3, genuine builders struggle to prove their value. Portfolios are scattered, claims are hard to verify, and recruiters waste time sorting truth from hype.</p>
              
              <p>We began as proofHub — a simple tool to help professionals document their work as it happens. Then we rebuilt everything on Solana to create a tamper-proof professional identity layer.</p>
              
              <p className="font-semibold text-white">Today, Ghonsi proof lets you:</p>
              <ul className="list-none space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-[#C19A4A] mr-2">•</span>
                  <span>Upload your real work and verify it on-chain in seconds</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#C19A4A] mr-2">•</span>
                  <span>Build a permanent, shareable portfolio that anyone can trust instantly</span>
                </li>
              </ul>
              
              <p className="font-semibold text-white pt-2">But we didn't stop at proof.</p>
              
              <p>Real proof is the perfect foundation for something bigger.</p>
              
              <p>When your past work is permanently recorded on-chain with summaries, files, and context, it becomes rich, trustworthy data. That data lets us do something powerful: create your Mini-Them AI Agent.</p>
              
              <p>Your Mini-Them is a personal digital twin trained directly on your own on-chain proofs. It learns exactly how you work: your skills, your style, your voice, your standards.</p>
              
              <p>You hand over your way of working once (in three quick steps), and your Mini-Them starts executing real tasks on the platform, writing reports, updating designs, completing gigs in the Job Marketplace, or replying to clients, all while staying 100% true to you.</p>
              
              <p>Every output the Mini-Them produces is automatically turned into a new on-chain proof. Clients rate the whole Human + Mini-Them Team together.</p>
              
              <p className="font-semibold text-white">This is how humans and AI agents become one stronger unit on Ghonsi proof.</p>
              
              <p>proof is no longer just a record of the past, it powers your future productivity. You focus on high-value creative work while your team handles volume, and your portfolio grows automatically with verified, high-quality output</p>
            </div>
          </div>

          {/* Mobile Layout: Text First, Then Image */}
          <div className="md:hidden space-y-8">
            {/* Text Container */}
            <div className="text-white/80 text-base leading-relaxed space-y-4">
              <p>It started with a clear problem: In Web3, genuine builders struggle to prove their value. Portfolios are scattered, claims are hard to verify, and recruiters waste time sorting truth from hype.</p>
              
              <p>We began as proofHub — a simple tool to help professionals document their work as it happens. Then we rebuilt everything on Solana to create a tamper-proof professional identity layer.</p>
              
              <p className="font-semibold text-white">Today, Ghonsi proof lets you:</p>
              <ul className="list-none space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-[#C19A4A] mr-2">•</span>
                  <span>Upload your real work and verify it on-chain in seconds</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#C19A4A] mr-2">•</span>
                  <span>Build a permanent, shareable portfolio that anyone can trust instantly</span>
                </li>
              </ul>
              
              <p className="font-semibold text-white pt-2">But we didn't stop at proof.</p>
              
              <p>Real proof is the perfect foundation for something bigger.</p>
              
              <p>When your past work is permanently recorded on-chain with summaries, files, and context, it becomes rich, trustworthy data. That data lets us do something powerful: create your Mini-Them AI Agent.</p>
              
              <p>Your Mini-Them is a personal digital twin trained directly on your own on-chain proofs. It learns exactly how you work: your skills, your style, your voice, your standards.</p>
              
              <p>You hand over your way of working once (in three quick steps), and your Mini-Them starts executing real tasks on the platform, writing reports, updating designs, completing gigs in the Job Marketplace, or replying to clients, all while staying 100% true to you.</p>
              
              <p>Every output the Mini-Them produces is automatically turned into a new on-chain proof. Clients rate the whole Human + Mini-Them Team together.</p>
              
              <p className="font-semibold text-white">This is how humans and AI agents become one stronger unit on Ghonsi proof.</p>
              
              <p>proof is no longer just a record of the past, it powers your future productivity. You focus on high-value creative work while your team handles volume, and your portfolio grows automatically with verified, high-quality output</p>
            </div>

            {/* Image Container */}
            <div className="w-full">
              <div className="relative p-[3px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 flex items-center justify-center min-h-[300px]">
                  <img 
                    src="/assets/ghonsi-proof-logos/transparent-png-logo/Get-noticed.PNG"
                    alt="Ghonsi proof platform diagram" 
                    className="max-w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Discoverability and Hiring Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="p-4 max-w-6xl mx-auto mt-20 mb-20 relative z-10"
        >
          {/* Desktop Layout: Text Left, Button Right */}
          <div className="hidden md:flex items-center justify-between gap-12">
            <div className="flex-1">
              <h2 className="text-[#0B0F1B] bg-[#C19A4A] rounded-lg px-6 py-4 text-3xl lg:text-4xl font-bold font-[Inter] mb-4 inline-block">Discoverability and Hiring</h2>
              <p className="text-white/70 text-base leading-relaxed max-w-2xl">
                Our discovery layer makes it easy to explore real talents, see what people (and their teams) are building, and request work directly. With the upcoming Job Marketplace, companies can post gigs that both humans and Mini-Them agents can execute, creating faster, more reliable delivery for everyone.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button className="flex items-center gap-2 bg-transparent border-2 border-[#C19A4A] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#C19A4A] hover:text-[#0B0F1B] transition-all duration-300">
                Explore Proofs
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Layout: Text First, Then Button */}
          <div className="md:hidden space-y-6">
            <div className="text-center">
              <h2 className="text-[#0B0F1B] bg-[#C19A4A] rounded-lg px-6 py-4 text-2xl font-bold font-[Inter] mb-4 inline-block">Discoverability and Hiring</h2>
              <p className="text-white/70 text-base leading-relaxed">
                Our discovery layer makes it easy to explore real talents, see what people (and their teams) are building, and request work directly. With the upcoming Job Marketplace, companies can post gigs that both humans and Mini-Them agents can execute, creating faster, more reliable delivery for everyone.
              </p>
            </div>
            <button className="flex items-center gap-2 bg-transparent border-2 border-[#C19A4A] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#C19A4A] hover:text-[#0B0F1B] transition-all duration-300 w-full justify-center">
              Explore Proofs
              <ArrowRight size={20} />
            </button>
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          id="values" 
          className="py-16 px-5 text-center rounded-lg m-4 relative max-w-5xl mx-auto"
        >
          <div>
            <h2 className="text-white text-3xl mb-4 font-[Inter] font-bold">Our Values</h2>
            <h2 className="text-white/70 mb-4 font-[Inter]">These guide everything we build</h2>
          </div>
          <div 
            className="relative max-w-[25rem] mx-auto h-72 cursor-pointer mt-[-25px]" 
            id="valuesGallery"
            role="region"
            aria-label="Company values carousel"
            onClick={() => setActiveValueSlide((prev) => (prev + 1) % 4)}
          >
        
            {valuesData.map((value, index) => (
              <div
                key={value.title}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${
                  activeValueSlide === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563] mb-6">
                  <div className="bg-[#0B0F1B] rounded-2xl p-4 text-[#C19A4A]">
                    {renderIcon(value.iconName)}
                  </div>
                </div>
                <h3 className="text-white text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-400 text-sm max-w-[300px]">{value.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Values navigation">
            {valuesData.map((value, i) => (
              <button
                key={value.title}
                onClick={(e) => {
                  e.stopPropagation();
                  handleValueSlideClick(i);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeValueSlide === i ? 'bg-[#C19A4A] w-8' : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Show ${value.title} value`}
                aria-current={activeValueSlide === i ? 'true' : 'false'}
                role="tab"
              />
            ))}
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          id="team" 
          className="py-20 px-5 text-center rounded-lg m-4 relative bg-gradient-to-b from-white/5 to-transparent"
        >
          {/* Heading Block */}
          <div className="mb-16">
            <h2 className="text-white text-3xl md:text-5xl mb-4 font-bold font-[Inter]">A Team of Real Builders</h2>
            <p className="text-white/60 text-lg">We’re a small, and committed team that’s inclusive of people of different backgrounds. Get to know the wonderful team who’s building our product, and shaping the proof of work layer</p>
          </div>

          {/* Desktop Card Grid */}
          <motion.div 
            className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1150px] mx-auto justify-items-center"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedMember(member)}
                className="w-[210px] bg-[#0B0F19] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:border-[#C19A4A]/30 transition-all duration-300"
              >
                <div className="p-4 pt-4">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full aspect-square object-cover rounded-xl"
                  />
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

          {/* Mobile Card Stack */}
          <motion.div 
            className="md:hidden flex flex-col items-center gap-6 max-w-[360px] mx-auto"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {teamMembers.map((member) => (
              <motion.div
                key={member.name}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                onClick={() => setSelectedMember(member)}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
              >
                <div className="p-4 pt-4">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full aspect-square object-cover rounded-xl"
                  />
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
        </motion.section>

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
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-[750px] w-full relative mt-20 md:mt-0 md:max-h-[90vh] md:overflow-y-auto flex flex-col max-h-[85vh]"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
                >
                  <X size={20} className="text-gray-600" />
                </button>

                {/* Desktop Layout */}
                <div className="hidden md:flex gap-8 p-8">
                  <img 
                    src={selectedMember.image} 
                    alt={selectedMember.name}
                    className="w-[220px] h-[280px] object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedMember.name}</h2>
                    <p className="text-[#C19A4A] text-sm uppercase italic mb-6">{selectedMember.role}</p>
                    <p className="text-gray-700 text-base leading-relaxed mb-6 flex-1">{selectedMember.bio}</p>
                    <a 
                      href={selectedMember.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#C19A4A] hover:text-[#a8853b] underline text-sm font-medium inline-flex items-center gap-1"
                    >
                      Personal Website <ArrowRight size={14} />
                    </a>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden overflow-y-auto h-full">
                  <div className="p-6">
                    <img 
                      src={selectedMember.image} 
                      alt={selectedMember.name}
                      className="w-full aspect-square object-cover rounded-xl mb-6"
                    />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedMember.name}</h2>
                    <p className="text-[#C19A4A] text-sm uppercase italic mb-6">{selectedMember.role}</p>
                    <p className="text-gray-700 text-base leading-relaxed mb-6">{selectedMember.bio}</p>
                    <a 
                      href={selectedMember.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#C19A4A] hover:text-[#a8853b] underline text-sm font-medium inline-flex items-center gap-1"
                    >
                      Personal Website <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

                {/* Journey Section */}
        <motion.section
          id="journey" 
          className="py-16 px-5 text-center rounded-lg m-4 relative max-w-5xl mx-auto"
        >
          {/* Section Heading - Animates First */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-white text-[1.875rem] mb-8 font-[Inter] font-bold">Our Journey</h2>
            <p className="text-white/80 mb-8">From concept to reality here's how we're building the future of Proof of Work.</p>
          </motion.div>

          {/* Timeline Items Container */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.25
                }
              }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Timeline Item 1 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-[60px_30px_1fr] items-start relative mb-6"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
                className="text-sm text-white/60"
              >
                Q4 2025
              </motion.div>
              <div className="relative h-full flex justify-center">
                <motion.span 
                  variants={{
                    hidden: { scale: 0 },
                    visible: { scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
                  }}
                  className="w-2.5 h-2.5 bg-[#C19A4A] rounded-full relative z-[2]"
                />
                <span className="absolute top-[14px] left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%+30px)] bg-white/20"></span>
              </div>
              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
                className="pl-5"
              >
                <div>
                  <h3 className="m-0 text-xl text-white font-bold font-[Inter] text-left">Foundation</h3>
                  <hr className="border-0 border-t border-white/15 my-2" />
                  <p className="m-0 text-white/80 text-sm leading-[1.6] text-left">Strategic partnerships and waitlist launch.</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Timeline Item 2 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-[60px_30px_1fr] items-start relative mb-6"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
                className="text-sm text-white/60"
              >
                Q1 2026
              </motion.div>
              <div className="relative h-full flex justify-center">
                <motion.span 
                  variants={{
                    hidden: { scale: 0 },
                    visible: { scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
                  }}
                  className="w-2.5 h-2.5 bg-[#C19A4A] rounded-full relative z-[2]"
                />
                <span className="absolute top-[14px] left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%+30px)] bg-white/20"></span>
              </div>
              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
                className="pl-5"
              >
                <div>
                  <h3 className="m-0 text-xl text-white font-bold font-[Inter] text-left">MVP Launch</h3>
                  <hr className="border-0 border-t border-white/15 my-2" />
                  <p className="m-0 text-white/80 text-sm leading-[1.6] text-left">Beta and Public MVP launch (open signup & onboarding).</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Timeline Item 3 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-[60px_30px_1fr] items-start relative mb-6"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
                className="text-sm text-white/60"
              >
                Q2 2026
              </motion.div>
              <div className="relative h-full flex justify-center">
                <motion.span 
                  variants={{
                    hidden: { scale: 0 },
                    visible: { scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
                  }}
                  className="w-2.5 h-2.5 bg-[#C19A4A] rounded-full relative z-[2]"
                />
                <span className="absolute top-[14px] left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%+30px)] bg-white/20"></span>
              </div>
              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
                className="pl-5"
              >
                <div>
                  <h3 className="m-0 text-xl text-white font-bold font-[Inter] text-left">Community Growth</h3>
                  <hr className="border-0 border-t border-white/15 my-2" />
                  <p className="m-0 text-white/80 text-sm leading-[1.6] text-left">Discovery layer, hiring features, and Human + Mini-Them rollout.</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Timeline Item 4 */}
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-[60px_30px_1fr] items-start relative mb-6"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
                className="text-sm text-white/60"
              >
                 Q3 2026
              </motion.div>
              <div className="relative h-full flex justify-center">
                <motion.span 
                  variants={{
                    hidden: { scale: 0 },
                    visible: { scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
                  }}
                  className="w-2.5 h-2.5 bg-[#C19A4A] rounded-full relative z-[2]"
                />
              </div>
              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
                className="pl-5"
              >
                <div>
                  <h3 className="m-0 text-xl text-white font-bold font-[Inter] text-left">Ecosystem Expansion</h3>
                  <hr className="border-0 border-t border-white/15 my-2" />
                  <p className="m-0 text-white/80 text-sm leading-[1.6] text-left mb-8">Deeper team capabilities and ecosystem growth.</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Closing Paragraph - Animates after timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 1.0 }}
          >
            <p className="text-white/80 mb-8">We're still early, but our focus is clear: make proof of work visible, verifiable, and scalable — forever. <br /> Ready to showcase your work and unlock your team's full potential?</p>
          </motion.div>

          {/* CTA Buttons - Animate after paragraph */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 1.2 }}
            className="flex flex-col md:flex-row gap-3 mb-20"
          >
            <button className="w-full bg-[#C19A4A] text-[#0B0F1B] py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#d4af37] transition-colors">
              Create My Portfolio
              <ArrowRight size={20} />
            </button>
            <button className="w-full bg-transparent border-2 border-white text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              Launch My Mini-Them Agent
            </button>
          </motion.div>
        </motion.section>

        {/* Partner With Us Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          id="partner" 
          className="py-20 px-5 text-center rounded-lg m-4 relative bg-[#0a0a0a] mt-[-60px]"
        >
          <div className="max-w-5xl mx-auto relative z-10">
            <h2 className="text-[#C19A4A] text-[1.875rem] mb-4 font-[Inter] font-bold">Partner With Us</h2>
            <p className="text-white text-lg mb-4 max-w-3xl mx-auto">
              Partner with us to embed verifiable proof of work directly into your ecosystem.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-12 max-w-3xl mx-auto">
              At Ghonsi Proof, we're building the on-chain infrastructure that makes every contribution tamper-proof and instantly verifiable. When you integrate with us, your projects, talent pools, and communities gain permanent, trustless records of real impact.
            </p>

            {/* Partner Types Label */}
            <p className="text-white text-base mb-6 font-semibold">We collaborate with:</p>

            {/* Partner Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
              {/* Card 1: Web3 Projects */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A]/30 to-white/10"
              >
                <div className="bg-[#0B0F1B]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-left h-full">
                  <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563] mb-4 w-fit">
                    <div className="bg-[#0B0F1B] rounded-xl p-3 text-[#C19A4A]">
                      <Rocket size={24} />
                    </div>
                  </div>
                  <h3 className="text-white text-lg font-bold mb-2">Web3 Projects & Protocols</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Showcase genuine builder contributions</p>
                </div>
              </motion.div>

              {/* Card 2: Hackathon Organizers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A]/30 to-white/10"
              >
                <div className="bg-[#0B0F1B]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-left h-full">
                  <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563] mb-4 w-fit">
                    <div className="bg-[#0B0F1B] rounded-xl p-3 text-[#C19A4A]">
                      <Trophy size={24} />
                    </div>
                  </div>
                  <h3 className="text-white text-lg font-bold mb-2">Hackathon Organizers</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Issue verifiable participation and win proofs</p>
                </div>
              </motion.div>

              {/* Card 3: Talent Platforms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A]/30 to-white/10"
              >
                <div className="bg-[#0B0F1B]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-left h-full">
                  <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563] mb-4 w-fit">
                    <div className="bg-[#0B0F1B] rounded-xl p-3 text-[#C19A4A]">
                      <Briefcase size={24} />
                    </div>
                  </div>
                  <h3 className="text-white text-lg font-bold mb-2">Talent Platforms & Hiring Marketplaces</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Add reliable reputation layers</p>
                </div>
              </motion.div>

              {/* Card 4: DAOs & Communities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A]/30 to-white/10"
              >
                <div className="bg-[#0B0F1B]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-left h-full">
                  <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563] mb-4 w-fit">
                    <div className="bg-[#0B0F1B] rounded-xl p-3 text-[#C19A4A]">
                      <Building2 size={24} />
                    </div>
                  </div>
                  <h3 className="text-white text-lg font-bold mb-2">DAOs, Communities & Ecosystems</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Build transparency and accountability</p>
                </div>
              </motion.div>
            </div>

            {/* Closing Line */}
            <p className="text-gray-300 text-sm mb-6 max-w-2xl mx-auto">
              If you're building tools, running events, or growing communities where proof matters, let's talk.
            </p>

            {/* CTA Button */}
            <a href="mailto:partnerships@ghonsiproof.com" className="inline-flex gap-2 bg-[#C19A4A] text-[#0B0F1B] py-3 px-6 rounded-lg font-bold cursor-pointer border-none shadow-[0_6px_18px_rgba(193,154,74,0.12)] hover:bg-[#a8853b] transition-all hover:shadow-[0_8px_24px_rgba(193,154,74,0.25)] text-base">
              Discuss a Partnership
            </a>
          </div>

        </motion.section>

        {/* Closing Line */}
        <div className="py-4 italic text-[Inter]">
          <p className=" bg-gradient-to-r from-gray-400 to-[#C19A4A] bg-clip-text text-transparent text-lg text-center mb-4 max-w-3xl mx-auto">
              Welcome to Ghonsi proof! Where your real work gets proved on-chain, and your Human + AI Team becomes unstoppable.
          </p>
        </div>


      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .hover\:pause-animation:hover {
          animation-play-state: paused;
        }

        @media (min-width: 768px) {
          [style*="scroll-left"] {
            animation-duration: 40s !important;
          }
          [style*="scroll-right"] {
            animation-duration: 40s !important;
          }
        }
      `}</style>
    </div>
  );
}

export default About;