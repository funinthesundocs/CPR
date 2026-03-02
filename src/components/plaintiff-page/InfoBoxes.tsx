'use client'

import { motion } from 'framer-motion'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface InfoBox {
  label: string
  value: string
}

interface InfoBoxesProps {
  boxes: InfoBox[]
}

export function InfoBoxes({ boxes }: InfoBoxesProps) {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="py-12 px-6"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-[1340px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {boxes.map((box) => (
          <motion.div
            key={box.label}
            variants={itemVariants}
            className="bg-[var(--accent-700)]/60 border border-[var(--accent-300)]/20 rounded-lg p-6 flex flex-col items-center justify-center text-center"
          >
            <p className="text-sm uppercase tracking-widest text-[var(--accent-300)] mb-3 font-semibold">
              {box.label}
            </p>
            <p className="text-xl text-white font-bold leading-snug">
              {box.value}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}
