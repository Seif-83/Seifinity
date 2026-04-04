import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Award, BookOpen } from 'lucide-react';

const teachers = [
  // { 
  //   name: 'Mr. Amr Mohsen', 
  //   subject: 'Mathematics', 
  //   description: 'Specialist in teaching Mathematics for preparatory levels, providing a solid foundation for future academic success.',
  //   platformUrl: 'https://mr-amr-platform.vercel.app/',
  //   image: 'Amr-Mohsen.png'
  // },
  // { 
  //   name: 'Mrs. Safaa Esmail', 
  //   subject: 'Science', 
  //   description: 'Specialist in teaching Science for preparatory levels, dedicated to making complex concepts simple and engaging for all students.',
  //   platformUrl: 'https://mrs-safaa-platform.vercel.app/#/',
  //   image: 'Safaa-Esmail.png'
  // }
];

export default function Teachers() {
  return (
    <div className="space-y-12 flex flex-col items-center">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold mb-2">Our Educators</h2>
        <p className="text-white/60 text-sm max-w-md mx-auto">Working with the best specialists to ensure your academic excellence.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl px-4">
        {teachers.map((teacher, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass p-8 rounded-[2.5rem] border border-white/5 hover:border-cyan-500/30 transition-all group w-full"
          >
            <div className="flex flex-col items-center text-center h-full">
              <div className="relative mb-8">
                 <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-[3px] shadow-2xl shadow-cyan-500/20">
                    <div className="w-full h-full rounded-full bg-[#050505] overflow-hidden">
                       <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                 </div>
                 <div className="absolute -bottom-2 -right-2 bg-white text-black p-2 rounded-full shadow-lg">
                    <Award className="w-5 h-5 text-cyan-600" />
                 </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-2 group-hover:text-cyan-400 transition-colors uppercase">{teacher.name}</h3>
              <div className="flex items-center gap-2 px-4 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20 mb-6">
                 <BookOpen className="w-3 h-3 text-cyan-400" />
                 <span className="text-cyan-400 text-[10px] font-mono uppercase tracking-[0.2em] font-bold">{teacher.subject}</span>
              </div>
              
              <p className="text-base text-white/60 leading-relaxed italic mb-8 flex-grow">
                "{teacher.description}"
              </p>
              
              <button 
                onClick={() => window.open(teacher.platformUrl, '_blank')}
                className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm rounded-2xl transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3 active:scale-95"
              >
                Visit Platform Website
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
