import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

const variants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    enter: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.61, 1, 0.88, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.2,
        },
    },
};

export const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
    return (
        <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={variants}
            className={`w-full ${className}`}
        >
            {children}
        </motion.div>
    );
};
