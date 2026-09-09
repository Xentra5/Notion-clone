"use client";

import React, { useEffect, useState } from "react";

interface TypewriterTextProps {
  words: string[];
  typingSpeed?: number; // ms per char
  deletingSpeed?: number;
  pauseDuration?: number; // pause when complete
  className?: string;
  cursorClassName?: string;
}

export function TypewriterText({
  words,
  typingSpeed = 70,
  deletingSpeed = 35,
  pauseDuration = 2200,
  className = "",
  cursorClassName = "text-[#0078df]",
}: TypewriterTextProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullWord = words[wordIndex % words.length];

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing characters
        setCurrentText(fullWord.substring(0, currentText.length + 1));

        // When complete
        if (currentText.length + 1 === fullWord.length) {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        // Deleting characters
        setCurrentText(fullWord.substring(0, currentText.length - 1));

        // When completely deleted
        if (currentText.length === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    const timer = setTimeout(
      handleTyping,
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{currentText}</span>
      <span
        className={`ml-0.5 inline-block w-[2px] h-[1em] bg-current animate-pulse ${cursorClassName}`}
        aria-hidden="true"
      />
    </span>
  );
}
