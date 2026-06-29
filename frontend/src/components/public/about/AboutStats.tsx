"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { School, Users, MapPin, IndianRupee } from "lucide-react";

const stats = [
  {
    icon: <School className="w-6 h-6" />,
    value: 500,
    suffix: "+",
    label: "Schools Listed",
    iconBg: "bg-blue-800/40",
    iconColor: "text-blue-200",
  },
  {
    icon: <Users className="w-6 h-6" />,
    value: 10000,
    suffix: "+",
    label: "Parents Helped",
    iconBg: "bg-amber-400/20",
    iconColor: "text-amber-300",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    value: 50,
    suffix: "+",
    label: "Cities Covered",
    iconBg: "bg-blue-800/40",
    iconColor: "text-blue-200",
  },
  {
    icon: <IndianRupee className="w-6 h-6" />,
    value: 0,
    prefix: "₹",
    suffix: "",
    label: "Starting Plan",
    iconBg: "bg-amber-400/20",
    iconColor: "text-amber-300",
  },
];

function CountUp({
  target,
  started,
}: {
  target: number;
  started: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started || target === 0) {
      setCount(target);
      return;
    }
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setCount(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <span>
      {target >= 1000
        ? count >= 1000
          ? `${(count / 1000).toFixed(0)}K`
          : count.toString()
        : count.toString()}
    </span>
  );
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function AboutStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="bg-hero-gradient py-20" ref={ref}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-body text-label font-medium text-blue-200 uppercase tracking-widest">
            Our Impact
          </span>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-2xl border border-blue-400/20 bg-blue-800/30 backdrop-blur-sm p-6 text-center"
            >
              <div
                className={`w-12 h-12 ${stat.iconBg} ${stat.iconColor} rounded-xl flex items-center justify-center mx-auto mb-4`}
              >
                {stat.icon}
              </div>
              <div className="font-heading text-display-md text-white mb-1 leading-none">
                {stat.prefix}
                <CountUp target={stat.value} started={inView} />
                {stat.suffix}
              </div>
              <p className="font-body text-label text-blue-200">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}